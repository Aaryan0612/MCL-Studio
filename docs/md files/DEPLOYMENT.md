# Deployment Guide

## Production Target

The project is prepared for static deployment on Vercel.

Runtime characteristics:

- framework: `Vite + React`
- output directory: `dist`
- required environment variables: none
- client-side persistence: browser `localStorage`
- client-side export: browser `Blob` + download link

## Vercel Configuration

The repository includes:

- `vercel.json`

Configured values:

- `framework: vite`
- `buildCommand: npm run build`
- `outputDirectory: dist`

## Local Release Verification

Before deploying:

1. Run `npm run lint`
2. Run `npm test`
3. Run `npm run test:e2e`
4. Run `npm run build`

## Deployment Steps

### Vercel UI

1. Import the repository into Vercel
2. Keep the detected Vite framework preset
3. Confirm the build command is `npm run build`
4. Confirm the output directory is `dist`
5. Deploy

### Vercel CLI

```bash
npm install -g vercel
vercel
vercel --prod
```

## Environment Notes

No secrets or server-side environment variables are required for the current release.

Browser-dependent features:

- AST export depends on browser download support
- workspace persistence depends on `localStorage`

The application already hardens against storage access failures and falls back safely to starter content.

## Post-Deploy Smoke Checklist

- app boot renders starter template
- editor updates preview after debounce
- template switching works
- AST graph and outline open under Developer Tools
- export downloads `ast.json`
- refresh restores saved content
- reset workspace restores starter template
