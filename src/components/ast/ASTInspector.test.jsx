import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { ASTInspector } from '@/components/ast/ASTInspector';
import { parse } from '@/parser/parser';
import { STARTER_DOCUMENT } from '@/test/fixtures';

describe('ASTInspector', () => {
  it('renders graph view by default and toggles to outline view', () => {
    const result = parse(STARTER_DOCUMENT);
    const onSelectNode = vi.fn();
    const onToggleNode = vi.fn();

    render(
      <ASTInspector
        ast={result.ast}
        diagnostics={result.diagnostics}
        errors={result.errors}
        expandedNodeIds={['root', 'node-1', 'node-2']}
        onSelectNode={onSelectNode}
        onToggleNode={onToggleNode}
        selectedNodeId={null}
        tokens={result.tokens}
        warnings={result.warnings}
      />,
    );

    expect(screen.getByRole('button', { name: 'Graph' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'root' })).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Outline' }));

    expect(
      screen.getAllByRole('button', { name: 'Collapse root' }),
    ).toHaveLength(2);
  });

  it('selects graph nodes through the shared callback', () => {
    const result = parse(STARTER_DOCUMENT);
    const onSelectNode = vi.fn();

    render(
      <ASTInspector
        ast={result.ast}
        diagnostics={result.diagnostics}
        errors={result.errors}
        expandedNodeIds={['root', 'node-1', 'node-2']}
        onSelectNode={onSelectNode}
        onToggleNode={vi.fn()}
        selectedNodeId={null}
        tokens={result.tokens}
        warnings={result.warnings}
      />,
    );

    fireEvent.click(screen.getByRole('button', { name: 'col width=100' }));

    expect(onSelectNode).toHaveBeenCalledWith('node-2');
  });

  it('renders resilient empty and malformed states without crashing', () => {
    render(
      <ASTInspector
        ast={null}
        diagnostics={null}
        errors={[{}]}
        expandedNodeIds={[]}
        onSelectNode={vi.fn()}
        onToggleNode={vi.fn()}
        selectedNodeId="missing-node"
        tokens={null}
        warnings={[{ severity: 'warning' }]}
      />,
    );

    expect(screen.getByText('No AST Generated')).toBeInTheDocument();
    expect(screen.getAllByText(/Malformed diagnostic/)).toHaveLength(2);
    expect(screen.getAllByText(/unknown at line 0, column 0/)).toHaveLength(2);
    expect(screen.queryByText('Parser Failure')).not.toBeInTheDocument();
    expect(screen.getByText('Layout Invalid')).toBeInTheDocument();
    expect(screen.getByText('[]')).toBeInTheDocument();
  });
});
