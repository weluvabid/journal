const TABLE_SEPARATOR = /^\s*\|?\s*:?-{3,}:?\s*(?:\|\s*:?-{3,}:?\s*)+\|?\s*$/u;

/**
 * @typedef {{ type: 'text', value: string }} TextNode
 * @typedef {{ type: 'tableCell', children: TextNode[] }} TableCellNode
 * @typedef {{ type: 'tableRow', children: TableCellNode[] }} TableRowNode
 * @typedef {{ type: 'table', align: Array<'left' | 'center' | 'right'>, children: TableRowNode[], position?: unknown }} TableNode
 * @typedef {{ type: string, children?: AstNode[], value?: string, position?: unknown }} AstNode
 */

/** @param {string} row */
function splitCells(row) {
  const trimmed = row.trim().replace(/^\|/u, '').replace(/\|$/u, '');
  return trimmed.split('|').map((cell) => cell.trim());
}

/** @param {string} separator @returns {Array<'left' | 'center' | 'right'>} */
function parseAlignment(separator) {
  return splitCells(separator).map((cell) => {
    const left = cell.startsWith(':');
    const right = cell.endsWith(':');
    if (left && right) return 'center';
    if (right) return 'right';
    return 'left';
  });
}

/** @param {string} line @param {number} expectedCells @returns {TableRowNode | null} */
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

/** @param {AstNode} node @returns {node is TextNode} */
function isTextNode(node) {
  return node.type === 'text' && typeof node.value === 'string';
}

/** @param {AstNode} node @returns {TableNode | null} */
function convertParagraph(node) {
  if (!Array.isArray(node.children) || !node.children.every(isTextNode)) {
    return null;
  }

  const source = node.children.map((child) => child.value).join('');
  const lines = source.split(/\r?\n/u).map((line) => line.trim()).filter(Boolean);
  if (lines.length < 3 || !TABLE_SEPARATOR.test(lines[1])) return null;

  const header = splitCells(lines[0]);
  const align = parseAlignment(lines[1]);
  if (header.length < 2 || header.length !== align.length) return null;

  /** @type {TableRowNode[]} */
  const rows = [];
  const headerRow = toRow(lines[0], header.length);
  if (!headerRow) return null;
  rows.push(headerRow);

  for (const line of lines.slice(2)) {
    const row = toRow(line, header.length);
    if (!row) return null;
    rows.push(row);
  }

  return {
    type: 'table',
    align,
    children: rows,
    position: node.position,
  };
}

/** @param {AstNode} node */
function transform(node) {
  if (!Array.isArray(node.children)) return;

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
 * @returns {(tree: AstNode) => void}
 */
export default function remarkPipeTables() {
  return (tree) => transform(tree);
}
