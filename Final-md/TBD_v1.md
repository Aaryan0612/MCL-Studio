# Markdown Component Layout Engine
# Task Breakdown Document (TBD)
## Sprint Planning & Execution Roadmap
### Version 1.0

---

# PURPOSE

This document converts the PRD and TDD into actionable engineering tasks.

Goal:

- Reduce overwhelm
- Enable AI-assisted development
- Track progress
- Build incrementally
- Ensure understanding at every stage

---

# SUCCESS DEFINITION

Project is complete when:

✅ Custom tokenizer works

✅ AST generation works

✅ Recursive renderer works

✅ Live preview works

✅ LocalStorage works

✅ Diagnostics work

✅ Deployment completed

✅ Viva-ready understanding achieved

---

# SPRINT 0 — PROJECT FOUNDATION

## Objective

Create clean development environment.

---

### Task 0.1

Initialize Project

Deliverables:

- Create Vite project
- Install dependencies
- Verify application runs

Commands:

```bash
npm create vite@latest
npm install
npm run dev
```

Definition of Done:

- Project launches locally

---

### Task 0.2

Install Styling

Deliverables:

- Tailwind setup
- Global styles

Definition of Done:

- Tailwind classes working

---

### Task 0.3

Create Folder Structure

Deliverables:

```text
src/
components/
parser/
hooks/
utils/
constants/
styles/
```

Definition of Done:

- Architecture matches TDD

---

# SPRINT 1 — APPLICATION SHELL

## Objective

Build visual layout.

---

### Task 1.1

Create App Layout

Deliverables:

- Left editor panel
- Right preview panel
- Header with Export AST and Reset Workspace
- Bottom diagnostics panel
- AST inspector panel

Definition of Done:

- Layout visible
- Responsive

---

### Task 1.2

Build EditorPanel

Deliverables:

- Textarea
- Change handler

Definition of Done:

- Typing updates state

---

### Task 1.3

Build PreviewPanel

Deliverables:

- Starter-template-driven preview

Definition of Done:

- Component renders

---

### Task 1.4

Build DiagnosticsBar

Deliverables:

- Static metrics

Definition of Done:

- UI visible

---

### Task 1.5

Build ASTInspector Shell

Deliverables:

- Tree panel
- Empty tree shell
- Expand/collapse affordance

Definition of Done:

- AST inspector area is visible in the layout
- Tree interaction shell is ready for parser integration

---

# SPRINT 2 — TOKENIZER ENGINE

## Objective

Convert text into tokens.

---

### Task 2.1

Create Token Types

Deliverables:

```text
ROW_OPEN
COL_OPEN
INFO_OPEN
BLOCK_CLOSE
H1
H2
H3
TEXT
```

Definition of Done:

- Constants defined

---

### Task 2.2

Implement Tokenizer

File:

```text
parser/tokenizer.js
```

Definition of Done:

Input:

```text
:::row
```

Output:

```js
{ type: "ROW_OPEN" }
```

---

### Task 2.3

Regex Handling

Support:

- row
- col
- info
- close
- heading
- text
- width parsing with default `100`

Definition of Done:

All syntax parses correctly.

---

### Task 2.4

Tokenizer Testing

Definition of Done:

All token types verified.
Line and column metadata verified.

---

# SPRINT 3 — AST BUILDER

## Objective

Convert tokens into tree structure.

---

### Task 3.1

Define AST Schema

Deliverables:

```js
{
 type,
 children,
 startLine,
 endLine
}
```

Definition of Done:

Schema finalized.

---

### Task 3.2

Implement Stack-Based Parser

Definition of Done:

Nested structures supported.

---

### Task 3.3

Parent Child Linking

Definition of Done:

Children attach correctly.

---

### Task 3.4

AST Testing

Definition of Done:

AST output matches expectations.

---

# SPRINT 4 — VALIDATION ENGINE

## Objective

Detect syntax problems.

---

### Task 4.1

Detect Unclosed Blocks

Definition of Done:

Errors generated.

---

### Task 4.2

Detect Invalid Closures

Definition of Done:

Errors generated.

---

### Task 4.2A

Detect Invalid Width Values

Definition of Done:

- Missing width defaults to `100`
- Width `<= 0` produces error
- Width `> 100` produces error
- Non-numeric width produces error

---

### Task 4.3

Create Error Model

Output:

```js
{
 errors: [
   {
     type,
     message,
     line,
     column,
     severity
   }
 ]
}
```

Definition of Done:

Standardized error format.

---

# SPRINT 5 — RECURSIVE RENDERER

## Objective

Convert AST into React UI.

---

### Task 5.1

