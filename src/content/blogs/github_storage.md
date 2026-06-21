---
title: 'How GitHub Stores Petabytes of Code: Under the Hood of Git'
date: '2026-06-21'
readTime: '18 min read'
summary: "A deep dive into how GitHub stores and serves petabytes of source code using Git's content-addressable storage model, packfiles, delta compression, distributed architecture, and large-scale storage systems. Learn how commits, blobs, trees, and packfiles work together to efficiently manage billions of repositories and trillions of Git objects."
tags:
  [
    'Git',
    'GitHub',
    'Distributed Systems',
    'System Design',
    'Software Engineering',
    'Version Control',
    'Scalability',
  ]
---

# Under the Hood of GitHub: How to Store Petabytes of Code

## The Scale Problem Nobody Talks About

When you run `git push`, something remarkable happens. Within seconds, your code is safe. Not just saved — _replicated_, _validated_, and _distributed_ across multiple physical servers in different racks, possibly different continents. You see a green checkmark and move on with your life.

But behind that push sits one of the most quietly impressive distributed systems in software engineering.

GitHub stores **more than 18.6 petabytes of Git data** across **420+ million repositories**. To put that in perspective — it is more than six times the size of the Library of Congress's entire digital collection. Every line of code, every commit message, every branch from every fork of every project: all of it safe, all of it consistent, all of it instantly retrievable.

How does a company actually store that? The naive approaches collapse under their own weight:

- A single global file system degrades catastrophically as you add servers
- A relational database cannot hold hundreds of millions of repository histories
- Block-level replication is too coarse and too slow for write-heavy Git workloads

GitHub's answer involves two interlocking ideas: **Git's own content-addressable object model** — which makes deduplication and integrity checking nearly free — and **Spokes**, a custom distributed replication system built on top of it. Understanding one requires understanding the other.

This post is a complete technical deep-dive into both. By the end, you will understand exactly what happens between `git push` and the checkmark.

---

## Part 1: Git as a Database

Most developers think of Git as a tool that tracks file diffs. It is not. Git is a **content-addressable key-value store** — a small database that lives in the `.git` folder of every repository. The version control behaviour is a user interface built on top of it.

Understanding this reframes everything.

### The `.git` Directory

When you run `git init`, Git creates a directory structure:

```plaintext
.git/
├── HEAD                  ← pointer to your current branch
├── config                ← local repo configuration
├── description           ← used by GitWeb
├── hooks/                ← lifecycle scripts
├── info/
│   └── exclude
├── objects/              ← THE DATABASE (everything lives here)
│   ├── info/
│   └── pack/
└── refs/                 ← branch and tag pointers
    ├── heads/            ← local branches
    └── tags/
```

The `objects/` directory is the heart of Git. Every piece of data your project has ever contained — every file version, every directory snapshot, every commit — is stored here as an **object**.

### The Four Object Types

Git has exactly four object types. Everything in Git is built from these four primitives.

| Type     | Stores                                                 | Analogy                  |
| -------- | ------------------------------------------------------ | ------------------------ |
| `blob`   | Raw file contents                                      | An inode / file contents |
| `tree`   | Directory listing (names + modes + child hashes)       | A directory entry        |
| `commit` | Snapshot metadata (tree hash, parent, author, message) | A save point             |
| `tag`    | Named pointer with optional GPG signature              | An annotated label       |

### Content-Addressable Storage: The Core Idea

Here is the single design decision that makes Git, Git.

When Git stores an object, it computes the **SHA-1 hash of the content** and uses that hash as the object's name (filename on disk). The address of an object is derived from its contents — not from a sequence number, not from a database ID, not from a file path. The content _is_ the address.

Concretely, Git prepends a header (`blob <size>\0` for blobs, `commit <size>\0` for commits, etc.), runs SHA-1 on the result, and uses the 40-character hex digest as the key.

```bash
# Hash a string without storing it
$ echo "hello world" | git hash-object --stdin
3b18e512dba79e4c8300dd08aeb37f8e728b8dad

# Hash AND store it in the object database
$ echo "hello world" | git hash-object -w --stdin
3b18e512dba79e4c8300dd08aeb37f8e728b8dad

# It now exists on disk — first 2 chars = directory, rest = filename
$ find .git/objects -type f
.git/objects/3b/18e512dba79e4c8300dd08aeb37f8e728b8dad
```

The object is stored at `.git/objects/3b/18e512...` — the first two characters form the directory name, the remaining 38 form the filename. This two-level structure prevents any single directory from containing millions of files, which would severely degrade filesystem performance.

The content inside is zlib-compressed:

```bash
# Read it back
$ git cat-file -p 3b18e512dba79e4c8300dd08aeb37f8e728b8dad
hello world

# Check its type
$ git cat-file -t 3b18e512dba79e4c8300dd08aeb37f8e728b8dad
blob
```

