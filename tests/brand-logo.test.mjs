import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const read = (path) => readFile(new URL(`../${path}`, import.meta.url), 'utf8');

test('header uses a text Journal wordmark instead of the retired ghost mark', async () => {
  const header = await read('src/components/site/JournalHeader.svelte');
  assert.match(header, />\s*Journal\s*</);
  assert.match(header, /aria-label="Journal home"/);
  assert.doesNotMatch(header, /GhostMark|ghost-link/);
});

test('footer retains the GitHub link without the retired ghost mark', async () => {
  const footer = await read('src/components/site/JournalFooter.svelte');
  assert.match(footer, /SiGithub/);
  assert.match(footer, /https:\/\/github\.com\/weluvabid\/journal/);
  assert.doesNotMatch(footer, /GhostMark|ghost-link/);
});
