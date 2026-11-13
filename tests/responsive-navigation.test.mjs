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

test('desktop primary navigation groups Writing, Projects and Resume before utilities', () => {
  const mainSections = header.indexOf('aria-label="Main sections"');
  const separator = header.indexOf('h-6 w-px');
  const otherControls = header.indexOf('aria-label="Other controls"');

  assert.notEqual(mainSections, -1);
  assert.ok(mainSections < separator && separator < otherControls);
  assert.match(header.slice(mainSections, separator), /Tooltip\.Content>Writing/);
  assert.match(header.slice(mainSections, separator), /Tooltip\.Content>Projects/);
  assert.match(header.slice(mainSections, separator), /Tooltip\.Content>Resume/);
  assert.match(header.slice(mainSections, separator), /FileText/);
});

test('desktop primary navigation and separator are hidden on mobile', () => {
  assert.match(header, /<div class="flex items-center gap-1" aria-label="Main sections">/);
  assert.match(header, /<details class="relative sm:hidden" bind:this=\{mobileMenu\}>/);
  assert.match(header, /<div class="hidden sm:contents">/);
  assert.match(header, /<span class="mx-2 h-6 w-px shrink-0 bg-border"/);
});

test('mobile overflow menu exposes secondary controls without duplicating primary navigation', () => {
  const menu = header.slice(header.indexOf('<details class="relative sm:hidden"'));

  assert.match(menu, /<summary[\s\S]*aria-label="More options"/);
  assert.match(menu, /Light theme|Dark theme/);
  assert.match(menu, /GitHub/);
  assert.match(menu, /Help/);
  assert.doesNotMatch(footer, /Writing|Projects|Resume/);
});
