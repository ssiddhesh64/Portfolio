#!/usr/bin/env node
/**
 * Refreshes src/data/repoStats.json: commit count and last push date for
 * every repository in a `repos: [...]` list in src/data/projects.ts, read
 * from the GitHub API.
 *
 *   npm run repo-stats            (set GITHUB_TOKEN to avoid the 60/hour limit)
 *
 * The numbers are committed rather than fetched during the build, so a build
 * never depends on GitHub being reachable. Rerun this after pushing to a
 * project repo, then commit the JSON.
 */
import { readFile, writeFile } from 'node:fs/promises';

const OUT = new URL('../src/data/repoStats.json', import.meta.url);
const SRC = new URL('../src/data/projects.ts', import.meta.url);

const source = await readFile(SRC, 'utf8');
const repos = [
  ...new Set(
    [...source.matchAll(/repos:\s*\[([^\]]*)\]/g)].flatMap((list) =>
      [...list[1].matchAll(/'([\w.-]+\/[\w.-]+)'/g)].map((m) => m[1]),
    ),
  ),
];

const headers = {
  Accept: 'application/vnd.github+json',
  'User-Agent': 'portfolio-repo-stats',
  ...(process.env.GITHUB_TOKEN && {
    Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
  }),
};

async function get(path) {
  const res = await fetch(`https://api.github.com/${path}`, { headers });
  if (!res.ok) throw new Error(`${path}: ${res.status} ${res.statusText}`);
  return res;
}

/** GitHub has no commit-count field; with one commit per page, the last page number is the count. */
async function commitCount(repo) {
  const res = await get(`repos/${repo}/commits?per_page=1`);
  const last = res.headers.get('link')?.match(/[?&]page=(\d+)>; rel="last"/);
  if (last) return Number(last[1]);
  return (await res.json()).length;
}

const stats = {};
for (const repo of repos) {
  const info = await (await get(`repos/${repo}`)).json();
  stats[repo] = {
    commits: await commitCount(repo),
    pushedAt: info.pushed_at.slice(0, 10),
    fork: info.fork,
  };
  if (info.fork) console.warn(`warning: ${repo} is a fork`);
  console.log(repo, stats[repo]);
}

await writeFile(OUT, JSON.stringify(stats, null, 2) + '\n');
console.log(`wrote ${Object.keys(stats).length} repos`);
