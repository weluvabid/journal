import assert from 'node:assert/strict';
import { Linter } from 'eslint';
import test from 'node:test';
import assignmentGroupPadding from '../../eslint/rules/assignment-group-padding.js';

function createLinter() {
  const linter = new Linter();

  const config = {
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
    },
    plugins: {
      local: {
        rules: {
          'assignment-group-padding': assignmentGroupPadding,
        },
      },
    },
    rules: {
      'local/assignment-group-padding': 'error',
    },
  };

  return { linter, config };
}

test('assignment groups require blank lines around the group, not within it', () => {
  const { linter, config } = createLinter();

  const source = ['validate();', 'first = 1;', 'second = 2;', 'render();'].join('\n');

  const messages = linter.verify(source, config);

  assert.deepEqual(
    messages.map(({ messageId }) => messageId),
    ['missingBefore', 'missingAfter'],
  );
});

test('assignment groups accept the required spacing', () => {
  const { linter, config } = createLinter();

  const source = ['validate();', '', 'first = 1;', 'second = 2;', '', 'render();'].join('\n');

  assert.deepEqual(linter.verify(source, config), []);
});

test('assignment-group spacing is autofixable', () => {
  const { linter, config } = createLinter();

  const source = ['validate();', 'first = 1;', 'second = 2;', 'render();'].join('\n');

  const result = linter.verifyAndFix(source, config);

  assert.equal(result.fixed, true);

  assert.equal(
    result.output,
    ['validate();', '', 'first = 1;', 'second = 2;', '', 'render();'].join('\n'),
  );
});
