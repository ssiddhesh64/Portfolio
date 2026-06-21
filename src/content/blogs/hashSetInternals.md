---
title: 'Why Mutable Objects Break HashSet: A Deep Dive into Java Hashing Internals'
date: '2026-06-21'
readTime: '7 min read'
summary: "Discover why modifying objects after inserting them into a HashSet can lead to missing elements, failed lookups, and subtle production bugs. Learn how hashCode(), equals(), buckets, and Java's HashSet internals work together, and why immutability is critical for hash-based collections."
tags:
  [
    'Java',
    'HashSet',
    'HashMap',
    'Data Structures',
    'Collections Framework',
    'Java Internals',
    'Backend Engineering',
    'Software Engineering',
    'Performance',
  ]
---

# Why Mutable Objects Break HashSet

Most Java developers use `HashSet` every day.

```java
Set<String> names = new HashSet<>();
```

We add elements, check if they exist, remove them, and move on.

But what if I told you that a single field modification can make an object "disappear" from a `HashSet` even though it's still inside the collection?

Let's look at a surprising example.

---

## The Mysterious Bug

Consider the following code:

```java
import java.util.HashSet;
import java.util.Set;

class Employee {

    int id;
    String name;

    Employee(int id, String name) {
        this.id = id;
        this.name = name;
    }

    @Override
    public boolean equals(Object o) {
        if (!(o instanceof Employee))
            return false;

        Employee e = (Employee) o;

        return id == e.id;
    }

    @Override
    public int hashCode() {
        return Integer.hashCode(id);
    }
}

public class Main {

    public static void main(String[] args) {

        Set<Employee> set = new HashSet<>();

        Employee emp = new Employee(1, "Sid");

        set.add(emp);

        emp.id = 2;

        System.out.println(set.contains(emp));
    }
}
```

Output:

```text
false
```

Wait.

We just inserted `emp` into the `HashSet`.

Why can't the set find it anymore?

To understand this behavior, we need to understand how `HashSet` actually works internally.

---

## HashSet Is Backed by HashMap

One of the most important facts about Java collections is:

```text
HashSet
   ↓
internally uses
   ↓
HashMap
```

When you write:

```java
set.add(emp);
```

Java roughly does this internally:

```java
map.put(emp, PRESENT);
```

Where:

```java
private static final Object PRESENT = new Object();
```

The object is stored as a key inside a `HashMap`.

This means all the rules of `HashMap` apply to `HashSet` as well.

---

## What Happens During add()?

Let's focus on this line:

```java
Employee emp = new Employee(1, "Sid");

set.add(emp);
```

Before storing the object, Java calculates:

`emp.hashCode()`

Which returns:

`1`

Suppose the underlying `HashMap` currently has `16` buckets.

Before selecting a bucket, Java does something clever called **Hash Spreading**. It XORs the higher bits of the hash with the lower bits to prevent collisions if your hash function is poorly distributed:

```java
(h = key.hashCode()) ^ (h >>> 16)
```

After spreading the hash, a bucket is selected. Most developers think it uses modulo (`hash % 16`), but modulo is slow. Instead, `HashMap` uses a highly optimized bitwise AND operation (which is why `HashMap` capacity must always be a power of 2):

```java
bucket = (n - 1) & hash
```

_(Where_ `n` _is the number of buckets, e.g., 16)._

Result:

`bucket = 1`

**Visual representation:**

```text
    B0[Bucket 0]
    B1[Bucket 1] --> E1(Employee id=1)
    B2[Bucket 2]
    B3[Bucket 3]
    B15[Bucket 15]
```

The object is now physically stored in Bucket 1.

Everything is working perfectly.

---

## The Dangerous Mutation

Now we execute:

```java
emp.id = 2;
```

Remember:

```java
hashCode()
```

depends on:

```java
id
```

So after the modification:

`emp.hashCode()`

returns:

`2`

The object's hash code has changed.

This is where the problem begins.

---

## What Happens During contains()?

When we call:

```java
set.contains(emp);
```

Java performs the following steps:

### Step 1: Calculate hashCode()

`hashCode() = 2`

### Step 2: Determine bucket

`(16 - 1) & 2 = Bucket 2`

### Step 3: Search Bucket 2

**Visual representation:**

```text
    B1[Bucket 1] -.-> E1(Employee id=2)
    B2[Bucket 2] --> Empty[Empty]
```

The object is physically stored in Bucket 1.

But Java is searching Bucket 2.

Result:

```java
false
```

---

## The Object Is Still There

Let's verify.

