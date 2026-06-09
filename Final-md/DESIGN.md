# DESIGN.md
## Markdown Layout Engine — v1.0

This document is the UI constitution of the project. It defines the complete visual design system, interaction model, layout architecture, and implementation constraints. Every design and code decision must trace back to a rule in this file.

---

## Part 1 — Design Vision

### Product Statement

Markdown Layout Engine is a developer-focused parsing playground that transforms custom layout syntax into a visual interface through a `tokenizer → AST → renderer` pipeline.

The application must feel like a professional engineering tool — not a college project.

A user opening the application should feel as though they are interacting with an internal tool used by engineers building documentation systems, UI builders, or compilers.

---

### Inspiration Sources

**Primary:**
- AST Explorer
- Cursor
- Vercel Developer Tooling
- Warp
- OpenCode

**Secondary:**
- VS Code
- React DevTools
- Chrome DevTools

**Explicitly Avoid:**
- Notion
- ChatGPT
- Linear
- ClickUp
- Dashboard SaaS layouts
- Glassmorphism portfolios

---

### Product Personality

The product should feel: Technical. Precise. Serious. Structured. Minimal.

The product should NOT feel: Friendly. Playful. Cartoonish. Consumer-focused. Social.

> Think: "A tool built by compiler engineers." Not: "A startup dashboard."

---

### Emotional Response Benchmark

When a professor or panelist opens the application:

1. First thought: "This looks like a real engineering tool."
2. Second thought: "The student understands parser architecture."
3. Third thought: "This is significantly beyond a typical React CRUD project."

---

## Part 2 — Core Design Principles

### Principle 1 — Information Over Decoration

Every element must serve a functional purpose. If it cannot be explained, it should be removed.

### Principle 2 — Structure Over Visual Effects

Hierarchy must be communicated using spacing, borders, typography, and alignment.

**Never use:** shadows, gradients, glassmorphism, neon effects, animated backgrounds.

### Principle 3 — Developer Tool Aesthetic

The application should resemble a parser workbench or compiler playground — not a content creation platform.

### Principle 4 — The Interface Teaches the Pipeline

The UI must continuously communicate:

```
Raw Input → Tokenizer → AST → Renderer → Preview
```

A first-time user should understand this architecture within 30 seconds of opening the application — without anyone explaining it.

---

## Part 3 — Color System

### Base Surfaces

| Token | Hex | Usage |
|---|---|---|
| Background Primary | `#0A0A0A` | Root background |
| Background Secondary | `#111111` | Panel backgrounds |
| Background Elevated | `#161616` | Cards, raised surfaces |
| Background Surface | `#1D1E22` | Nested panels |

### Borders

| Token | Hex | Width |
|---|---|---|
| Border Primary | `#2A2A2A` | 1px — default |
| Border Secondary | `#3A3A3A` | 1px — emphasis |
| Border Active | `#40424A` | 2px — selected panel |

**No shadows. All hierarchy is expressed through borders.**

### Text

| Token | Hex | Usage |
|---|---|---|
| Text Primary | `#E5E5E5` | Main readable content |
| Text Secondary | `#A1A1A1` | Labels, descriptions |
| Text Muted | `#7B7B7B` | Hints, inactive states |
| Text Disabled | `#5F5F5F` | Disabled controls |

### Semantic / Status Colors

| State | Hex | Used For |
|---|---|---|
| Success | `#22C55E` | Valid parse, no errors |
| Warning | `#F59E0B` | Partial parse, missing blocks |
| Danger | `#EF4444` | Parse failures, unclosed tags |
| Info | `#3B82F6` | Info blocks, selected AST node |
| AST Highlight | `#E7A6FF` | Active node in tree |

**No gradients. No neon. No glow. No glass. Only functional color.**

---

## Part 4 — Typography System

### Mandatory Requirement

> **Times New Roman, 12pt** is the project-specified font. This requirement takes priority over aesthetic preference.

### Font Roles

| Role | Family | Usage |
|---|---|---|
| Primary | Times New Roman, serif | Navigation, buttons, labels, headings, body, preview content |
| Technical | JetBrains Mono, monospace | Editor, AST viewer, diagnostics, token viewer, exported JSON |

**Rule:** Never use monospace for general UI. Never use Times New Roman in code regions.

### Type Scale

| Level | Size | Weight |
|---|---|---|
| Application Title | 24px | 700 |
| H1 | 24px | 600 |
| H2 | 20px | 600 |
| H3 | 16px | 600 |
| Body | 12pt | 400 |
| Panel Label | 12px | 400 — uppercase, 1px letter-spacing |
| Code / Diagnostics | 13–14px | 400 — JetBrains Mono |

---

## Part 5 — Spacing & Radius System

### Spacing

Base unit: **4px**

Permitted values: `4 / 8 / 12 / 16 / 24 / 32 / 48`

Never use arbitrary spacing values.

### Border Radius

| Context | Value |
|---|---|
| Buttons | 4px |
| Inputs | 6px |
| Panels | 8px |
| Maximum allowed | 8px |

**No pill buttons. No fully rounded cards.**

---

## Part 6 — Application Layout

### Desktop Layout

```
┌──────────────────────────────────────────────────────────────┐
│  Header                                                      │  64px
├─────────────────────────┬────────────────────────────────────┤
│                         │                                    │
│        Editor           │          Live Preview              │
│         40%             │              60%                   │
│                         │                                    │
├─────────────────────────┴────────────────────────────────────┤
│  AST Inspector                                               │
├──────────────────────────────────────────────────────────────┤
│  Diagnostics Footer                                          │  40px
└──────────────────────────────────────────────────────────────┘
```

