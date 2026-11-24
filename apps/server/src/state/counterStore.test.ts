import { describe, expect, it } from "vitest";
import { createInMemoryCounterStore } from "./counterStore.ts";

describe("in-memory counter store", () => {
  it("starts at 0", async () => {
    const store = createInMemoryCounterStore();
    expect(await store.get()).toBe(0);
  });

  it("starts at the given initial value", async () => {
    const store = createInMemoryCounterStore(5);
    expect(await store.get()).toBe(5);
  });

  it("increments by the given amount and resolves to the new value", async () => {
    const store = createInMemoryCounterStore();
    expect(await store.increment(3)).toBe(3);
    expect(await store.increment(2)).toBe(5);
    expect(await store.get()).toBe(5);
  });

  it("keeps separate state per store", async () => {
    const a = createInMemoryCounterStore();
    const b = createInMemoryCounterStore();
    await a.increment(1);
    expect(await b.get()).toBe(0);
  });
});
