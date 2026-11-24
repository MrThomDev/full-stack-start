# full-stack-start

A template for real-time full-stack apps. The server owns the logic and state. The client renders what the server sends and emits user intents.
This repo is deliberately lean. Databases, auth and multi-instance scaling are added later in each project built from it, not here.

## Stack

- TypeScript everywhere, strict mode, ESM
- pnpm workspaces monorepo
- Server: Node (current LTS), Express 5, Socket.IO
- Client: React, Vite, Zustand, CSS Modules
- Design tokens: W3C DTCG JSON → Style Dictionary → CSS custom properties + TS exports
- Tests: Vitest · Lint: ESLint (typescript-eslint, react-hooks) · Format: Prettier
- Deploy: Docker, multi-stage build, single container

## Layout

```
apps/server/src/
  index.ts          bootstrap: reads env, starts the server, graceful shutdown
  server.ts         createServer(): http server + Express + Socket.IO (used by tests)
  app.ts            Express app (routes; serves client build in prod)
  socket/           connection setup + handlers grouped by feature
  state/            state stores; the only place state is changed
apps/web/src/
  main.tsx, App.tsx
  socket/           the single socket client + wiring of events into stores
  stores/           Zustand stores
  components/       Name/Name.tsx + Name/Name.module.css
  styles/           global CSS (reset, token imports) only
packages/shared/src/  typed socket event maps + shared types
packages/tokens/
  tokens/primitive/   raw color palettes (color.primary.500)
  tokens/semantic/    what components use: light.json + dark.json (themed colors,
                      e.g. color.text.primary) and base.json (font, space, size,
                      radius, shadow, border, duration; same in both themes)
  dist/               generated, never edit by hand
```

## Architecture rules

- The server is the source of truth. The client never computes authoritative state.
- Socket handler flow: validate input → call the state module → emit or broadcast the result. No business logic in handlers.
- State lives behind a store interface. The template ships an in-memory implementation, so a project can swap in a database without touching handlers.
- Every socket event is typed in `packages/shared` (`ClientToServerEvents`, `ServerToClientEvents`). Add the type first, then implement.
- Client: create one socket instance, in `socket/`. Components never call `socket.on` directly. Listeners update Zustand stores, and components read the stores through selectors.
- Auth is not included. Socket auth belongs in `io.use()` middleware; a commented placeholder marks the spot.

## Styling rules

- Components use semantic tokens only, e.g. `var(--color-text-primary)`. Never use primitives, raw hex or raw px in component CSS.
- If you need a value that doesn't exist, add a token and rebuild. Don't hardcode it.
- Themes: light and dark semantic sets, switched by `data-theme` on `<html>`.
- Component styles go in CSS Modules. Global CSS is only for the reset and token imports.

## Commands

- `pnpm dev` builds tokens, then runs the server (watch) and Vite in parallel
- `pnpm build` · `pnpm start` (production server that also serves the built client)
- `pnpm test` · `pnpm lint` · `pnpm format` · `pnpm typecheck`
- `docker build -t full-stack-start .` · `docker run -p 3000:3000 full-stack-start`

## Dev vs prod

- Dev: Vite (port 5173) serves the client with hot reload and proxies `/api` and `/socket.io` (with `ws: true`) to Express (port 3000).
- Prod: Express serves `apps/web/dist` with an SPA fallback, all on one port.

## Working agreements

- Before calling a task done, run `pnpm typecheck`, `pnpm lint` and `pnpm test`.
- Ask before adding any dependency.
- Keep the template generic. No app-specific features.

## Git workflow

- Work on `main` unless told otherwise.
- After each completed stage or task, if typecheck, lint and test pass, commit and then `git push`. Don't wait to be asked.
- Commits are small and focused. Messages use Conventional Commits (`feat:`, `fix:`, `chore:`, `docs:`, `test:`, `refactor:`).
- Never force-push, rewrite pushed history, or commit `.env` files or secrets.
- If a push fails, stop and report why. Don't work around it.
