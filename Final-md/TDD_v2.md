# Markdown Component Layout Engine (MCLE)
# Technical Design Document (TDD)
**Version:** 2.0 — Consolidated Engineering Edition
**Owner:** Aaryan Kuchekar
**Purpose:** Engineering implementation blueprint for AI coding agents and developers.
**Companion Documents:** `PRD.md` · `TBD.md` · `DESIGN.md`

---

## 1. Architecture Overview

```
User Types in Editor
        ↓
   Editor State (useState)
        ↓
    Tokenizer
   tokenize(rawText)
        ↓
   Token Array [ ]
        ↓
   AST Builder
  buildAST(tokens)
        ↓
    AST Tree { }
        ↓
    Validator
 validateParseArtifacts({ tokens, ast })
        ↓
  Diagnostics Builder
 buildDiagnostics({ tokens, ast, validation })
        ↓
   NodeRenderer
 renderNode(node)
        ↓
   Preview UI
```

**Core Rule:** The parser is completely independent of React. It is plain JavaScript. React only consumes the output.

---

## 2. Development Principles

1. Parser independent of React — parser files must never import React
2. Pure functions wherever possible — same input always produces same output
3. Single responsibility per module — one file, one job
4. Renderer must never parse text — separation of concerns is absolute
5. Diagnostics must never mutate state — read-only consumers
6. Easy viva explanation — if you cannot explain it in 30 seconds, simplify it
7. Easy testing — pure functions are trivially testable
8. Modular and extensible — new syntax types should not require rewrites

---

## 3. Project Structure

```
src/
├── App.jsx
│
├── components/
│   ├── editor/
│   │   └── EditorPanel.jsx
│   │
│   ├── preview/
│   │   ├── PreviewPanel.jsx
│   │   └── NodeRenderer.jsx
│   │
│   ├── ast/
│   │   ├── ASTInspector.jsx
│   │   ├── ASTTreeNode.jsx
│   │   └── astSelection.js
│   │
│   ├── diagnostics/
│   │   └── DiagnosticsBar.jsx
│   │
│   └── layout/
│       ├── Row.jsx
│       ├── Column.jsx
│       ├── InfoBox.jsx
│       ├── Heading.jsx
│       └── TextNode.jsx
│
├── parser/
│   ├── tokenizer.js        ← pure JS, no React imports
│   ├── astBuilder.js       ← pure JS, no React imports
│   ├── validator.js        ← pure JS, no React imports
│   └── parser.js           ← orchestrates tokenizer + astBuilder + validator
│
├── hooks/
│   ├── useLocalStorage.js
│   └── useParser.js
│
├── utils/
│   ├── diagnostics.js
│   ├── astDepth.js
│   └── performance.js
│
├── constants/
│   └── syntax.js           ← TOKEN_TYPES constants
│
└── styles/
    └── globals.css
```

**File Size Rule:** Preferred under 150 lines. Maximum 250 lines. If exceeded, refactor before continuing.

---

## 4. Application State Model

```js
// App-level state
{
  rawText: string,           // current editor content
  tokens: Token[],           // output of tokenizer
  ast: ASTNode,              // output of AST builder
  errors: ValidationError[], // output of validator
  selectedNodeId: string | null,
  expandedNodeIds: string[],
  diagnostics: {
    tokenCount: number,
    astDepth: number,
    parseTime: number,       // milliseconds
    errorCount: number
  }
}
```

---

## 5. Constants — Token Types

File: `src/constants/syntax.js`

```js
export const TOKEN_TYPES = {
  ROW_OPEN:    'ROW_OPEN',
  COL_OPEN:    'COL_OPEN',
  INFO_OPEN:   'INFO_OPEN',
  BLOCK_CLOSE: 'BLOCK_CLOSE',
  H1:          'H1',
  H2:          'H2',
  H3:          'H3',
  TEXT:        'TEXT',
}
```

---

## 6. Tokenizer

### File
`src/parser/tokenizer.js`

### Function Signature
```js
tokenize(rawText: string): Token[]
```

### Token Schema
```js
// Canonical token schema
{
  type: string,
  value?: string,
  line: number,
  column: number,
  metadata?: object
}
```

### Algorithm

```
1. Split rawText by '\n'
2. Loop through each line
3. Trim whitespace
4. Skip empty lines
5. Track 1-based line and column positions
6. Apply regex checks in priority order (see below)
7. Push matched token to array with source metadata
8. Return array
```

### Regex Match Priority (top wins)

