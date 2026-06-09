import { useState } from 'react';

import { ASTGraphView } from '@/components/ast/ASTGraphView';
import { ASTTreeNode } from '@/components/ast/ASTTreeNode';
import { UI_TEXT } from '@/constants/ui';

function ValidationItem({ issue }) {
  const severity =
    typeof issue?.severity === 'string' && issue.severity
      ? issue.severity.toUpperCase()
      : 'ERROR';
  const message =
    typeof issue?.message === 'string' && issue.message
      ? issue.message
      : 'Malformed diagnostic';
  const type =
    typeof issue?.type === 'string' && issue.type ? issue.type : 'unknown';
  const line = Number.isFinite(issue?.line) ? issue.line : 0;
  const column = Number.isFinite(issue?.column) ? issue.column : 0;

  return (
    <div className="rounded-lg border border-app-border bg-app-surface/70 px-3 py-3">
      <p className="text-app-text">
        {severity}: {message}
      </p>
      <p className="mt-1 text-app-textMuted">
        {type} at line {line}, column {column}
      </p>
    </div>
  );
}

export function ASTInspector({
  ast,
  tokens,
  errors,
  warnings,
  diagnostics,
  selectedNodeId,
  expandedNodeIds,
  onSelectNode,
  onToggleNode,
}) {
  const [astViewMode, setAstViewMode] = useState('graph');
  const safeTokens = Array.isArray(tokens) ? tokens : [];
  const safeErrors = Array.isArray(errors) ? errors : [];
  const safeWarnings = Array.isArray(warnings) ? warnings : [];
  const safeDiagnostics =
    diagnostics && typeof diagnostics === 'object' ? diagnostics : {};
  const hasTokens = safeTokens.length > 0;
  const serializedTokens = JSON.stringify(safeTokens, null, 2);
  const hasAst = ast !== null && typeof ast === 'object';
  const issues = [...safeErrors, ...safeWarnings];
  const tokenCount = Number.isFinite(safeDiagnostics.tokenCount)
    ? safeDiagnostics.tokenCount
    : safeTokens.length;
  const astDepth = Number.isFinite(safeDiagnostics.astDepth)
    ? safeDiagnostics.astDepth
    : 0;
  const parseTime = Number.isFinite(safeDiagnostics.parseTime)
    ? safeDiagnostics.parseTime
    : 0;
  const errorCount = Number.isFinite(safeDiagnostics.errorCount)
    ? safeDiagnostics.errorCount
    : safeErrors.length;
  const statusLabel = safeErrors.some(
    (issue) => issue?.type === 'parser_failure',
  )
    ? 'Parser Failure'
    : errorCount > 0
      ? 'Layout Invalid'
      : 'Layout Valid';

  return (
    <section className="panel-shell border-b border-app-border">
      <div className="panel-header">{UI_TEXT.developerToolsLabel}</div>
      <div className="panel-content font-mono text-sm text-app-textSecondary">
        <div className="grid gap-4 xl:grid-cols-2">
          <div className="rounded-lg border border-app-border bg-app-panel p-4">
            <p className="mb-3 text-app-text">{UI_TEXT.astLabel}</p>
            <p className="mb-4">{UI_TEXT.astPlaceholder}</p>
            <div className="ast-view-toggle mb-4">
              <button
                className={`ast-view-toggle-button ${
                  astViewMode === 'graph' ? 'ast-view-toggle-button-active' : ''
                }`}
                onClick={() => setAstViewMode('graph')}
                type="button"
              >
                Graph
              </button>
              <button
                className={`ast-view-toggle-button ${
                  astViewMode === 'outline'
                    ? 'ast-view-toggle-button-active'
                    : ''
                }`}
                onClick={() => setAstViewMode('outline')}
                type="button"
              >
                Outline
              </button>
            </div>
            {hasAst ? (
              <div className="max-h-[360px] overflow-auto">
                {astViewMode === 'graph' ? (
                  <ASTGraphView
                    ast={ast}
                    onSelectNode={onSelectNode}
                    selectedNodeId={selectedNodeId}
                  />
                ) : (
                  <ASTTreeNode
                    expandedNodeIds={expandedNodeIds}
                    node={ast}
                    onSelectNode={onSelectNode}
                    onToggleNode={onToggleNode}
                    selectedNodeId={selectedNodeId}
                  />
                )}
              </div>
            ) : (
              <div className="rounded border border-dashed border-app-border px-4 py-6 text-app-textMuted">
                {UI_TEXT.astEmpty}
              </div>
            )}
          </div>

          <div className="rounded-lg border border-app-border bg-app-panel p-4">
            <p className="mb-3 text-app-text">{UI_TEXT.validationTitle}</p>
            <p className="mb-4">{UI_TEXT.validationPlaceholder}</p>
            <div className="max-h-[360px] space-y-3 overflow-auto">
              {issues.length > 0 ? (
                issues.map((issue, index) => (
                  <ValidationItem
                    issue={issue}
                    key={`${issue?.type ?? 'unknown'}-${issue?.line ?? 0}-${issue?.column ?? 0}-${index}`}
                  />
                ))
              ) : (
                <div className="rounded-lg border border-app-border bg-app-surface/60 px-4 py-5">
                  <p className="text-app-text">Layout Valid</p>
                  <p className="mt-2 text-app-textMuted">
                    No structural validation issues were found.
                  </p>
                </div>
              )}
            </div>
          </div>

          <div className="rounded-lg border border-app-border bg-app-panel p-4">
            <p className="mb-3 text-app-text">{UI_TEXT.tokenInspectorTitle}</p>
            <p className="mb-4 text-app-textMuted">
              {UI_TEXT.tokenInspectorPlaceholder}
            </p>
            <pre className="max-h-[360px] overflow-auto rounded border border-app-border bg-app-surface px-4 py-4 text-xs leading-6 text-app-textSecondary">
              {hasTokens ? serializedTokens : '[]'}
            </pre>
          </div>

          <div className="rounded-lg border border-app-border bg-app-panel p-4">
            <p className="mb-3 text-app-text">{UI_TEXT.diagnosticsTitle}</p>
            <p className="mb-4">{UI_TEXT.diagnosticsPanelPlaceholder}</p>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="developer-stat-card">
                <span className="developer-stat-label">Status</span>
                <span className="developer-stat-value">{statusLabel}</span>
              </div>
              <div className="developer-stat-card">
                <span className="developer-stat-label">Tokens</span>
                <span className="developer-stat-value">{tokenCount}</span>
              </div>
              <div className="developer-stat-card">
                <span className="developer-stat-label">Depth</span>
                <span className="developer-stat-value">{astDepth}</span>
              </div>
              <div className="developer-stat-card">
                <span className="developer-stat-label">Parse Time</span>
                <span className="developer-stat-value">
                  {parseTime.toFixed(2)}ms
                </span>
              </div>
              <div className="developer-stat-card">
                <span className="developer-stat-label">Errors</span>
                <span className="developer-stat-value">{errorCount}</span>
              </div>
              <div className="developer-stat-card">
                <span className="developer-stat-label">Warnings</span>
                <span className="developer-stat-value">
                  {safeWarnings.length}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
