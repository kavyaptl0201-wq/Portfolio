# UI Audit Exceptions

The following deliberate exceptions are documented according to Section 5 of the Apple Glass Design Specification:

### 1. Monospace Allowed Contexts
- **Terminal Tile (`src/components/sections/about/TerminalTile.tsx`)**: The terminal simulation intentionally displays command line invocations and output in `--font-mono` (`JetBrains Mono`).
- **Code Blocks & Inline `<code>`**: Technical parameter recipes (e.g. in Sound Lab or syntax blocks) use `--font-mono`.
- **Section Heading Accent Labels**: Controlled via `MONO_ACCENT_LABELS` in `src/config/design.ts` (default `false`).

### 2. Uppercase Allowed Contexts
- **Badges (`Chip` variant="badge", `.apple-glass-chip-badge`)**: Status/demo indicators (`DEMO`, `Coming soon`) use uppercase with letter spacing `0.04em`.
- **Hero & Footer Wordmarks**: The main typographic masthead (the name) retains its uppercase display font according to Section 0 & 3 constraints ("Do not change: ... the hero ...").

### 3. Non-Capsule Small Boxes
- **Icon Boxes**: 40px/48px square containers (e.g. in Beyond Code, Education) use the token radius `--r-input: 16px`.
- **Form Inputs**: Form fields (48px height) use the token radius `--r-input: 16px` rather than capsule shape.
- **Recipe Snippets**: Technical code cards use the token radius `--r-input: 16px`.