**Layout Ratio Rationale:** Preview receives more space than the editor because the rendered output is the primary artifact. Users should spend most of their time watching the result, not the syntax.

### Visual Priority Order

1. Preview — primary output, most real estate
2. Editor — input mechanism
3. AST Inspector — structural transparency
4. Diagnostics — parser health

---

## Part 7 — Component Specifications

### Header

**Height:** 64px

**Left:** Application name + Status indicator  
**Center:** Current workspace label  
**Right:** Export AST, Reset Workspace

**Never place:** user profiles, notifications, search bars, marketing content, logos, icons, emojis.

---

### Editor Panel

**Purpose:** Raw syntax input.

**Mental model:** Source code.

| Property | Value |
|---|---|
| Font | JetBrains Mono |
| Line height | 1.6 |
| Padding | 16px |
| Scroll | Vertical, full height |

Panel label: `EDITOR` — uppercase, 12px, 1px letter-spacing, muted color.

**Responsibilities:** Capture input, trigger parsing, maintain cursor stability.  
**Must not:** Parse syntax, render preview, validate AST.

---

### Preview Panel

**Purpose:** Rendered output.

**Mental model:** Compiled result.

| Property | Value |
|---|---|
| Padding | 24px |
| Font | Times New Roman |
| Overflow | Scrollable |

The preview must look like a polished product — not raw HTML, not plain text. Rendered layouts must demonstrate rows, columns, info blocks, nested layouts, headings, and typography.

**Responsibilities:** Render AST output only.  
**Must not:** Modify AST, parse text, validate syntax.

---

### AST Inspector

**Purpose:** Visualize parser hierarchy.

**Primary View — Tree:**

```
row
├── col
│   ├── heading
│   └── text
└── info
```

**Secondary View — JSON:** Toggle available. Never the default.

**Node Colors:**

| Node Type | Color |
|---|---|
| row / col | Neutral (text primary) |
| info | Info blue |
| error | Danger red |
| selected | AST highlight purple |

Avoid rainbow trees. Use semantic color only.

**Interactions:** Selecting a node highlights both the AST node and the corresponding preview region.

**Responsibilities:** Visualize hierarchy, support expand/collapse, selected node highlighting. Read-only.

---

### Diagnostics Footer

**Height:** 40px — always visible, docked to bottom.

**Contents:**

```
Tokens: 14    Depth: 3    Parse: 0.42ms    Errors: 0    Status: OK
```

All values rendered in JetBrains Mono. No business logic. Receives computed values only.

---

### Buttons

| Property | Value |
|---|---|
| Style | Ghost |
| Height | 36px |
| Padding | 8px 16px |
| Border | 1px solid |
| Background | Transparent |
| Hover | Slight border emphasis |

No shadows. No elevation. No gradients.

---

### Info Blocks

**Visual inspiration:** Docusaurus callouts.

Structure: Left accent border + title + content.

Use semantic color only. No flashy visuals.

---

## Part 8 — Interaction Design

### Parsing Flow

```
User Types → Debounce (150ms) → Tokenizer → AST Builder → Validation → Diagnostics → Render
```

The user should feel: "Everything updates instantly."

### Animation Rules

**Allowed:**

| Type | Duration |
|---|---|
| Opacity fade | 100ms |
| Panel resize | 150ms |
| Border transitions | 100–150ms |
| Height transitions | 150ms |

**Maximum:** 200ms

**Forbidden:** Bounce, elastic, parallax, floating elements, particle effects, confetti, Lottie animations, heavy motion.

### Hover States

Purpose: Clarify interactivity. Not decoration.

Permitted: border emphasis, background shift, text color shift. Nothing more.

### Focus States

Mandatory. Keyboard users must always know their current focus.

All interactive elements — inputs, buttons, toggles — must have visible focus rings. WCAG AA minimum contrast required.

### Empty & Error States

**Empty Editor:** Show starter template.  
**Empty AST:** `No AST Generated`  

The editor must never initialize blank in MVP. The starter template is the default workspace state, so no empty-preview placeholder is required.

**Error format:** Be educational.

```
Expected closing block for :::row
Line: 14
```

Never show bare: `Syntax Error`. Users must understand what happened, why it happened, and how to fix it.

---

## Part 9 — Forbidden Design Patterns

Do not use:

- Gradients
- Glassmorphism
- Neumorphism
- Animated backgrounds
- Dashboard widget layouts
- Large hero sections
- Onboarding screens
- Marketing banners
- Emoji usage
- Bright neon colors
- Excessive shadows
- Pill-shaped buttons
- God components (>250 lines)
- Parsing logic inside React components
- Global state without justification

---

## Part 10 — Codex Implementation Rules

### Layer Separation

| Layer | Constraint |
|---|---|
| Parser | Must never import React |
| Renderer | Must never parse text |
| Diagnostics | Must never mutate state |

### File Size

**Preferred:** Under 150 lines per component.  
**Maximum:** 250 lines. If exceeded, refactor before continuing.

### State Management

Prefer local state. Use a 150ms debounce plus `useMemo` for parsing. Do not introduce Zustand in MVP. Avoid unnecessary global state.

### Component Principle

One component. One responsibility.

Avoid God Components. Avoid massive `App.jsx` files.

---

## Part 11 — Quality Checklist

Before shipping any screen, ask:

**Does this look like AST Explorer, Cursor, or Vercel Developer Tooling?**

or

**Does this look like a student assignment?**

If the answer is the second — redesign.

---

## Part 12 — Ultimate Success Criteria

A professor opens the application. No one explains anything.

Within 30 seconds, they understand:

```
Input → Parse → AST → Render → Output
```

The interface communicates the architecture.

That is the only success metric that matters.

---

*End of DESIGN.md v1.0*