### The Implications of Content Addressing

This design choice has three enormous consequences that ripple all the way up to GitHub's petabyte-scale infrastructure:

**1\. Deduplication is automatic and free.** Two files with identical contents produce the same SHA-1 hash and share exactly one blob on disk. A repository with 1000 identical `LICENSE` files stores one blob. If your fork of `linux/linux` has 98% of the same files as the original, those files share blobs. At GitHub's scale, this saves enormous amounts of storage — especially across the millions of forks of popular projects.

```bash
# Demonstrate deduplication
$ echo "shared content" > file1.txt
$ echo "shared content" > file2.txt
$ git add file1.txt file2.txt
$ git ls-files --stage
100644 6f43e7ce4a4ba1f6e40ae5e35ea8c7fb1e1f3e2c 0  file1.txt
100644 6f43e7ce4a4ba1f6e40ae5e35ea8c7fb1e1f3e2c 0  file2.txt
# Same SHA-1 hash — one blob stored, referenced twice
```

**2\. Integrity is structural, not bolted on.** If a single byte of any stored object is corrupted on disk — hardware failure, bit rot, cosmic ray — the SHA-1 hash will not match, and Git will refuse to use it. Corruption is automatically detected. You cannot have a silently corrupted repository without Git noticing.

```bash
$ git fsck --full
Checking object connectivity and validating packed Git data in .git/objects
notice: HEAD points to an unborn branch (master)
```

**3\. Distribution and sync become trivial.** Two repositories can compare their sets of SHA-1 hashes to know exactly which objects each is missing — without sending any content at all. The hash set _is_ the manifest. This is why `git fetch` is so efficient: the client and server negotiate which objects are missing using just hashes, then transfer the minimum necessary content.

### Walking the Object Graph: Blobs, Trees, and Commits

Let's build up a concrete example to see how these four object types connect.

Suppose you have a project:

```plaintext
my-project/
├── README.md       ← "# Hello World\n"
└── src/
    └── main.py     ← "print('hello')\n"
```

When you run `git add . && git commit -m "initial commit"`, Git creates:

**Step 1: Two blobs** — one for each file's contents

```bash
# Git creates these blobs (content-addressed)
blob: a1b2c3...  ← contains "# Hello World\n"
blob: d4e5f6...  ← contains "print('hello')\n"
```

**Step 2: Two trees** — one for `src/`, one for the root

```bash
$ git cat-file -p HEAD^{tree}
040000 tree 9a8b7c...   src
100644 blob a1b2c3...   README.md

$ git cat-file -p 9a8b7c...
100644 blob d4e5f6...   main.py
```

Each tree entry contains: file mode, object type, SHA-1 hash, and name. Notice there is no concept of "rename" at this level — Git detects renames heuristically by comparing blob hashes, not by storing rename events.

**Step 3: One commit object** — pointing to the root tree

```bash
$ git cat-file -p HEAD
tree 7c6d5e...
author Alice <alice@example.com> 1718870400 +0530
committer Alice <alice@example.com> 1718870400 +0530

initial commit
```

A commit object contains: the root tree hash, parent commit hashes (zero for initial, one for normal commits, two or more for merges), author, committer, timestamps, and the message. That's it. The entire snapshot of your project is encoded in this graph.

**The Directed Acyclic Graph**

Commits form a **DAG (Directed Acyclic Graph)**. Each commit points to its parent(s). Branches are just pointers into this graph.

```plaintext
          [commit C]  ← HEAD (main)
          /   tree: T3
         /
[commit B]
    tree: T2
         \
          [commit A]  ← (initial)
              tree: T1


T1 → { blob: README.md (v1), tree: src/ → { blob: main.py (v1) } }
T2 → { blob: README.md (v2), tree: src/ → { blob: main.py (v1) } }  ← reuses blob!
T3 → { blob: README.md (v2), tree: src/ → { blob: main.py (v2) } }
```

Notice that commit B's tree (`T2`) reuses the `main.py` blob from `T1` unchanged — it just points to the same blob hash. Git never stores the same content twice. When you have 50,000 commits and only modified 3 files in the last 1000 commits, those 3 files don't duplicate — there are just new blobs for the changed versions.

This is the fundamental reason Git is space-efficient. It is not storing diffs — it is storing snapshots, but because snapshots share unchanged blobs, the actual disk usage is close to diff storage.

---

## Part 2: Packfiles — From Millions of Tiny Files to Efficient Storage

The loose object format (one object = one compressed file) works fine for small repositories and active development. But it hits a wall at scale.

Consider: a repository with 100,000 commits, each touching 10 files on average, produces **1,000,000 loose objects** — a million tiny files. On most filesystems, listing a directory with a million entries is slow. Opening a million files for a garbage collection pass is slow. Transferring them over a network is very slow.

