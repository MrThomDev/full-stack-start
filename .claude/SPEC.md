# Initial build spec

The first build of the template. Read it together with CLAUDE.md, which holds the standing rules.

## Starting point

This is a brand-new repo that starts empty except for CLAUDE.md, SPEC.md and `.claude/settings.json`. It is not based on any earlier version of this project, so don't look for one or reuse code from one.
Use the current stable versions of every package. Check them when you install; don't rely on memory.

## Deliverables

1. **Monorepo scaffold**: pnpm workspaces, root scripts, shared tsconfig base, ESLint + Prettier configs, `.editorconfig`, `.gitignore`, `.nvmrc`.
2. **packages/tokens**: DTCG JSON tokens and a Style Dictionary build that outputs:
   - `tokens.css`: primitives plus light and dark semantic variables (`[data-theme="dark"]`)
   - `tokens.ts`: typed JS export
   Starter token set:
   - Color primitives: neutral, primary, success, warning, danger, each with a 50–900 scale
   - Semantic colors: background, surface, text (primary/secondary), border, accent, status colors, for both light and dark
   - Font families: sans, serif, mono
   - Font sizes: a scale from xs to 4xl, plus line heights and weights
   - Spacing, radius and shadow scales
3. **packages/shared**: typed Socket.IO event maps for the events below.
4. **apps/server**: Express + Socket.IO with the layout from CLAUDE.md, an in-memory counter store behind a store interface, a `/api/health` route, a placeholder for `io.use()` auth, and graceful shutdown.
5. **apps/web**: React + Vite with the proxy config, a single socket client, Zustand stores, and the starter page below.
6. **Dockerfile** (multi-stage, non-root user) and `.dockerignore`.
7. **README**: what the template is, how to start a new project from it, and the commands.

## Socket events (the reference pattern)

- `server:hello` (server → client, on connect): `{ socketId, serverTime }`
- `counter:increment` (client → server)
- `counter:state` (server → all clients): `{ value }`. Also sent to each client when it connects.

The counter is intentionally trivial. It demonstrates the full loop: typed event → handler → state module → broadcast → Zustand store → component.

## Starter page

- **Header**: app name, a connection indicator (connected/disconnected + socket id) and a light/dark toggle.
- **Counter card**: shows the server-owned value and has an increment button. Two open tabs must stay in sync.
- **Color grid**:
  - Primitive palettes, one row per palette. Each swatch shows the token name and value.
  - The semantic colors in a separate section below.
- **Typography**:
  - One sample line per font family
  - One sample line per font-size step, labeled with the token name and size
- Every style comes from tokens through CSS Modules. The page reads its token lists from `tokens.ts`, so adding a token makes it appear automatically.

## Tests

- Unit tests for the counter store.
- A server integration test that connects a real socket client, increments, and checks the broadcast.
- One component test that renders the connection indicator from store state.

## Done when

- `pnpm install && pnpm dev` works, hot reload works, and two tabs keep the counter in sync.
- `pnpm build && pnpm start` serves the whole app on port 3000.
- `docker build` and `docker run` work.
- `pnpm typecheck`, `pnpm lint` and `pnpm test` all pass.
