import { TOKEN_TYPES } from '@/constants/syntax';

function createToken(type, line, column, value, metadata = {}) {
  return {
    type,
    value,
    line,
    column,
    metadata,
  };
}

export function tokenize(rawText = '') {
  const lines = rawText.split('\n');
  const tokens = [];

  for (let index = 0; index < lines.length; index += 1) {
    const originalLine = lines[index];
    const trimmedLine = originalLine.trim();

    if (!trimmedLine) {
      continue;
    }

    const line = index + 1;
    const column = originalLine.indexOf(trimmedLine) + 1;

    if (trimmedLine === ':::') {
      tokens.push(
        createToken(TOKEN_TYPES.BLOCK_CLOSE, line, column, ':::', {}),
      );
      continue;
    }

    if (trimmedLine === ':::row') {
      tokens.push(createToken(TOKEN_TYPES.ROW_OPEN, line, column, 'row', {}));
      continue;
    }

    if (trimmedLine === ':::info') {
      tokens.push(createToken(TOKEN_TYPES.INFO_OPEN, line, column, 'info', {}));
      continue;
    }

    const colMatch = trimmedLine.match(/^:::col(?:\s+width=(\S+))?$/);
    if (colMatch) {
      const widthValue = colMatch[1] ?? '100';
      const numericWidth = Number(widthValue);
      const metadata = Number.isNaN(numericWidth)
        ? { width: widthValue }
        : { width: numericWidth };

      tokens.push(
        createToken(TOKEN_TYPES.COL_OPEN, line, column, widthValue, metadata),
      );
      continue;
    }

    if (trimmedLine.startsWith('### ')) {
      tokens.push(
        createToken(TOKEN_TYPES.H3, line, column, trimmedLine.slice(4), {}),
      );
      continue;
    }

    if (trimmedLine.startsWith('## ')) {
      tokens.push(
        createToken(TOKEN_TYPES.H2, line, column, trimmedLine.slice(3), {}),
      );
      continue;
    }

    if (trimmedLine.startsWith('# ')) {
      tokens.push(
        createToken(TOKEN_TYPES.H1, line, column, trimmedLine.slice(2), {}),
      );
      continue;
    }

    tokens.push(createToken(TOKEN_TYPES.TEXT, line, column, trimmedLine, {}));
  }

  return tokens;
}
