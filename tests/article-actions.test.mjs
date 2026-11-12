import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const read = (path) => readFile(new URL(`../${path}`, import.meta.url), 'utf8');

test('journal schema accepts optional external resource links', async () => {
  const schema = await read('src/content.config.ts');
  assert.match(schema, /links:\s*z\.object\(/);
  for (const key of ['git', 'stackblitz', 'mermaid']) {
    assert.match(schema, new RegExp(`${key}: z\\.string\\(\\)\\.url\\(\\)\\.optional\\(\\)`));
  }
});

test('article action component uses the existing Simple Icons exports', async () => {
  const component = await read('src/components/article/ArticleActions.svelte');
  assert.match(component, /SiGit, SiStackblitz, SiMermaid/);
  assert.equal((component.match(/target="_blank"/g) ?? []).length, 3);
  assert.equal((component.match(/rel="noopener noreferrer"/g) ?? []).length, 3);
  assert.equal((component.match(/aria-label=/g) ?? []).length, 4);
  assert.match(component, /\{#if links\.git\}/);
  assert.match(component, /\{#if links\.stackblitz\}/);
  assert.match(component, /\{#if links\.mermaid\}/);
});

test('article page renders resource actions only when frontmatter supplies links', async () => {
  const page = await read('src/pages/journal/[...slug].astro');
  assert.match(page, /import ArticleActions from '@components\/article\/ArticleActions\.svelte'/);
  assert.match(page, /entry\.data\.links && <ArticleActions links=\{entry\.data\.links\}/);
});

test('StackBlitz and Mermaid test links are attached to relevant articles', async () => {
  const toolsArticle = await read('src/content/journal/shipping-small-developer-tools.mdx');
  const platformArticle = await read('src/content/journal/designing-a-static-content-platform.mdx');
  assert.match(toolsArticle, /git: https:\/\/github\.com\/weluvabid\/jsonplus/);
  assert.match(toolsArticle, /stackblitz: https:\/\/stackblitz\.com\/edit\/jsonplus\?file=index\.js/);
  assert.match(platformArticle, /git: https:\/\/github\.com\/weluvabid\/frontend-atlas/);
  assert.match(platformArticle, /mermaid: "https:\/\/mermaid\.live\/edit#pako:/);
});
