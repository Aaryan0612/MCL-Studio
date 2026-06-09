import { formatNodeLabel } from '@/components/ast/astNodeLabel';

export function ASTTreeNode({
  node,
  depth = 0,
  expandedNodeIds = [],
  selectedNodeId = null,
  onSelectNode,
  onToggleNode,
}) {
  const childNodes = Array.isArray(node?.children) ? node.children : [];
  const nodeId = typeof node?.id === 'string' ? node.id : null;
  const isExpandable = childNodes.length > 0;
  const isExpanded = nodeId ? expandedNodeIds.includes(nodeId) : false;
  const isSelected = nodeId !== null && selectedNodeId === nodeId;

  function handleSelect() {
    if (nodeId && typeof onSelectNode === 'function') {
      onSelectNode(nodeId);
    }
  }

  function handleToggle() {
    if (nodeId && isExpandable && typeof onToggleNode === 'function') {
      onToggleNode(nodeId);
    }
  }

  return (
    <div className="space-y-2">
      <div
        className={`ast-node-row ${isSelected ? 'ast-node-selected' : ''}`}
        style={{ marginLeft: `${depth * 16}px` }}
      >
        <button
          aria-label={
            isExpandable
              ? `${isExpanded ? 'Collapse' : 'Expand'} ${formatNodeLabel(node)}`
              : `Select ${formatNodeLabel(node)}`
          }
          className={`ast-node-label ${node?.type === 'info' ? 'ast-node-info' : ''}`}
          onClick={handleSelect}
          type="button"
        >
          {formatNodeLabel(node)}
        </button>

        {isExpandable ? (
          <button
            aria-label={`${isExpanded ? 'Collapse' : 'Expand'} ${formatNodeLabel(node)}`}
            className="ast-node-toggle"
            onClick={handleToggle}
            type="button"
          >
            {isExpanded ? '−' : '+'}
          </button>
        ) : null}
      </div>

      {isExpanded
        ? childNodes.map((child, index) => (
            <ASTTreeNode
              depth={depth + 1}
              expandedNodeIds={expandedNodeIds}
              key={typeof child?.id === 'string' ? child.id : `child-${index}`}
              node={child}
              onSelectNode={onSelectNode}
              onToggleNode={onToggleNode}
              selectedNodeId={selectedNodeId}
            />
          ))
        : null}
    </div>
  );
}
