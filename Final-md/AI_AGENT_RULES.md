# AI_AGENT_RULES.md
## Markdown Component Layout Engine (MCLE)
### Version 1.0

---

# PURPOSE

This document defines mandatory execution rules for any AI coding agent or automated contributor working on MCLE.

Its purpose is to prevent architectural drift, feature hallucination, and implementation choices that conflict with the approved specification package.

---

# SOURCE OF TRUTH HIERARCHY

All AI agents must follow this precedence order:

```text
1. ARCHITECTURE_FREEZE.md
2. DESIGN.md
3. TDD_v2.md
4. PRD_v3.md
5. TBD_v1.md
```

If two documents conflict:

- The higher-priority document wins
- The AI agent must not invent a compromise
- The AI agent must request clarification or document reconciliation before proceeding if the conflict cannot be safely resolved

---

# NON-NEGOTIABLE RULES

## 1. No Hallucinated Features

Do not invent features that are not explicitly described in the approved specification package.

Examples of forbidden additions:

- Theme toggles in MVP
- Grid syntax in MVP
- Authentication
- Backend APIs
- Collaboration features
- Alternate export formats
- WYSIWYG editing

---

## 2. No Architecture Changes Without Approval

Do not change:

- Parser pipeline order
- Token schema
- AST schema
- Validator contract
- Folder structure
- State management strategy
- MVP boundaries

unless the user explicitly approves the change in writing.

---

## 3. Preserve Folder Structure

Implementation must follow the folder structure defined in `TDD_v2.md`.

Do not move parser logic into component folders.
Do not merge unrelated responsibilities into large files.
Do not create parallel architecture patterns unless required by an approved change.

---

## 4. Preserve Component Boundaries

Required component separation:

- Editor captures input only
- Parser processes syntax only
- Validator validates parse artifacts only
- Renderer renders AST only
- Diagnostics displays derived state only
- AST Inspector visualizes AST only

Forbidden:

- Parsing logic inside React components
- Validation logic inside renderer components
- AST mutation inside AST Inspector

---

## 5. Preserve Parser Contracts

Tokenizer, AST builder, validator, and parser orchestrator must remain separate layers.

Canonical pipeline:

```text
Input
↓
Tokenizer
↓
AST Builder
↓
Validator
↓
Diagnostics
↓
Renderer
```

The parser layer must not import React.

---

## 6. Preserve Token Contract

Canonical token contract:

```ts
{
  type: string;
  value?: string;
  line: number;
  column: number;
  metadata?: object;
}
```

Every token must preserve source metadata.

Do not remove `line` or `column`.
Do not rename fields without approval.

---

## 7. Preserve AST Contract

Canonical AST contract:

```ts
{
  type: string;
  children: [];
  startLine: number;
  endLine: number;
}
```

Extended fields such as `id`, `content`, and `width` are allowed where required by the TDD.

Do not remove source-range metadata.
Do not replace the tree structure with a flat model.

---

# UI AND DESIGN RULES

## 8. Preserve Design System Constraints

AI agents must follow `DESIGN.md` exactly for:

- Color system
- Typography
- Spacing
- Borders
- Layout proportions
- Interaction constraints
- Forbidden visual patterns

Forbidden visual drift includes:

- Gradients
- Glassmorphism
- Neumorphism
- Marketing-style dashboards
- Excessive shadows
- Decorative animations

---

## 9. Preserve Times New Roman Requirement

Times New Roman, 12pt, remains mandatory for general UI and preview content where specified in `DESIGN.md`.

JetBrains Mono remains mandatory for:

- Editor
- AST inspector
- Diagnostics values
- Exported JSON views

AI agents must not substitute another default UI font for aesthetic preference.

---

## 10. Preserve Accessibility Requirements

AI agents must preserve:

- Visible keyboard focus states
- WCAG AA contrast intent
- Clear text hierarchy
- Readable error messages
- Predictable interactive behavior

Do not remove focus rings.
Do not hide critical state behind hover-only interactions.

---

# STATE AND DATA RULES

## 11. Preserve State Management Strategy

MVP state management is:

```text
useState
useMemo
useEffect
```

with the approved debounce strategy from the spec package.

Do not introduce:

- Zustand
- Redux
- Context-based global parser state

without explicit approval.

---

## 12. Preserve LocalStorage Contract

Approved LocalStorage key:

```text
mcle-workspace-v1
```

Reset behavior must:

- Clear the saved workspace
- Restore the starter template

AI agents must not change persistence key names casually because that breaks expected behavior.

---

# TESTING AND QUALITY RULES

## 13. Preserve Test Requirements

AI agents must maintain and extend the required test coverage areas:

- Tokenizer
- AST builder
- Validator
- Recursive renderer
- LocalStorage behavior
- Diagnostics
- AST Inspector interactions

If implementation changes behavior in one of these areas, tests must be updated accordingly.

---

## 14. No Silent Spec Drift

If implementation reveals that the spec is incomplete or contradictory:

- Stop
- Report the issue
- Propose the smallest reconciliation
- Wait for approval before changing architecture

Do not silently “fix” the specification through code.

---

# DELIVERY RULES

## 15. Keep the MVP Boundary Clean

Mandatory MVP:

- Editor
- Parser pipeline
- Validator
- Diagnostics
- Recursive preview renderer
- AST Inspector tree with expand/collapse and node selection
- Preview highlighting
- LocalStorage persistence
- Export AST
- Reset workspace

Optional MVP+ only if explicitly requested later:

- AST JSON view
- Grid syntax
- Light/dark theming
- Syntax highlighting

---

## 16. Prefer Small, Explainable Units

AI agents should prefer:

- Small components
- Small parser modules
- Pure functions
- Explicit data contracts
- Readable code over clever abstractions

The implementation must remain easy to explain in a viva setting.

---

# FINAL RULE

If an AI agent is uncertain, it must optimize for:

```text
spec fidelity over creativity
clarity over cleverness
architecture stability over speed
```

The goal is not merely to produce working code.
The goal is to produce a clean, explainable, specification-faithful implementation.
