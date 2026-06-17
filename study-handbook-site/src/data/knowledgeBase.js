import handbookRaw from '../../../docs/MCL_Studio_Engineering_Handbook.md?raw';

import appShellSource from '../../../src/components/layout/AppShell.jsx?raw';
import editorPanelSource from '../../../src/components/editor/EditorPanel.jsx?raw';
import previewPanelSource from '../../../src/components/preview/PreviewPanel.jsx?raw';
import nodeRendererSource from '../../../src/components/preview/NodeRenderer.jsx?raw';
import astInspectorSource from '../../../src/components/ast/ASTInspector.jsx?raw';
import astGraphViewSource from '../../../src/components/ast/ASTGraphView.jsx?raw';
import useParserSource from '../../../src/hooks/useParser.js?raw';
import useDebouncedValueSource from '../../../src/hooks/useDebouncedValue.js?raw';
import useLocalStorageSource from '../../../src/hooks/useLocalStorage.js?raw';
import tokenizerSource from '../../../src/parser/tokenizer.js?raw';
import astBuilderSource from '../../../src/parser/astBuilder.js?raw';
import validatorSource from '../../../src/parser/validator.js?raw';
import parserSource from '../../../src/parser/parser.js?raw';
import diagnosticsSource from '../../../src/utils/diagnostics.js?raw';
import astDepthSource from '../../../src/utils/astDepth.js?raw';

function section(source, start, end) {
  const startIndex = source.indexOf(start);

  if (startIndex === -1) {
    return source.trim();
  }

  if (!end) {
    return source.slice(startIndex).trim();
  }

  const endIndex = source.indexOf(end, startIndex);

  if (endIndex === -1) {
    return source.slice(startIndex).trim();
  }

  return source.slice(startIndex, endIndex).trim();
}

export { handbookRaw };

export const overviewHighlights = [
  'Custom layout grammar with rows, columns, info blocks, headings, and text',
  'Real parser pipeline: tokenizer → AST builder → validator → diagnostics → renderer',
  'React state synchronization between editor, preview, AST graph, AST outline, and diagnostics',
  'Live parser visibility through developer-facing inspection tools',
  'Persistence, templates, AST export, and release-quality testing',
];

