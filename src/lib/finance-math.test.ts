import { describe, expect, it } from "vitest";

import { buildCashflowSeries, calculateCashRunwayDays, calculateFinancialSummary, filterTransactions } from "@/lib/finance-math";

const sampleTransactions = [
  { transaction_type: "income", description: "Consulting contract", category: "Services", amount: 285000, transaction_date: "2026-11-17" },
  { transaction_type: "income", description: "Project payment", category: "Projects", amount: 198500, transaction_date: "2026-11-14" },
  { transaction_type: "income", description: "Subscriptions", category: "Subscriptions", amount: 142000, transaction_date: "2026-11-10" },
  { transaction_type: "income", description: "Equipment sales", category: "Sales", amount: 118000, transaction_date: "2026-11-05" },
  { transaction_type: "income", description: "Client invoice", category: "Sales", amount: 106500, transaction_date: "2026-10-31" },
  { transaction_type: "expense", description: "Team salaries", category: "Salaries", amount: 142000, transaction_date: "2026-11-18" },
  { transaction_type: "expense", description: "Office rent", category: "Rent", amount: 42000, transaction_date: "2026-11-16" },
  { transaction_type: "expense", description: "Digital marketing", category: "Marketing", amount: 38500, transaction_date: "2026-11-12" },
  { transaction_type: "expense", description: "Cloud services", category: "Technology", amount: 25750, transaction_date: "2026-11-09" },
  { transaction_type: "expense", description: "Operating costs", category: "Operations", amount: 32250, transaction_date: "2026-11-03" },
  { transaction_type: "expense", description: "Office supplies", category: "Operations", amount: 39500, transaction_date: "2026-10-27" },
];

describe("financial dashboard calculations", () => {
  it("totals the demonstration revenue at exactly EGP 850,000", () => {
    expect(calculateFinancialSummary(sampleTransactions).revenue).toBe(850000);
  });

  it("totals the demonstration expenses at exactly EGP 320,000", () => {
    expect(calculateFinancialSummary(sampleTransactions).expenses).toBe(320000);
  });

  it("calculates demonstration net profit at exactly EGP 530,000", () => {
    expect(calculateFinancialSummary(sampleTransactions).profit).toBe(530000);
  });

  it("calculates a 62.35 percent demonstration profit margin", () => {
    expect(calculateFinancialSummary(sampleTransactions).profitMargin).toBeCloseTo(62.3529411765);
  });

  it("includes only current-month income of EGP 743,500 for November 2026", () => {
    const november = filterTransactions(sampleTransactions, "this_month", new Date(2026, 10, 19));
    expect(calculateFinancialSummary(november).revenue).toBe(743500);
  });

  it("ranks the shared November expenses by their real category totals", () => {
    const november = filterTransactions(sampleTransactions, "this_month", new Date(2026, 10, 19));
    expect(calculateFinancialSummary(november).expenseCategories.slice(0, 2)).toEqual([
      { category: "Salaries", amount: 142000 },
      { category: "Rent", amount: 42000 },
    ]);
  });

  it("calculates 22.5 illustrative days of runway at EGP 240,000 cash and EGP 320,000 monthly expenses", () => {
    expect(calculateCashRunwayDays(240000, 320000, 30)).toBe(22.5);
  });

  it("groups annual income by month: EGP 743,500 in November and 106,500 in October", () => {
    const series = buildCashflowSeries(sampleTransactions, "this_year", new Date(2026, 10, 19));
    expect(series[10]?.revenue).toBe(743500);
    expect(series[9]?.revenue).toBe(106500);
  });
});