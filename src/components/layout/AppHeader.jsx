import { UI_TEXT } from '@/constants/ui';

function exportButtonLabel(exportState) {
  if (exportState === 'done') {
    return UI_TEXT.exportAstSuccess;
  }

  if (exportState === 'error') {
    return UI_TEXT.exportAstRetry;
  }

  return UI_TEXT.exportAst;
}

export function AppHeader({
  canExportAst,
  exportState,
  isDebouncing,
  onExportAst,
  onResetWorkspace,
  parseResult,
}) {
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
  const errorCount = Number.isFinite(safeDiagnostics.errorCount)
    ? safeDiagnostics.errorCount
    : safeErrors.length;
  const tokenCount = Number.isFinite(safeDiagnostics.tokenCount)
    ? safeDiagnostics.tokenCount
    : 0;
  const astDepth = Number.isFinite(safeDiagnostics.astDepth)
    ? safeDiagnostics.astDepth
    : 0;
  const statusLabel = isDebouncing
    ? 'Updating'
    : errorCount > 0
      ? 'Needs Attention'
      : 'Live';

  return (
    <header className="app-header">
      <div className="min-w-0 flex-1">
        <p className="app-brand">{UI_TEXT.appTitle}</p>
        <p className="app-subtitle">
          Compose structure on the left. See the layout engine resolve it on the
          right.
        </p>
      </div>

      <div className="hidden min-w-0 flex-1 px-6 xl:block">
        <div className="app-status-strip">
          <div className="app-status-pill app-status-pill-primary">
            <span className="app-status-pill-label">
              {UI_TEXT.workspaceLabel}
            </span>
            <span className="app-status-pill-value">{statusLabel}</span>
          </div>
          <div className="app-status-pill">
            <span className="app-status-pill-label">Tokens</span>
            <span className="app-status-pill-value">{tokenCount}</span>
          </div>
          <div className="app-status-pill">
            <span className="app-status-pill-label">Depth</span>
            <span className="app-status-pill-value">{astDepth}</span>
          </div>
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-3">
        <button
          className="shell-button"
          disabled={!canExportAst}
          onClick={onExportAst}
          type="button"
        >
          {exportButtonLabel(exportState)}
        </button>
        <button
          className="shell-button"
          onClick={onResetWorkspace}
          type="button"
        >
          Reset Workspace
        </button>
      </div>
    </header>
  );
}