export const architectureNodes = [
  {
    id: 'editor',
    label: 'EditorPanel',
    purpose: 'Controlled authoring surface for layout source text.',
    responsibilities: [
      'Capture source text updates',
      'Display line numbers and source focus',
      'Allow template loading',
      'Map cursor position back to AST line selection',
    ],
    inputs: ['value', 'selectedNode', 'templateOptions', 'handlers from AppShell'],
    outputs: ['text change events', 'line-selection events', 'template actions'],
    dependencies: ['AppShell', 'UI_TEXT'],
    breaks: 'The user loses the main authoring surface and source-linked selection behavior.',
    why: 'Editing behavior is very different from preview rendering, so it needs its own focused component.',
    relatedFiles: ['src/components/editor/EditorPanel.jsx'],
  },
  {
    id: 'app-shell',
    label: 'AppShell',
    purpose: 'Central state coordinator and orchestration layer.',
    responsibilities: [
      'Own shared state',
      'Connect hooks and parser output',
      'Coordinate selection across panels',
      'Handle reset, export, and template workflows',
    ],
    inputs: ['editor events', 'preview selection', 'inspector selection', 'template actions'],
    outputs: ['props to all major panels', 'shared parse result', 'selection state'],
    dependencies: ['useParser', 'useDebouncedValue', 'useLocalStorage', 'PreviewPanel', 'ASTInspector'],
    breaks: 'The entire synchronization model collapses: panels drift, export fails, and shared state loses its owner.',
    why: 'A synchronized multi-panel app needs one source of truth for shared interaction state.',
    relatedFiles: ['src/components/layout/AppShell.jsx'],
  },
  {
    id: 'hooks',
    label: 'Custom Hooks',
    purpose: 'Package reusable React behavior outside visual components.',
    responsibilities: [
      'Debounce expensive updates',
      'Persist source text safely',
      'Memoize parser execution',
    ],
    inputs: ['raw text', 'delay', 'storage key'],
    outputs: ['debounced text', 'safe parse result', 'persistent state'],
    dependencies: ['React hooks', 'parse()', 'localStorage'],
    breaks: 'UI logic becomes noisier, parser invocation leaks into components, and persistence behavior gets duplicated.',
    why: 'Hooks keep non-visual React behavior readable and reusable.',
    relatedFiles: [
      'src/hooks/useParser.js',
      'src/hooks/useDebouncedValue.js',
      'src/hooks/useLocalStorage.js',
    ],
  },
  {
    id: 'parser',
    label: 'Parser Orchestrator',
    purpose: 'Run the full language pipeline and guarantee a stable result shape.',
    responsibilities: [
      'Normalize input',
      'Call tokenizer, AST builder, validator, and diagnostics',
      'Measure parse time',
      'Return fallback diagnostics on failure',
    ],
    inputs: ['raw text'],
    outputs: ['tokens', 'ast', 'errors', 'warnings', 'diagnostics'],
    dependencies: ['tokenizer', 'astBuilder', 'validator', 'diagnostics'],
    breaks: 'Every consumer would need to manually orchestrate parser stages and handle failures.',
    why: 'Pipeline orchestration is its own responsibility and should not be embedded in UI or lower parser stages.',
    relatedFiles: ['src/parser/parser.js'],
  },
  {
    id: 'tokenizer',
    label: 'Tokenizer',
    purpose: 'Convert raw source lines into semantic tokens with metadata.',
    responsibilities: [
      'Recognize directives and headings',
      'Attach line and column metadata',
      'Default missing column width to 100',
    ],
    inputs: ['raw source string'],
    outputs: ['Token[]'],
    dependencies: ['TOKEN_TYPES'],
    breaks: 'Without tokens, no AST, no validation, and no meaningful preview can exist.',
    why: 'Later parser stages should not operate directly on raw strings.',
    relatedFiles: ['src/parser/tokenizer.js', 'src/constants/syntax.js'],
  },
  {
    id: 'ast-builder',
    label: 'AST Builder',
    purpose: 'Transform flat tokens into hierarchical structure.',
    responsibilities: [
      'Manage stack-based nesting',
      'Assign stable node IDs',
      'Track source ranges',
      'Auto-close open containers at EOF',
    ],
    inputs: ['Token[]'],
    outputs: ['AST root node'],
    dependencies: ['TOKEN_TYPES'],
    breaks: 'The project loses its intermediate representation, making graph view, validation, and rendering much weaker.',
    why: 'Layout structure is hierarchical, so the project needs a tree rather than a flat token list.',
    relatedFiles: ['src/parser/astBuilder.js'],
  },
  {
    id: 'validator',
    label: 'Validator',
    purpose: 'Enforce frozen grammar rules and width constraints.',
    responsibilities: [
      'Catch unexpected closes and unclosed blocks',
      'Reject invalid nesting',
      'Reject invalid widths',
      'Emit warnings for empty containers',
    ],
    inputs: ['tokens', 'ast'],
    outputs: ['errors', 'warnings', 'valid flag'],
    dependencies: ['TOKEN_TYPES', 'AST shape'],
    breaks: 'Invalid layouts could silently render, and structural rules would no longer be trustworthy.',
    why: 'Parsing alone is not enough; the app must judge structural correctness.',
    relatedFiles: ['src/parser/validator.js'],
  },
  {
    id: 'renderer',
    label: 'NodeRenderer',
    purpose: 'Convert AST nodes into React UI recursively.',
    responsibilities: [
      'Map each node type to JSX',
      'Apply type-aware selection styling',
      'Render nested structure recursively',
    ],
    inputs: ['AST node', 'selectedNodeId', 'selection handler', 'boundary toggle'],
    outputs: ['nested JSX tree'],
    dependencies: ['preview CSS classes', 'AST shape'],
    breaks: 'The parser may still work, but the visible layout disappears or becomes wrong.',
    why: 'Renderer purity makes the architecture easier to test, explain, and trust.',
    relatedFiles: ['src/components/preview/NodeRenderer.jsx'],
  },
  {
    id: 'preview',
    label: 'PreviewPanel',
    purpose: 'Host the layout canvas and renderer output.',
    responsibilities: [
      'Decide whether renderable AST exists',
      'Show empty state when needed',
      'Host layout-boundary controls',
    ],
    inputs: ['parseResult', 'selectedNodeId', 'boundary mode'],
    outputs: ['live layout canvas'],
    dependencies: ['NodeRenderer', 'UI_TEXT'],
    breaks: 'Users lose the main product payoff: visible rendered layout.',
    why: 'Preview rendering deserves its own surface and interaction model.',
    relatedFiles: ['src/components/preview/PreviewPanel.jsx'],
  },
];

