export interface CounterStore {
  get(): Promise<number>;
  /** Adds `by` and resolves to the new value. */
  increment(by: number): Promise<number>;
}

// Async even in memory, so a database-backed store can replace it without
// changing any handler.
export function createInMemoryCounterStore(initial = 0): CounterStore {
  let value = initial;
  return {
    get: () => Promise.resolve(value),
    increment: (by) => {
      value += by;
      return Promise.resolve(value);
    },
  };
}
