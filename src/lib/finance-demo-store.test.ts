import { beforeEach, describe, expect, it } from "vitest";

import {
  createInitialFinanceDemoSnapshot,
  readFinanceDemoSnapshot,
  saveFinanceDemoSnapshot,
} from "@/lib/finance-demo-store";

function createMemoryStorage(): Storage {
  const entries = new Map<string, string>();
  return {
    get length() {
      return entries.size;
    },
    clear: () => entries.clear(),
    getItem: (key) => entries.get(key) ?? null,
    key: (index) => [...entries.keys()][index] ?? null,
    removeItem: (key) => void entries.delete(key),
    setItem: (key, value) => void entries.set(key, String(value)),
  };
}

describe("browser-local finance demo", () => {
  let storage: Storage;

  beforeEach(() => {
    storage = createMemoryStorage();
  });

  it("starts with a complete sample and a cash balance", () => {
    const snapshot = createInitialFinanceDemoSnapshot(new Date(2026, 10, 25));

    expect(snapshot.transactions).toHaveLength(14);
    expect(snapshot.cashBalance).toBe(240000);
    expect(readFinanceDemoSnapshot(storage)).toBeNull();
  });

  it("persists and restores only a validated browser snapshot", () => {
    const snapshot = createInitialFinanceDemoSnapshot(new Date(2026, 10, 25));
    saveFinanceDemoSnapshot(snapshot, storage);

    expect(readFinanceDemoSnapshot(storage)).toEqual(snapshot);
    expect(readFinanceDemoSnapshot(createMemoryStorage())).toBeNull();
  });

  it("rejects malformed or invalid saved data instead of silently accepting it", () => {
    storage.setItem("cfo-command-center-demo-v1", "{");
    expect(() => readFinanceDemoSnapshot(storage)).toThrow("not valid JSON");

    storage.setItem(
      "cfo-command-center-demo-v1",
      JSON.stringify({ transactions: [], cashBalance: -1 }),
    );
    expect(() => readFinanceDemoSnapshot(storage)).toThrow();
  });
});
