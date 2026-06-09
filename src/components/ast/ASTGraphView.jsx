import { formatNodeLabel } from '@/components/ast/astNodeLabel';

function ASTGraphBranch({ node, onSelectNode, selectedNodeId }) {
  const childNodes = Array.isArray(node?.children) ? node.children : [];
  const nodeId = typeof node?.id === 'string' ? node.id : null;
  const isSelected = nodeId !== null && nodeId === selectedNodeId;

  function handleSelect() {
    if (nodeId && typeof onSelectNode === 'function') {
      onSelectNode(nodeId);
    }
  }

  return (
    <li className="ast-graph-branch">
      <button
        className={`ast-graph-node ${isSelected ? 'ast-graph-node-selected' : ''}`}
        onClick={handleSelect}
        type="button"
      >
        {formatNodeLabel(node)}
      </button>

      {childNodes.length > 0 ? (
        <ul className="ast-graph-children">
          {childNodes.map((child, index) => (
            <ASTGraphBranch
              key={typeof child?.id === 'string' ? child.id : `graph-${index}`}
              node={child}
              onSelectNode={onSelectNode}
              selectedNodeId={selectedNodeId}
            />
          ))}
        </ul>
      ) : null}
    </li>
  );
}

export function ASTGraphView({ ast, onSelectNode, selectedNodeId }) {
  if (!ast || typeof ast !== 'object') {
    return null;
  }

  return (
    <div className="ast-graph-shell">
      <ul className="ast-graph-root">
        <ASTGraphBranch
          ast={ast}
          node={ast}
          onSelectNode={onSelectNode}
          selectedNodeId={selectedNodeId}
        />
      </ul>
    </div>
  );
}