export const fileEntries = [
  {
    path: 'src/components/layout/AppShell.jsx',
    group: 'components/layout',
    oneLine: 'Central state coordinator for the entire application.',
    purpose: 'Own shared state and connect every major panel.',
    responsibility: 'State ownership, parser wiring, selection synchronization, export, reset, templates.',
    inputs: ['User text', 'selection events', 'template actions', 'button actions'],
    outputs: ['Props for editor, preview, inspector, header, diagnostics'],
    dependencies: ['useParser', 'useDebouncedValue', 'useLocalStorage'],
    impact: 'Without AppShell, the app loses its synchronization model.',
    viva: 'AppShell is the brain of the UI. It does not parse directly, but it owns the state that feeds the parser and all consumer panels.',
    snippet: section(
      appShellSource,
      'const [rawText, setRawText, clearRawText] = useLocalStorage(',
      '  return (',
    ),
  },
  {
    path: 'src/components/editor/EditorPanel.jsx',
    group: 'components/editor',
    oneLine: 'Controlled editor for writing layout source.',
    purpose: 'Provide text editing, line numbers, source focus, and templates.',
    responsibility: 'Collect input and map cursor position back to AST line context.',
    inputs: ['value', 'selectedNode', 'template options', 'handlers'],
    outputs: ['text change events', 'line selection events'],
    dependencies: ['React refs/effects', 'UI_TEXT'],
    impact: 'Without it, the user cannot author layouts or inspect source-linked node focus.',
    viva: 'EditorPanel is not the parser. It is a controlled input surface that reports intent upward to AppShell.',
    snippet: section(
      editorPanelSource,
      'function handleCursorSync(event) {',
      '  return (',
    ),
  },
  {
    path: 'src/components/preview/PreviewPanel.jsx',
    group: 'components/preview',
    oneLine: 'AST-driven preview canvas shell.',
    purpose: 'Host the rendered layout and expose layout boundary toggles.',
    responsibility: 'Decide between empty state and renderable AST canvas.',
    inputs: ['parseResult', 'selectedNodeId', 'toggle state'],
    outputs: ['preview canvas or empty state'],
    dependencies: ['NodeRenderer'],
    impact: 'Without it, the AST can exist but the user cannot see the rendered result.',
    viva: 'PreviewPanel does not create structure. It consumes parseResult.ast and hands rendering to NodeRenderer.',
    snippet: section(
      previewPanelSource,
      '  const ast =',
      '        ) : (',
    ),
  },
  {
    path: 'src/components/preview/NodeRenderer.jsx',
    group: 'components/preview',
    oneLine: 'Recursive bridge from AST nodes to JSX.',
    purpose: 'Render AST nodes into visible UI without mutating parser output.',
    responsibility: 'Map row, col, info, headings, and text to visual elements.',
    inputs: ['node', 'selectedNodeId', 'onSelectNode', 'showLayoutBoundaries'],
    outputs: ['nested JSX'],
    dependencies: ['AST node shape', 'preview CSS classes'],
    impact: 'Without it, the parser still works but nothing meaningful appears in the preview.',
    viva: 'NodeRenderer is pure renderer logic. It does not tokenize, validate, or modify the AST.',
    snippet: section(
      nodeRendererSource,
      "  if (node.type === 'row') {",
      "  if (node.type === 'H1') {",
    ),
  },
  {
    path: 'src/components/ast/ASTInspector.jsx',
    group: 'components/ast',
    oneLine: 'Developer-facing AST dashboard.',
    purpose: 'Expose graph view, outline view, validation, token JSON, and diagnostics.',
    responsibility: 'Make parser output inspectable and explainable.',
    inputs: ['ast', 'tokens', 'errors', 'warnings', 'diagnostics', 'selectedNodeId'],
    outputs: ['interactive AST engineering tools'],
    dependencies: ['ASTGraphView', 'ASTTreeNode'],
    impact: 'Without it, the app still renders layouts but loses its strongest parser-demonstration features.',
    viva: 'ASTInspector proves the parser is real by exposing structure, issues, metrics, and tokens together.',
    snippet: section(
      astInspectorSource,
      'export function ASTInspector({',
      '          <div className="rounded-lg border border-app-border bg-app-panel p-4">',
    ),
  },
  {
    path: 'src/components/ast/ASTGraphView.jsx',
    group: 'components/ast',
    oneLine: 'Visual AST tree explorer.',
    purpose: 'Make hierarchical structure easier to understand than raw JSON.',
    responsibility: 'Render recursive clickable graph nodes.',
    inputs: ['ast', 'selectedNodeId', 'onSelectNode'],
    outputs: ['graph-like AST visualization'],
    dependencies: ['formatNodeLabel'],
    impact: 'Without it, AST understanding becomes more abstract and less visually intuitive.',
    viva: 'The graph view is a learning and debugging aid built on top of the AST, not a replacement for parsing.',
    snippet: astGraphViewSource.trim(),
  },
  {
    path: 'src/hooks/useParser.js',
    group: 'hooks',
    oneLine: 'Memoized parser hook with failure-safe fallback.',
    purpose: 'Keep parser invocation out of UI components.',
    responsibility: 'Call parse() and return a stable fallback result if needed.',
    inputs: ['rawText'],
    outputs: ['ParseResult'],
    dependencies: ['parse'],
    impact: 'Without it, parser orchestration leaks into AppShell and becomes harder to reason about.',
    viva: 'useParser is a custom hook because parser execution is stateful, reusable, and non-visual.',
    snippet: useParserSource.trim(),
  },
  {
    path: 'src/hooks/useDebouncedValue.js',
    group: 'hooks',
    oneLine: 'Debounce hook that protects typing experience.',
    purpose: 'Delay expensive parse updates.',
    responsibility: 'Return a lagged version of an input value.',
    inputs: ['value', 'delay'],
    outputs: ['debouncedValue'],
    dependencies: ['useEffect', 'useState'],
    impact: 'Without it, parsing happens on every keystroke and the editor feels heavier.',
    viva: 'Debouncing improves UX by separating immediate typing from delayed parser recomputation.',
    snippet: useDebouncedValueSource.trim(),
  },
  {
    path: 'src/hooks/useLocalStorage.js',
    group: 'hooks',
    oneLine: 'Persistence hook for raw workspace text.',
    purpose: 'Restore and save editor content across reloads.',
    responsibility: 'Read, write, and clear localStorage safely.',
    inputs: ['key', 'defaultValue'],
    outputs: ['value', 'setValue', 'clearValue'],
    dependencies: ['localStorage', 'useEffect', 'useState'],
    impact: 'Without it, workspace persistence disappears and reset becomes less reliable.',
    viva: 'Only source text is persisted. AST and diagnostics are recomputed because they are derived data.',
    snippet: useLocalStorageSource.trim(),
  },
  {
    path: 'src/parser/tokenizer.js',
    group: 'parser',
    oneLine: 'Converts source text into tokens with metadata.',
    purpose: 'Recognize layout syntax and attach source-aware metadata.',
    responsibility: 'Emit ROW_OPEN, COL_OPEN, INFO_OPEN, BLOCK_CLOSE, headings, and TEXT.',
    inputs: ['rawText'],
    outputs: ['Token[]'],
    dependencies: ['TOKEN_TYPES'],
    impact: 'Without tokens, no meaningful parser pipeline exists.',
    viva: 'Tokenizer is the first parser stage. It does classification, not rendering.',
    snippet: section(
      tokenizerSource,
      'export function tokenize(rawText = \'\') {',
      '  return tokens;',
    ),
  },
  {
    path: 'src/parser/astBuilder.js',
    group: 'parser',
    oneLine: 'Builds a hierarchical AST using a stack.',
    purpose: 'Transform flat token streams into tree structure.',
    responsibility: 'Create nodes, manage nesting, assign IDs, and update line ranges.',
    inputs: ['Token[]'],
    outputs: ['AST root'],
    dependencies: ['TOKEN_TYPES'],
    impact: 'Without the AST, validation, graph view, export, and recursive rendering become much weaker.',
    viva: 'The stack is the key idea here: open container tokens push, close tokens pop.',
    snippet: section(
      astBuilderSource,
      'export function buildAST(tokens = []) {',
      '  return root;',
    ),
  },
  {
    path: 'src/parser/validator.js',
    group: 'parser',
    oneLine: 'Enforces grammar and width rules after parsing.',
    purpose: 'Judge structural correctness of tokens and AST nodes.',
    responsibility: 'Emit errors and warnings for invalid states.',
    inputs: ['tokens', 'ast'],
    outputs: ['valid', 'errors', 'warnings'],
    dependencies: ['TOKEN_TYPES'],
    impact: 'Without it, invalid layouts can pass silently and the grammar loses credibility.',
    viva: 'Validator does not build the AST. It works after AST creation and token emission.',
    snippet: section(
      validatorSource,
      'function validateAstStructure(ast) {',
      'function dedupeIssues(issues) {',
    ),
  },
  {
    path: 'src/parser/parser.js',
    group: 'parser',
    oneLine: 'Orchestrates the entire parser pipeline.',
    purpose: 'Run every parser stage and guarantee a stable result shape.',
    responsibility: 'Normalize input, time parsing, invoke stages, return fallback on failure.',
    inputs: ['rawText'],
    outputs: ['ParseResult'],
    dependencies: ['tokenize', 'buildAST', 'validateParseArtifacts', 'buildDiagnostics'],
    impact: 'Without it, each consumer would need to assemble parser stages manually.',
    viva: 'parser.js is the single place where the full pipeline is assembled in order.',
    snippet: parserSource.trim(),
  },
  {
    path: 'src/utils/diagnostics.js',
    group: 'utils',
    oneLine: 'Builds lightweight parser metrics.',
    purpose: 'Compute summary values without polluting UI components.',
    responsibility: 'Return token count, AST depth, parse time, and error count.',
    inputs: ['tokens', 'ast', 'errors', 'parseTime'],
    outputs: ['diagnostics object'],
    dependencies: ['calculateDepth'],
    impact: 'Without it, diagnostics logic becomes duplicated or inconsistent.',
    viva: 'Diagnostics summarize state. They do not create validation rules.',
    snippet: diagnosticsSource.trim(),
  },
  {
    path: 'src/utils/astDepth.js',
    group: 'utils',
    oneLine: 'Pure recursive AST depth calculator.',
    purpose: 'Measure the structural depth of the tree.',
    responsibility: 'Traverse children recursively without mutation.',
    inputs: ['node'],
    outputs: ['depth number'],
    dependencies: ['AST shape'],
    impact: 'Without it, AST depth metrics disappear or get duplicated elsewhere.',
    viva: 'This is a clean example of recursion applied to a tree.',
    snippet: astDepthSource.trim(),
  },
];

