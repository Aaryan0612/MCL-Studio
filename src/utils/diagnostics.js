import { calculateDepth } from '@/utils/astDepth';

export function buildDiagnostics({
  tokens = [],
  ast = null,
  errors = [],
  parseTime = 0,
}) {
  const safeTokens = Array.isArray(tokens) ? tokens : [];
  const safeErrors = Array.isArray(errors) ? errors : [];

  return {
    tokenCount: safeTokens.length,
    astDepth: ast ? calculateDepth(ast) : 0,
    parseTime,
    errorCount: safeErrors.length,
  };
}
