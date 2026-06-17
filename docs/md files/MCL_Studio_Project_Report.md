# MCL Studio Project Report

## Cover Page

**Project Title:** MCL Studio  
**Expanded Name:** Markdown Component Layout Studio  
**Project Type:** React Case Study / Parser-Driven Layout Authoring Tool  
**Student Name:** Aaryan Kuchekar  
**Submission Purpose:** LISA Submission / Academic Evaluation / GitHub Documentation  

---

## Student Details

- **Student Name:** Aaryan Kuchekar
- **Project Name:** MCL Studio
- **Project Category:** React + Parsing + Live Preview System
- **Repository Artifact:** `README.md`
- **Primary Documentation Folder:** `docs/`

---

## Abstract

MCL Studio is a frontend-only React and Vite application that turns a constrained markdown-like language into a structured layout system. Instead of treating markdown as plain formatted text, the application treats it as a small language with explicit blocks such as `row`, `col`, and `info`. User input is tokenized, converted into an Abstract Syntax Tree (AST), structurally validated, and then rendered into a live layout canvas.

The application was designed to demonstrate both product-facing and engineering-facing ideas. On the product side, it provides a usable editor, live preview, templates, export, and persistence. On the engineering side, it exposes the parser pipeline through an AST inspector, graph view, diagnostics, and validation output. The result is a case study that combines React architecture, browser APIs, controlled state management, parser design, AST construction, diagnostics, and UI synchronization into one coherent application.

---

## Project Explained Simply

The problem behind MCL Studio is simple: normal markdown is good for writing paragraphs and headings, but it is not good at expressing layout. If a user wants to describe a sidebar, a main content area, or a two-column dashboard, plain markdown does not give enough structural control.

MCL Studio solves that by introducing a small layout language on top of markdown-style writing. The user writes structured input in the editor. The application reads that input, understands what the blocks mean, checks whether the structure is valid, and then renders the result on a live canvas.

This is why React was used. React provides a clean way to build the user interface, manage interactive state, and render different panels together. A parser was also required because the application is not just formatting text. It needs to understand layout structure, detect invalid nesting, create a tree representation, and render from that tree.

In simple terms:

1. The user writes layout markdown.
2. The application parses it.
3. The parser builds an AST.
4. The AST is validated.
5. The UI renders the validated structure as a layout.

That makes MCL Studio more than a markdown editor. It is a layout authoring system driven by parsing and React rendering.

---

## Problem Statement

Traditional markdown systems are linear. They describe content, but not layout relationships. Modern UI authoring often needs explicit structure such as rows, columns, grouped information blocks, and diagnostic feedback.

The problem addressed in this case study was:

> How can a React application allow users to write a markdown-like input language, transform that input into a structured intermediate representation, validate it, and render it as a live layout preview?

The system also needed to remain understandable for academic evaluation, support user-friendly workflows such as templates and persistence, and expose enough internal visibility to prove that the parser genuinely exists.

---

## Objectives

The main objectives of MCL Studio were:

1. Build a structured markdown-like layout language.
2. Parse user input into tokens with source metadata.
3. Build an AST from the token stream.
4. Validate layout structure and width rules.
5. Render the AST into a live layout preview.
6. Provide diagnostics for invalid structures.
7. Support developer-facing inspection through AST outline and graph views.
8. Preserve editor content through browser persistence.
9. Support AST export for engineering inspection.

---

## Technology Stack

| Area | Technology | Why It Was Used |
| --- | --- | --- |
| Frontend | React 19 | Component-driven UI and state orchestration |
| Build Tool | Vite 8 | Fast local development and clean static build output |
| Language | JavaScript | Lightweight frontend implementation aligned to project scope |
| Testing | Vitest | Fast unit and integration testing |
| UI Testing | React Testing Library | Component interaction verification |
| E2E Testing | Playwright | Browser workflow validation |
| Deployment | Vercel | Static deployment for a Vite frontend |
| Persistence | Browser `localStorage` | Restore workspace content across reloads |
| Export | `Blob` and temporary download link | Browser-native AST file download |

---

## React Concepts Demonstrated

The project is a React case study, so it is important to connect the application design directly to React concepts used in the implementation.

