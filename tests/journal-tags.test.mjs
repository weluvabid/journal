import test from 'node:test';
import assert from 'node:assert/strict';
import { tagToSlug, tagHref, groupEntriesByTag } from '../src/lib/journal-tags.ts';

test('tag slugs are stable, lowercase, and URL safe', () => {
  assert.equal(tagToSlug('Local First'), 'local-first');
  assert.equal(tagToSlug('  Rust & Systems  '), 'rust-systems');
  assert.throws(() => tagToSlug('!!!'), TypeError);
});

test('tag URLs use the owning content section', () => {
  assert.equal(tagHref('project'), '/journal/tag/project/');
  assert.equal(tagHref('developer tools'), '/journal/tag/developer-tools/');
  assert.equal(tagHref('rust', 'projects'), '/projects/tag/rust/');
  assert.equal(tagHref('data structures', 'projects'), '/projects/tag/data-structures/');
});

test('journal entries are grouped once per tag and preserve source order', () => {
  const entries = [
    { data: { id: 'a', tags: ['rust', 'project'] } },
    { data: { id: 'b', tags: ['rust'] } },
  ];
  const groups = groupEntriesByTag(entries);

  assert.deepEqual(groups.get('rust').entries, entries);
  assert.deepEqual(groups.get('project').entries, [entries[0]]);
});
