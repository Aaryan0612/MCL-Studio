# ARCHITECTURE_FREEZE.md
## Markdown Component Layout Engine (MCLE)
### Version 1.0

---

# PURPOSE

This document freezes all architecture decisions that were previously ambiguous across the PRD, TDD, DESIGN, and TBD.

After this file is accepted, the final specification package becomes:

- `PRD_v3.md`
- `TDD_v2.md`
- `DESIGN.md`
- `TBD_v1.md`
- `AI_AGENT_RULES.md`
- `ARCHITECTURE_FREEZE.md`

No implementation should begin before these decisions are treated as final.

---

# 1. AST INSPECTOR STATUS

AST Inspector is mandatory for MVP.

Required MVP features:

- Tree view
- Expand/collapse
- Node selection
- Preview highlighting

JSON View:

- Optional MVP+
- Not required for first implementation pass

Reason:

The AST Inspector is a core product differentiator. It makes the parser architecture immediately visible to a professor or panelist and materially improves viva explanation quality.

---

# 2. CANONICAL PIPELINE

The canonical application pipeline is frozen as:

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

This is the only accepted pipeline definition.

All future documents, explanations, and implementation decisions must align with this flow.

---

# 3. TOKEN METADATA

Every token must include source metadata.

Canonical token shape:

```ts
{
  type: string;
  value?: string;
  line: number;
  column: number;
}
```

Notes:

- `line` is 1-based
- `column` is 1-based
- `value` is used when the token carries content or attributes

Reason:

Line and column metadata are required for professional diagnostics and precise parser feedback.

---

# 4. AST METADATA

Every AST node must include source-range metadata.

Canonical AST node shape:

```ts
{
  type: string;
  children: [];
  startLine: number;
  endLine: number;
}
```

Extended node fields such as `content` and `width` are allowed where relevant.

Reason:

This metadata enables:

- AST node selection
- Preview highlighting
- Better diagnostics
- Clear traceability from source input to rendered output

---

# 5. GRAMMAR RULES

The grammar is frozen as:

```text
ROOT
 ├─ ROW
 │   ├─ COL
 │   └─ COL
 │
 ├─ INFO
 │
 ├─ H1
 ├─ H2
 ├─ H3
 └─ TEXT
```

Containment rules:

```text
ROW
  can contain COL only

COL
  can contain H1/H2/H3/TEXT/INFO

INFO
  can contain H1/H2/H3/TEXT

TEXT
  cannot contain children
```

Validation rules:

```text
COL outside ROW = Error

Unexpected closing = Error

Extra closing = Error

Unclosed block = Error
```

These rules remove grammar ambiguity and define the valid nesting model for MVP.

---

# 6. WIDTH VALIDATION

Column width behavior is frozen as:

```text
width missing
→ default 100

width <= 0
→ error

width > 100
→ error

non-numeric
→ error
```

Reason:

This keeps layout behavior simple, predictable, and easy to explain during review.

---

# 7. EXPORT BEHAVIOR

Export AST behavior is frozen as:

```text
Export AST

downloads:

ast.json

formatted:

JSON.stringify(ast, null, 2)
```

No alternate export modes are required for MVP.

---

# 8. LOCAL STORAGE

LocalStorage behavior is frozen as:

```text
key:
mcle-workspace-v1
```

Reset button behavior:

```text
Clear storage
Restore starter template
```

This is the canonical persistence behavior for MVP.

---

# 9. EMPTY STATE

Empty-state behavior is frozen as:

```text
Editor Empty:

Load starter template
```

Meaning:

```text
No completely blank editor.
```

Therefore:

```text
No empty preview state required.
```

This removes an unnecessary edge case from MVP.

---

# 10. STATE MANAGEMENT

State management is frozen as:

```text
React Hooks only.

useState
useMemo
useEffect

No Zustand.
```

Reason:

- Project scope is small
- Viva explanation becomes simpler
- Less code and less abstraction

---

# FINAL RULE

If any older document conflicts with this file, `ARCHITECTURE_FREEZE.md` takes priority.

This file is the final architecture lock before implementation begins.