export const executionJourney = [
  {
    id: 'editor-input',
    label: 'EditorPanel',
    description: 'The user types in the controlled textarea. The input event sends the new value upward immediately.',
    enters: 'Keyboard input + previous textarea value',
    happens: 'onChange reads event.target.value and calls the handler passed from AppShell.',
    exits: 'A new raw source string',
    why: 'The editor should report source changes, not own parser state.',
    file: 'src/components/editor/EditorPanel.jsx',
  },
  {
    id: 'app-shell-state',
    label: 'AppShell state update',
    description: 'AppShell receives the new text and updates shared state.',
    enters: 'New source string',
    happens: 'setRawText updates the root-level source of truth for the entire app.',
    exits: 'New rawText state',
    why: 'One synchronized application needs one shared source string.',
    file: 'src/components/layout/AppShell.jsx',
  },
  {
    id: 'debounce',
    label: 'useDebouncedValue',
    description: 'The raw text is delayed by 150ms before parser execution.',
    enters: 'rawText + 150ms delay',
    happens: 'A timeout is scheduled and the debounced value updates only after typing pauses.',
    exits: 'debouncedText',
    why: 'Typing should feel immediate even if parsing is more expensive.',
    file: 'src/hooks/useDebouncedValue.js',
  },
  {
    id: 'use-parser',
    label: 'useParser',
    description: 'The hook memoizes parser execution for the latest debounced text.',
    enters: 'debouncedText',
    happens: 'parse(rawText) is called inside useMemo, with a fallback contract if it throws.',
    exits: 'safe ParseResult',
    why: 'Parser orchestration should stay out of presentation components.',
    file: 'src/hooks/useParser.js',
  },
  {
    id: 'parse-orchestrator',
    label: 'parse()',
    description: 'The parser orchestrator runs the full pipeline in order.',
    enters: 'raw source string',
    happens: 'Calls tokenize → buildAST → validateParseArtifacts → buildDiagnostics.',
    exits: 'tokens + ast + errors + warnings + diagnostics',
    why: 'One stable contract makes the rest of the app easier to trust.',
    file: 'src/parser/parser.js',
  },
  {
    id: 'tokenize',
    label: 'tokenize()',
    description: 'Raw source is classified into semantic tokens with source metadata.',
    enters: 'source text',
    happens: 'Recognizes directives, headings, text, and closing blocks line by line.',
    exits: 'Token[]',
    why: 'AST building should work on semantic units, not raw strings.',
    file: 'src/parser/tokenizer.js',
  },
  {
    id: 'ast-build',
    label: 'buildAST()',
    description: 'The flat token stream becomes a hierarchical tree.',
    enters: 'Token[]',
    happens: 'Container tokens push to a stack, block closes pop, leaves attach to the current parent.',
    exits: 'AST root node',
    why: 'Layout structure is hierarchical, so the app needs a tree.',
    file: 'src/parser/astBuilder.js',
  },
  {
    id: 'validate',
    label: 'validateParseArtifacts()',
    description: 'Grammar and width rules are enforced after the AST exists.',
    enters: 'tokens + AST',
    happens: 'Checks unexpected closes, unclosed blocks, width validity, and invalid nesting.',
    exits: 'errors + warnings + valid flag',
    why: 'The app must not just parse input, it must also judge correctness.',
    file: 'src/parser/validator.js',
  },
  {
    id: 'diagnostics',
    label: 'buildDiagnostics()',
    description: 'Parser metrics are computed without mutating the AST.',
    enters: 'tokens + AST + errors + parseTime',
    happens: 'Counts tokens, measures AST depth, records parse time, and counts errors.',
    exits: 'diagnostics object',
    why: 'System health should be summarized once, then displayed elsewhere.',
    file: 'src/utils/diagnostics.js',
  },
  {
    id: 'ui-consumers',
    label: 'Preview / Inspector / Diagnostics',
    description: 'The parse result fans out to all synchronized surfaces.',
    enters: 'ParseResult + selectedNodeId',
    happens: 'Preview renders AST, AST tools inspect it, diagnostics summarize status, header shows readiness.',
    exits: 'visual feedback across the entire app',
    why: 'One parser result powers the whole learning and product experience.',
    file: 'src/components/preview/PreviewPanel.jsx, src/components/ast/ASTInspector.jsx, src/components/diagnostics/DiagnosticsBar.jsx',
  },
];

