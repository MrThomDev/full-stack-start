import {
  createInMemoryCounterStore,
  type CounterStore,
} from "./counterStore.ts";

/** Every store the server uses. Handlers receive these and never hold state themselves. */
export interface Stores {
  counter: CounterStore;
}

export function createInMemoryStores(): Stores {
  return { counter: createInMemoryCounterStore() };
}
