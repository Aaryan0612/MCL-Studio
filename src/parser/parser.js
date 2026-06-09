import { buildAST } from '@/parser/astBuilder';
import { tokenize } from '@/parser/tokenizer';
import { validateParseArtifacts } from '@/parser/validator';
import { buildDiagnostics } from '@/utils/diagnostics';

function createParserFailure() {
  return {
    type: 'parser_failure',
    code: 'parser_failure',
    severity: 'error',
    message: 'Internal parser failure',
    line: 0,
    column: 0,
  };
}

function createFallbackResult() {
  return {
    tokens: [],
    ast: null,
    errors: [createParserFailure()],
    warnings: [],
    diagnostics: {
      tokenCount: 0,
      astDepth: 0,
      parseTime: 0,
      errorCount: 1,
    },
  };
}

/**
 * Sprint 1 parser shell.
 * Sprint 2 adds tokenizer output while keeping AST, validation,
 * and rendering work deferred to later sprints.
 */
export function parse(rawText = '') {
  try {
    const start = performance.now();
    const safeRawText = typeof rawText === 'string' ? rawText : '';
    const tokens = tokenize(safeRawText);
    const ast = buildAST(tokens);
    const validationResult = validateParseArtifacts({ tokens, ast });
    const errors = Array.isArray(validationResult?.errors)
      ? validationResult.errors
      : [];
    const warnings = Array.isArray(validationResult?.warnings)
      ? validationResult.warnings
      : [];
    const parseTime = Number((performance.now() - start).toFixed(2));
    const diagnostics = buildDiagnostics({
      tokens,
      ast,
      errors,
      parseTime,
    });

    return {
      tokens: Array.isArray(tokens) ? tokens : [],
      ast,
      errors,
      warnings,
      diagnostics,
    };
  } catch {
    return createFallbackResult();
  }
}
