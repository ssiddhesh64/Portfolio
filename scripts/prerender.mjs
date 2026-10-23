import { readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

const projectRoot = process.cwd();
const { renderHome } = await import('../dist-ssr/entry-server.js');
const markup = renderHome();
const indexPath = resolve(projectRoot, 'dist/index.html');
const indexHtml = readFileSync(indexPath, 'utf8');

if (!indexHtml.includes('<div id="root"></div>')) {
  throw new Error('Could not find the application root in dist/index.html');
}

writeFileSync(
  indexPath,
  indexHtml.replace('<div id="root"></div>', `<div id="root">${markup}</div>`),
);
