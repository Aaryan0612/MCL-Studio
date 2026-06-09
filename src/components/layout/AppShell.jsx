import { useEffect, useRef, useState } from 'react';

import { ASTInspector } from '@/components/ast/ASTInspector';
import { DiagnosticsBar } from '@/components/diagnostics/DiagnosticsBar';
import { EditorPanel } from '@/components/editor/EditorPanel';
import { AppHeader } from '@/components/layout/AppHeader';
import { PreviewPanel } from '@/components/preview/PreviewPanel';
import { LAYOUT_TEMPLATES } from '@/constants/templates';
import { UI_TEXT } from '@/constants/ui';
import { useDebouncedValue } from '@/hooks/useDebouncedValue';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { useParser } from '@/hooks/useParser';

const WORKSPACE_STORAGE_KEY = 'mcle-workspace-v1';

function collectExpandableNodeIds(node, ids = []) {
  if (!node || typeof node !== 'object') {
    return ids;
  }

  const children = Array.isArray(node.children) ? node.children : [];

  if (typeof node.id === 'string' && children.length > 0) {
    ids.push(node.id);
  }

  for (const child of children) {
    collectExpandableNodeIds(child, ids);
  }

  return ids;
}

function hasNodeId(node, targetId) {
  if (!node || typeof node !== 'object' || !targetId) {
    return false;
  }

  if (node.id === targetId) {
    return true;
  }

  const children = Array.isArray(node.children) ? node.children : [];

  return children.some((child) => hasNodeId(child, targetId));
}

function findNodeById(node, targetId) {
  if (!node || typeof node !== 'object' || !targetId) {
    return null;
  }

  if (node.id === targetId) {
    return node;
  }

  const children = Array.isArray(node.children) ? node.children : [];

  for (const child of children) {
    const match = findNodeById(child, targetId);

    if (match) {
      return match;
    }
  }

  return null;
}

function findDeepestNodeByLine(node, line) {
  if (
    !node ||
    typeof node !== 'object' ||
    !Number.isFinite(line) ||
    !Number.isFinite(node.startLine) ||
    !Number.isFinite(node.endLine) ||
    line < node.startLine ||
    line > node.endLine
  ) {
    return null;
  }

  const children = Array.isArray(node.children) ? node.children : [];

  for (const child of children) {
    const match = findDeepestNodeByLine(child, line);

    if (match) {
      return match;
    }
  }

  return node.type === 'root' ? null : node;
}

