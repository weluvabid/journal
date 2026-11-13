import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const read = (path) => readFile(new URL(`../${path}`, import.meta.url), 'utf8');

test('project schema supports optional StackBlitz and Mermaid resources', async () => {
  const schema = await read('src/content.config.ts');

  assert.match(schema, /stackblitz:\s*z\.url\(\)\.optional\(\)/);
  assert.match(schema, /mermaid:\s*z\.url\(\)\.optional\(\)/);
});

test('project detail reuses the shared icon-only resource actions', async () => {
  const page = await read('src/pages/projects/[...slug].astro');

  assert.match(
    page,
    /import ResourceActions from '@components\/resources\/ResourceActions\.svelte'/,
  );
  assert.match(
    page,
    /<ResourceActions[\s\S]*?client:load[\s\S]*?git: entry\.data\.github,[\s\S]*?stackblitz: entry\.data\.stackblitz,[\s\S]*?mermaid: entry\.data\.mermaid,[\s\S]*?\/>/,
  );
  assert.doesNotMatch(page, /GitHub <ExternalLink/);
});

test('JSONPlus project exposes its real StackBlitz workspace', async () => {
  const project = await read('src/content/projects/jsonplus.md');

  assert.match(
    project,
    /stackblitz:\s*['"]https:\/\/stackblitz\.com\/edit\/jsonplus\?file=index\.js['"]/,
  );
});

test('Frontend Atlas project exposes the editable Mermaid diagram', async () => {
  const project = await read('src/content/projects/frontend-atlas.md');

  assert.match(project, /mermaid:\s*['"]https:\/\/mermaid\.live\/edit#pako:/);
});

test('project schema supports an explicit primary journal entry and additional related entries', async () => {
  const schema = await read('src/content.config.ts');
  const project = await read('src/content/projects/cachewise.md');
  const page = await read('src/pages/projects/[...slug].astro');

  assert.match(
    schema,
    /journal:\s*z\s*\.object\([\s\S]*?primary:\s*z\.string\(\)\.regex[\s\S]*?related:\s*z\.array\(z\.string\(\)\.regex/,
  );
  assert.ok(project.includes('journal:\n  primary: building-a-cache-from-first-principles'));
  assert.match(
    project,
    /related: \[cost-aware-eviction-policies, benchmarking-without-lying-to-yourself\]/,
  );
  assert.match(
    page,
    /journalHref=\{[\s\S]*?entryHref\(entry\.data\.journal\.primary\)[\s\S]*?undefined[\s\S]*?\}/,
  );
  assert.match(page, /references\.primary, \.\.\.references\.related/);
});

test('project resource actions render the ghost link only when a primary journal URL exists', async () => {
  const component = await read('src/components/resources/ResourceActions.svelte');
  const page = await read('src/pages/projects/[...slug].astro');

  assert.match(component, /import GhostMark from '@components\/brand\/GhostMark\.svelte'/);
  assert.match(component, /\{#if journalHref\}/);
  assert.match(component, /href=\{journalHref\}/);
  assert.match(component, /aria-label="Read the related journal entry"/);
  assert.match(page, /entry\.data\.journal\?\.primary/);
});

test('StructAura project links to its engineering deep dive', async () => {
  const project = await read('src/content/projects/structaura.md');
  const article = await read('src/content/journal/building-structaura.mdx');

  assert.match(project, /primary: building-structaura/);
  assert.match(article, /project: structaura/);
  assert.match(article, /flat preorder records|canonical representation|Merkle-style/i);
});


test('JSON+ project links to its graph-aware serialization deep dive', async () => {
  const project = await read('src/content/projects/jsonplus.md');
  const article = await read('src/content/journal/building-jsonplus.mdx');

  assert.match(project, /primary: building-jsonplus/);
  assert.match(article, /project: jsonplus/);
  assert.match(article, /node table|shared identity|allocate.*connect/i);
});

test('Frontend Atlas project links to its local-first progress and QR protocol deep dive', async () => {
  const project = await read('src/content/projects/frontend-atlas.md');
  const article = await read('src/content/journal/frontend-atlas-progress-without-accounts.mdx');

  assert.match(project, /primary: frontend-atlas-progress-without-accounts/);
  assert.match(article, /project: frontend-atlas/);
  assert.match(article, /two bits/);
  assert.match(article, /FATL1:/);
  assert.match(article, /favourit/);
  assert.match(article, /QR code/);
});

test('Copy 2 Markdown project links to its local-first extraction deep dive', async () => {
  const project = await read('src/content/projects/copy-2-markdown.md');
  const article = await read('src/content/journal/copy-2-markdown-local-first-browser-extraction.mdx');

  assert.match(project, /primary: copy-2-markdown-local-first-browser-extraction/);
  assert.match(article, /project: copy-2-markdown/);
  assert.match(article, /offscreen document/);
  assert.match(article, /Readability/);
});

test('EnvSentry project links to its value-redacting configuration comparison deep dive', async () => {
  const project = await read('src/content/projects/envsentry.md');
  const article = await read('src/content/journal/envsentry-configuration-drift-without-secrets.mdx');

  assert.match(project, /primary: envsentry-configuration-drift-without-secrets/);
  assert.match(article, /project: envsentry/);
  assert.match(article, /ConfigDocument/);
  assert.match(article, /do not include old values/);
});

test('WordWeave project links to its reversible codec and collision analysis deep dive', async () => {
  const project = await read('src/content/projects/wordweave.md');
  const article = await read('src/content/journal/wordweave-ordinary-words-as-a-codec.mdx');

  assert.match(project, /primary: wordweave-ordinary-words-as-a-codec/);
  assert.match(article, /project: wordweave/);
  assert.match(article, /64⁴/);
  assert.match(article, /not encryption/);
});

test('Pulse project links to its reactive runtime deep dive', async () => {
  const project = await read('src/content/projects/pulse.md');
  const article = await read('src/content/journal/pulse-reactive-runtime-from-first-principles.mdx');

  assert.match(project, /primary: pulse-reactive-runtime-from-first-principles/);
  assert.match(article, /project: pulse/);
  assert.match(article, /hybrid push-pull/);
  assert.match(article, /onCleanup/);
});

test('TinyLSM project links to its storage-engine deep dive', async () => {
  const project = await read('src/content/projects/tiny-lsm.md');
  const article = await read('src/content/journal/a-small-lsm-tree.mdx');

  assert.match(project, /primary: a-small-lsm-tree/);
  assert.match(article, /project: tiny-lsm/);
  assert.match(article, /tombstones/);
  assert.match(article, /published/);
});

test('Cachewise project links to its cache architecture and supporting articles', async () => {
  const project = await read('src/content/projects/cachewise.md');
  const article = await read('src/content/journal/building-a-cache-from-first-principles.mdx');

  assert.match(project, /primary: building-a-cache-from-first-principles/);
  assert.match(project, /related: \[cost-aware-eviction-policies, benchmarking-without-lying-to-yourself\]/);
  assert.match(article, /project: cachewise/);
  assert.match(article, /single-flight/);
  assert.match(article, /logical byte budget/);
});

test('Needle project links to its compiler and reversible debugger deep dive', async () => {
  const project = await read('src/content/projects/needle.md');
  const article = await read('src/content/journal/needle-language-compiler-and-reversible-debugger.mdx');

  assert.match(project, /primary: needle-language-compiler-and-reversible-debugger/);
  assert.match(article, /project: needle/);
  assert.match(article, /bounded deltas/);
  assert.match(article, /Web Worker/);
});
