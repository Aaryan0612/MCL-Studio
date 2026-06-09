import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { ASTGraphView } from '@/components/ast/ASTGraphView';
import { PreviewPanel } from '@/components/preview/PreviewPanel';
import { parse } from '@/parser/parser';
import { createLargeDocument } from '@/test/fixtures';

describe('stress coverage', () => {
  it.each([100, 500, 1000])(
    'parses large valid documents with %s column blocks without crashing',
    (columnCount) => {
      const document = createLargeDocument(columnCount);

      const result = parse(document);

      expect(result.ast).not.toBeNull();
      expect(result.errors).toEqual([]);
      expect(result.warnings).toEqual([]);
      expect(result.diagnostics.tokenCount).toBeGreaterThan(columnCount);
      expect(result.diagnostics.astDepth).toBeGreaterThan(0);
    },
  );

  it('renders the preview shell and graph view for a large AST', () => {
    const result = parse(createLargeDocument(100));

    render(
      <div>
        <ASTGraphView
          ast={result.ast}
          onSelectNode={() => {}}
          selectedNodeId={null}
        />
        <PreviewPanel
          isDebouncing={false}
          onSelectNode={() => {}}
          onToggleLayoutBoundaries={() => {}}
          parseResult={result}
          selectedNodeId={null}
          showLayoutBoundaries={true}
        />
      </div>,
    );

    expect(screen.getByText('Layout Canvas')).toBeInTheDocument();
    expect(screen.getAllByText(/row/i).length).toBeGreaterThan(0);
  });
});