export function AppShell() {
  const [rawText, setRawText, clearRawText] = useLocalStorage(
    WORKSPACE_STORAGE_KEY,
    UI_TEXT.starterTemplate,
  );
  const [showDeveloperTools, setShowDeveloperTools] = useState(false);
  const [showLayoutBoundaries, setShowLayoutBoundaries] = useState(true);
  const [selectedNodeId, setSelectedNodeId] = useState(null);
  const [selectionOrigin, setSelectionOrigin] = useState('inspector');
  const [collapsedNodeIds, setCollapsedNodeIds] = useState([]);
  const [activeTemplateId, setActiveTemplateId] = useState('starter');
  const [exportState, setExportState] = useState('idle');
  const exportResetTimerRef = useRef(null);
  const debouncedText = useDebouncedValue(rawText, 150);
  const parseResult = useParser(debouncedText);
  const isDebouncing = rawText !== debouncedText;
  const ast =
    parseResult?.ast && typeof parseResult.ast === 'object'
      ? parseResult.ast
      : null;
  const expandableNodeIds = ast ? collectExpandableNodeIds(ast, []) : [];
  const expandedNodeIds = expandableNodeIds.filter(
    (nodeId) => !collapsedNodeIds.includes(nodeId),
  );
  const safeSelectedNodeId = hasNodeId(ast, selectedNodeId)
    ? selectedNodeId
    : null;
  const selectedNode = safeSelectedNodeId
    ? findNodeById(ast, safeSelectedNodeId)
    : null;
  const canExportAst = !isDebouncing && ast !== null;

  useEffect(() => {
    return () => {
      if (exportResetTimerRef.current !== null) {
        window.clearTimeout(exportResetTimerRef.current);
      }
    };
  }, []);

  function scheduleExportStateReset() {
    if (exportResetTimerRef.current !== null) {
      window.clearTimeout(exportResetTimerRef.current);
    }

    exportResetTimerRef.current = window.setTimeout(() => {
      setExportState('idle');
      exportResetTimerRef.current = null;
    }, 1800);
  }

  function handleSelectNode(nodeId, origin = 'inspector') {
    setSelectedNodeId(nodeId);
    setSelectionOrigin(origin);
  }

  function handleToggleNode(nodeId) {
    setCollapsedNodeIds((currentIds) =>
      currentIds.includes(nodeId)
        ? currentIds.filter((currentId) => currentId !== nodeId)
        : [...currentIds, nodeId],
    );
  }

  function handleResetWorkspace() {
    clearRawText(UI_TEXT.starterTemplate);
    setSelectedNodeId(null);
    setCollapsedNodeIds([]);
    setSelectionOrigin('inspector');
  }

  function handleSelectNodeByLine(line) {
    const matchedNode = findDeepestNodeByLine(ast, line);

    if (matchedNode?.id) {
      setSelectedNodeId(matchedNode.id);
      setSelectionOrigin('editor');
    }
  }

  function resetInteractionState() {
    setSelectedNodeId(null);
    setCollapsedNodeIds([]);
    setSelectionOrigin('inspector');
  }

  function handleApplyTemplate() {
    const nextTemplate = LAYOUT_TEMPLATES.find(
      (template) => template.id === activeTemplateId,
    );

    if (!nextTemplate) {
      return;
    }

    setRawText(nextTemplate.content);
    resetInteractionState();
  }

  function handleExportAst() {
    if (!canExportAst || ast === null) {
      return;
    }

    try {
      const serializedAst = JSON.stringify(ast, null, 2);
      const astBlob = new Blob([serializedAst], {
        type: 'application/json;charset=utf-8',
      });
      const downloadUrl = window.URL.createObjectURL(astBlob);
      const downloadLink = document.createElement('a');

      downloadLink.href = downloadUrl;
      downloadLink.download = 'ast.json';
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
      window.URL.revokeObjectURL(downloadUrl);

      setExportState('done');
      scheduleExportStateReset();
    } catch {
      setExportState('error');
      scheduleExportStateReset();
    }
  }

  return (
    <div className="min-h-screen bg-app-bg text-app-text">
      <div className="mx-auto flex min-h-screen max-w-[1600px] flex-col">
        <AppHeader
          canExportAst={canExportAst}
          exportState={exportState}
          isDebouncing={isDebouncing}
          onExportAst={handleExportAst}
          onResetWorkspace={handleResetWorkspace}
          parseResult={parseResult}
        />

        <main className="flex flex-1 flex-col">
          <section className="grid flex-1 grid-cols-1 border-b border-app-border lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.35fr)]">
            <EditorPanel
              activeTemplateId={activeTemplateId}
              onChange={setRawText}
              onApplyTemplate={handleApplyTemplate}
              onSelectNodeByLine={handleSelectNodeByLine}
              onTemplateChange={setActiveTemplateId}
              selectedNode={selectedNode}
              selectionOrigin={selectionOrigin}
              templateOptions={LAYOUT_TEMPLATES}
              value={rawText}
            />
            <PreviewPanel
              isDebouncing={isDebouncing}
              onSelectNode={(nodeId) => handleSelectNode(nodeId, 'preview')}
              parseResult={parseResult}
              selectedNodeId={safeSelectedNodeId}
              showLayoutBoundaries={showLayoutBoundaries}
              onToggleLayoutBoundaries={() =>
                setShowLayoutBoundaries((current) => !current)
              }
            />
          </section>

          <section className="border-b border-app-border bg-app-panel">
            <button
              aria-expanded={showDeveloperTools}
              className="developer-tools-toggle"
              onClick={() => setShowDeveloperTools((current) => !current)}
              type="button"
            >
              <span className="developer-tools-toggle-icon">
                {showDeveloperTools ? '−' : '+'}
              </span>
              <span>
                {showDeveloperTools
                  ? UI_TEXT.developerToolsHide
                  : UI_TEXT.developerToolsShow}
              </span>
            </button>
          </section>

          {showDeveloperTools ? (
            <ASTInspector
              ast={parseResult.ast}
              diagnostics={parseResult.diagnostics}
              expandedNodeIds={expandedNodeIds}
              errors={parseResult.errors}
              onSelectNode={(nodeId) => handleSelectNode(nodeId, 'inspector')}
              onToggleNode={handleToggleNode}
              selectedNodeId={safeSelectedNodeId}
              tokens={parseResult.tokens}
              warnings={parseResult.warnings}
            />
          ) : null}
        </main>

        <DiagnosticsBar isDebouncing={isDebouncing} parseResult={parseResult} />
      </div>
    </div>
  );
}
