import type { Stores } from "../state/index.ts";
import { registerCounterHandlers } from "./counter.ts";
import type { AppServer } from "./types.ts";

export function setupSocket(io: AppServer, stores: Stores) {
  // Auth goes here. Middleware runs once per connection, before "connection".
  // Reject with next(new Error("Unauthorized")) or attach the user to socket.data:
  //
  // io.use((socket, next) => {
  //   const token: unknown = socket.handshake.auth.token;
  //   const user = verifyToken(token);
  //   if (!user) return next(new Error("Unauthorized"));
  //   socket.data.userId = user.id; // add userId to SocketData in @app/shared
  //   next();
  // });

  io.on("connection", (socket) => {
    socket.emit("server:hello", {
      socketId: socket.id,
      serverTime: new Date().toISOString(),
    });
    registerCounterHandlers(io, socket, stores.counter);
  });
}
