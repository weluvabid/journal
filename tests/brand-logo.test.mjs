import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const header = readFileSync(new URL('../src/components/site/JournalHeader.svelte', import.meta.url), 'utf8');
const footer = readFileSync(new URL('../src/components/site/JournalFooter.svelte', import.meta.url), 'utf8');

for (const [name, source] of [['header', header], ['footer', footer]]) {
  test(`${name} uses the shared ghost mark in both themes`, () => {
    assert.match(source, /brand\/mark\.svg\?url/);
    assert.match(source, /brand\/mark-dark\.svg\?url/);
    assert.match(source, /dark:hidden/);
    assert.match(source, /dark:block/);
    assert.doesNotMatch(source, />\s*fa\s*</);
  });
}