| Concept | Usage in Project |
| --- | --- |
| Components | `EditorPanel`, `PreviewPanel`, `ASTInspector`, `AppHeader`, `DiagnosticsBar` |
| Props | Parent-child communication from `AppShell` into editor, preview, and AST tools |
| `useState` | `rawText`, `selectedNodeId`, `activeTemplateId`, `exportState`, layout boundary mode |
| `useEffect` | persistence updates, debounced timing, and editor source-focus synchronization |
| Custom Hooks | `useParser`, `useLocalStorage`, `useDebouncedValue` |
| Controlled Components | the main editor textarea is controlled by React state |
| Conditional Rendering | preview empty state, graph/outline mode, diagnostics states |
| Local Storage | workspace persistence through browser storage |

This table is useful in viva because it ties React terminology to actual project files instead of generic examples.

---

## System Architecture

MCL Studio is built as a parser-driven frontend application. The most important architectural idea is that rendering does not happen directly from raw text. Instead, user input goes through an intermediate parsing pipeline and only then becomes UI.

### High-Level Architecture

![High-Level Architecture](diagrams/high-level-architecture.png)

### What This Means

- The **editor** owns raw layout input.
- The **tokenizer** converts text into structured tokens.
- The **AST builder** converts tokens into a tree.
- The **validator** checks structural correctness.
- The **renderer** turns the AST into visible React UI.
- The **diagnostics layer** summarizes parse health.
- The **inspector and graph** visualize the AST rather than the raw text.

This architecture separates parsing logic from UI logic and makes the project easier to reason about and explain.

---

## Component Architecture

The application uses a clear React component hierarchy with `AppShell` as the main coordinator.

![Component Hierarchy](diagrams/component-hierarchy.png)

### Key Responsibilities

- `AppShell` manages shared state such as raw text, selection state, template choice, and parser output.
- `EditorPanel` handles input, cursor-linked source focus, and template loading.
- `PreviewPanel` renders the layout canvas.
- `NodeRenderer` recursively renders AST nodes into React elements.
- `ASTInspector` displays outline mode, graph mode, validation issues, and diagnostics.
- `DiagnosticsBar` provides a compact status footer.

This structure keeps business logic centralized while keeping rendering components focused.

### State Flow

![State Flow](diagrams/state-flow.png)

The state flow is intentionally centralized. `AppShell` owns the important shared values and distributes derived data to the panels that need it.

---

## Features Implemented

| Feature | Description |
| --- | --- |
| Markdown-like layout editor | Allows users to author structured layout input |
| Tokenizer | Produces tokens with `type`, `value`, `line`, `column`, and `metadata` |
| AST builder | Builds a tree with node IDs, source ranges, and child relationships |
| Structural validator | Enforces grammar and width rules |
| Diagnostics engine | Summarizes token count, depth, parse time, and error count |
| Live layout canvas | Renders the AST into a visual preview |
| AST outline inspector | Expandable tree view of parsed structure |
| AST graph view | Visual tree-style representation of the AST |
| Template loader | Starter, dashboard, and documentation templates |
| Export AST | Downloads `ast.json` from the current in-memory AST |
| Persistence | Restores saved editor content from browser storage |

---

## Requirement Mapping

| Requirement | Implementation |
| --- | --- |
| Markdown Editor | `src/components/editor/EditorPanel.jsx` |
| Live Preview | `src/components/preview/PreviewPanel.jsx` and `src/components/preview/NodeRenderer.jsx` |
| AST Generation | `src/parser/astBuilder.js` |
| Tokenization | `src/parser/tokenizer.js` |
| Validation | `src/parser/validator.js` |
| Diagnostics | `src/utils/diagnostics.js` and `src/utils/astDepth.js` |
| Persistence | `src/hooks/useLocalStorage.js` |
| Debounced parsing | `src/hooks/useDebouncedValue.js` and `src/hooks/useParser.js` |
| AST Visualization | `src/components/ast/ASTInspector.jsx` and `src/components/ast/ASTGraphView.jsx` |
| Export | `handleExportAst()` inside `src/components/layout/AppShell.jsx` |
| Template Workflow | `src/constants/templates.js` and `EditorPanel` |

---

## Implementation Details

The implementation follows a clear pipeline:

![Parsing Pipeline](diagrams/parsing-pipeline.png)

### Parsing Pipeline