Git's solution is the **packfile**.

### Packfile Anatomy

A packfile bundles many objects together into a single binary file. The format lives in `.git/objects/pack/` and comes in pairs:

```plaintext
.git/objects/pack/
├── pack-abc123.pack    ← the actual data
└── pack-abc123.idx     ← the index for fast lookup
```

```bash
# Trigger packfile creation (Git does this automatically, but you can force it)
$ git gc

# Inspect what's in a packfile
$ git verify-pack -v .git/objects/pack/pack-abc123.idx
abc123... commit 250 180 12          ← SHA, type, uncompressed size, compressed size, offset
d4e5f6... blob   3042 1891 192
9a8b7c... tree   876  432  2083
...
```

### The Pack Index (`.idx`)

The `.idx` file is a sorted table of (SHA-1 hash → byte offset in `.pack`). Because it's sorted lexicographically, lookup is a **binary search** — O(log n) even with millions of objects.

```plaintext
Index structure (Version 2):
┌─────────────────────────────────┐
│  Magic number + version         │
│  Fan-out table (256 entries)    │  ← how many objects start with each first byte
│  SHA-1 list (sorted)            │  ← all object IDs
│  CRC32 checksums                │  ← per-object integrity
│  Offsets (4-byte)               │  ← position in .pack file
│  Large offsets (8-byte)         │  ← for packs > 2GB
│  Pack checksum                  │
│  Index checksum                 │
└─────────────────────────────────┘
```

The fan-out table is a clever optimization: `fanout[n]` contains the count of objects whose SHA-1 starts with a byte value ≤ n. To find objects starting with byte `0x3b`, you binary-search only the slice `[fanout[0x3a], fanout[0x3b])`. It partitions the search space by the first byte before the binary search even begins.

### Delta Compression: The Storage Superpower

Plain compression (zlib/DEFLATE) is applied to every object. But packfiles go further: **delta compression** between objects.

If two objects are similar — say, two versions of the same file — Git stores one as a full object and the other as a **delta**: a compact set of copy/insert instructions that reconstruct the second object from the first.

```plaintext
# Conceptual delta format:
# "Copy bytes 0-1023 from base object, then insert these 40 new bytes"

COPY  offset=0    length=1024   ← reference base object
INSERT length=40  data="...new content here..."
COPY  offset=1064 length=8192   ← continue from base

# Result: 40-byte insert + 2 copy instructions
# Instead of: storing the full 9256-byte object again
```

In practice, this is remarkably effective. The GitHub engineering team noted that a 19KB tree object can be represented as a 50-byte offset delta in a packfile. That is a **99.7% reduction** for that single object.

The delta instructions themselves are also DEFLATE-compressed, so you get compression stacked on compression.

```bash
# See delta chains in a packfile
$ git verify-pack -v .git/objects/pack/pack-abc123.idx | grep " delta"
3f2a1b... blob 2048 89 4096 1 base_sha_here   ← "delta of base_sha_here"
```

There are two delta types:

- **Ref delta**: references the base object by its SHA-1 (can reference any known object)
- **Offset delta**: references the base by byte offset within the same packfile (faster, no hash lookup needed)

Modern Git prefers offset deltas for efficiency.

### Packfile Lookup: Walking the Chain

When Git needs an object stored as a delta, it must reconstruct it:

1.  Look up the object's SHA-1 in the `.idx` file (binary search) → get byte offset in `.pack`
2.  Read the packfile header at that offset → determine if it's a base object or a delta
3.  If delta: follow the base reference (recursively, if the base is also a delta)
4.  Apply delta instructions to the base object → reconstruct the target object

Delta chains can be several levels deep. Git limits chain depth (default: 50) to bound the worst-case reconstruction cost.

### Multi-Pack-Index (MIDX)

At GitHub scale, a single repository might accumulate many packfiles over time — especially large monorepos with heavy push traffic. Searching through N pack-index files to find a single object means N binary searches.

Git's **multi-pack-index** (`MIDX`) solves this by building a single sorted index across all packfiles in the repository:

```bash
# Write a MIDX covering all packs
$ git multi-pack-index write

# Write it with reachability bitmaps (more on this below)
$ git multi-pack-index write --bitmap
```

The MIDX is stored at `.git/objects/pack/multi-pack-index` and enables O(log n) lookup across the entire object database regardless of how many individual packfiles exist.

GitHub uses MIDX heavily as part of their monorepo maintenance work — it dramatically reduces the cost of operations like `git clone` and `git fetch` on repositories with years of history.

---

## Part 3: References, Branches, and HEAD

With the object database understood, we can look at how Git tracks _which_ objects matter.

### Branches Are Just Text Files

This surprises many developers: **a branch is a 41-byte file** containing a SHA-1 hash (40 hex chars + newline).