```
Priority  Pattern                    Token
1         line === ':::'             BLOCK_CLOSE
2         line === ':::row'          ROW_OPEN
3         /^:::col(?:\s+width=(\S+))?/  COL_OPEN (width defaults to 100)
4         line === ':::info'         INFO_OPEN
5         /^\[Grid\s+columns=(\d+)\]/   GRID (future)
6         /^### /                    H3
7         /^## /                     H2
8         /^# /                      H1
9         anything else              TEXT
```

### Example

Input:
```
:::row
:::col width=60
# Hello
Some text
:::
:::
```

Output:
```js
[
  { type: 'ROW_OPEN', line: 1, column: 1 },
  { type: 'COL_OPEN', value: '60', line: 2, column: 1, metadata: { width: 60 } },
  { type: 'H1', value: 'Hello', line: 3, column: 1 },
  { type: 'TEXT', value: 'Some text', line: 4, column: 1 },
  { type: 'BLOCK_CLOSE', line: 5, column: 1 },
  { type: 'BLOCK_CLOSE', line: 6, column: 1 }
]
```

### Implementation Reference

```js
export function tokenize(rawText) {
  const lines = rawText.split('\n')
  const tokens = []

  for (let index = 0; index < lines.length; index++) {
    const line = lines[index]
    const t = line.trim()
    if (!t) continue
    const lineNumber = index + 1
    const column = line.indexOf(t) + 1

    if (t === ':::')        { tokens.push({ type: 'BLOCK_CLOSE', line: lineNumber, column }); continue }
    if (t === ':::row')     { tokens.push({ type: 'ROW_OPEN', line: lineNumber, column });    continue }
    if (t === ':::info')    { tokens.push({ type: 'INFO_OPEN', line: lineNumber, column });   continue }

    const col  = t.match(/^:::col(?:\s+width=(\S+))?/)
    if (col)  {
      const widthValue = col[1] ?? '100'
      tokens.push({
        type: 'COL_OPEN',
        value: widthValue,
        line: lineNumber,
        column,
        metadata: { width: Number(widthValue) },
      })
      continue
    }

    if (t.startsWith('### ')) { tokens.push({ type: 'H3', value: t.slice(4), line: lineNumber, column }); continue }
    if (t.startsWith('## '))  { tokens.push({ type: 'H2', value: t.slice(3), line: lineNumber, column }); continue }
    if (t.startsWith('# '))   { tokens.push({ type: 'H1', value: t.slice(2), line: lineNumber, column }); continue }

    tokens.push({ type: 'TEXT', value: t, line: lineNumber, column })
  }

  return tokens
}
```

---

## 7. AST Node Schema

```js
// TypeScript interface
interface ASTNode {
  id: string
  type: string          // 'root' | 'row' | 'col' | 'info' | 'H1' | 'H2' | 'H3' | 'text'
  content?: string      // for leaf nodes (H1, H2, H3, text)
  width?: number        // for col nodes
  startLine: number
  endLine: number
  children: ASTNode[]   // always present, empty array for leaf nodes
}
```

---

## 8. AST Builder

### File
`src/parser/astBuilder.js`

### Function Signature
```js
buildAST(tokens: Token[]): ASTNode
```

### Algorithm (Stack-Based)

```
1. Create root node: { type: 'root', children: [] }
2. Create stack = [root]
3. For each token:
   a. If container opener (ROW_OPEN, COL_OPEN, INFO_OPEN):
      - Create new node from token
      - Copy source metadata into startLine/endLine
      - Add node as child of stack top
      - Push node onto stack
   b. If BLOCK_CLOSE:
      - Pop stack top (only if stack.length > 1 — never pop root)
      - Finalize the popped node endLine from the closing token line
   c. If leaf (H1, H2, H3, TEXT):
      - Create leaf node
      - Set startLine and endLine from token line
      - Add as child of stack top
      - Do NOT push onto stack
4. Finalize any remaining node ranges
5. Return root
```

### Container → Node Type Mapping

| Token Type | AST Node Type |
|---|---|
| ROW_OPEN | row |
| COL_OPEN | col |
| INFO_OPEN | info |

### Example

Input tokens from previous tokenizer example produce:

```json
{
  "id": "root",
  "type": "root",
  "startLine": 1,
  "endLine": 6,
  "children": [
    {
      "id": "node-1",
      "type": "row",
      "startLine": 1,
      "endLine": 6,
      "children": [
        {
          "id": "node-2",
          "type": "col",
          "width": 60,
          "startLine": 2,
          "endLine": 5,
          "children": [
            { "id": "node-3", "type": "H1", "content": "Hello", "startLine": 3, "endLine": 3, "children": [] },
            { "id": "node-4", "type": "text", "content": "Some text", "startLine": 4, "endLine": 4, "children": [] }
          ]
        }
      ]
    }
  ]
}
```