export const reactConcepts = [
  {
    id: 'use-state',
    title: 'useState',
    definition: 'Stores interactive values that survive rerenders and trigger UI updates.',
    whereUsed: 'AppShell stores rawText, selectedNodeId, activeTemplateId, exportState, and multiple UI toggles.',
    file: 'src/components/layout/AppShell.jsx',
    whyNeeded: 'The app has multiple interactive panels whose state changes over time.',
    vivaQuestion: 'Why is useState necessary here instead of local variables?',
    answer: 'Because local variables reset on rerender. useState preserves values across renders and tells React when the UI must update.',
    snippet: section(
      appShellSource,
      'const [rawText, setRawText, clearRawText] = useLocalStorage(',
      '  const debouncedText = useDebouncedValue(rawText, 150);',
    ),
  },
  {
    id: 'use-effect',
    title: 'useEffect',
    definition: 'Runs side effects after render when dependencies change.',
    whereUsed: 'EditorPanel uses it to synchronize source highlighting when another surface selects a node.',
    file: 'src/components/editor/EditorPanel.jsx',
    whyNeeded: 'The editor needs to react after selection state changes, not during plain JSX return.',
    vivaQuestion: 'What is a real useEffect example in this project?',
    answer: 'When a node is selected in preview or AST tools, EditorPanel uses useEffect to focus the textarea and highlight the correct source range.',
    snippet: section(
      editorPanelSource,
      '  useEffect(() => {',
      '  function handleCursorSync(event) {',
    ),
  },
  {
    id: 'props',
    title: 'Props',
    definition: 'Values and handlers passed from parent components to child components.',
    whereUsed: 'AppShell passes parseResult, selectedNodeId, and handlers to EditorPanel, PreviewPanel, and ASTInspector.',
    file: 'src/components/layout/AppShell.jsx',
    whyNeeded: 'One source of truth can coordinate many views through one-way data flow.',
    vivaQuestion: 'How do props help synchronization here?',
    answer: 'AppShell owns the shared state and pushes the same truth into each panel through props, so the views stay aligned.',
    snippet: section(
      appShellSource,
      '<EditorPanel',
      '          <section className="border-b border-app-border bg-app-panel">',
    ),
  },
  {
    id: 'custom-hooks',
    title: 'Custom Hooks',
    definition: 'Reusable functions built from React hooks for non-visual behavior.',
    whereUsed: 'useParser, useDebouncedValue, and useLocalStorage each isolate a repeated system behavior.',
    file: 'src/hooks/useParser.js',
    whyNeeded: 'Parser invocation, debouncing, and persistence should not clutter visual components.',
    vivaQuestion: 'Why turn these behaviors into custom hooks?',
    answer: 'Because they are stateful and reusable, but not visual. Hooks keep the architecture cleaner and easier to explain.',
    snippet: useParserSource.trim(),
  },
  {
    id: 'controlled-components',
    title: 'Controlled Components',
    definition: 'Inputs whose value is driven by React state instead of being owned by the DOM.',
    whereUsed: 'The main editor textarea gets its value from AppShell state and sends every change upward.',
    file: 'src/components/editor/EditorPanel.jsx',
    whyNeeded: 'The parser pipeline needs one authoritative source text value at all times.',
    vivaQuestion: 'Why is the editor a controlled component?',
    answer: 'Because the app must always know the exact current source text so parsing, persistence, and synchronization all stay correct.',
    snippet: section(
      editorPanelSource,
      '          <textarea',
      '        </div>',
    ),
  },
  {
    id: 'conditional-rendering',
    title: 'Conditional Rendering',
    definition: 'React renders different UI branches depending on state or derived data.',
    whereUsed: 'PreviewPanel shows either the layout canvas or an empty state depending on whether renderable AST exists.',
    file: 'src/components/preview/PreviewPanel.jsx',
    whyNeeded: 'The preview should communicate whether the parser currently has something meaningful to render.',
    vivaQuestion: 'Give a real conditional rendering example from the project.',
    answer: 'PreviewPanel uses a boolean hasRenderableAst. If it is true, it shows the canvas. Otherwise it shows an empty state message.',
    snippet: section(
      previewPanelSource,
      '        {hasRenderableAst ? (',
      '        )}',
    ),
  },
];