```java
System.out.println(set.size());
```

Output:

`1`

Interesting.

Now iterate through the collection:

```java
for (Employee e : set) {
    System.out.println(e.id);
}
```

Output:

`2`

The object clearly exists inside the collection.

Yet `set.contains(emp)` returns `false`.

We have corrupted the `HashSet`.

---

## Why Does This Happen?

Hash-based collections assume that an object's hash code remains stable while it is stored inside the collection.

When the object was inserted, `hashCode = 1`, so Java stored it in **Bucket 1**.

Later, `hashCode = 2`, so Java starts looking in **Bucket 2**.

The collection has no mechanism to move the object automatically when its hash code changes.

As a result, the object becomes unreachable through normal lookup operations.

---

## Hash Collisions: LinkedLists and Red-Black Trees

What if two _different_ objects end up with the same bucket index? This is a **Hash Collision**.

Historically, `HashMap` resolved collisions by chaining objects in a `LinkedList` within that bucket. When searching, Java would traverse the list, calling `.equals()` on each element to find the right one.

However, a long `LinkedList` destroys the `O(1)` performance guarantee (turning it into `O(N)`).

To fix this, Java 8 introduced a major optimization: **Tree Bins**. If a bucket's `LinkedList` grows beyond 8 elements (the `TREEIFY_THRESHOLD`), and the map has a minimum capacity of 64, Java converts that list into a **Red-Black Tree**. This restores worst-case performance from `O(N)` to `O(log N)`.

_(This is another reason why your_ `hashCode()` _and_ `equals()` _implementations must be solid—and why elements should ideally implement_ `Comparable` _when used heavily in HashMaps)._

---

## remove() Breaks Too

The problem doesn't stop with `contains()`.

Consider:

```java
set.remove(emp);
```

Java again calculates `hashCode() = 2` and searches **Bucket 2**.

But the object is still physically located in **Bucket 1**.

Result: `false`.

The removal operation fails.

Now you have an object trapped inside the collection.

---

## The Contract of equals() and hashCode()

Java expects the following rule to be respected:

> If fields participate in equals() and hashCode(), those fields should not change while the object is being used as a key in a HashMap or an element in a HashSet.

Violating this rule can cause:

- Failed lookups
- Failed removals
- Duplicate entries
- Memory leaks
- Difficult production bugs

---

## A Real-World Example

Imagine:

```java
class User {

    String email;

    @Override
    public boolean equals(Object o) {
        ...
    }

    @Override
    public int hashCode() {
        ...
    }
}
```

Suppose:

```java
HashSet<User> users = new HashSet<>();
```

and the user is added to the set.

Later:

```java
user.email = "new@email.com";
```

If `email` participates in `hashCode()`, the object may become unreachable.

Operations like:

```java
users.contains(user);
users.remove(user);
```

can suddenly fail.

These bugs are notoriously difficult to diagnose because the object still appears during iteration.

---

## How to Avoid This Problem

### Option 1: Make Key Fields Immutable (Enter Java Records)

The safest solution is absolute immutability. If fields cannot change, the hash code cannot change.

Since Java 14, the perfect way to do this is using a **Record**.

```java
public record Employee(int id, String name) {}
```

Records are completely immutable. Furthermore, the compiler automatically generates perfectly distributed `equals()` and `hashCode()` methods for you.

If you are using objects as keys in a map or elements in a set, **they should probably be records**.

---

### Option 2: Avoid Mutable Fields in hashCode()

Bad example:

```java
@Override
public int hashCode() {
    return Objects.hash(
        salary,
        department,
        address
    );
}
```

If any of these fields change, the object's location inside the hash table becomes invalid.

---

### Option 3: Remove Before Modifying

If modification is unavoidable:

```java
set.remove(emp);

emp.id = 2;

set.add(emp);
```

This works because the collection can reinsert the object using the new hash value.

However, this approach is easy to forget and therefore error-prone.

---

## This Problem Affects More Than HashSet

The same issue applies to:

- HashMap keys
- HashSet elements
- ConcurrentHashMap keys
- Hashtable keys

In general:

> Never mutate fields used by equals() and hashCode() while the object is stored in a hash-based collection.

---

## Key Takeaway

A `HashSet` does not store an object based on where it is today.

It stores an object based on the hash code it had when it was inserted.

If that hash code changes later, Java starts searching in the wrong bucket.

The object is still inside the collection, but from the collection's perspective, it has become lost.

Understanding this behavior is essential for writing correct Java applications and avoiding some of the most frustrating bugs in production systems.
