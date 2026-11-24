// Every Socket.IO event is typed here first, then implemented on the server
// and wired into a store on the client.
//
// This package is types only. Import it with `import type`: the server runs
// .ts files through Node's type stripping, which never loads code from
// node_modules, so a runtime export here would break the server.

export interface ServerHello {
  socketId: string;
  /** ISO 8601 timestamp. */
  serverTime: string;
}

export interface CounterState {
  value: number;
}

export interface CounterIncrement {
  /** An integer from 1 to 10. */
  by: number;
}

/** Reply sent through an event's acknowledgement callback. */
export type Ack = { ok: true } | { ok: false; error: string };

export interface ServerToClientEvents {
  "server:hello": (payload: ServerHello) => void;
  "counter:state": (payload: CounterState) => void;
}

export interface ClientToServerEvents {
  "counter:increment": (
    payload: CounterIncrement,
    ack: (res: Ack) => void,
  ) => void;
}

/** Events between server instances. Unused until a project adds an adapter. */
export type InterServerEvents = Record<never, never>;

/** Per-socket data, set by auth middleware (e.g. `userId`). Empty until a project adds auth. */
export type SocketData = Record<never, never>;
