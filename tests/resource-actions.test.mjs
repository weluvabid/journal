import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const read = (path) => readFile(new URL(`../${path}`, import.meta.url), 'utf8');

test('journal schema retains optional external resource metadata', async () => {
  const schema = await read('src/content.config.ts');

  assert.match(schema, /links:\s*z\s*\.object\(/);

  for (const key of ['git', 'stackblitz', 'mermaid']) {
    assert.match(schema, new RegExp(`${key}: z\\.url\\(\\)\\.optional\\(\\)`));
  }
});

test('article resource actions reuse the existing Git and StackBlitz icons', async () => {
  const component = await read('src/components/resources/ResourceActions.svelte');

  assert.match(component, /import \{ Button, Tooltip \} from '@weluvabid\/iris\/components'/);
  assert.match(component, /import \{ SiGit, SiStackblitz \} from '@weluvabid\/iris\/simple-icons'/);
  assert.equal((component.match(/<Button\.Root/g) ?? []).length, 2);
  assert.match(component, /href=\{git\}/);
  assert.match(component, /target="_blank"/);
  assert.match(component, /rel="noopener noreferrer"/);
  assert.match(component, /aria-label="Source repository \(opens in a new tab\)"/);
  assert.match(component, /href=\{stackblitz\}/);
  assert.match(component, /<SiStackblitz class="size-5" aria-hidden="true" \/>/);
  assert.match(component, /aria-label="Open StackBlitz demo \(opens in a new tab\)"/);
});

test('article page resolves one repository URL from canonical project metadata or article links', async () => {
  const page = await read('src/pages/journal/[...slug].astro');

  assert.match(page, /projectEntry\?\.data\.projectDetails\?\.github/);
  assert.match(page, /entry\.data\.projectDetails\?\.github/);
  assert.match(page, /entry\.data\.links\?\.git/);
  assert.match(
    page,
    /<ResourceActions[\s\S]*?git=\{sourceRepository\}[\s\S]*?stackblitz=\{stackblitzDemo\}/,
  );
  assert.match(page, /projectEntry\?\.data\.projectDetails\?\.stackblitz/);
  assert.match(
    page,
    /<p class="mt-5 text-base leading-8 text-muted-foreground">\{entry\.data\.summary\}<\/p>[\s\S]*?<ResourceActions/,
  );
  assert.doesNotMatch(page, /ProjectResources|entry\.data\.links &&/);
});
