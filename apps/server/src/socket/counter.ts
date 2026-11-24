import type { Ack, CounterIncrement } from "@app/shared";
import type { CounterStore } from "../state/counterStore.ts";
import type { AppServer, AppSocket } from "./types.ts";

const MAX_INCREMENT = 10;

// Payloads come off the wire, so they are `unknown` until checked.
function parseIncrement(payload: unknown): CounterIncrement | null {
  if (typeof payload !== "object" || payload === null || !("by" in payload))
    return null;
  const { by } = payload;
  if (
    typeof by !== "number" ||
    !Number.isInteger(by) ||
    by < 1 ||
    by > MAX_INCREMENT
  )
    return null;
  return { by };
}

type Reply = (res: Ack) => void;

// A client may omit the callback; replying must not throw.
const toReply = (ack: unknown): Reply =>
  typeof ack === "function" ? (ack as Reply) : () => {};

export function registerCounterHandlers(
  io: AppServer,
  socket: AppSocket,
  store: CounterStore,
) {
  // Flow: validate input → call the state module → emit or broadcast the result.
  socket.on("counter:increment", (payload: unknown, ack: unknown) => {
    void handleIncrement(payload, toReply(ack));
  });

  async function handleIncrement(payload: unknown, reply: Reply) {
    const input = parseIncrement(payload);
    if (!input) {
      reply({
        ok: false,
        error: `"by" must be an integer from 1 to ${MAX_INCREMENT}`,
      });
      return;
    }
    try {
      const value = await store.increment(input.by);
      io.emit("counter:state", { value });
      reply({ ok: true });
    } catch (err) {
      console.error("counter:increment failed", err);
      reply({ ok: false, error: "Internal error" });
    }
  }

  // Every client gets the current value when it connects.
  store.get().then(
    (value) => socket.emit("counter:state", { value }),
    (err: unknown) => console.error("counter:state on connect failed", err),
  );
}
