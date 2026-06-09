export function formatNodeLabel(node) {
  if (!node || typeof node !== 'object') {
    return 'invalid-node';
  }

  if (node.type === 'col' && typeof node.width !== 'undefined') {
    return `${node.type} width=${node.width}`;
  }

  if (
    (node.type === 'H1' ||
      node.type === 'H2' ||
      node.type === 'H3' ||
      node.type === 'text') &&
    node.content
  ) {
    return `${node.type} "${node.content}"`;
  }

  return node.type;
}
