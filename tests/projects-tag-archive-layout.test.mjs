import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
const read = () =>
  readFile(new URL('../src/pages/projects/tag/[...slug].astro', import.meta.url), 'utf8');

test('project tag archives statically render only published projects', async () => {
  const source = await read();

  assert.match(source, /getCollection\([\s\S]*?'journal'/);
  assert.match(source, /!data\.draft && data\.kind === 'project'/);
  assert.match(source, /groupContentByTag\(projects\)/);
  assert.match(source, /rankProjects\(taggedProjects\)/);
  assert.match(source, /<ProjectCard/);
  assert.match(source, /withBase\('\/projects\/'\)/);
  assert.doesNotMatch(source, /Astro\.redirect/);
});
