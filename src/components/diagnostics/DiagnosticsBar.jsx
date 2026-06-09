import { UI_TEXT } from '@/constants/ui';

export function DiagnosticsBar({ isDebouncing, parseResult }) {
  const safeParseResult =
    parseResult && typeof parseResult === 'object' ? parseResult : {};
  const safeDiagnostics =
    safeParseResult.diagnostics &&
    typeof safeParseResult.diagnostics === 'object'
      ? safeParseResult.diagnostics
      : {};
  const safeErrors = Array.isArray(safeParseResult.errors)
    ? safeParseResult.errors
    : [];
  const safeWarnings = Array.isArray(safeParseResult.warnings)
    ? safeParseResult.warnings
    : [];
  const tokenCount = Number.isFinite(safeDiagnostics.tokenCount)
    ? safeDiagnostics.tokenCount
    : 0;
  const errorCount = Number.isFinite(safeDiagnostics.errorCount)
    ? safeDiagnostics.errorCount
    : safeErrors.length;
  const warningCount = safeWarnings.length;
  const isParserFailure = safeErrors.some(
    (issue) => issue?.type === 'parser_failure',
  );
  const astDepth = Number.isFinite(safeDiagnostics.astDepth)
    ? safeDiagnostics.astDepth
    : 0;
  const parseTime = Number.isFinite(safeDiagnostics.parseTime)
    ? safeDiagnostics.parseTime
    : 0;
  const statusLabel = isDebouncing
    ? UI_TEXT.pipelineQueued
    : isParserFailure
      ? 'Parser Failure'
      : errorCount > 0
        ? 'Layout Invalid'
        : 'Layout Valid';

  return (
    <footer className="status-footer">
      <span className="status-footer-title">{statusLabel}</span>
      <span className="status-footer-copy">
        {isDebouncing
          ? `${tokenCount} Tokens • Refreshing preview`
          : isParserFailure
            ? 'Recovered safely • Check developer tools for details'
            : `${errorCount} Errors • ${warningCount} Warnings • Depth ${astDepth} • ${parseTime.toFixed(2)}ms`}
      </span>
    </footer>
  );
}
