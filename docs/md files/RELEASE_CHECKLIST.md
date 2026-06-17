# Release Checklist

- [x] Lint passes
- [x] Build passes
- [x] Unit tests pass
- [x] Integration tests pass
- [x] E2E tests pass
- [x] Coverage targets met
- [x] Export verification completed
- [x] Template verification completed
- [x] Persistence verification completed
- [x] Accessibility smoke checks completed
- [x] README updated
- [x] Deployment docs updated

## Evidence

- lint: `npm run lint`
- build: `npm run build`
- unit/integration: `npm test`
- coverage: `npm run test:coverage`
- browser E2E: `npm run test:e2e`

## Coverage Snapshot

- statements: `92.20%`
- branches: `79.79%`
- functions: `90.29%`
- lines: `92.24%`

## Release Notes

- parser, validator, diagnostics, export, persistence, templates, AST graph, and synchronization workflows are covered
- frozen grammar remains enforced by tests
- nested rows inside columns remain intentionally invalid by specification
