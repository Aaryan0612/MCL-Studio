# MCL Studio Learning Console

This is a separate study website built from [MCL_Studio_Engineering_Handbook.md](/Users/aaryan_kuchekar/ITM/Sem2/ReactMLE/docs/MCL_Studio_Engineering_Handbook.md) and the real MCL Studio source code.

It exists only for personal revision, viva preparation, and deeper project understanding.

## What it includes

- interactive architecture explorer
- repository file explorer with viva-ready summaries
- code execution journey from editor input to rendered preview
- live parser simulator using the actual project parser modules
- React concepts explained through the real implementation
- viva question practice mode
- common viva traps and correction cards
- impact maps for "what breaks if this breaks?"
- full handbook reference inside a more navigable UI

## Why it is isolated

This site lives in its own directory so it does not disturb the main MCL Studio application, architecture, build, or deployment flow.

## How to run

From the repository root:

```bash
npm --prefix study-handbook-site run dev
```

Open:

```text
http://127.0.0.1:4179
```

## How to build

```bash
npm --prefix study-handbook-site run build
```

## Important implementation note

This study site reuses the root workspace dependencies and imports actual source files from the main MCL Studio app through a Vite alias. That means the study site stays truthful to the real implementation instead of becoming a disconnected copy.
