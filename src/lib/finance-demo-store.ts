import { z } from "zod";

import { DEMO_CASH_BALANCE, buildDemoTransactions } from "@/lib/finance-insights";

const STORAGE_KEY = "cfo-command-center-demo-v1";

const transactionSchema = z.object({
  id: z.string().min(1),
  created_at: z.string().datetime(),
  transaction_type: z.enum(["income", "expense"]),
  description: z.string().min(1).max(180),
  category: z.string().min(1).max(80),
  amount: z.number().finite().positive(),
  transaction_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
});

const snapshotSchema = z.object({
  transactions: z.array(transactionSchema),
  cashBalance: z.number().finite().min(0),
});

export type FinanceDemoTransaction = z.infer<typeof transactionSchema>;
export type FinanceDemoSnapshot = z.infer<typeof snapshotSchema>;

export function createInitialFinanceDemoSnapshot(anchor = new Date()): FinanceDemoSnapshot {
  const transactions = buildDemoTransactions(anchor).map((transaction, index) => ({
    ...transaction,
    id: `sample-${index + 1}`,
    created_at: new Date(`${transaction.transaction_date}T12:00:00.000Z`).toISOString(),
  }));
  return { transactions, cashBalance: DEMO_CASH_BALANCE };
}

export function readFinanceDemoSnapshot(
  storage: Storage = window.localStorage,
): FinanceDemoSnapshot | null {
  const serialized = storage.getItem(STORAGE_KEY);
  if (serialized === null) return null;

  let parsed: unknown;
  try {
    parsed = JSON.parse(serialized);
  } catch (error) {
    throw new Error("Saved finance demo data is not valid JSON.", { cause: error });
  }
  return snapshotSchema.parse(parsed);
}

export function saveFinanceDemoSnapshot(
  snapshot: FinanceDemoSnapshot,
  storage: Storage = window.localStorage,
): void {
  storage.setItem(STORAGE_KEY, JSON.stringify(snapshotSchema.parse(snapshot)));
}