export const vivaQuestions = [
  {
    id: 'q1',
    difficulty: 'easy',
    question: 'What is MCL Studio?',
    think: 'Focus on layout grammar + AST + live preview.',
    answer:
      'MCL Studio is a React-based layout authoring tool that parses a custom markdown-like syntax into tokens, builds an AST, validates it, and renders the result as a live layout canvas.',
  },
  {
    id: 'q2',
    difficulty: 'easy',
    question: 'Why did you use React?',
    think: 'Think about synchronized panels and shared state.',
    answer:
      'React was used because the project has multiple synchronized surfaces such as the editor, preview, AST inspector, graph view, and diagnostics, all of which depend on shared state.',
  },
  {
    id: 'q3',
    difficulty: 'medium',
    question: 'Why does AppShell exist?',
    think: 'It is not just a wrapper. It owns shared state.',
    answer:
      'AppShell exists because the app needs one central state owner for raw text, selection state, template state, export state, and parser output. It keeps the editor, preview, and AST tools synchronized.',
  },
  {
    id: 'q4',
    difficulty: 'medium',
    question: 'What is the role of the tokenizer?',
    think: 'Tokenizer is about classification, not rendering.',
    answer:
      'The tokenizer converts raw source text into semantic tokens like ROW_OPEN, COL_OPEN, INFO_OPEN, H1, TEXT, and BLOCK_CLOSE. It also attaches line, column, and width metadata.',
  },
  {
    id: 'q5',
    difficulty: 'medium',
    question: 'What is an AST and why do you need it?',
    think: 'AST is the intermediate representation.',
    answer:
      'The AST is a tree representation of the parsed document. It is needed because validation, graph visualization, recursive rendering, selection synchronization, and export all become easier and more reliable when the structure exists as a tree.',
  },
  {
    id: 'q6',
    difficulty: 'hard',
    question: 'Why is validation separated from AST building?',
    think: 'Building structure and judging correctness are different jobs.',
    answer:
      'AST building is responsible for creating hierarchy from tokens. Validation is a separate stage because parsing structure and judging correctness are different responsibilities. Separation makes the pipeline easier to test and reason about.',
  },
  {
    id: 'q7',
    difficulty: 'hard',
    question: 'How does selection synchronization work?',
    think: 'selectedNodeId in AppShell.',
    answer:
      'Selection is centralized through selectedNodeId in AppShell. The editor, preview, outline, and graph all receive that value through props and update their visual state accordingly.',
  },
  {
    id: 'q8',
    difficulty: 'brutal',
    question: 'Why not render directly from markdown without an AST?',
    think: 'You need stronger validation and visualization.',
    answer:
      'Direct rendering from markdown would weaken validation, remove the AST as an intermediate representation, make graph visualization far less meaningful, and reduce clarity around structure-aware rendering. The AST is what makes the project defensible as an engineering system.',
  },
  {
    id: 'q9',
    difficulty: 'brutal',
    question: 'Why is only source text persisted and not the AST?',
    think: 'Derived state should be recomputed.',
    answer:
      'Only source text is persisted because AST, diagnostics, and validation are derived data. Storing derived data risks staleness and inconsistency, so the app regenerates those artifacts from the true source of truth.',
  },
];

