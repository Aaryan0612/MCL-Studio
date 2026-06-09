export function calculateDepth(node, depth = 0) {
  if (!node || typeof node !== 'object') {
    return 0;
  }

  const children = Array.isArray(node.children) ? node.children : [];

  if (children.length === 0) {
    return depth;
  }

  return Math.max(...children.map((child) => calculateDepth(child, depth + 1)));
}
