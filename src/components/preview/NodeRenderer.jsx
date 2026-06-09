function previewClassNames(
  node,
  selectedNodeId,
  baseClassName,
  showLayoutBoundaries,
) {
  const classes = [baseClassName];

  if (
    node?.type !== 'root' &&
    typeof node?.id === 'string' &&
    node.id === selectedNodeId
  ) {
    if (node.type === 'row') {
      classes.push('preview-node-selected-row');
    } else if (node.type === 'col') {
      classes.push('preview-node-selected-col');
    } else if (node.type === 'info') {
      classes.push('preview-node-selected-info');
    } else if (
      node.type === 'H1' ||
      node.type === 'H2' ||
      node.type === 'H3' ||
      node.type === 'text'
    ) {
      classes.push('preview-node-selected-inline');
    } else {
      classes.push('preview-node-selected-inline');
    }
  }

  if (node?.type === 'info') {
    classes.push('preview-node-info');
  }

  if (
    showLayoutBoundaries &&
    (node?.type === 'row' || node?.type === 'col' || node?.type === 'info')
  ) {
    classes.push('preview-node-debug');
  }

  return classes.join(' ');
}

function containerLabel(node) {
  if (node.type === 'row') {
    return 'ROW';
  }

  if (node.type === 'col') {
    return `COL ${typeof node.width === 'number' ? `${node.width}%` : ''}`.trim();
  }

  return 'INFO';
}

export function NodeRenderer({
  node,
  onSelectNode = null,
  selectedNodeId = null,
  showLayoutBoundaries = false,
}) {
  if (!node || typeof node !== 'object') {
    return null;
  }

  if (node.type === 'root') {
    const children = Array.isArray(node.children) ? node.children : [];

    return children.map((child, index) => (
      <NodeRenderer
        key={typeof child?.id === 'string' ? child.id : `node-${index}`}
        node={child}
        onSelectNode={onSelectNode}
        selectedNodeId={selectedNodeId}
        showLayoutBoundaries={showLayoutBoundaries}
      />
    ));
  }

  function handleSelect(event) {
    event.stopPropagation();

    if (typeof node?.id === 'string' && typeof onSelectNode === 'function') {
      onSelectNode(node.id);
    }
  }

  function handleKeyDown(event) {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      handleSelect(event);
    }
  }

  function renderNodeChildren(children) {
    return children.map((child, index) => (
      <NodeRenderer
        key={typeof child?.id === 'string' ? child.id : `node-${index}`}
        node={child}
        onSelectNode={onSelectNode}
        selectedNodeId={selectedNodeId}
        showLayoutBoundaries={showLayoutBoundaries}
      />
    ));
  }

  if (node.type === 'row') {
    const children = Array.isArray(node.children) ? node.children : [];

    return (
      <div
        className={previewClassNames(
          node,
          selectedNodeId,
          'preview-row',
          showLayoutBoundaries,
        )}
        onClick={handleSelect}
        onKeyDown={handleKeyDown}
        role="button"
        tabIndex={0}
      >
        {showLayoutBoundaries ? (
          <span className="preview-debug-label">{containerLabel(node)}</span>
        ) : null}
        {renderNodeChildren(children)}
      </div>
    );
  }

  if (node.type === 'col') {
    const width =
      typeof node.width === 'number' && Number.isFinite(node.width)
        ? Math.min(100, Math.max(0, node.width))
        : 100;

    const children = Array.isArray(node.children) ? node.children : [];

    return (
      <div
        className={previewClassNames(
          node,
          selectedNodeId,
          'preview-col',
          showLayoutBoundaries,
        )}
        onClick={handleSelect}
        onKeyDown={handleKeyDown}
        role="button"
        style={{
          width: `${width}%`,
          flexBasis: `${width}%`,
          maxWidth: `${width}%`,
        }}
        tabIndex={0}
      >
        {showLayoutBoundaries ? (
          <span className="preview-debug-label">{containerLabel(node)}</span>
        ) : null}
        {renderNodeChildren(children)}
      </div>
    );
  }

  if (node.type === 'info') {
    const children = Array.isArray(node.children) ? node.children : [];

    return (
      <div
        className={previewClassNames(
          node,
          selectedNodeId,
          'preview-info',
          showLayoutBoundaries,
        )}
        onClick={handleSelect}
        onKeyDown={handleKeyDown}
        role="button"
        tabIndex={0}
      >
        {showLayoutBoundaries ? (
          <span className="preview-debug-label">{containerLabel(node)}</span>
        ) : null}
        {renderNodeChildren(children)}
      </div>
    );
  }

  if (node.type === 'H1') {
    return (
      <button
        className={previewClassNames(
          node,
          selectedNodeId,
          'preview-h1 preview-leaf-button',
          showLayoutBoundaries,
        )}
        onClick={handleSelect}
        type="button"
      >
        {node.content ?? ''}
      </button>
    );
  }

  if (node.type === 'H2') {
    return (
      <button
        className={previewClassNames(
          node,
          selectedNodeId,
          'preview-h2 preview-leaf-button',
          showLayoutBoundaries,
        )}
        onClick={handleSelect}
        type="button"
      >
        {node.content ?? ''}
      </button>
    );
  }

  if (node.type === 'H3') {
    return (
      <button
        className={previewClassNames(
          node,
          selectedNodeId,
          'preview-h3 preview-leaf-button',
          showLayoutBoundaries,
        )}
        onClick={handleSelect}
        type="button"
      >
        {node.content ?? ''}
      </button>
    );
  }

  if (node.type === 'text') {
    return (
      <button
        className={previewClassNames(
          node,
          selectedNodeId,
          'preview-text preview-leaf-button',
          showLayoutBoundaries,
        )}
        onClick={handleSelect}
        type="button"
      >
        {node.content ?? ''}
      </button>
    );
  }

  return null;
}