1. The editor stores raw input in React state.
2. The raw input is debounced by `useDebouncedValue` to avoid reparsing on every keystroke.
3. `useParser` calls the `parse()` function.
4. `parse()` orchestrates tokenization, AST construction, validation, and diagnostics.
5. The resulting AST is used by both the preview renderer and the AST tools.

### Frozen Grammar

The grammar intentionally stays constrained in version 1:

- `ROOT` can contain `ROW`, `INFO`, headings, and text.
- `ROW` can contain `COL` only.
- `COL` can contain `H1`, `H2`, `H3`, `TEXT`, and `INFO` only.
- nested `row` inside `col` is invalid in the current language version.

This makes the language easier to reason about and easier to validate.

### Grammar Specification

The frozen grammar of version 1 can be summarized as:

```text
ROOT -> ROW | INFO | H1 | H2 | H3 | TEXT
ROW  -> COL
COL  -> H1 | H2 | H3 | TEXT | INFO
INFO -> H1 | H2 | H3 | TEXT
```

Example:

```md
:::row
:::col width=100
# Welcome
Describe your layout.
:::
:::
```

This grammar is intentionally limited so that parsing and validation stay predictable.

### AST Example

The parser does not render directly from raw text. It first produces an AST. A simple layout such as one row with one column becomes:

```text
root
 └─ row
     └─ col
         ├─ H1
         └─ text
```

In JSON-style shape, this means the AST stores:

- node type
- children
- source line range
- width metadata for columns
- content for headings and text

This is why the AST inspector and graph view are possible.

### Complexity Analysis

The current parser pipeline is linear with respect to the number of meaningful input lines and nodes.

| Operation | Complexity |
| --- | --- |
| Tokenization | `O(n)` |
| AST Building | `O(n)` |
| Validation | `O(n)` |
| Rendering | `O(n)` |

Here, `n` refers to the number of tokens or AST nodes being processed. This makes the system efficient enough for real-time frontend parsing within the scope of the project.

---

## Screenshots

### 1. Main Workspace
![Main Workspace](screenshots/social-preview.png)
**Caption:** The main workspace shows the branded editor-to-canvas workflow and the product’s overall presentation.

### 2. Editor
![Editor](screenshots/editor.png)
**Caption:** The editor is a controlled textarea with line numbers, template controls, and source-linked selection awareness.

### 3. Preview Canvas
![Preview Canvas](screenshots/preview.png)
**Caption:** The preview canvas renders the current AST into visible layout output and supports layout boundaries.

### 4. AST Graph View
![AST Graph View](screenshots/ast-graph.png)
**Caption:** The graph view exposes the parsed hierarchy visually and helps prove the parser pipeline is real.

### 5. AST Inspector
![AST Inspector](screenshots/sprint3-ast-builder.png)
**Caption:** The AST inspector demonstrates outline navigation, expand/collapse behavior, and source-aware node selection.

### 6. Diagnostics Panel
![Diagnostics Panel](screenshots/diagnostics.png)
**Caption:** Diagnostics and validation results remain visible for engineering inspection without dominating the product surface.

### 7. Template Loader
**Figure note:** Insert the reviewed template-selection screenshot from the final Google Docs copy.  
**What it demonstrates:** faster layout authoring through predefined structures.

### 8. Export Feature
**Figure note:** Insert the reviewed `Export AST` success-state screenshot from the final Google Docs copy.  
**What it demonstrates:** browser-based engineering artifact generation.

### 9. LocalStorage Persistence
**Figure note:** Insert the reviewed workspace-restore screenshot from the final Google Docs copy.  
**What it demonstrates:** persistent workspace behavior using browser storage.

### 10. Validation Errors
![Validation Errors](screenshots/sprint4-validator.png)
**Caption:** Validation results make grammar violations visible and prove that the parser pipeline is enforcing structural rules.

---

## Competitive Analysis

| Tool | Layout Grammar | AST View | Diagnostics | Export AST |
| --- | --- | --- | --- | --- |
| Traditional Markdown Previewers | No | No | No | No |
| Obsidian | Partial formatting features | No | No | No |
| Notion | Different structured content model | No | No | No |
| MCL Studio | Yes | Yes | Yes | Yes |

MCL Studio is not trying to compete with large document platforms directly. Its value lies in combining structured authoring with explicit parser visibility, which is uncommon in normal markdown tools.

---

## Major Engineering Decisions

