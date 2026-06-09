# Markdown Component Layout Engine (MCLE)
# Product Requirements Document (PRD)
**Version:** 3.0 — Clean Edition
**Owner:** Aaryan Kuchekar
**Project Type:** ReactJS Capstone / External Assessment Submission
**Companion Documents:** `TDD.md` · `TBD.md` · `DESIGN.md`

---

## 1. Executive Summary

MCLE is a frontend-only React application. Users write custom layout syntax in a text editor. The application parses that syntax in real time and renders a live visual output.

The core pipeline:

```
Raw Input → Tokenizer → Tokens → AST Builder → AST → Validator → Diagnostics → Renderer → Live Preview
```

The project demonstrates React fundamentals, compiler-inspired design, tree structures, recursion, and real-time state management — packaged as a working, deployable product.

---

## 2. Problem Statement

Traditional visual editors require drag-and-drop interactions.

This project explores a text-driven alternative: users describe layouts through structured syntax, and the application interprets that syntax to generate a visual interface in real time.

This mirrors how production systems like Docusaurus, MDX, and static site generators convert structured input into rendered interfaces.

---

## 3. Product Vision

A lightweight, compiler-inspired layout engine that:

- Accepts custom layout syntax as plain text
- Parses it using a hand-written tokenizer and AST builder
- Builds a structured intermediate representation
- Renders responsive layouts dynamically
- Provides live diagnostics and validation feedback
- Persists workspace state across sessions

The product must feel like a professional engineering tool — not a college assignment.

---

## 4. Target Users

| User | Context |
|---|---|
| Primary | Professor / External Panelist |
| Secondary | Developer experimenting with layout DSL concepts |

---

## 5. Success Criteria

The project is considered complete when all of the following are true:

- [ ] Custom syntax is accepted in the editor
- [ ] Tokenizer produces correct, labelled token arrays
- [ ] AST builder produces the correct nested tree structure
- [ ] Recursive renderer produces correct visual output
- [ ] Live preview updates through a 150ms debounced parse cycle
- [ ] LocalStorage persistence works across browser refreshes
- [ ] Diagnostics (token count, depth, parse time, errors) display correctly
- [ ] Syntax errors are caught and displayed clearly — app never crashes
- [ ] AST Inspector tree is visible, interactive, and synchronized with preview highlighting
- [ ] GitHub repository is public with clean incremental commits
- [ ] Vercel deployment is live and accessible
- [ ] Student can explain the full architecture confidently without notes

---

## 6. MVP Feature Set

### Editor Panel
- Textarea input for custom syntax
- Real-time change handling on every keystroke
- Auto-save to LocalStorage on every change

### Parser Engine
- Custom tokenizer (no external parsing libraries)
- Stack-based AST builder
- Syntax validator with error output

### Preview Engine
- Recursive AST renderer
- Live updates driven by React state
- Renders: rows, columns, info blocks, headings, paragraphs

### AST Inspector
- Tree view of the generated AST
- Expand/collapse for nested nodes
- Node selection state
- Preview highlighting for the selected AST node
- JSON view is optional MVP+

### Workspace Controls
- Export AST downloads `ast.json`
- Reset clears saved workspace and restores the starter template

### Diagnostics
- Token count
- AST depth (max nesting level)
- Parse time in milliseconds
- Error count with error messages

### Persistence
- LocalStorage save on content change
- LocalStorage load on application startup
- Reset restores the starter template

### Deployment
- GitHub — public repository, clean commit history
- Vercel — live, accessible URL at submission time

---

## 7. Supported Syntax (MVP)

| Syntax | Output | Behaviour |
|---|---|---|
| `:::row` | Horizontal flex container | Opens a row block |
| `:::col width=100` | Column element | Width is percentage; defaults to 100 if omitted |
| `:::info` | Info callout card | Styled information block |
| `:::` | Block closer | Closes the most recently opened container |
| `# Heading` | H1 element | Standard heading syntax |
| `## Heading` | H2 element | Standard heading syntax |
| `### Heading` | H3 element | Standard heading syntax |
| Any other text | Paragraph | Default for unmatched lines |

Empty lines are ignored by the tokenizer.
The editor never starts blank; a starter template is loaded by default.

---

## 8. Out of Scope

The following are explicitly excluded from this project:

- Backend server or API
- Database or cloud storage
- Authentication or user accounts
- AI-powered features
- Collaboration or multi-user editing
- Full Markdown specification support
- Rich text / WYSIWYG editing
- Mobile-native experience

---

## 9. Future Enhancements (Post-MVP)

These are not required for submission but represent logical extensions:

- `[Grid columns=N]` macro for CSS grid layouts
- Light/dark theme toggle
- JSON view for AST inspector
- HTML/CSS asset bundle export
- Syntax highlighting in the editor
- Drag-and-drop builder powered by the same AST

---

## Companion Documents

| Document | Purpose |
|---|---|
| `TDD.md` | How to build it — engineering architecture, data models, algorithms, coding standards |
| `TBD.md` | What to build when — sprint tasks with definitions of done |
| `DESIGN.md` | Visual design system — colors, typography, layout, interaction rules |
