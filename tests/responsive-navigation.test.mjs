import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const header = readFileSync(new URL('../src/components/site/JournalHeader.svelte', import.meta.url), 'utf8');
const footer = readFileSync(new URL('../src/components/site/JournalFooter.svelte', import.meta.url), 'utf8');

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
  assert.match(header, /hidden items-center gap-1 sm:flex/);
  assert.match(header, /hidden h-6 w-px shrink-0 bg-border sm:block/);
});

test('mobile bottom navigation contains Writing, Projects and Resume in order', () => {
  const writing = footer.indexOf('<span class="text-xs leading-none">Writing</span>');
  const projects = footer.indexOf('<span class="text-xs leading-none">Projects</span>');
  const resume = footer.indexOf('<span class="text-xs leading-none">Resume</span>');

  assert.ok(writing !== -1 && writing < projects && projects < resume);
  assert.match(footer, /sm:hidden/);
  assert.match(footer, /NotebookText/);
});