```bash
$ cat .git/refs/heads/main
a3f9c2b1e4d8f7a6b5c3d2e1f0a9b8c7d6e5f4a3

$ cat .git/refs/heads/feature/auth
b7d3e9a2c5f8b1d4e7a3c6f9b2d5e8a1c4f7b3d6
```

That's it. Creating a branch is creating this file. Deleting a branch is deleting this file. Moving a branch (a commit) is overwriting this file with a new hash. None of these operations touch the object database at all — they are O(1) filesystem operations.

This is why Git branch operations are instantaneous regardless of repository size. You are not copying files; you are updating a 41-byte pointer.

```bash
# HEAD points to the current branch (a symbolic ref)
$ cat .git/HEAD
ref: refs/heads/main

# On a detached HEAD
$ cat .git/HEAD
a3f9c2b1e4d8f7a6b5c3d2e1f0a9b8c7d6e5f4a3
```

### Packed Refs

For repositories with thousands of branches and tags (large open-source projects, monorepos), having thousands of individual files in `refs/heads/` is slow to list. Git packs them into `.git/packed-refs`:

```plaintext
# packed-refs with: peeled fully-peeled sorted
a3f9c2b1e4d8f7a6b5c3d2e1f0a9b8c7d6e5f4a3 refs/heads/main
b7d3e9a2c5f8b1d4e7a3c6f9b2d5e8a1c4f7b3d6 refs/heads/feature/auth
c9e1f3a5b7d2e4f6a8b0c2d4e6f8a1b3c5d7e9f1 refs/tags/v1.0.0
^d2e4f6a8b0c2d4e6f8a1b3c5d7e9f1a3b5c7d9e1  ← peeled tag (commit SHA)
```

But even this has limits. For repos with millions of refs (GitHub internally has repositories with refs in the millions), listing and sorting `packed-refs` is O(n) in ref count.

### Reftable: GitHub's Solution for Massive Ref Counts

GitHub contributed the **reftable** format to the Git project to solve this. Reftable is a binary, sorted, block-based format for reference storage:

```plaintext
reftable layout:
┌──────────────────────────────┐
│  ref blocks (sorted by name) │  ← binary-searchable
│  log blocks (ref history)    │  ← reflog, also sorted
│  index blocks                │  ← multi-level index
│  footer                      │
└──────────────────────────────┘
```

Key properties:

- **O(log n) lookup** by reference name (block index → binary search within block)
- **O(log n) prefix search** (find all `refs/heads/feature/*` efficiently)
- **Atomic updates** — an entire transaction writes to a new file, old file is swapped out
- **Reflog included** — the history of where each ref pointed is embedded in the same format

For GitHub's largest repositories, reftable reduces ref lookup from milliseconds to microseconds.

---

## Part 4: The Push Flow — From Your Machine to GitHub

Now that we understand the object model, let's trace exactly what happens when you run `git push`.

### Phase 1: Transport Negotiation

Git supports two transport protocols for push: **SSH** and **Smart HTTP**. Smart HTTP is more common on GitHub and is the one we'll trace.

```plaintext
your machine                    GitHub
     │                              │
     │── HTTPS GET /repo.git/info/refs?service=git-receive-pack ──►
     │                              │
     │◄──── 200 OK (ref advertisement) ────────────────────────────
     │   # service=git-receive-pack
     │   a3f9c2b... refs/heads/main
     │   b7d3e9a... refs/heads/develop
     │   capabilities: side-band-64k ofs-delta agent=git/2.40.0
```

The server sends its current ref state plus a capability list. The client now knows what the server has.

### Phase 2: Object Negotiation (for `git fetch`) / Packfile Generation (for `git push`)

For a push, the client:

1.  Computes which local commits the server does not have (by comparing ref hashes)
2.  Walks the local object graph to find all reachable objects the server needs
3.  Builds a packfile containing exactly those objects
4.  Sends the packfile + ref update instructions

```plaintext
your machine                    GitHub
     │                              │
     │── HTTPS POST /repo.git/git-receive-pack ────────────────────►
     │   [pack-protocol header]
     │   old-sha new-sha refs/heads/main\0 report-status side-band-64k
     │   [packfile bytes]
     │                              │
     │◄──── unpack ok ─────────────────────────────────────────────
     │      ok refs/heads/main
```

The wire protocol format for the ref update line:

```plaintext
# Format: <old-sha1> SP <new-sha1> SP <refname> NUL <capabilities> LF
a3f9c2b1e4d8f7a6b5c3d2e1f0a9b8c7d6e5f4a3 \
d9e8f7a6b5c4d3e2f1a0b9c8d7e6f5a4b3c2d1e0 \
refs/heads/main\0 \
report-status side-band-64k ofs-delta
```

For a new branch (no previous commit): `old-sha` is `0000000000000000000000000000000000000000`.

### Phase 3: Server-Side Processing

