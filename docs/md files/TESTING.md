# Testing Strategy

## Overview

The project now uses a three-layer QA stack:

- `Vitest` for parser, validator, diagnostics, hooks, templates, and component integration.
- `React Testing Library` for editor, preview, AST inspector, export flow, and shared interaction state.
- `Playwright` for full browser workflows against a live Vite server.

This strategy is aligned to the implemented product behavior, not stale roadmap assumptions:

- tokenizer emits `BLOCK_CLOSE`
- grammar remains frozen with `ROW -> COL`
- `COL` accepts only `H1/H2/H3/TEXT/INFO`
- nested `row` inside `col` is invalid and explicitly tested as invalid

## Commands

- `npm test`
- `npm run test:watch`
- `npm run test:ui`
- `npm run test:coverage`
- `npm run test:e2e`
- `npm run lint`
- `npm run build`

## Test Layers

### Unit and parser-contract tests

Covered areas:

- tokenizer token metadata and malformed input handling
- AST builder structure, metadata propagation, and EOF auto-close behavior
- validator structural rules, width validation, deduplication, malformed AST fallback
- parser orchestration fallback contract
- diagnostics and AST depth utilities
- template parsing validity

Primary files:

- `src/parser/tokenizer.test.js`
- `src/parser/astBuilder.test.js`
- `src/parser/validator.test.js`
- `src/parser/parser.test.js`
- `src/utils/diagnostics.test.js`
- `src/constants/templates.test.js`

### Component and integration tests

Covered areas:

- AST graph and outline rendering
- AST empty and malformed diagnostic states
- preview snapshots for starter, dashboard, and documentation templates
- debounced parse flow
- template loading
- preview-to-editor selection sync
- graph-to-editor selection sync
- safe selection clearing after reparse
- export button success path
- persistence restore and storage-failure fallback
- workspace reset

Primary files:

- `src/components/ast/ASTInspector.test.jsx`
- `src/components/ast/ASTTreeNode.test.jsx`
- `src/components/preview/PreviewPanel.snapshots.test.jsx`
- `src/components/layout/AppShell.test.jsx`

### Stress and scale tests

Covered areas:

- large valid documents with 100, 500, and 1000 column blocks
- parser completion without crashes
- diagnostics sanity under scale
- preview shell and graph rendering for large ASTs

Primary file:

- `src/test/stress.test.jsx`

### Browser E2E tests

Covered areas:

- starter boot
- template switching
- AST graph to preview synchronization
- AST export download
- persistence across reload
- storage failure fallback
- keyboard access for advanced tooling controls

Primary file:

- `tests/e2e/app.spec.js`

## Fixtures

Canonical fixtures live in:

- `src/test/fixtures.js`

Current fixture set:

- starter document
- two-column document
- info document
- invalid nested-row document
- orphan close document
- invalid width document
- generated large documents

## Coverage Targets

Sprint targets and current outcome:

- parser core `> 95%`: met
- validator `> 95%`: met
- diagnostics utilities `> 90%`: met
- templates path `> 90%`: met
- AppShell integration `> 80%`: met

## Coverage Notes

Files still below `80%` statement coverage:

- `src/hooks/useParser.js`

Reason:

- this hook is intentionally thin and delegates directly to the parser orchestration layer, which is already covered at `100%` statement coverage. Additional tests here would mostly duplicate `AppShell` and parser integration assertions.

Low branch coverage remains in a few presentational components such as `DiagnosticsBar`, `PreviewPanel`, and `NodeRenderer`. These are already covered for primary behaviors, but secondary visual permutations still have room for future refinement.

## Bug-Fix Policy During QA

- clear implementation bugs are fixed immediately
- ambiguous behavior is documented before any behavioral change
- frozen grammar is not rewritten to satisfy tests
- tests are not weakened merely to force a pass
- implementation defects are preferred over assertion relaxation
