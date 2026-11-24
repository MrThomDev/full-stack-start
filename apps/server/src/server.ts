import { createServer as createHttpServer } from "node:http";
import type { AddressInfo } from "node:net";
import { Server } from "socket.io";
import { createApp } from "./app.ts";
import { setupSocket } from "./socket/index.ts";
import { createInMemoryStores, type Stores } from "./state/index.ts";
import type { AppServer } from "./socket/types.ts";

export interface ServerOptions {
  /** 0 picks a free port. */
  port: number;
  host?: string | undefined;
  clientDir?: string | undefined;
  stores?: Stores | undefined;
}

export interface RunningServer {
  url: string;
  io: AppServer;
  /** Disconnects every socket, then stops the HTTP server. */
  close(): Promise<void>;
}

export async function createServer({
  port,
  host,
  clientDir,
  stores = createInMemoryStores(),
}: ServerOptions): Promise<RunningServer> {
  const httpServer = createHttpServer(createApp({ clientDir }));
  // No CORS config: the client is same-origin in dev (Vite proxy) and in prod.
  const io: AppServer = new Server(httpServer);
  setupSocket(io, stores);

  await new Promise<void>((resolve, reject) => {
    httpServer.once("error", reject);
    httpServer.listen(port, host, resolve);
  });

  const address = httpServer.address() as AddressInfo;
  return {
    url: `http://localhost:${address.port}`,
    io,
    close: () => io.close(),
  };
}