When GitHub's servers receive the push, several things happen in sequence:

```plaintext
Incoming packfile
       │
       ▼
[Git Proxy / Receive Layer]
       │  ← authenticates, routes to correct Spoke
       ▼
[Pre-receive hooks]
       │  ← branch protection rules, code scanning, size limits
       ▼
[Object unpacking]
       │  ← validates every object's SHA-1, writes to object store
       ▼
[Reference update]
       │  ← atomically updates branch pointers
       ▼
[Spokes replication]  ←─ THIS IS WHERE THE MAGIC HAPPENS
       │  ← synchronously replicates to 2+ other fileservers
       ▼
[Post-receive hooks]
       │  ← triggers CI/CD, notifications, webhooks
       ▼
[Success response to client]
```

The key constraint: **the client gets a success response only after Spokes confirms at least 2 of 3 replicas have the data**. The replication is synchronous from the client's perspective. If your push succeeds, your data is already in multiple places.

---

## Part 5: Spokes — GitHub's Distributed Git Replication

This is the system that makes GitHub's storage actually work at scale. Understanding Spokes requires understanding the problem it replaced.

### The Problem: Global File System (GFS) and DRBD

Early GitHub stored repositories on a **Global File System (GFS)** — a shared filesystem mounted by all servers. As they grew and added more servers, performance degraded rapidly. The shared filesystem became a bottleneck.

They moved to **DRBD (Distributed Replicated Block Device)** — block-level replication. DRBD mirrors a block device to another server at the storage level, below the filesystem. This was better but had critical limitations:

- Block-level replication cannot validate Git objects — it replicates bytes blindly, including corrupted bytes
- Adding a new replica meant a slow full-block-device copy, not an incremental Git sync
- Geographic distribution (replica in another datacenter) required very low latency between sites, or replication lag became unbounded

### Spokes: Application-Level Replication

GitHub built **Spokes** (originally called DGit — Distributed Git) to replace DRBD. The key insight: **replicate at the Git application level, not the filesystem level**.

Because Git is content-addressed, two servers can independently verify they have identical repository state by comparing SHA-1 object sets. Replication can be validated, not just assumed. A corrupted byte on one replica is caught when its SHA-1 doesn't match, and the correct data can be fetched from another replica.

### Architecture: The Three-Replica Model

Every repository on GitHub lives on exactly **three fileservers** — its "spoke set".

```plaintext
                     ┌─────────────────────────────────────┐
                     │           Git Proxy Layer            │
                     │  (routes reads/writes to spokes)    │
                     └───────────┬──────────┬──────────────┘
                                 │          │
              ┌──────────────────▼──┐    ┌──▼──────────────────┐
              │   Fileserver A      │    │   Fileserver B       │
              │   Rack 3, Row 7     │    │   Rack 11, Row 2     │
              │   ┌───────────────┐ │    │   ┌───────────────┐  │
              │   │  repo.git/    │ │    │   │  repo.git/    │  │
              │   │  objects/     │ │    │   │  objects/     │  │
              │   │  refs/        │ │    │   │  refs/        │  │
              │   └───────────────┘ │    │   └───────────────┘  │
              └─────────────────────┘    └──────────────────────┘
                                                  │
                              ┌───────────────────▼──────────────┐
                              │         Fileserver C              │
                              │         Rack 19, Row 4            │
                              │         ┌───────────────┐         │
                              │         │  repo.git/    │         │
                              │         │  objects/     │         │
                              │         │  refs/        │         │
                              │         └───────────────┘         │
                              └──────────────────────────────────┘
```

Critical design choices:

**1\. Full repository replicas, not shards.** Each of the three servers holds a complete, standard `.git` repository — not a shard or a partial copy. Any of the three can serve any read request independently. This means Spokes can tolerate losing one server with zero degradation in read capability.

**2\. Rack-level isolation.** Replicas are placed on servers in different physical racks. A rack failure (power, top-of-rack switch, cooling) takes down at most one replica. The other two remain operational.

**3\. Native Git format.** There is no proprietary storage format. Files on disk are valid Git repositories that any standard `git` command can read. This is a crucial operational advantage — engineers can diagnose and repair issues using standard tools.

### The Quorum Write Protocol

When you push, here is what Spokes actually does:

```plaintext
Push arrives at Proxy
        │
        │ 1. Proxy identifies the three fileservers for this repo
        │
        ├───────────────────────────────────────────┐
        │                                           │
        ▼                                           ▼
  Fileserver A                              Fileserver B
  git-receive-pack                          git-receive-pack
  (validates objects)                       (validates objects)
  (writes to disk)                          (writes to disk)
        │                                           │
        │ ACK: "wrote to sha X"                     │ ACK: "wrote to sha X"
        │ ← same result hash                        │ ← same result hash
        └────────────────────┬──────────────────────┘
                             │
                             │ 2 of 3 confirmed with identical result
                             │
                             ▼
                    ┌──────────────────┐
                    │  Commit the write │
                    │  Update refs      │
                    └──────────────────┘
                             │
                             ▼
                    Send ACK to client ✓

                    (Fileserver C catches up asynchronously)
```

