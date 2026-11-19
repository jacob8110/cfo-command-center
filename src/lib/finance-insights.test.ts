import { describe, expect, it } from "vitest";
import { buildDemoTransactions, buildFinancialAlerts } from "@/lib/finance-insights";
import { calculateFinancialSummary, filterTransactions } from "@/lib/finance-math";

const anchor = new Date(2026, 10, 25);

describe("demo reset data", () => {
  it("restores EGP 850,000 revenue within the last 30 days", () => {
    const recent = filterTransactions(buildDemoTransactions(anchor), "last_30_days", anchor);
    expect(calculateFinancialSummary(recent).revenue).toBe(850000);
  });
  it("restores EGP 320,000 expenses within the last 30 days", () => {
    const recent = filterTransactions(buildDemoTransactions(anchor), "last_30_days", anchor);
    expect(calculateFinancialSummary(recent).expenses).toBe(320000);
  });
});

describe("financial alerts", () => {
  const base = { revenue: 100, expenses: 50, profit: 50, runwayDays: 60, expenseCategories: [{ category: "a", amount: 10 }] };
  it("flags a loss when profit is negative", () => {
    expect(buildFinancialAlerts({ ...base, profit: -1 }).some((a) => a.level === "danger")).toBe(true);
  });
  it("warns when cash covers fewer than 30 days", () => {
    expect(buildFinancialAlerts({ ...base, runwayDays: 29 }).map((a) => a.title)).toContain("السيولة أقل من شهر");
  });
  it("does not warn about runway at exactly 30 days", () => {
    expect(buildFinancialAlerts({ ...base, runwayDays: 30 }).map((a) => a.title)).not.toContain("السيولة أقل من شهر");
  });
  it("warns when expenses exceed 80% of revenue", () => {
    expect(buildFinancialAlerts({ ...base, expenses: 81 }).map((a) => a.title)).toContain("نسبة مصروفات مرتفعة");
  });
  it("reports stable status when nothing triggers", () => {
    expect(buildFinancialAlerts(base)[0]?.level).toBe("success");
  });
});
