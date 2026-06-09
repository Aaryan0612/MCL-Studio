import { describe, expect, it } from 'vitest';

import {
  INFO_DOCUMENT,
  INVALID_NESTED_ROW_DOCUMENT,
  INVALID_WIDTH_DOCUMENT,
  ORPHAN_CLOSE_DOCUMENT,
  STARTER_DOCUMENT,
} from '@/test/fixtures';
import { buildAST } from '@/parser/astBuilder';
import { tokenize } from '@/parser/tokenizer';
import { validateParseArtifacts } from '@/parser/validator';

function validateDocument(document) {
  const tokens = tokenize(document);
  const ast = buildAST(tokens);
  return validateParseArtifacts({ tokens, ast });
}

describe('validateParseArtifacts', () => {
  it('passes a valid starter document', () => {
    const result = validateDocument(STARTER_DOCUMENT);

    expect(result.valid).toBe(true);
    expect(result.errors).toEqual([]);
    expect(result.warnings).toEqual([]);
  });

  it('rejects orphan closing blocks', () => {
    const result = validateDocument(ORPHAN_CLOSE_DOCUMENT);

    expect(result.valid).toBe(false);
    expect(result.errors).toContainEqual(
      expect.objectContaining({
        type: 'unexpected_close',
        message: 'Unexpected closing tag',
        line: 1,
        column: 1,
        severity: 'error',
      }),
    );
  });

  it('rejects unclosed blocks deterministically', () => {
    const result = validateDocument(':::row\n:::col width=100\nHello');

    expect(result.valid).toBe(false);
    expect(result.errors).toEqual([
      expect.objectContaining({
        type: 'unclosed_block',
        message: 'Expected closing block for :::row',
        line: 1,
        column: 1,
        severity: 'error',
      }),
      expect.objectContaining({
        type: 'unclosed_block',
        message: 'Expected closing block for :::col',
        line: 2,
        column: 1,
        severity: 'error',
      }),
    ]);
  });

  it('rejects invalid widths', () => {
    const result = validateDocument(INVALID_WIDTH_DOCUMENT);

    expect(result.valid).toBe(false);
    expect(result.errors).toContainEqual(
      expect.objectContaining({
        type: 'invalid_width',
        message: 'Column width must be between 1 and 100',
        line: 2,
        column: 1,
      }),
    );
  });

  it('rejects non-numeric width metadata', () => {
    const result = validateParseArtifacts({
      tokens: [
        {
          type: 'COL_OPEN',
          value: 'abc',
          line: 1,
          column: 1,
          metadata: { width: Number.NaN },
        },
      ],
      ast: {
        id: 'root',
        type: 'root',
        startLine: 1,
        endLine: 1,
        children: [],
      },
    });

    expect(result.errors).toContainEqual(
      expect.objectContaining({
        type: 'invalid_width',
        message: 'Column width must be between 1 and 100',
        line: 1,
        column: 1,
      }),
    );
  });

  it('rejects nested rows inside columns', () => {
    const result = validateDocument(INVALID_NESTED_ROW_DOCUMENT);

    expect(result.valid).toBe(false);
    expect(result.errors).toContainEqual(
      expect.objectContaining({
        type: 'invalid_nesting',
        message: 'COL can contain H1/H2/H3/TEXT/INFO only',
        line: 3,
        column: 1,
      }),
    );
  });

  it('rejects malformed AST roots', () => {
    const result = validateParseArtifacts({
      tokens: [],
      ast: null,
    });

    expect(result.valid).toBe(false);
    expect(result.errors).toEqual([
      expect.objectContaining({
        type: 'malformed',
        message: 'AST root is malformed',
        line: 0,
        column: 0,
      }),
    ]);
  });

  it('rejects root-level columns', () => {
    const result = validateParseArtifacts({
      tokens: [],
      ast: {
        id: 'root',
        type: 'root',
        startLine: 1,
        endLine: 3,
        children: [
          {
            id: 'col-1',
            type: 'col',
            width: 100,
            startLine: 2,
            endLine: 3,
            children: [],
          },
        ],
      },
    });

    expect(result.valid).toBe(false);
    expect(result.errors).toContainEqual(
      expect.objectContaining({
        type: 'invalid_nesting',
        message: 'COL must appear inside ROW',
        line: 2,
        column: 1,
      }),
    );
  });

  it('rejects non-column children inside rows', () => {
    const result = validateParseArtifacts({
      tokens: [],
      ast: {
        id: 'root',
        type: 'root',
        startLine: 1,
        endLine: 3,
        children: [
          {
            id: 'row-1',
            type: 'row',
            startLine: 1,
            endLine: 3,
            children: [
              {
                id: 'heading-1',
                type: 'H1',
                content: 'Oops',
                startLine: 2,
                endLine: 2,
                children: [],
              },
            ],
          },
        ],
      },
    });

    expect(result.errors).toContainEqual(
      expect.objectContaining({
        type: 'invalid_nesting',
        message: 'ROW can contain COL only',
        line: 2,
        column: 1,
      }),
    );
  });

  it('rejects non-text children inside info blocks', () => {
    const result = validateParseArtifacts({
      tokens: [],
      ast: {
        id: 'root',
        type: 'root',
        startLine: 1,
        endLine: 4,
        children: [
          {
            id: 'info-1',
            type: 'info',
            startLine: 1,
            endLine: 4,
            children: [
              {
                id: 'row-1',
                type: 'row',
                startLine: 2,
                endLine: 3,
                children: [],
              },
            ],
          },
        ],
      },
    });

    expect(result.errors).toContainEqual(
      expect.objectContaining({
        type: 'invalid_nesting',
        message: 'INFO can contain H1/H2/H3/TEXT only',
        line: 2,
        column: 1,
      }),
    );
  });

  it('reports unclosed info blocks with the frozen token contract', () => {
    const result = validateDocument(':::info\nHello');

    expect(result.errors).toContainEqual(
      expect.objectContaining({
        type: 'unclosed_block',
        message: 'Expected closing block for :::info',
        line: 1,
        column: 1,
      }),
    );
  });

  it('warns for empty containers', () => {
    const result = validateDocument(':::row\n:::col width=100\n:::\n:::');

    expect(result.warnings).toContainEqual(
      expect.objectContaining({
        severity: 'warning',
        message: 'col container has no children',
      }),
    );
  });

  it('accepts info blocks inside columns', () => {
    const result = validateDocument(INFO_DOCUMENT);

    expect(result.valid).toBe(true);
    expect(result.errors).toEqual([]);
  });
});
