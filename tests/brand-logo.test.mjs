import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const read = (path) => readFile(new URL(`../${path}`, import.meta.url), 'utf8');

test('header uses the shared ghost mark as the Journal home link', async () => {
  const header = await read('src/components/site/JournalHeader.svelte');

  assert.match(header, /import GhostMark from '@components\/brand\/GhostMark\.svelte'/u);
  assert.match(header, /<GhostMark\b/u);
  assert.match(header, /aria-label="Journal home"/u);
  assert.match(header, /href=\{withBase\('\/'\)\}/u);
});

test('footer retains the GitHub link and shared ghost mark', async () => {
  const footer = await read('src/components/site/JournalFooter.svelte');

  assert.match(footer, /SiGithub/u);
  assert.match(footer, /https:\/\/github\.com\/weluvabid\/journal/u);
  assert.match(footer, /import GhostMark from '@components\/brand\/GhostMark\.svelte'/u);
  assert.match(footer, /<GhostMark\b/u);
});