The critical point: **a write is only committed if at least 2 of 3 replicas confirm they received the same objects and produced the same result**. "Same result" means the resulting repository state (all object hashes, all ref states) is identical on both servers.

If the two results differ — perhaps one server had a transient disk error that caused a write to partially fail — the write is rejected and rolled back. The client sees an error. Your push fails rather than silently succeeding in a corrupted state.

This is a form of **quorum consensus** — the same principle used in systems like Raft and Paxos, but implemented at the Git application level rather than as a general-purpose log.

### Read Routing

For read operations (`git clone`, `git fetch`, `git ls-remote`), the proxy picks the **best available replica** based on:

- Which server is least loaded
- Network latency to the requesting client
- Whether a replica is currently healthy (recent successful operations)

Reads do not require quorum. Any healthy replica can serve a read independently.

### Failure Detection and Recovery

Spokes detects unhealthy replicas through **traffic-driven health tracking**: every read and write operation is scored. Failures (network timeout, invalid data, lock contention) lower a server's health score. A server below a threshold is temporarily excluded from the replica set.

When a server returns from failure:

1.  The cluster detects it is missing objects (its last-known-good state is in the system)
2.  Neighboring servers in the cluster coordinate to push missing objects to the recovering server
3.  Git's native transfer protocol handles the delta sync — only missing objects are transferred
4.  The larger the cluster, the faster recovery: more servers can contribute objects in parallel

```bash
# The internal recovery essentially does:
git fetch origin --all    # from a healthy replica
git remote update         # ensure refs are current
# Then validate:
git fsck --full           # verify all objects are intact
```

### Stretching Spokes Across Datacenters

Early Spokes required replicas to be geographically close (same datacenter) because the quorum write required synchronous round-trips to all replicas, and high latency makes this prohibitively slow.

GitHub later extended Spokes to support **geo-distributed replicas** — replicas in different cities or continents. The solution is a two-tier model:

**Primary replicas** (in the same region): synchronous quorum writes, low latency **Secondary replicas** (in distant regions): asynchronous replication after the primary quorum commits

This means:

- Writes commit as soon as 2 local replicas confirm (fast)
- Distant replicas catch up asynchronously (they may lag seconds behind)
- Reads can be served from the nearest available replica, even if it is a secondary

For global teams, this is significant: a developer in Mumbai cloning a popular repository can be served by a replica in the APAC region instead of routing all the way to a US datacenter.

---

## Part 6: Fork Networks and Storage Deduplication at GitHub Scale

When you fork a repository on GitHub, you might expect a full copy to be made. It is not.

GitHub maintains the concept of a **fork network** — a group of repositories that share a common history. The original repository and all its forks share the same underlying object pool.

```plaintext
  microsoft/vscode  (original)
         │
         │ fork
         ├── user1/vscode    (fork)
         ├── user2/vscode    (fork)
         └── org/vscode      (fork)

All four share the same blob and commit objects.
Each has its own refs (branches, tags) pointing into the shared pool.
```

When you push a commit to your fork that adds a new file, only the new objects (the new blob, the new tree, the new commit) are added to the pool. The 200,000 existing blobs from the original are not duplicated.

This makes forking effectively free from a storage perspective, regardless of repository size.

### Reachability Bitmaps

One of the most impactful optimizations for `git clone` and `git fetch` is **reachability bitmaps**.

When a client clones a repository, the server must compute the set of all objects reachable from the repository's heads (all commits, all trees, all blobs, transitively). For a large repository, this walk can touch millions of objects and take seconds or minutes.

Reachability bitmaps pre-compute this traversal:

```bash
# Write a bitmap index alongside the packfile
$ git repack -adb --write-bitmap-index

# Or with MIDX
$ git multi-pack-index write --bitmap
```

The bitmap index stores, for each commit, a **bit vector** where bit N is set if object N is reachable from that commit. With bitmaps, answering "what objects does the client need?" becomes a series of bitwise OR operations instead of a full graph traversal — orders of magnitude faster.

GitHub writes reachability bitmaps for all repositories, which is why cloning a large repository is faster than you'd expect.

### Geometric Repacking

A repository that receives thousands of pushes per day accumulates many small packfiles. Thousands of packfiles means thousands of binary searches for every object lookup. GitHub uses **geometric repacking** to keep packfiles healthy.

The idea: maintain a set of packfiles where each one is at least as large as the total size of all smaller ones combined (a geometric progression). New pushes create small packfiles; over time, small packfiles are merged into larger ones; the largest pack (the "base pack") accumulates old objects and is rarely rewritten.

