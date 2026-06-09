import { describe, expect, it } from 'vitest';

import { TOKEN_TYPES } from '@/constants/syntax';
import {
  INFO_DOCUMENT,
  INVALID_WIDTH_DOCUMENT,
  ORPHAN_CLOSE_DOCUMENT,
  STARTER_DOCUMENT,
} from '@/test/fixtures';
import { tokenize } from '@/parser/tokenizer';

describe('tokenize', () => {
  it('returns an empty array for empty input', () => {
    expect(tokenize('')).toEqual([]);
    expect(tokenize(' \n \n')).toEqual([]);
  });

  it('tokenizes starter content with exact metadata', () => {
    expect(tokenize(STARTER_DOCUMENT)).toEqual([
      {
        type: TOKEN_TYPES.ROW_OPEN,
        value: 'row',
        line: 1,
        column: 1,
        metadata: {},
      },
      {
        type: TOKEN_TYPES.COL_OPEN,
        value: '100',
        line: 2,
        column: 1,
        metadata: { width: 100 },
      },
      {
        type: TOKEN_TYPES.H1,
        value: 'Welcome',
        line: 3,
        column: 1,
        metadata: {},
      },
      {
        type: TOKEN_TYPES.TEXT,
        value: 'Describe your layout here.',
        line: 4,
        column: 1,
        metadata: {},
      },
      {
        type: TOKEN_TYPES.BLOCK_CLOSE,
        value: ':::',
        line: 5,
        column: 1,
        metadata: {},
      },
      {
        type: TOKEN_TYPES.BLOCK_CLOSE,
        value: ':::',
        line: 6,
        column: 1,
        metadata: {},
      },
    ]);
  });

  it('tokenizes info blocks and plain text', () => {
    const tokens = tokenize(INFO_DOCUMENT);

    expect(tokens.map((token) => token.type)).toEqual([
      TOKEN_TYPES.ROW_OPEN,
      TOKEN_TYPES.COL_OPEN,
      TOKEN_TYPES.H1,
      TOKEN_TYPES.INFO_OPEN,
      TOKEN_TYPES.TEXT,
      TOKEN_TYPES.BLOCK_CLOSE,
      TOKEN_TYPES.TEXT,
      TOKEN_TYPES.BLOCK_CLOSE,
      TOKEN_TYPES.BLOCK_CLOSE,
    ]);
  });

  it('preserves invalid width values as metadata without crashing', () => {
    const tokens = tokenize(INVALID_WIDTH_DOCUMENT);

    expect(tokens[1]).toMatchObject({
      type: TOKEN_TYPES.COL_OPEN,
      value: '101',
      metadata: { width: 101 },
    });
  });

  it('treats malformed directives as text', () => {
    expect(tokenize(':::column width=50')).toEqual([
      {
        type: TOKEN_TYPES.TEXT,
        value: ':::column width=50',
        line: 1,
        column: 1,
        metadata: {},
      },
    ]);
  });

  it('emits orphan closing blocks as BLOCK_CLOSE tokens', () => {
    expect(tokenize(ORPHAN_CLOSE_DOCUMENT)).toEqual([
      {
        type: TOKEN_TYPES.BLOCK_CLOSE,
        value: ':::',
        line: 1,
        column: 1,
        metadata: {},
      },
    ]);
  });

  it('never throws on malformed mixed input', () => {
    expect(() =>
      tokenize('### Heading\n:::bogus\n:::col width=nope\n:::\n# Tail'),
    ).not.toThrow();
  });
});
