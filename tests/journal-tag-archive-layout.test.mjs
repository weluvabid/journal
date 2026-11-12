import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const source = await readFile(
  new URL('../src/pages/journal/tag/[...slug].astro', import.meta.url),
  'utf8',
);

test('journal tag archive uses Journal as the parent and #tag as the current breadcrumb', () => {
  assert.ok(source.includes("<Breadcrumb.Link href={withBase('/journal/')}>Journal</Breadcrumb.Link>"));
  assert.ok(source.includes('<Breadcrumb.Page>#{label}</Breadcrumb.Page>'));
  assert.ok(!source.includes('Tag: {label}'));
});

test('journal tag archive retains the entry count without a redundant hero', () => {
  assert.ok(source.includes("{entries.length === 1 ? 'entry' : 'entries'}"));
  assert.ok(!source.includes('Writing filed under'));
  assert.ok(!source.includes('text-4xl font-semibold tracking-tight'));
});