```plaintext
Base pack:     ████████████████████████████████████  (billions of objects, rarely touched)

Medium packs:  ████████████████  ████████████████

Small packs:   ████  ████  ████  ████

Micro packs:   ██ ██ ██ ██  (recent pushes)
```

This keeps the number of packfiles logarithmically bounded — you never accumulate thousands of them even under heavy push load.

---

## Part 7: Git LFS — When Files Don't Belong in Git

Git's delta compression model is brilliant for text files — it exploits the fact that successive versions of source code are similar. But it breaks completely for binary files.

A 100MB Photoshop `.psd` file changed in any way produces a completely different binary, with no exploitable similarity to the previous version. Git stores every version in full. Ten versions of the same `.psd` = 1GB in your repository history, forever, in every clone.

**Git Large File Storage (LFS)** solves this by storing large binary files outside the Git object database entirely.

### How LFS Works

Instead of storing the binary file as a blob, LFS stores a **pointer file** — a small text file containing a hash of the actual content:

```plaintext
# .git/lfs/objects/pointer file content:
version https://git-lfs.github.com/spec/v1
oid sha256:4d7a214614ab2935c943f9e0ff69d22eadbb8f32b1258daaa5e2ca24d17e2393
size 132547
```

The actual binary file lives on an **LFS object storage server** (in GitHub's case, backed by cloud object storage — similar to AWS S3 or Azure Blob).

### The LFS Push/Pull Flow

```plaintext
git push with LFS file
        │
        │ 1. Pre-push hook intercepts
        │
        ▼
.gitattributes check:
*.psd filter=lfs diff=lfs merge=lfs -text
        │
        │ 2. Clean filter runs: computes SHA-256, uploads binary to LFS API
        │
        ▼
LFS API (https://github.com/org/repo.git/info/lfs/objects/batch)
        │
        │ 3. GitHub returns pre-signed upload URL
        │
        ▼
Binary file → Cloud Object Storage (S3 / Azure Blob)
        │
        │ 4. Pointer file stored as normal Git blob in the repo
        │
        ▼
Normal git push (tiny pointer file only)


git checkout / git pull with LFS file
        │
        │ 1. Smudge filter intercepts when checking out
        │
        ▼
Read pointer file from Git object store
        │
        │ 2. Request actual binary from LFS server
        │
        ▼
LFS API returns pre-signed download URL
        │
        ▼
Binary file downloaded from Cloud Object Storage
        │
        ▼
Written to your working directory
```

### LFS Setup

```bash
# Install LFS
$ git lfs install

# Track large file types
$ git lfs track "*.psd"
$ git lfs track "*.mp4"
$ git lfs track "*.zip"

# This creates/updates .gitattributes:
$ cat .gitattributes
*.psd filter=lfs diff=lfs merge=lfs -text
*.mp4 filter=lfs diff=lfs merge=lfs -text
*.zip filter=lfs diff=lfs merge=lfs -text

# Commit the .gitattributes file
$ git add .gitattributes
$ git commit -m "Track large files with LFS"

# From here, adding .psd files automatically goes through LFS
$ git add design.psd
$ git push origin main
# ↑ This uploads design.psd to LFS storage, commits the pointer
```

A file tracked by LFS lives once on object storage and gets pulled to your working directory on demand. A 100MB `.psd` in 50 clones does not become 5GB of object storage — it remains 100MB plus 50 pointer files (< 1KB each).

---

## Part 8: Garbage Collection and the 90% Storage Reduction

Not all data in a Git repository is useful. When you force-push over a branch, the overwritten commits become **unreachable** — no branch or tag points to them. They still exist in the object store, but they cannot be reached by normal traversal.

GitHub normally keeps unreachable objects as a safety net — a force-push is recoverable for a window of time because the old objects still exist. But eventually, unreachable objects should be cleaned up.

### The Scale of the Problem

With 18.6+ petabytes of Git data, GitHub's GC systems run continuously. The challenge: running garbage collection on a live repository requires careful coordination with Spokes replication. You cannot delete an object on one replica while another replica is mid-operation referencing it.

The process must be:

1.  **Mark** — identify all reachable objects (using reachability bitmaps for speed)
2.  **Coordinate** — acquire locks across all three Spokes replicas
3.  **Sweep** — delete unreachable objects from packfiles (requires rewriting the pack)
4.  **Verify** — confirm all three replicas are consistent

### Geometric Repacking as GC

Rather than traditional mark-and-sweep GC (which requires downtime or complex locking), GitHub primarily uses **geometric repacking** as a continuous, incremental GC strategy:

When packs are merged (following the geometric progression described earlier), unreachable objects that fall out of the reachability window are simply omitted from the new merged pack. No explicit "delete" pass is needed — objects that aren't included in repacking gradually disappear from the live object set.

### The 90% Reduction Story

GitHub engineering reported reducing specific repository sizes by more than 90% through targeted object cleanup. How?

The culprits are typically:

- Large binary files accidentally committed directly (before LFS adoption)
- Generated files checked in (built artifacts, compiled assets)
- Sensitive data that was subsequently removed but remains in history

When a repository owner uses `git filter-repo` (or GitHub's sensitive data removal service) to purge a large file from history, new packfiles are created with the objects omitted. But the old packfiles with the large objects still exist until GC runs and the retention window expires.

For a repository where a 500MB binary was committed and then immediately removed, the history rewrite reclaims almost all of that 500MB — hence the 90%+ reduction figures.

---

## Putting It All Together: The Full Picture

Let's trace a complete `git push` from first keystroke to GitHub's "push successful":

```plaintext
1. LOCAL: git push origin main
   └── Git computes which commits server lacks (ref comparison)
   └── Builds a packfile of missing objects (with delta compression)
   └── Sends packfile via HTTPS POST

2. GITHUB EDGE: Load balancer + TLS termination
   └── Routes to a web server (Ruby on Rails)

3. RECEIVE LAYER: git-receive-pack
   └── Authenticates the request (OAuth token / SSH key)
   └── Identifies the repository's Spokes set (3 fileservers)

4. PRE-RECEIVE HOOKS
   └── Branch protection rules checked
   └── Code scanning / secret detection
   └── Payload size limits

5. SPOKES PROXY: Synchronous replication
   └── Streams packfile to Fileserver A + Fileserver B simultaneously
   └── Both validate all SHA-1 hashes
   └── Both write objects to their local .git/objects/
   └── Both update refs atomically
   └── Both return the same result hash
   └── 2-of-3 quorum confirmed → WRITE COMMITTED

6. POST-RECEIVE HOOKS
   └── CI/CD pipelines triggered
   └── Webhooks dispatched
   └── Deploy previews kicked off

7. RESPONSE: "Everything up-to-date" or "Branch 'main' set up to track..."

8. BACKGROUND: Fileserver C catches up asynchronously
   └── Receives missing objects from A or B
   └── Validates and writes
   └── Full 3-of-3 consistency restored
```

Your code is safe before step 7 completes. By the time you see the green checkmark, two independent servers on separate physical racks have your data. The third will have it within seconds.

---

## Key Takeaways

GitHub's storage architecture is a masterclass in using a data structure's inherent properties as the foundation for a distributed system.

**Content addressing is the load-bearing insight.** SHA-1 hashes as object names give you deduplication, integrity checking, and distributed sync negotiation for free. Every other layer (packfiles, Spokes, fork networks, bitmaps) builds on this.

**Replicate at the application layer, not the block layer.** Block replication moves bytes; application-level replication moves validated semantic units. Git can verify that a replicated repository is correct in a way that block replication never can.

**Quorum writes, not distributed transactions.** The 2-of-3 quorum protocol is simpler and faster than two-phase commit while providing the same durability guarantee. The third replica catching up asynchronously is acceptable because reads can be served by any quorum-set member.

**Deduplication at every layer.** Blobs deduplicate identical files. Delta compression deduplicated similar files. Fork networks deduplicate common history. Reachability bitmaps deduplicate traversal work. Every layer makes the layers above it cheaper.

**Native formats are operationally invaluable.** Storing repositories as standard `.git` directories (not a proprietary format) means any issue can be diagnosed and repaired using standard `git` commands. This is not a performance choice — it is a resilience and maintainability choice that pays dividends for years.

---

## Further Reading

- [Git's Database Internals series — GitHub Engineering Blog](https://github.blog/open-source/git/gits-database-internals-i-packed-object-store/) (5 parts, deep dive into packfiles, commit graphs, and bitmaps)
- [Introducing DGit / Spokes — GitHub Engineering Blog](https://github.blog/engineering/architecture-optimization/introducing-dgit/)
- [Building Resilience in Spokes — GitHub Engineering Blog](https://github.blog/engineering/infrastructure/building-resilience-in-spokes/)
- [Stretching Spokes — GitHub Engineering Blog](https://github.blog/engineering/infrastructure/stretching-spokes/)
- [Scaling Git's Garbage Collection — GitHub Engineering Blog](https://github.blog/engineering/architecture-optimization/scaling-gits-garbage-collection/)
- [Scaling Monorepo Maintenance — GitHub Engineering Blog](https://github.blog/engineering/architecture-optimization/scaling-monorepo-maintenance/)
- [Pro Git Book, Chapter 10: Git Internals](https://git-scm.com/book/en/v2/Git-Internals-Plumbing-and-Porcelain) — free, canonical reference

---

_Next in the series: How Cloudflare Routes Traffic Across 300+ Cities — Inside Anycast and the Global Load Balancer_
