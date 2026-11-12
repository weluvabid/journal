import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const source = await readFile(
  new URL('../src/pages/projects/tag/[...slug].astro', import.meta.url),
  'utf8',
);

test('project tag archive uses Projects as parent and #tag as current breadcrumb', () => {
  assert.ok(
    source.includes("<Breadcrumb.Link href={withBase('/projects/')}>Projects</Breadcrumb.Link>"),
  );
  assert.ok(source.includes('<Breadcrumb.Page>#{label}</Breadcrumb.Page>'));
  assert.ok(!source.includes('Tag: {label}'));
});

test('project tag archive retains the count and removes the redundant hero', () => {
  assert.ok(source.includes("{projects.length === 1 ? 'project' : 'projects'}"));
  assert.ok(!source.includes('Projects filed under'));
  assert.ok(!source.includes('text-4xl font-semibold tracking-tight'));
  assert.ok(!source.includes('<h1'));
});

test('project tag archive preserves the existing responsive project card grid', () => {
  assert.ok(source.includes('<div class="grid items-stretch gap-3 sm:grid-cols-2">'));
  assert.ok(source.includes('<ProjectCard'));
});
