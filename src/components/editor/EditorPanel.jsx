import { useEffect, useRef, useState } from 'react';

import { UI_TEXT } from '@/constants/ui';

function formatSelectedNodeLabel(node) {
  if (!node || typeof node !== 'object') {
    return 'No source focus';
  }

  if (node.type === 'col' && typeof node.width === 'number') {
    return `COL ${node.width}%`;
  }

  if (node.type === 'info') {
    return 'INFO';
  }

  if (node.type === 'row') {
    return 'ROW';
  }

  return node.type;
}

function getLineStartOffsets(value) {
  const offsets = [0];

  for (let index = 0; index < value.length; index += 1) {
    if (value[index] === '\n') {
      offsets.push(index + 1);
    }
  }

  return offsets;
}

function getLineFromOffset(value, offset) {
  let line = 1;

  for (let index = 0; index < offset && index < value.length; index += 1) {
    if (value[index] === '\n') {
      line += 1;
    }
  }

  return line;
}

function getSelectionRangeForNode(value, node) {
  if (!node || typeof node !== 'object') {
    return null;
  }

  const lineOffsets = getLineStartOffsets(value);
  const startLine = Math.max(1, Number(node.startLine) || 1);
  const endLine = Math.max(startLine, Number(node.endLine) || startLine);
  const start = lineOffsets[startLine - 1] ?? 0;
  const end =
    endLine < lineOffsets.length ? lineOffsets[endLine] - 1 : value.length;

  return {
    start,
    end: Math.max(start, end),
  };
}

export function EditorPanel({
  activeTemplateId,
  onApplyTemplate,
  onTemplateChange,
  templateOptions,
  value,
  onChange,
  selectedNode,
  selectionOrigin,
  onSelectNodeByLine,
}) {
  const textareaRef = useRef(null);
  const [scrollTop, setScrollTop] = useState(0);
  const lineCount = value.split('\n').length;
  const selectedStartLine = Number.isFinite(selectedNode?.startLine)
    ? selectedNode.startLine
    : null;
  const selectedEndLine = Number.isFinite(selectedNode?.endLine)
    ? selectedNode.endLine
    : null;

  useEffect(() => {
    if (
      !textareaRef.current ||
      selectionOrigin === 'editor' ||
      !selectedNode ||
      typeof selectedNode !== 'object'
    ) {
      return;
    }

    const range = getSelectionRangeForNode(value, selectedNode);

    if (!range) {
      return;
    }

    textareaRef.current.focus();
    textareaRef.current.setSelectionRange(range.start, range.end);
  }, [selectedNode, selectionOrigin, value]);

  function handleCursorSync(event) {
    if (typeof onSelectNodeByLine !== 'function') {
      return;
    }

    const offset = event.target.selectionStart ?? 0;
    const line = getLineFromOffset(value, offset);
    onSelectNodeByLine(line);
  }

  return (
    <section className="editor-shell border-r-0 lg:border-r lg:border-app-border">
      <div className="panel-header">{UI_TEXT.editorLabel}</div>
      <div className="panel-content editor-panel-content font-mono text-sm leading-6 text-app-textSecondary">
        <div className="editor-meta-bar">
          <div>
            <p className="editor-meta-title">Source Focus</p>
            <p className="editor-meta-copy">
              {selectedNode
                ? `${formatSelectedNodeLabel(selectedNode)} • lines ${selectedStartLine}-${selectedEndLine}`
                : 'Move through the source to inspect the matching layout region.'}
            </p>
          </div>
          <div className="editor-template-controls">
            <label className="sr-only" htmlFor="layout-template-select">
              Layout template
            </label>
            <select
              id="layout-template-select"
              className="editor-template-select"
              onChange={(event) => onTemplateChange(event.target.value)}
              value={activeTemplateId}
            >
              {templateOptions.map((template) => (
                <option key={template.id} value={template.id}>
                  {template.label}
                </option>
              ))}
            </select>
            <button
              className="editor-template-button"
              onClick={onApplyTemplate}
              type="button"
            >
              Load Template
            </button>
          </div>
        </div>

        <label className="sr-only" htmlFor="workspace-editor">
          Layout editor
        </label>
        <div className="editor-frame">
          <div className="editor-gutter" aria-hidden="true">
            <div
              className="editor-gutter-track"
              style={{ transform: `translateY(-${scrollTop}px)` }}
            >
              {Array.from({ length: lineCount }, (_, index) => {
                const lineNumber = index + 1;
                const isActive =
                  selectedStartLine !== null &&
                  selectedEndLine !== null &&
                  lineNumber >= selectedStartLine &&
                  lineNumber <= selectedEndLine;

                return (
                  <div
                    className={`editor-gutter-line ${
                      isActive ? 'editor-gutter-line-active' : ''
                    }`}
                    key={`line-${lineNumber}`}
                  >
                    {lineNumber}
                  </div>
                );
              })}
            </div>
          </div>

          <textarea
            id="workspace-editor"
            ref={textareaRef}
            className="editor-textarea"
            onChange={(event) => onChange(event.target.value)}
            onClick={handleCursorSync}
            onKeyUp={handleCursorSync}
            onScroll={(event) => setScrollTop(event.target.scrollTop)}
            onSelect={handleCursorSync}
            spellCheck={false}
            value={value}
          />
        </div>
      </div>
    </section>
  );
}
