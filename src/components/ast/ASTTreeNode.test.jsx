import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { ASTTreeNode } from '@/components/ast/ASTTreeNode';

const TREE = {
  id: 'root',
  type: 'root',
  startLine: 1,
  endLine: 4,
  children: [
    {
      id: 'col-1',
      type: 'col',
      width: 100,
      startLine: 2,
      endLine: 4,
      children: [
        {
          id: 'heading-1',
          type: 'H1',
          content: 'Welcome',
          startLine: 3,
          endLine: 3,
          children: [],
        },
      ],
    },
  ],
};

describe('ASTTreeNode', () => {
  it('renders expanded tree nodes and forwards selection', () => {
    const onSelectNode = vi.fn();

    render(
      <ASTTreeNode
        expandedNodeIds={['root', 'col-1']}
        node={TREE}
        onSelectNode={onSelectNode}
        onToggleNode={vi.fn()}
        selectedNodeId="col-1"
      />,
    );

    fireEvent.click(
      screen.getAllByRole('button', { name: 'Collapse col width=100' })[0],
    );

    expect(onSelectNode).toHaveBeenCalledWith('col-1');
    expect(
      screen.getByRole('button', { name: 'Select H1 "Welcome"' }),
    ).toBeInTheDocument();
  });

  it('toggles expandable nodes and handles leaf nodes safely', () => {
    const onToggleNode = vi.fn();

    render(
      <ASTTreeNode
        expandedNodeIds={[]}
        node={TREE}
        onSelectNode={vi.fn()}
        onToggleNode={onToggleNode}
        selectedNodeId={null}
      />,
    );

    fireEvent.click(screen.getAllByRole('button', { name: 'Expand root' })[1]);

    expect(onToggleNode).toHaveBeenCalledWith('root');
    expect(
      screen.queryByRole('button', { name: 'Select H1 "Welcome"' }),
    ).not.toBeInTheDocument();
    expect(screen.getAllByRole('button', { name: 'Expand root' })).toHaveLength(
      2,
    );
  });
});
