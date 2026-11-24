import path from "node:path";
import express, { type Express } from "express";

export interface AppOptions {
  /** Absolute path to the built client. When set, it is served with an SPA fallback. */
  clientDir?: string | undefined;
}

export function createApp({ clientDir }: AppOptions = {}): Express {
  const app = express();
  app.disable("x-powered-by");

  app.get("/api/health", (_req, res) => {
    res.json({ status: "ok" });
  });

  // Unknown API routes get a JSON 404 instead of falling through to the client.
  app.use("/api", (_req, res) => {
    res.status(404).json({ error: "Not found" });
  });

  if (clientDir) {
    app.use(express.static(clientDir));
    app.get("/{*splat}", (_req, res) => {
      res.sendFile(path.join(clientDir, "index.html"));
    });
  }

  return app;
}
