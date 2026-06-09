import { describe, expect, it } from 'vitest';

import {
  INFO_DOCUMENT,
  ORPHAN_CLOSE_DOCUMENT,
  STARTER_DOCUMENT,
  TWO_COLUMN_DOCUMENT,
} from '@/test/fixtures';
import { buildAST } from '@/parser/astBuilder';
import { tokenize } from '@/parser/tokenizer';

describe('buildAST', () => {
  it('builds a root tree for a single heading', () => {
    const ast = buildAST(tokenize('# Title'));

    expect(ast).toMatchObject({
      id: 'root',
      type: 'root',
      startLine: 1,
      endLine: 1,
      children: [
        {
          id: 'node-1',
          type: 'H1',
          content: 'Title',
          startLine: 1,
          endLine: 1,
          children: [],
        },
      ],
    });
  });

  it('builds a row with two columns and leaf metadata', () => {
    const ast = buildAST(tokenize(TWO_COLUMN_DOCUMENT));

    expect(ast.children[0]).toMatchObject({
      type: 'row',
      startLine: 1,
      endLine: 10,
      children: [
        {
          type: 'col',
          width: 30,
          startLine: 2,
          endLine: 5,
        },
        {
          type: 'col',
          width: 70,
          startLine: 6,
          endLine: 9,
        },
      ],
    });
  });

  it('builds info containers inside columns', () => {
    const ast = buildAST(tokenize(INFO_DOCUMENT));
    const infoNode = ast.children[0].children[0].children[1];

    expect(infoNode).toMatchObject({
      type: 'info',
      startLine: 4,
      endLine: 6,
      children: [
        {
          type: 'text',
          content: 'Important note',
          startLine: 5,
          endLine: 5,
        },
      ],
    });
  });

  it('auto-closes remaining containers at end of file', () => {
    const ast = buildAST(tokenize(':::row\n:::col width=100\nOpen'));

    expect(ast.children[0]).toMatchObject({ endLine: 3 });
    expect(ast.children[0].children[0]).toMatchObject({ endLine: 3 });
  });

  it('does not crash on orphan closing tokens', () => {
    const ast = buildAST(tokenize(ORPHAN_CLOSE_DOCUMENT));

    expect(ast).toMatchObject({
      type: 'root',
      startLine: 1,
      endLine: 1,
      children: [],
    });
  });

  it('builds the starter document snapshot', () => {
    const ast = buildAST(tokenize(STARTER_DOCUMENT));
    expect(ast).toMatchSnapshot();
  });
});