Create NodeRenderer

Definition of Done:

Accepts AST node.

---

### Task 5.2

Implement Row Component

Definition of Done:

Flex row renders.

---

### Task 5.3

Implement Column Component

Definition of Done:

Width respected.

---

### Task 5.4

Implement Info Component

Definition of Done:

Info card renders.

---

### Task 5.5

Implement Text Components

Definition of Done:

Headings and paragraphs render.

---

### Task 5.6

Recursive Rendering

Definition of Done:

Nested layouts work.

---

# SPRINT 6 — PIPELINE INTEGRATION

## Objective

Connect everything.

---

### Task 6.1

Editor → Tokenizer

Definition of Done:

Typing generates tokens.

---

### Task 6.2

Tokenizer → AST

Definition of Done:

AST updates.

---

### Task 6.3

AST + Selection State → Renderer

Definition of Done:

Preview updates.

---

### Task 6.4

Real-Time Preview

Definition of Done:

Changes visible after the standard 150ms debounce cycle.

---

### Task 6.5

AST Inspector Integration

Definition of Done:

- Generated AST renders as a tree
- Expand/collapse works
- Node selection state updates
- Selected node highlights corresponding preview region

---

# SPRINT 7 — LOCAL STORAGE

## Objective

Persistence.

---

### Task 7.1

Create useLocalStorage Hook

Definition of Done:

Reusable hook exists.
Key is `mcle-workspace-v1`.

---

### Task 7.2

Load Saved Content

Definition of Done:

Refresh restores data.
Starter template loads when no saved workspace exists.

---

### Task 7.3

Auto Save

Definition of Done:

Changes persist.

---

### Task 7.4

Reset Workspace

Definition of Done:

- LocalStorage key is cleared
- Starter template is restored

---

# SPRINT 8 — DIAGNOSTICS

## Objective

System metrics.

---

### Task 8.1

Token Count

Definition of Done:

Count visible.

---

### Task 8.2

AST Depth

Definition of Done:

Depth visible.

---

### Task 8.3

Parse Time

Definition of Done:

Time visible.

---

### Task 8.4

Error Count

Definition of Done:

Errors visible.

---

### Task 8.5

Source-Aware Diagnostics

Definition of Done:

- Errors show line and column
- Warning/error severity is visible

---

# SPRINT 9 — UI POLISH

## Objective

Professional appearance.

---

### Task 9.1

Typography

Requirements:

- Times New Roman
- 12pt equivalent

---

### Task 9.2

Spacing

Definition of Done:

Readable UI.

---

### Task 9.3

Responsive Layout

Definition of Done:

Works across screen sizes.

---

# SPRINT 10 — TESTING

## Objective

Stability.

---

### Task 10.1

Tokenizer Tests

---

### Task 10.2

AST Tests

---

### Task 10.3

Renderer Tests

---

### Task 10.4

Persistence Tests

---

### Task 10.5

Error Handling Tests

---

### Task 10.6

AST Inspector Interaction Tests

---

# SPRINT 11 — DEPLOYMENT

## Objective

Submission-ready application.

---

### Task 11.1

GitHub Repository

Definition of Done:

Public repository available.

---

### Task 11.2

README

Include:

- Setup
- Architecture
- Screenshots
- Deployment URL

---

### Task 11.3

Vercel Deployment

Definition of Done:

Live URL accessible.

---

# SPRINT 12 — VIVA PREPARATION

## Objective

Project explanation mastery.

---

### Task 12.1

Explain Tokenizer

Can explain without notes.

---

### Task 12.2

Explain AST

Can explain without notes.

---

### Task 12.3

Explain Recursion

Can explain without notes.

---

### Task 12.4

Explain State Flow

Can explain without notes.

---

### Task 12.5

Draw Pipeline

Must draw:

```text
Input
↓
Tokenizer
↓
Tokens
↓
AST
↓
Validator
↓
Diagnostics
↓
Renderer
↓
Preview
```

---

# AI AGENT EXECUTION RULE

Never attempt to build the entire project at once.

Always complete:

Sprint N
↓
Verify
↓
Commit
↓
Proceed

---

# FINAL CHECKLIST

Before Submission:

- [ ] Tokenizer Complete
- [ ] AST Builder Complete
- [ ] Validator Complete
- [ ] Recursive Renderer Complete
- [ ] Live Preview Working
- [ ] LocalStorage Working
- [ ] Diagnostics Working
- [ ] Styling Complete
- [ ] GitHub Ready
- [ ] Vercel Ready
- [ ] README Complete
- [ ] Viva Ready

Project Status:

□ Not Started
□ In Progress
□ Completed
