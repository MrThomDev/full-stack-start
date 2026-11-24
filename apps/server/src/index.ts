import { createServer } from "./server.ts";

const SHUTDOWN_TIMEOUT_MS = 10_000;

const server = await createServer({
  port: Number(process.env.PORT ?? 3000),
  clientDir: process.env.CLIENT_DIR,
});
console.log(`Server listening on ${server.url}`);

let shuttingDown = false;

function shutdown(signal: NodeJS.Signals) {
  if (shuttingDown) return;
  shuttingDown = true;
  console.log(`${signal} received, shutting down`);

  // Doesn't keep the process alive; only fires if closing hangs.
  setTimeout(() => {
    console.error("Shutdown timed out, forcing exit");
    process.exit(1);
  }, SHUTDOWN_TIMEOUT_MS).unref();

  server.close().then(
    () => console.log("Server closed"),
    (err: unknown) => {
      console.error("Error during shutdown", err);
      process.exitCode = 1;
    },
  );
}

process.on("SIGTERM", shutdown);
process.on("SIGINT", shutdown);
