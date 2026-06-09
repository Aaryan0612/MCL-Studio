import { TOKEN_TYPES } from '@/constants/syntax';

function createIssue(type, message, line, column, severity = 'error') {
  return {
    type,
    message,
    line,
    column,
    severity,
  };
}

function openerName(tokenType) {
  if (tokenType === TOKEN_TYPES.ROW_OPEN) {
    return ':::row';
  }

  if (tokenType === TOKEN_TYPES.COL_OPEN) {
    return ':::col';
  }

  return ':::info';
}

function validateTokenStructure(tokens) {
  const errors = [];
  const stack = [];

  for (const token of tokens) {
    if (
      token.type === TOKEN_TYPES.ROW_OPEN ||
      token.type === TOKEN_TYPES.COL_OPEN ||
      token.type === TOKEN_TYPES.INFO_OPEN
    ) {
      stack.push(token);
      continue;
    }

    if (token.type === TOKEN_TYPES.BLOCK_CLOSE) {
      if (stack.length === 0) {
        errors.push(
          createIssue(
            'unexpected_close',
            'Unexpected closing tag',
            token.line,
            token.column,
          ),
        );
        continue;
      }

      stack.pop();
    }
  }

  for (const token of stack) {
    errors.push(
      createIssue(
        'unclosed_block',
        `Expected closing block for ${openerName(token.type)}`,
        token.line,
        token.column,
      ),
    );
  }

  return errors;
}

function validateTokenWidths(tokens) {
  const errors = [];

  for (const token of tokens) {
    if (token.type !== TOKEN_TYPES.COL_OPEN) {
      continue;
    }

    const width = token.metadata?.width;

    if (typeof width !== 'number' || Number.isNaN(width)) {
      errors.push(
        createIssue(
          'invalid_width',
          'Column width must be between 1 and 100',
          token.line,
          token.column,
        ),
      );
      continue;
    }

    if (width <= 0 || width > 100) {
      errors.push(
        createIssue(
          'invalid_width',
          'Column width must be between 1 and 100',
          token.line,
          token.column,
        ),
      );
    }
  }

  return errors;
}

function walkAst(node, visitor) {
  visitor(node);

  for (const child of node.children ?? []) {
    walkAst(child, visitor);
  }
}

function validateAstStructure(ast) {
  const errors = [];
  const warnings = [];

  if (!ast || ast.type !== 'root') {
    errors.push(createIssue('malformed', 'AST root is malformed', 0, 0));
    return { errors, warnings };
  }

  walkAst(ast, (node) => {
    if (node.type === 'root') {
      for (const child of node.children) {
        if (child.type === 'col') {
          errors.push(
            createIssue(
              'invalid_nesting',
              'COL must appear inside ROW',
              child.startLine,
              1,
            ),
          );
        }
      }
    }

    if (node.type === 'col') {
      const width = node.width;
      if (
        typeof width !== 'number' ||
        Number.isNaN(width) ||
        width <= 0 ||
        width > 100
      ) {
        errors.push(
          createIssue(
            'invalid_width',
            'Column width must be between 1 and 100',
            node.startLine,
            1,
          ),
        );
      }
    }

    if (
      (node.type === 'row' || node.type === 'col' || node.type === 'info') &&
      node.children.length === 0
    ) {
      warnings.push(
        createIssue(
          'malformed',
          `${node.type} container has no children`,
          node.startLine,
          1,
          'warning',
        ),
      );
    }

    if (node.type === 'row') {
      for (const child of node.children) {
        if (child.type !== 'col') {
          errors.push(
            createIssue(
              'invalid_nesting',
              'ROW can contain COL only',
              child.startLine,
              1,
            ),
          );
        }
      }
    }

    if (node.type === 'col') {
      for (const child of node.children) {
        if (!['H1', 'H2', 'H3', 'text', 'info'].includes(child.type)) {
          errors.push(
            createIssue(
              'invalid_nesting',
              'COL can contain H1/H2/H3/TEXT/INFO only',
              child.startLine,
              1,
            ),
          );
        }
      }
    }

    if (node.type === 'info') {
      for (const child of node.children) {
        if (!['H1', 'H2', 'H3', 'text'].includes(child.type)) {
          errors.push(
            createIssue(
              'invalid_nesting',
              'INFO can contain H1/H2/H3/TEXT only',
              child.startLine,
              1,
            ),
          );
        }
      }
    }
  });

  return { errors, warnings };
}

function dedupeIssues(issues) {
  const seen = new Set();

  return issues.filter((issue) => {
    const key = [
      issue.type,
      issue.message,
      issue.line,
      issue.column,
      issue.severity,
    ].join('|');

    if (seen.has(key)) {
      return false;
    }

    seen.add(key);
    return true;
  });
}

export function validateParseArtifacts({ tokens = [], ast = null }) {
  const tokenErrors = validateTokenStructure(tokens);
  const widthErrors = validateTokenWidths(tokens);
  const { errors: astErrors, warnings } = validateAstStructure(ast);
  const errors = dedupeIssues([...tokenErrors, ...widthErrors, ...astErrors]);

  return {
    valid: errors.length === 0,
    errors,
    warnings: dedupeIssues(warnings),
  };
}
