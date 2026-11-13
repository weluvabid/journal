import assert from 'node:assert/strict';
import { access, readFile, readdir } from 'node:fs/promises';
import { join } from 'node:path';
import test from 'node:test';

const root = new URL('../', import.meta.url).pathname;
const diagrams = [
  ['copy-2-markdown-local-first-browser-extraction.mdx', 'copy-2-markdown-extraction.svg'],
  ['building-a-cache-from-first-principles.mdx', 'cachewise-single-flight.svg'],
  ['a-small-lsm-tree.mdx', 'tiny-lsm-storage-lifecycle.svg'],
  ['building-structaura.mdx', 'structaura-fingerprinting.svg'],
  ['frontend-atlas-progress-without-accounts.mdx', 'frontend-atlas-progress-transfer.svg'],
];

test('the five architecture diagrams are bundled and open as full-size SVGs', async () => {
  for (const [article, diagram] of diagrams) {
    const content = await readFile(join(root, 'src/content/journal', article), 'utf8');
    assert.match(content, new RegExp(`<figure class="journal-diagram[^>]*>[\\s\\S]*?href="/diagrams/${diagram}"`));
    assert.match(content, /target="_blank" rel="noopener noreferrer"/);
    assert.match(content, new RegExp(`<img src="/diagrams/${diagram}" alt="[^\"]+" loading="lazy"`));
    await access(join(root, 'public/diagrams', diagram));
  }
});

test('journal and project content contain no unfinished example notes', async () => {
  for (const directory of ['src/content/journal', 'src/content/projects']) {
    for (const name of await readdir(join(root, directory))) {
      if (!name.endsWith('.mdx') && !name.endsWith('.md')) continue;
      const content = await readFile(join(root, directory, name), 'utf8');
      assert.doesNotMatch(content, /\*Example I'd add:\*/i, `${directory}/${name}`);
    }
  }
});
