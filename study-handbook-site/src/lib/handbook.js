function slugify(value) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function pushParagraph(blocks, lines) {
  if (!lines.length) {
    return;
  }

  blocks.push({
    type: 'paragraph',
    text: lines.join(' ').trim(),
  });
  lines.length = 0;
}

function flushList(blocks, listType, items) {
  if (!items.length) {
    return;
  }

  blocks.push({
    type: listType,
    items: [...items],
  });
  items.length = 0;
}

function flushTable(blocks, tableLines) {
  if (!tableLines.length) {
    return;
  }

  const rows = tableLines
    .filter((line) => line.trim())
    .map((line) =>
      line
        .trim()
        .replace(/^\|/, '')
        .replace(/\|$/, '')
        .split('|')
        .map((cell) => cell.trim()),
    );

  if (rows.length >= 2) {
    blocks.push({
      type: 'table',
      headers: rows[0],
      rows: rows.slice(2),
    });
  }

  tableLines.length = 0;
}

function parseSectionBody(lines) {
  const blocks = [];
  const paragraphLines = [];
  const bulletItems = [];
  const numberedItems = [];
  const tableLines = [];
  let codeFence = null;

  function flushAll() {
    pushParagraph(blocks, paragraphLines);
    flushList(blocks, 'bullet-list', bulletItems);
    flushList(blocks, 'numbered-list', numberedItems);
    flushTable(blocks, tableLines);
  }

  for (const line of lines) {
    if (line.startsWith('```')) {
      flushAll();

      if (codeFence) {
        blocks.push({
          type: 'code',
          language: codeFence.language,
          code: codeFence.lines.join('\n'),
        });
        codeFence = null;
      } else {
        codeFence = {
          language: line.slice(3).trim(),
          lines: [],
        };
      }

      continue;
    }

    if (codeFence) {
      codeFence.lines.push(line);
      continue;
    }

    if (!line.trim()) {
      flushAll();
      continue;
    }

    if (line.startsWith('#### ')) {
      flushAll();
      blocks.push({
        type: 'subheading',
        level: 4,
        text: line.slice(5).trim(),
      });
      continue;
    }

    if (line.startsWith('### ')) {
      flushAll();
      blocks.push({
        type: 'subheading',
        level: 3,
        text: line.slice(4).trim(),
      });
      continue;
    }

    if (line.startsWith('> ')) {
      flushAll();
      blocks.push({
        type: 'quote',
        text: line.slice(2).trim(),
      });
      continue;
    }

    if (/^\d+\.\s+/.test(line)) {
      flushTable(blocks, tableLines);
      pushParagraph(blocks, paragraphLines);
      flushList(blocks, 'bullet-list', bulletItems);
      numberedItems.push(line.replace(/^\d+\.\s+/, '').trim());
      continue;
    }

    if (line.startsWith('- ')) {
      flushTable(blocks, tableLines);
      pushParagraph(blocks, paragraphLines);
      flushList(blocks, 'numbered-list', numberedItems);
      bulletItems.push(line.slice(2).trim());
      continue;
    }

    if (line.trim().startsWith('|')) {
      pushParagraph(blocks, paragraphLines);
      flushList(blocks, 'bullet-list', bulletItems);
      flushList(blocks, 'numbered-list', numberedItems);
      tableLines.push(line);
      continue;
    }

    paragraphLines.push(line.trim());
  }

  flushAll();

  if (codeFence) {
    blocks.push({
      type: 'code',
      language: codeFence.language,
      code: codeFence.lines.join('\n'),
    });
  }

  return blocks;
}

export function parseHandbookMarkdown(markdown) {
  const lines = markdown.split('\n');
  const sections = [];
  let current = null;

  for (const line of lines) {
    if (line.startsWith('## ')) {
      if (current) {
        current.blocks = parseSectionBody(current.bodyLines);
        current.searchText = [
          current.title,
          ...current.bodyLines,
        ].join(' ');
        sections.push(current);
      }

      current = {
        id: slugify(line.slice(3).trim()),
        title: line.slice(3).trim(),
        bodyLines: [],
      };
      continue;
    }

    if (current) {
      current.bodyLines.push(line);
    }
  }

  if (current) {
    current.blocks = parseSectionBody(current.bodyLines);
    current.searchText = [current.title, ...current.bodyLines].join(' ');
    sections.push(current);
  }

  return sections;
}
