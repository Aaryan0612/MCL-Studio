import { describe, expect, it } from 'vitest';

import { LAYOUT_TEMPLATES } from '@/constants/templates';
import { parse } from '@/parser/parser';

describe('layout templates', () => {
  it('all templates parse successfully without errors or warnings', () => {
    for (const template of LAYOUT_TEMPLATES) {
      const result = parse(template.content);

      expect(result.errors, template.id).toEqual([]);
      expect(result.warnings, template.id).toEqual([]);
      expect(result.ast).not.toBeNull();
    }
  });
});
