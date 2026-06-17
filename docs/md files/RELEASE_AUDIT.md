# Release Audit

## Release Readiness

Status: `READY`

Verified gates:

- lint passes
- build passes
- unit and integration tests pass
- E2E tests pass
- coverage targets met
- export behavior verified
- persistence behavior verified
- deployment configuration prepared

## Repository Health

Healthy:

- public-facing documentation added
- screenshots organized under `docs/screenshots`
- generated output ignored through `.gitignore`
- deployment notes added
- release checklist and QA report included

Constraint:

- no `.git` directory is present in the current workspace snapshot, so commit-history cleanup could not be performed from within this environment

## Documentation Audit

Available release docs:

- `README.md`
- `docs/TESTING.md`
- `docs/QA_REPORT.md`
- `docs/RELEASE_CHECKLIST.md`
- `docs/DEPLOYMENT.md`

## Deployment Readiness

Prepared for:

- Vercel static deployment

Verified:

- production build succeeds
- no environment variables are required
- client-side persistence and export remain browser-compatible

## Recommended First GitHub Release Notes

Version: `v1.0.1`

Highlights:

- shipped MCL Studio, a parser-driven Markdown Component Layout Studio
- added tokenizer, AST builder, structural validator, diagnostics, and renderer pipeline
- added AST outline inspector and graph view
- added template loading, persistence, and AST export
- completed professional QA sprint with Vitest, React Testing Library, Playwright, and 90%+ overall statement coverage
- prepared repository for public release and Vercel deployment
