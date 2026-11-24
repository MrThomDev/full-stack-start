import type {
  ClientToServerEvents,
  CounterState,
  ServerHello,
  ServerToClientEvents,
} from "@app/shared";
import { io, type Socket } from "socket.io-client";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { createServer, type RunningServer } from "../server.ts";

type ClientSocket = Socket<ServerToClientEvents, ClientToServerEvents>;

let server: RunningServer;
const clients: ClientSocket[] = [];

beforeEach(async () => {
  server = await createServer({ port: 0, host: "127.0.0.1" });
});

afterEach(async () => {
  for (const c of clients.splice(0)) c.disconnect();
  await server.close();
});

/** Connects a client and resolves once it has the hello and the initial counter state. */
async function connect() {
  const socket: ClientSocket = io(server.url, {
    autoConnect: false,
    forceNew: true,
    transports: ["websocket"],
  });
  clients.push(socket);
  const hello = new Promise<ServerHello>((resolve) =>
    socket.once("server:hello", resolve),
  );
  const state = new Promise<CounterState>((resolve) =>
    socket.once("counter:state", resolve),
  );
  socket.connect();
  return { socket, hello: await hello, state: await state };
}

const nextState = (socket: ClientSocket) =>
  new Promise<CounterState>((resolve) => socket.once("counter:state", resolve));

describe("counter events", () => {
  it("sends hello and the current value on connect", async () => {
    const { socket, hello, state } = await connect();
    expect(hello.socketId).toBe(socket.id);
    expect(Number.isNaN(Date.parse(hello.serverTime))).toBe(false);
    expect(state).toEqual({ value: 0 });
  });

  it("broadcasts the new value to every client", async () => {
    const a = await connect();
    const b = await connect();
    const aState = nextState(a.socket);
    const bState = nextState(b.socket);

    const ack = await a.socket.emitWithAck("counter:increment", { by: 2 });

    expect(ack).toEqual({ ok: true });
    expect(await aState).toEqual({ value: 2 });
    expect(await bState).toEqual({ value: 2 });
  });

  it("sends the current value to clients that connect later", async () => {
    const a = await connect();
    await a.socket.emitWithAck("counter:increment", { by: 3 });
    const b = await connect();
    expect(b.state).toEqual({ value: 3 });
  });

  it.each([
    ["zero", { by: 0 }],
    ["above the max", { by: 11 }],
    ["a fraction", { by: 1.5 }],
    ["a string", { by: "1" }],
    ["a missing field", {}],
    ["null", null],
  ])(
    "rejects %s without changing or broadcasting state",
    async (_label, payload) => {
      const { socket } = await connect();
      const states: CounterState[] = [];
      socket.on("counter:state", (s) => states.push(s));

      // Deliberately malformed input, so the types don't apply.
      const ack = await socket.emitWithAck(
        "counter:increment",
        payload as never,
      );

      expect(ack).toEqual({
        ok: false,
        error: '"by" must be an integer from 1 to 10',
      });
      // A valid increment afterwards proves the rejected one changed nothing:
      // the next broadcast is 1, and it's the only broadcast.
      await socket.emitWithAck("counter:increment", { by: 1 });
      expect(states).toEqual([{ value: 1 }]);
    },
  );
});
