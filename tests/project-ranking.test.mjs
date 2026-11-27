import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import {
  assertFeaturedProjectCount,
  FEATURED_PROJECT_COUNT,
  rankProjects,
} from '../src/lib/project-ranking.ts';

const contentRoot = new URL('../src/content/journal/', import.meta.url);

test('project ranking is explicit, unique and independent of publication dates', async () => {
  const files = (await import('node:fs/promises')).readdir;
  const names = (await files(contentRoot)).filter((name) => name.endsWith('.mdx'));
  const ranked = [];

  for (const name of names) {
    const source = await readFile(new URL(name, contentRoot), 'utf8');
    const frontmatter = source.match(/^---\n([\s\S]*?)\n---/u)?.[1] ?? '';

    if (!/^kind: project$/mu.test(frontmatter)) {
      continue;
    }

    const project = frontmatter.match(/^project: ([a-z0-9-]+)$/mu)?.[1];
    const order = Number(frontmatter.match(/^ {2}order: (\d+)$/mu)?.[1]);

    ranked.push({ project, order });
  }

  ranked.sort((a, b) => a.order - b.order);
  assert.deepEqual(
    ranked.map(({ project }) => project),
    [
      'vehicle-signal-workbench',
      'pixelflow',
      'columnar',
      'structaura',
      'chronos',
      'arrayforge',
      'tiny-lsm',
      'pairwire',
      'jsonplus',
      'algokit',
      'discover',
      'cachewise',
      'envsentry',
      'pulse',
      'iris',
      'frontend-atlas',
      'queryx',
      'signaling',
      'needle',
      'wordweave',
      'copy-2-markdown',
      'journal',
    ],
  );
  assert.deepEqual(
    ranked.map(({ order }) => order),
    Array.from({ length: 22 }, (_, i) => i + 1),
  );
  assert.equal(new Set(ranked.map(({ order }) => order)).size, ranked.length);
});

test('ranking implementation rejects duplicate ranks and derives featured projects from rank', async () => {
  const source = await readFile(new URL('../src/lib/project-ranking.ts', import.meta.url), 'utf8');

  assert.match(source, /share ranking position/);
  assert.match(source, /FEATURED_PROJECT_COUNT = 6/);
  assert.doesNotMatch(source, /featuredProjectIds|featured:\s*z\.boolean/);
});

test('rankProjects sorts by editorial order without mutating the source array', () => {
  const project = (id, order) => ({
    data: { project: id, projectDetails: { order } },
  });
  const input = [
    project('second', 2),
    project('first', 1),
    project('third', 3),
    project('fourth', 4),
    project('fifth', 5),
    project('sixth', 6),
  ];
  const ranked = rankProjects(input);

  assert.equal(FEATURED_PROJECT_COUNT, 6);
  assert.deepEqual(
    ranked.map(({ data }) => data.project),
    ['first', 'second', 'third', 'fourth', 'fifth', 'sixth'],
  );
  assert.equal(input[0].data.project, 'second');
  assert.throws(
    () => rankProjects([...input, project('duplicate', 1)]),
    /share ranking position 1/u,
  );
  assert.doesNotThrow(() => rankProjects(input.slice(0, 1)));
  assert.throws(
    () => assertFeaturedProjectCount(input.slice(0, 5)),
    /Expected at least 6 published projects/u,
  );
  assert.doesNotThrow(() => assertFeaturedProjectCount(input));
});