### Why React
React made it easier to coordinate multiple synchronized panels such as the editor, preview, AST inspector, and diagnostics. Its state-driven rendering model fit the project naturally.

### Why Vite
Vite provided fast development feedback and simple static deployment. The project did not need a larger framework.

### Why AST
An AST created a stable intermediate representation between raw text and rendered UI. This made validation, visualization, and export possible.

### Why LocalStorage
Browser storage was enough for this scope. It restored user content without requiring backend infrastructure.

### Why Custom Grammar
A custom grammar was necessary because standard markdown does not express layout structure well enough for rows, columns, and block validation.

### Why Frontend-Only Architecture
The application’s core value is client-side parsing, validation, and rendering. Keeping it frontend-only reduced complexity and fit the academic case-study scope.

---

## Challenges Faced During Development

### 1. Parser Validation Issues
**Problem:** invalid structures needed to be rejected clearly.  
**Cause:** layout blocks introduce nesting rules that normal markdown does not have.  
**Solution:** a dedicated structural validator was built over parse artifacts.  
**Learning:** parsing and validation should remain separate responsibilities.

### 2. AST Synchronization Issues
**Problem:** editor, AST tools, and preview needed to stay aligned after reparses.  
**Cause:** selections can become stale when the document changes.  
**Solution:** selection safety checks were centralized in `AppShell`.  
**Learning:** synchronization state should be owned in one place.

### 3. Selection Mapping Problems
**Problem:** users needed clear feedback when selecting nodes.  
**Cause:** container nodes and leaf nodes need different visual treatment.  
**Solution:** the renderer introduced node-type-aware highlight classes.  
**Learning:** interaction design matters as much as parser correctness.

### 4. Layout Fidelity Problems
**Problem:** rows and columns needed to behave like actual layout containers.  
**Cause:** visual styling can undermine valid AST output if the layout rules are not respected.  
**Solution:** preview structure and layout boundaries were refined.  
**Learning:** a layout engine must make structure visible, not just render content.

### 5. Export and Persistence
**Problem:** the product needed to feel complete and usable beyond a demo.  
**Cause:** AST export and storage failures can create user confusion if not hardened.  
**Solution:** export was implemented with browser APIs and storage was wrapped in failure-safe hooks.  
**Learning:** small utility features still require architectural care.

---

## Results and Observations

MCL Studio successfully achieved its main objectives:

- it parses structured markdown-like input
- it builds a source-aware AST
- it validates structure and widths
- it renders a live layout canvas
- it exposes AST structure through outline and graph views
- it supports templates, persistence, and AST export
- it passes its release quality gates

The final architecture also demonstrates separation of concerns effectively:

- parser logic is not embedded in UI components
- rendering is AST-driven
- diagnostics are computed separately from display
- storage concerns are isolated into a custom hook

This makes the project defensible not only as a working product, but also as a technical case study.

---

## Future Scope

Although MCL Studio is feature-complete for its frozen grammar, future improvements are possible:

1. Nested layouts through a grammar v2
2. Additional block types beyond `row`, `col`, and `info`
3. Theme-aware preview rendering
4. Reusable template import/export workflows
5. Collaborative editing with backend persistence

This section shows that the current version is intentionally scoped, not incomplete by accident.

---

## Conclusion

MCL Studio is a successful example of combining React application design with parser-oriented engineering. It goes beyond standard markdown rendering by treating layout input as a small formal language. Through tokenization, AST generation, structural validation, diagnostics, and live rendering, the project demonstrates how frontend systems can benefit from compiler-style thinking.

Academically, the project shows understanding of React components, state management, hooks, browser APIs, and architecture. Technically, it shows the benefits of using an intermediate AST, separated validation, and synchronized UI views. As a result, the project is both a usable application and a strong learning artifact.

---

## GitHub Repository Link

**Repository:** [https://github.com/Aaryan0612/MCL-Studio](https://github.com/Aaryan0612/MCL-Studio)

---

## Live Deployment Link

**Deployment:** [https://mcl-studio.vercel.app](https://mcl-studio.vercel.app)

---

## References

1. React Official Documentation  
2. Vite Official Documentation  
3. Vitest Documentation  
4. React Testing Library Documentation  
5. Playwright Documentation  
6. Browser APIs for `localStorage`, `Blob`, and download links  
7. MCL Studio repository source files and release documentation
