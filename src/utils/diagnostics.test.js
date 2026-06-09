import { describe, expect, it } from 'vitest';

import { calculateDepth } from '@/utils/astDepth';
import { buildDiagnostics } from '@/utils/diagnostics';
import { buildAST } from '@/parser/astBuilder';
import { tokenize } from '@/parser/tokenizer';

describe('calculateDepth', () => {
  it('returns 0 for null or malformed input', () => {
    expect(calculateDepth(null)).toBe(0);
    expect(calculateDepth({})).toBe(0);
  });

  it('returns the deepest child depth', () => {
    const ast = buildAST(
      tokenize(':::row\n:::col width=100\n:::info\nText\n:::\n:::\n:::'),
    );

    expect(calculateDepth(ast)).toBe(4);
  });
});

describe('buildDiagnostics', () => {
  it('builds serializable diagnostics', () => {
    const tokens = tokenize('# Hello');
    const ast = buildAST(tokens);
    const diagnostics = buildDiagnostics({
      tokens,
      ast,
      errors: [],
      parseTime: 1.25,
    });

    expect(JSON.parse(JSON.stringify(diagnostics))).toEqual(diagnostics);
    expect(diagnostics).toEqual({
      tokenCount: 1,
      astDepth: 1,
      parseTime: 1.25,
      errorCount: 0,
    });
  });

  it('handles malformed inputs safely', () => {
    expect(
      buildDiagnostics({
        tokens: null,
        ast: { children: 'nope' },
        errors: null,
      }),
    ).toEqual({
      tokenCount: 0,
      astDepth: 0,
      parseTime: 0,
      errorCount: 0,
    });
  });
});
