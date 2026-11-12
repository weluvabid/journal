import test from 'node:test';
import assert from 'node:assert/strict';
import { groupEntriesByTag, groupProjectsByTag, tagHref, tagToSlug } from '../src/lib/journal-tags.ts';

test('tag slugs are stable, lowercase, and URL safe', () => {
  assert.equal(tagToSlug('Developer Tools'), 'developer-tools');
  assert.equal(tagToSlug('  Caching  '), 'caching');
  assert.equal(tagToSlug('Café'), 'cafe');
});

test('tag slugs reject values that cannot produce a usable route', () => {
  assert.throws(() => tagToSlug('---'), TypeError);
  assert.throws(() => tagToSlug('   '), TypeError);
});

test('tag archive links use the canonical route', () => {
  assert.equal(tagHref('developer-tools'), '/journal/tag/developer-tools/');
});

test('project tag links use an isolated projects archive route', () => {
  assert.equal(tagHref('developer-tools', 'projects'), '/projects/tag/developer-tools/');
});

test('projects are grouped independently by their own tags', () => {
  const first = { data: { tags: ['rust', 'storage'] } };
  const second = { data: { tags: ['rust', 'performance'] } };
  const groups = groupProjectsByTag([first, second]);

  assert.deepEqual([...groups.keys()], ['performance', 'rust', 'storage']);
  assert.deepEqual(groups.get('rust')?.entries, [first, second]);
});

test('entries are grouped once per tag and preserve source ordering', () => {
  const first = { data: { tags: ['rust', 'systems'] } };
  const second = { data: { tags: ['rust', 'caching'] } };
  const groups = groupEntriesByTag([first, second]);

  assert.deepEqual([...groups.keys()], ['caching', 'rust', 'systems']);
  assert.deepEqual(groups.get('rust')?.entries, [first, second]);
});

test('tag slug collisions fail loudly instead of generating ambiguous pages', () => {
  const entries = [
    { data: { tags: ['C++'] } },
    { data: { tags: ['C'] } },
  ];

  assert.throws(() => groupEntriesByTag(entries), /produce the same URL slug/u);
});
