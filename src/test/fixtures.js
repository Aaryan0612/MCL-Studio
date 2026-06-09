export const STARTER_DOCUMENT = `:::row
:::col width=100
# Welcome
Describe your layout here.
:::
:::`;

export const TWO_COLUMN_DOCUMENT = `:::row
:::col width=30
# Left
Navigation
:::
:::col width=70
# Right
Main content
:::
:::`;

export const INFO_DOCUMENT = `:::row
:::col width=100
# Overview
:::info
Important note
:::
Summary text
:::
:::`;

export const INVALID_NESTED_ROW_DOCUMENT = `:::row
:::col width=100
:::row
:::col width=100
Nested
:::
:::
:::
:::`;

export const ORPHAN_CLOSE_DOCUMENT = `:::`;

export const INVALID_WIDTH_DOCUMENT = `:::row
:::col width=101
Too wide
:::
:::`;

export function createLargeDocument(columnCount = 50) {
  const parts = [':::row'];

  for (let index = 0; index < columnCount; index += 1) {
    parts.push(':::col width=100');
    parts.push(`# Section ${index + 1}`);
    parts.push(`Paragraph ${index + 1}`);
    parts.push(':::');
  }

  parts.push(':::');

  return parts.join('\n');
}