export const vivaTrapCards = [
  {
    wrong: 'React parses the markdown.',
    correct: 'Custom parser modules parse the markdown. React manages UI state and renders parser output.',
  },
  {
    wrong: 'AST is stored in localStorage.',
    correct: 'Only raw source text is stored. The AST is regenerated from source through the parser pipeline.',
  },
  {
    wrong: 'Validator builds the AST.',
    correct: 'AST is built first by astBuilder.js. Validator checks tokens and AST after structure already exists.',
  },
  {
    wrong: 'NodeRenderer validates the layout.',
    correct: 'NodeRenderer only converts AST nodes into JSX. Validation happens earlier in validator.js.',
  },
];

export const impactChains = [
  {
    id: 'tokenizer',
    title: 'tokenizer.js',
    chain: ['No reliable tokens', 'No AST', 'No validation', 'No meaningful preview'],
    summary: 'Tokenizer failure kills the whole parser pipeline early.',
  },
  {
    id: 'app-shell',
    title: 'AppShell.jsx',
    chain: ['No central state owner', 'No panel synchronization', 'Selection drift', 'Broken reset/export/template flow'],
    summary: 'AppShell failure breaks coordination more than parsing.',
  },
  {
    id: 'renderer',
    title: 'NodeRenderer.jsx',
    chain: ['AST may still exist', 'Validation may still exist', 'Preview disappears or becomes wrong'],
    summary: 'Renderer failure is visible product failure even if parsing still works.',
  },
  {
    id: 'validator',
    title: 'validator.js',
    chain: ['Invalid structures pass silently', 'Grammar confidence drops', 'Diagnostics become misleading'],
    summary: 'Validator failure hurts trust more than raw rendering.',
  },
];

