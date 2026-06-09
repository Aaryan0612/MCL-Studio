import { describe, expect, it, vi } from 'vitest';

import { buildDiagnostics } from '@/utils/diagnostics';
import * as astBuilderModule from '@/parser/astBuilder';
import { parse } from '@/parser/parser';
import * as tokenizerModule from '@/parser/tokenizer';
import * as validatorModule from '@/parser/validator';

describe('parse', () => {
  it('returns the full parse contract for valid input', () => {
    const result = parse('# Title');

    expect(result).toEqual({
      tokens: expect.any(Array),
      ast: expect.any(Object),
      errors: expect.any(Array),
      warnings: expect.any(Array),
      diagnostics: expect.objectContaining({
        tokenCount: 1,
        astDepth: 1,
        parseTime: expect.any(Number),
        errorCount: 0,
      }),
    });
  });

  it('returns a fallback result when tokenization fails', () => {
    vi.spyOn(tokenizerModule, 'tokenize').mockImplementation(() => {
      throw new Error('boom');
    });

    expect(parse('anything')).toMatchObject({
      tokens: [],
      ast: null,
      errors: [
        expect.objectContaining({
          type: 'parser_failure',
          severity: 'error',
        }),
      ],
      warnings: [],
      diagnostics: {
        tokenCount: 0,
        astDepth: 0,
        parseTime: 0,
        errorCount: 1,
      },
    });
  });

  it('returns a fallback result when ast building fails', () => {
    vi.spyOn(astBuilderModule, 'buildAST').mockImplementation(() => {
      throw new Error('boom');
    });

    expect(parse('# Broken')).toMatchObject({
      ast: null,
      errors: [expect.objectContaining({ type: 'parser_failure' })],
    });
  });

  it('returns a fallback result when validation fails', () => {
    vi.spyOn(validatorModule, 'validateParseArtifacts').mockImplementation(
      () => {
        throw new Error('boom');
      },
    );

    expect(parse('# Broken')).toMatchObject({
      ast: null,
      errors: [expect.objectContaining({ type: 'parser_failure' })],
    });
  });

  it('can serialize and hydrate exported AST losslessly', () => {
    const result = parse(':::row\n:::col width=100\n# Export\n:::\n:::');
    const exported = JSON.stringify(result.ast, null, 2);
    const hydrated = JSON.parse(exported);

    expect(hydrated).toEqual(result.ast);
    expect(buildDiagnostics({ tokens: result.tokens, ast: hydrated })).toEqual(
      expect.objectContaining({
        tokenCount: result.tokens.length,
        astDepth: result.diagnostics.astDepth,
      }),
    );
  });
});