---

## 9. Validator

### File
`src/parser/validator.js`

### Function Signature
```js
validateParseArtifacts(input: {
  tokens: Token[]
  ast: ASTNode
}): ValidationResult

// Return type
interface ValidationResult {
  valid: boolean
  errors: ValidationError[]
  warnings: ValidationError[]
}

interface ValidationError {
  type: 'unclosed_block' | 'unexpected_close' | 'malformed' | 'invalid_nesting' | 'invalid_width'
  message: string
  line: number
  column: number
  severity: 'error' | 'warning'
}
```

### Checks

| Check | Method | Error Message |
|---|---|---|
| Unclosed blocks | Token + AST source ranges | `Expected closing block for :::TYPE` |
| Unexpected close | Token stream with source metadata | `Unexpected closing tag` |
| Invalid nesting | AST structure + grammar rules | `COL must appear inside ROW` |
| Invalid width | Token metadata / parsed attributes | `Column width must be between 1 and 100` |
| Empty containers | AST structure | Warning only, not an error |

**Rule:** Application must never crash. All parse errors are caught, stored, and displayed.

---

## 10. Parser Orchestrator

### File
`src/parser/parser.js`

### Function Signature
```js
parse(rawText: string): ParseResult

interface ParseResult {
  tokens: Token[]
  ast: ASTNode
  errors: ValidationError[]
  warnings: ValidationError[]
  diagnostics: {
    tokenCount: number
    astDepth: number
    parseTime: number
  }
}
```

### Implementation
```js
import { tokenize } from './tokenizer'
import { buildAST } from './astBuilder'
import { validateParseArtifacts } from './validator'
import { calculateDepth } from '../utils/astDepth'

export function parse(rawText) {
  const start = performance.now()
  
  const tokens = tokenize(rawText)
  const ast = buildAST(tokens)
  const { errors, warnings } = validateParseArtifacts({ tokens, ast })
  
  const parseTime = +(performance.now() - start).toFixed(2)
  
  return {
    tokens,
    ast,
    errors,
    warnings,
    diagnostics: {
      tokenCount: tokens.length,
      astDepth: calculateDepth(ast),
      parseTime,
    }
  }
}
```

---

## 11. Recursive Renderer

### File
`src/components/preview/NodeRenderer.jsx`

### Component Signature
```jsx
function NodeRenderer({ node }) { ... }
```

### Render Mapping

| AST Node Type | React Output |
|---|---|
| root | `<React.Fragment>` with children |
| row | `<Row>` (flex container) with children |
| col | `<Column width={node.width}>` with children |
| info | `<InfoBox>` with children |
| H1 | `<Heading level={1} content={node.content} />` |
| H2 | `<Heading level={2} content={node.content} />` |
| H3 | `<Heading level={3} content={node.content} />` |
| text | `<TextNode content={node.content} />` |

### Recursive Logic

```jsx
function NodeRenderer({ node }) {
  const renderChildren = () =>
    node.children?.map((child, i) => (
      <NodeRenderer key={i} node={child} />
    ))

  switch (node.type) {
    case 'root': return <>{renderChildren()}</>
    case 'row':  return <Row>{renderChildren()}</Row>
    case 'col':  return <Column width={node.width}>{renderChildren()}</Column>
    case 'info': return <InfoBox>{renderChildren()}</InfoBox>
    case 'H1':   return <Heading level={1}>{node.content}</Heading>
    case 'H2':   return <Heading level={2}>{node.content}</Heading>
    case 'H3':   return <Heading level={3}>{node.content}</Heading>
    case 'text': return <TextNode>{node.content}</TextNode>
    default:     return null
  }
}
```

---

## 12. React Components

### EditorPanel

File: `src/components/editor/EditorPanel.jsx`

```jsx
function EditorPanel({ value, onChange }) { ... }
```

Responsibilities: Text input, change handling, trigger autosave.
Must not: Parse syntax, render preview, validate AST.

---

### PreviewPanel

File: `src/components/preview/PreviewPanel.jsx`

```jsx
function PreviewPanel({ ast }) { ... }
```

Responsibilities: Render AST output via NodeRenderer.
Must not: Modify AST, parse text, validate syntax.

---

### DiagnosticsBar

File: `src/components/diagnostics/DiagnosticsBar.jsx`

```jsx
function DiagnosticsBar({ diagnostics, errors }) { ... }
```

Responsibilities: Display computed metrics and validation summary.
Must not: Compute diagnostics, mutate state.

