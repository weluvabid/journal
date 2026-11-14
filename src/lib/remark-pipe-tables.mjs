const TABLE_SEPARATOR = /^\s*\|?\s*:?-{3,}:?\s*(?:\|\s*:?-{3,}:?\s*)+\|?\s*$/u;

function splitCells(row) {
  const trimmed = row.trim().replace(/^\|/u, '').replace(/\|$/u, '');
  return trimmed.split('|').map((cell) => cell.trim());
}

function parseAlignment(separator) {
  return splitCells(separator).map((cell) => {
    const left = cell.startsWith(':');
    const right = cell.endsWith(':');
    if (left && right) return 'center';
    if (right) return 'right';
    return 'left';
  });
}

function toRow(line, expectedCells) {
  const cells = splitCells(line);
  if (cells.length !== expectedCells) return null;

  return {
    type: 'tableRow',
    children: cells.map((value) => ({
      type: 'tableCell',
      children: value ? [{ type: 'text', value }] : [],
    })),
  };
}

function convertParagraph(node) {
  if (!Array.isArray(node.children) || !node.children.every((child) => child.type === 'text')) {
    return null;
  }

  const source = node.children.map((child) => child.value).join('');
  const lines = source.split(/\r?\n/u).map((line) => line.trim()).filter(Boolean);
  if (lines.length < 3 || !TABLE_SEPARATOR.test(lines[1])) return null;

  const header = splitCells(lines[0]);
  const align = parseAlignment(lines[1]);
  if (header.length < 2 || header.length !== align.length) return null;

  const rows = [toRow(lines[0], header.length), ...lines.slice(2).map((line) => toRow(line, header.length))];
  if (rows.some((row) => row === null)) return null;

  return {
    type: 'table',
    align,
    children: rows,
    position: node.position,
  };
}

function transform(node) {
  if (!node || !Array.isArray(node.children)) return;

  for (let index = 0; index < node.children.length; index += 1) {
    const child = node.children[index];
    if (child.type === 'paragraph') {
      const table = convertParagraph(child);
      if (table) node.children[index] = table;
      continue;
    }
    transform(child);
  }
}

/**
 * Minimal pipe-table support for Journal MDX content.
 * Handles plain-text GFM table rows and column alignment without adding a runtime dependency.
 */
export default function remarkPipeTables() {
  return (tree) => transform(tree);
}