export const decisionCards = [
  {
    id: 'why-ast',
    decision: 'Why AST?',
    alternatives: ['Direct string-to-render approach', 'Flat token-only rendering'],
    rejected: 'Those approaches weaken validation, graph visualization, and structural clarity.',
    tradeoffs: 'AST introduces complexity, but it provides a stable intermediate representation for multiple features.',
    finalChoice: 'Use AST as the core intermediate model.',
  },
  {
    id: 'why-react',
    decision: 'Why React?',
    alternatives: ['Vanilla DOM scripting', 'Another UI framework'],
    rejected: 'Those would make synchronized multi-panel state management less clear for this case study.',
    tradeoffs: 'React adds component structure and hook concepts, but that directly supports the project goals.',
    finalChoice: 'Use React for state-driven UI composition and synchronization.',
  },
  {
    id: 'why-no-redux',
    decision: 'Why no Redux?',
    alternatives: ['Redux', 'global external store'],
    rejected: 'The shared state scope was manageable and AppShell already acted as a clean state owner.',
    tradeoffs: 'An external store could scale further, but would add explanation and setup complexity.',
    finalChoice: 'Keep central state in AppShell using React hooks.',
  },
  {
    id: 'why-no-backend',
    decision: 'Why no backend?',
    alternatives: ['Database persistence', 'API-driven storage'],
    rejected: 'The case study is frontend-centered and only lightweight persistence was needed.',
    tradeoffs: 'No collaboration or remote storage, but the architecture stays focused and explainable.',
    finalChoice: 'Use frontend-only architecture with localStorage.',
  },
];

export const handbookSidebarNotes = {
  'part-1-what-this-project-really-is': {
    summary: 'This is your fastest project-definition section.',
    takeaways: [
      'The project is parser-driven, not just a markdown previewer.',
      'React coordinates multiple synchronized surfaces.',
      'AST is the central intermediate representation.',
    ],
    examinerAngle: 'Expect “What is this project?” or “What makes it different from a markdown editor?”',
    remember: 'Say layout grammar + AST + validation + live preview.',
  },
  'part-4-react-concepts-through-this-exact-project': {
    summary: 'This section maps React theory to your real files.',
    takeaways: [
      'AppShell is the shared state owner.',
      'Hooks package reusable behavior.',
      'Controlled editor input is essential to parser correctness.',
    ],
    examinerAngle: 'Expect questions on useState, useEffect, props, custom hooks, and controlled inputs.',
    remember: 'Always explain React through actual project files.',
  },
  'part-8-parsing-engine-deep-dive': {
    summary: 'This is the technical heart of the app.',
    takeaways: [
      'Tokenizer creates semantic tokens.',
      'AST builder creates hierarchy using a stack.',
      'Validator judges correctness after parsing.',
    ],
    examinerAngle: 'Expect “Explain parser flow” and “What is AST?”',
    remember: 'Raw text never becomes UI directly.',
  },
  'part-15-likely-viva-questions-and-strong-answers': {
    summary: 'Use this section for last-minute direct revision.',
    takeaways: [
      'Know your one-line definitions.',
      'Know why AppShell exists.',
      'Know why only source text is persisted.',
    ],
    examinerAngle: 'This is where rapid-fire viva questions will come from.',
    remember: 'Stay precise; avoid trap phrasing.',
  },
};

export const learningRoadmap = [
  'Start with the landing page to rebuild the overall story.',
  'Use the architecture explorer to understand why each subsystem exists.',
  'Use the file explorer to connect that architecture to real code files.',
  'Step through the code execution journey until the runtime flow feels natural.',
  'Use the parser simulator to see each transformation live.',
  'Practice viva mode until your answers feel automatic.',
];