Displays:
```
Tokens: 14    Depth: 3    Parse: 0.42ms    Errors: 0    Status: OK
```

---

### Header Controls

Header actions required for MVP:

- `Export AST` downloads `ast.json` using formatted JSON output
- `Reset Workspace` clears `mcle-workspace-v1` and restores the starter template

---

### Layout Components

```jsx
// Row.jsx
function Row({ children }) {
  return <div style={{ display: 'flex', gap: '16px' }}>{children}</div>
}

// Column.jsx
function Column({ width, children }) {
  return <div style={{ width: `${width}%` }}>{children}</div>
}

// InfoBox.jsx
function InfoBox({ children }) {
  return (
    <div className="info-box">
      <span className="info-label">INFO</span>
      {children}
    </div>
  )
}

// Heading.jsx
function Heading({ level, children }) {
  const Tag = `h${level}`
  return <Tag>{children}</Tag>
}

// TextNode.jsx
function TextNode({ children }) {
  return <p>{children}</p>
}
```

---

### ASTInspector

File: `src/components/ast/ASTInspector.jsx`

```jsx
function ASTInspector({ ast, selectedNodeId, expandedNodeIds, onSelectNode, onToggleNode }) { ... }
```

Responsibilities: Render the AST tree, support expand/collapse, maintain read-only structural visibility, and surface node selection events.
Must not: Parse text, mutate AST nodes, or perform validation.

Selection behavior:

- Selecting a tree node updates `selectedNodeId`
- Selected tree node highlights the matching preview region
- Expand/collapse state is tracked by `expandedNodeIds`
- Tree view is mandatory MVP
- JSON view is optional MVP+

---

## 13. Custom Hooks

### useLocalStorage

File: `src/hooks/useLocalStorage.js`

```js
function useLocalStorage(key, defaultValue) {
  const [value, setValue] = useState(() => {
    return localStorage.getItem(key) ?? defaultValue
  })

  useEffect(() => {
    localStorage.setItem(key, value)
  }, [key, value])

  return [value, setValue]
}
```

LocalStorage key: `mcle-workspace-v1`

---

### useParser

File: `src/hooks/useParser.js`

```js
function useParser(rawText) {
  return useMemo(() => parse(rawText), [rawText])
}
```

Returns the full `ParseResult` object. Memoized to avoid unnecessary re-parses.

---

## 14. Diagnostics Engine

File: `src/utils/diagnostics.js`

| Metric | Source | Calculation |
|---|---|---|
| Token count | tokens array | `tokens.length` |
| AST depth | AST tree | Recursive traversal finding max depth |
| Parse time | `parser.js` | `performance.now()` delta in ms |
| Error count | errors array | `errors.length` |

### AST Depth Algorithm

File: `src/utils/astDepth.js`

```js
export function calculateDepth(node, depth = 0) {
  if (!node.children || node.children.length === 0) return depth
  return Math.max(...node.children.map(child => calculateDepth(child, depth + 1)))
}
```

---

## 15. LocalStorage Flow

```
App mounts
    ↓
useLocalStorage loads saved content
    ↓
Sets rawText state or starter template
    ↓
Parser runs on loaded content
    ↓
Preview renders

--- on change ---

User types
    ↓
rawText state updates
    ↓
useEffect saves to localStorage
    ↓
useParser runs
    ↓
Preview updates
```

---

## 16. State Management

Selected: React hooks only.

```js
useState    // rawText, derived state
useEffect   // LocalStorage sync
useMemo     // parser execution (performance)
```

No Zustand. State management remains React hooks only for MVP.

---

## 17. UI Layout

Reference: DESIGN.md for exact colours, spacing, and typography values.

```
┌──────────────────────────────────────────────────────────────┐
│  Header                                              64px    │
├─────────────────────────┬────────────────────────────────────┤
│                         │                                    │
│     Editor (40%)        │     Live Preview (60%)             │
│                         │                                    │
├─────────────────────────┴────────────────────────────────────┤
│  AST Inspector (collapsible)                                 │
├──────────────────────────────────────────────────────────────┤
│  Diagnostics Bar                                     40px    │
└──────────────────────────────────────────────────────────────┘
```

---

## 18. Typography & Styling

**Mandatory project requirement:** Times New Roman, 12pt — applies to the web app UI.

**Font roles:**

| Region | Font |
|---|---|
| All UI labels, headings, body, buttons, preview content | Times New Roman, serif |
| Editor textarea, AST viewer, diagnostics values, exported JSON | JetBrains Mono, monospace |

