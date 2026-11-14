import test from 'node:test';
import assert from 'node:assert/strict';
import remarkPipeTables from '../src/lib/remark-pipe-tables.mjs';

function transform(paragraph) {
  const tree = { type: 'root', children: [paragraph] };

  remarkPipeTables()(tree);

  return tree.children[0];
}

test('converts a pipe table into semantic table, row and cell nodes', () => {
  const table = transform({
    type: 'paragraph',
    children: [
      {
        type: 'text',
        value:
          '| Entry | Size |\n| --- | ---: |\n| Small report | 100 B |\n| Large blob | 1,000 B |',
      },
    ],
  });

  assert.equal(table.type, 'table');
  assert.deepEqual(table.align, ['left', 'right']);
  assert.equal(table.children.length, 3);
  assert.deepEqual(
    table.children[0].children.map((cell) => cell.children[0].value),
    ['Entry', 'Size'],
  );
  assert.deepEqual(
    table.children[2].children.map((cell) => cell.children[0].value),
    ['Large blob', '1,000 B'],
  );
});

test('preserves non-table paragraphs', () => {
  const paragraph = {
    type: 'paragraph',
    children: [{ type: 'text', value: 'A normal paragraph with | a pipe, but no separator.' }],
  };

  assert.equal(transform(paragraph), paragraph);
});

test('does not convert malformed rows with inconsistent column counts', () => {
  const paragraph = {
    type: 'paragraph',
    children: [{ type: 'text', value: '| A | B |\n| --- | --- |\n| one cell |' }],
  };

  assert.equal(transform(paragraph), paragraph);
});
