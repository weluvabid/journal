/**
 * @typedef {{
 *   type: string,
 *   range: [number, number],
 *   loc: {
 *     start: { line: number, column: number },
 *     end: { line: number, column: number }
 *   },
 *   expression?: { type: string }
 * }} PositionedNode
 */

export default {
  meta: {
    type: 'layout',
    docs: {
      description: 'Keep consecutive standalone assignments together as a padded group',
    },
    fixable: 'whitespace',
    schema: [],
    messages: {
      missingBefore: 'Add a blank line before this assignment group.',
      missingAfter: 'Add a blank line after this assignment group.',
      splitGroup: 'Do not separate consecutive assignments with blank lines.',
    },
  },

  /** @param {import('eslint').Rule.RuleContext} context */
  create(context) {
    const sourceCode = context.sourceCode;

    /** @param {PositionedNode} statement */
    function isAssignment(statement) {
      return (
        statement.type === 'ExpressionStatement' &&
        statement.expression?.type === 'AssignmentExpression'
      );
    }

    /**
     * @param {PositionedNode} left
     * @param {PositionedNode} right
     */
    function hasOnlyWhitespaceBetween(left, right) {
      return /^\s*$/u.test(sourceCode.text.slice(left.range[1], right.range[0]));
    }

    /**
     * @param {PositionedNode} left
     * @param {PositionedNode} right
     * @param {number} blankLinesRequired
     * @returns {((fixer: import('eslint').Rule.RuleFixer) => import('eslint').Rule.Fix) | null}
     */
    function fixGap(left, right, blankLinesRequired) {
      if (!hasOnlyWhitespaceBetween(left, right)) {
        return null;
      }

      const between = sourceCode.text.slice(left.range[1], right.range[0]);
      const newline = sourceCode.text.includes('\r\n') ? '\r\n' : '\n';
      const desired = newline.repeat(blankLinesRequired + 1);
      const indentation = between.match(/[ \t]*$/u)?.[0] ?? '';

      return (fixer) =>
        fixer.replaceTextRange([left.range[1], right.range[0]], `${desired}${indentation}`);
    }

    /** @param {PositionedNode[]} statements */
    function checkBody(statements) {
      for (let index = 0; index < statements.length; index += 1) {
        const statement = statements[index];

        if (!isAssignment(statement)) {
          continue;
        }

        const previous = statements[index - 1];
        const next = statements[index + 1];
        const previousIsAssignment = previous ? isAssignment(previous) : false;
        const nextIsAssignment = next ? isAssignment(next) : false;

        if (previous) {
          const lineGap = statement.loc.start.line - previous.loc.end.line - 1;
          const expectedGap = previousIsAssignment ? 0 : 1;

          if (lineGap !== expectedGap) {
            context.report({
              node: /** @type {import('eslint').Rule.Node} */ (statement),
              messageId: previousIsAssignment ? 'splitGroup' : 'missingBefore',
              fix: fixGap(previous, statement, expectedGap),
            });
          }
        }

        if (next && !nextIsAssignment) {
          const lineGap = next.loc.start.line - statement.loc.end.line - 1;

          if (lineGap !== 1) {
            context.report({
              node: /** @type {import('eslint').Rule.Node} */ (statement),
              messageId: 'missingAfter',
              fix: fixGap(statement, next, 1),
            });
          }
        }
      }
    }

    return {
      /** @param {PositionedNode & { body: PositionedNode[] }} node */
      Program(node) {
        checkBody(node.body);
      },

      /** @param {PositionedNode & { body: PositionedNode[] }} node */
      BlockStatement(node) {
        checkBody(node.body);
      },

      /** @param {PositionedNode & { consequent: PositionedNode[] }} node */
      SwitchCase(node) {
        checkBody(node.consequent);
      },
    };
  },
};
