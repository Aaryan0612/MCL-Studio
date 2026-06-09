import { UI_TEXT } from '@/constants/ui';
import { NodeRenderer } from '@/components/preview/NodeRenderer';

export function PreviewPanel({
  isDebouncing,
  parseResult,
  selectedNodeId,
  showLayoutBoundaries,
  onToggleLayoutBoundaries,
  onSelectNode,
}) {
  const ast =
    parseResult?.ast && typeof parseResult.ast === 'object'
      ? parseResult.ast
      : null;
  const astChildren = Array.isArray(ast?.children) ? ast.children : [];
  const hasRenderableAst = ast !== null && astChildren.length > 0;

  return (
    <section className="panel-shell">
      <div className="panel-header">{UI_TEXT.previewLabel}</div>
      <div className="panel-content preview-panel-content">
        <div className="preview-meta-bar">
          <div>
            <p className="preview-meta-title">{UI_TEXT.previewCanvasTitle}</p>
            <p className="preview-meta-copy">{UI_TEXT.previewCanvasSubtitle}</p>
          </div>
          <button
            className={`preview-guide-toggle ${
              showLayoutBoundaries ? 'preview-guide-toggle-active' : ''
            }`}
            onClick={onToggleLayoutBoundaries}
            type="button"
          >
            {showLayoutBoundaries
              ? UI_TEXT.layoutGuidesHide
              : UI_TEXT.layoutGuidesShow}
          </button>
        </div>

        {hasRenderableAst ? (
          <div className="preview-canvas">
            <div className="preview-stage">
              <NodeRenderer
                node={ast}
                onSelectNode={onSelectNode}
                selectedNodeId={selectedNodeId}
                showLayoutBoundaries={showLayoutBoundaries}
              />
            </div>
          </div>
        ) : (
          <div className="preview-empty-state">
            <p className="preview-empty-title">{UI_TEXT.previewPlaceholder}</p>
            <p className="preview-empty-copy">
              {isDebouncing
                ? 'The layout is refreshing through the debounced parser pipeline.'
                : 'Your layout renders live as the workspace content is parsed.'}
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