**Tailwind CSS** is the styling framework. No inline styles except for dynamic values (column widths, etc.).

Reference DESIGN.md for the complete design system.

---

## 19. Error States

| State | Behaviour |
|---|---|
| Empty editor | Load starter template into the editor |
| Invalid syntax | Display error message above diagnostics |
| Unclosed block | Show: `Expected closing block for :::TYPE` with line and column |
| Unexpected close | Show: `Unexpected closing tag` with line and column |
| Parse exception | Catch with try/catch, display fallback, never crash |

All errors must be educational: state what happened, why, and how to fix it.

---

## 20. Performance

```js
// Standard MVP behavior: 150ms debounce + memoization
const debouncedText = useDebounce(rawText, 150)
const result = useParser(debouncedText)
```

Target: Instant feedback with predictable rendering and reduced parser churn on rapid typing.

---

## 21. Coding Standards

### Naming Conventions

| Type | Convention | Example |
|---|---|---|
| Components | PascalCase | `EditorPanel`, `NodeRenderer` |
| Functions | camelCase | `tokenize`, `buildAST`, `renderNode` |
| Constants | UPPER_CASE | `TOKEN_TYPES`, `STORAGE_KEY` |
| Files (components) | PascalCase | `EditorPanel.jsx` |
| Files (utilities) | camelCase | `tokenizer.js`, `astDepth.js` |

### Rules

- No file exceeds 250 lines — refactor first
- No parser logic inside React component files
- No duplicated logic across files
- No direct localStorage calls outside the useLocalStorage hook
- No hardcoded magic strings — use constants from `syntax.js`

---

## 22. Git Workflow

Branch: `main`

Commit format: `type: description`

```
feat: initialize vite + tailwind project setup
feat: implement tokenizer
feat: implement ast builder
feat: implement validator
feat: implement recursive renderer
feat: wire editor to parser pipeline
feat: implement local storage persistence
feat: implement diagnostics bar
feat: ui polish and layout
docs: update readme with screenshots and demo link
chore: deploy to vercel
```

One commit per sprint or per completed feature. Never commit broken code to main.

---

## 23. Testing Plan

| Area | Test Cases |
|---|---|
| Tokenizer | `:::row` → `ROW_OPEN`; `:::col width=75` → `COL_OPEN, width:75`; `# Heading` → `H1`; plain text → `TEXT`; empty lines ignored; line/column metadata preserved |
| AST Builder | Nested row+col produces correct parent-child; source ranges preserved; unclosed block handled gracefully |
| Renderer | row → flex div; col → div with correct width; info → styled card; H1 → h1 element |
| Validator | Unclosed `:::row` produces error; invalid `COL` nesting produces error; width > 100 produces error; valid input produces empty errors array |
| LocalStorage | Content persists across simulated refresh |
| Diagnostics | Token count matches array length; depth matches nesting level |
| AST Inspector | Expand/collapse works; node selection updates preview highlighting |

---

## 24. Viva Cheat Sheet

Answer these without notes:

| Question | One-line Answer |
|---|---|
| What is tokenization? | Converting raw text into a labelled array of token objects |
| What is an AST? | A nested JavaScript object tree representing the document structure |
| Why AST instead of direct render? | Separates parsing from rendering — each layer has one responsibility |
| What is recursive rendering? | A function that calls itself on each child node, naturally handling any nesting depth |
| Why useMemo for parsing? | Prevents re-running the parser on every render — only runs when rawText changes |
| Why debounce parsing? | It smooths rapid typing and reduces unnecessary parse cycles while keeping the preview effectively live |
| Why no external parsing library? | The :::syntax is custom; no library understands it without writing the same logic anyway |
| What is LocalStorage used for? | Persisting editor content between browser refreshes — no backend required |
| How are errors detected? | Stack not empty after processing all tokens means an unclosed block exists |

---

## 25. Engineering Principles

1. **Separation of Concerns** — parser, renderer, and diagnostics are isolated layers
2. **Single Responsibility** — every file and function does exactly one thing
3. **Modular Design** — adding a new syntax type requires only: one regex check + one AST node + one render case
4. **Pure Functions** — `tokenize()` and `buildAST()` are stateless and testable in isolation
5. **Predictable State Flow** — rawText → tokens → AST → UI, always in one direction
6. **Parser/UI Isolation** — parser files never import React; React never does parsing
7. **Graceful Degradation** — malformed input produces errors, never crashes

---

## Final Engineering Rule

The parser is the engine.
The AST is the bridge.
React is the presentation layer.

A new contributor must be able to read this document, understand the full architecture, and modify any layer without rewriting the others.
