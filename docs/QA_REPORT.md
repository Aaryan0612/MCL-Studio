# QA Report

## Scope

This QA sprint covered the current shipping system:

- parser pipeline
- structural validator
- diagnostics
- persistence
- AST outline and graph views
- preview renderer
- template workflows
- AST export
- editor, preview, and inspector synchronization

## Verification Results

### Static quality gates

- `npm run lint`: passed
- `npm run build`: passed

### Unit and integration suite

- `npm test`: passed
- total test files: `11`
- total tests: `56`

### Browser E2E suite

- `npm run test:e2e`: passed
- total E2E tests: `7`

### Coverage

- statements: `92.20%`
- branches: `79.79%`
- functions: `90.29%`
- lines: `92.24%`

Target outcomes:

- parser core `> 95%`: passed
- validator `> 95%`: passed
- diagnostics utilities `> 90%`: passed
- templates path `> 90%`: passed
- AppShell integration `> 80%`: passed

## High-Risk Areas Audited

### Parser resilience

Verified:

- malformed input does not crash tokenizer, AST builder, validator, or parser orchestration
- parser fallback contract remains intact
- malformed storage or storage access failures do not white-screen the app

### Frozen grammar enforcement

Verified:

- `ROW -> COL` remains enforced
- `COL -> H1/H2/H3/TEXT/INFO` remains enforced
- nested `row` inside `col` remains invalid
- width validation remains enforced

### Interaction synchronization

Verified:

- preview selection updates editor source focus
- AST graph selection updates editor source focus
- selection clears safely after reparses that remove the selected node

### Export integrity

Verified:

- `Export AST` downloads `ast.json`
- exported JSON parses correctly
- exported root structure matches the in-memory AST contract

## Performance Notes

Stress coverage was executed with generated valid documents at:

- `100` column blocks
- `500` column blocks
- `1000` column blocks

Observed result:

- parser completed successfully
- diagnostics remained sane
- large AST preview and graph rendering completed without crashes

Performance was intentionally recorded as completion-and-stability evidence rather than a machine-specific hard CI budget.

## Accessibility Notes

Smoke checks covered:

- keyboard navigation through advanced developer-tool controls
- visible focus retention during advanced-panel interaction
- non-mouse access for graph and outline controls in the browser suite

## Remaining Coverage Carry-Over

Files below `80%` statement coverage:

- `src/hooks/useParser.js` at `75%`

Assessment:

- low risk
- intentionally thin wrapper
- materially exercised through parser integration and `AppShell` flows

Files with lower branch coverage but acceptable primary-behavior confidence:

- `src/components/diagnostics/DiagnosticsBar.jsx`
- `src/components/preview/NodeRenderer.jsx`
- `src/components/preview/PreviewPanel.jsx`

These do not block release readiness, but future UI refinement could broaden visual-state branch coverage.

## Risk Summary

- critical: none found
- medium: branch coverage for some UI presentation permutations remains lower than core logic coverage
- low: `useParser` direct statement coverage remains below `80%`, but the underlying parser path is fully covered

## Release Verdict

Release readiness for the current architecture: `PASS`

The system is now backed by a professional test stack with green lint, green build, green unit/integration tests, green browser E2E tests, and coverage that exceeds the sprint targets.
