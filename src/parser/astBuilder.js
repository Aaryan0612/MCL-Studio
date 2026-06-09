import { TOKEN_TYPES } from '@/constants/syntax';

function createNodeIdFactory() {
  let nodeCount = 0;

  return function nextNodeId() {
    nodeCount += 1;
    return `node-${nodeCount}`;
  };
}

function createRootNode(line) {
  return {
    id: 'root',
    type: 'root',
    startLine: line,
    endLine: line,
    children: [],
  };
}

function createContainerNode(token, nextNodeId) {
  const baseNode = {
    id: nextNodeId(),
    startLine: token.line,
    endLine: token.line,
    children: [],
  };

  if (token.type === TOKEN_TYPES.ROW_OPEN) {
    return { ...baseNode, type: 'row' };
  }

  if (token.type === TOKEN_TYPES.COL_OPEN) {
    return {
      ...baseNode,
      type: 'col',
      width: token.metadata?.width,
    };
  }

  return { ...baseNode, type: 'info' };
}

function createLeafNode(token, nextNodeId) {
  const baseNode = {
    id: nextNodeId(),
    startLine: token.line,
    endLine: token.line,
    children: [],
  };

  if (token.type === TOKEN_TYPES.TEXT) {
    return {
      ...baseNode,
      type: 'text',
      content: token.value ?? '',
    };
  }

  return {
    ...baseNode,
    type: token.type,
    content: token.value ?? '',
  };
}

export function buildAST(tokens = []) {
  const firstLine = tokens[0]?.line ?? 0;
  const lastLine = tokens[tokens.length - 1]?.line ?? firstLine;
  const root = createRootNode(firstLine);
  const stack = [root];
  const nextNodeId = createNodeIdFactory();

  for (const token of tokens) {
    const currentParent = stack[stack.length - 1];

    if (
      token.type === TOKEN_TYPES.ROW_OPEN ||
      token.type === TOKEN_TYPES.COL_OPEN ||
      token.type === TOKEN_TYPES.INFO_OPEN
    ) {
      const node = createContainerNode(token, nextNodeId);
      currentParent.children.push(node);
      currentParent.endLine = Math.max(currentParent.endLine, token.line);
      stack.push(node);
      continue;
    }

    if (token.type === TOKEN_TYPES.BLOCK_CLOSE) {
      if (stack.length > 1) {
        const node = stack.pop();
        node.endLine = token.line;
      }

      stack[stack.length - 1].endLine = Math.max(
        stack[stack.length - 1].endLine,
        token.line,
      );
      continue;
    }

    const node = createLeafNode(token, nextNodeId);
    currentParent.children.push(node);
    currentParent.endLine = Math.max(currentParent.endLine, token.line);
  }

  for (let index = stack.length - 1; index >= 1; index -= 1) {
    stack[index].endLine = Math.max(stack[index].endLine, lastLine);
  }

  root.endLine = Math.max(root.endLine, lastLine);

  return root;
}
