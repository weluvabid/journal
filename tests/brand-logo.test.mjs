import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const header = readFileSync(
  new URL('../src/components/site/JournalHeader.svelte', import.meta.url),
  'utf8',
);
const footer = readFileSync(
  new URL('../src/components/site/JournalFooter.svelte', import.meta.url),
  'utf8',
);
const ghost = readFileSync(
  new URL('../src/components/brand/GhostMark.svelte', import.meta.url),
  'utf8',
);

for (const [name, source] of [
  ['header', header],
  ['footer', footer],
]) {
  test(`${name} uses the shared animated ghost mark`, () => {
    assert.match(source, /GhostMark/);
    assert.match(source, /gradientId=/);
    assert.doesNotMatch(source, />\s*fa\s*</);
  });
}

test('footer ghost and GitHub icons use matching 24px dimensions', () => {
  assert.match(footer, /ghost-link inline-flex size-10/);
  assert.match(footer, /<GhostMark class="h-7 w-auto"/);
  assert.match(footer, /<SiGithub class="size-6"/);
});

test('ghost animation includes idle, blink, twinkle, hover wink and reduced-motion support', () => {
  assert.match(ghost, /ghost-float/);
  assert.match(ghost, /ghost-blink/);
  assert.match(ghost, /ghost-twinkle/);
  assert.match(ghost, /ghost-wink-eye/);
  assert.match(ghost, /prefers-reduced-motion: reduce/);
});
