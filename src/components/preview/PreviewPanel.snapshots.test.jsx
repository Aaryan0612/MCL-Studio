import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { PreviewPanel } from '@/components/preview/PreviewPanel';
import { LAYOUT_TEMPLATES } from '@/constants/templates';
import { parse } from '@/parser/parser';

describe('PreviewPanel snapshots', () => {
  for (const template of LAYOUT_TEMPLATES) {
    it(`matches the ${template.id} template snapshot`, () => {
      const result = parse(template.content);
      const { asFragment } = render(
        <PreviewPanel
          isDebouncing={false}
          onSelectNode={() => {}}
          onToggleLayoutBoundaries={() => {}}
          parseResult={result}
          selectedNodeId={null}
          showLayoutBoundaries={true}
        />,
      );

      expect(asFragment()).toMatchSnapshot();
    });
  }
});
