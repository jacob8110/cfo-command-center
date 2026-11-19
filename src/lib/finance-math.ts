export interface FinanceEntry {
  amount: number;
  category: string;
  transaction_date: string;
  transaction_type: string;
}

export type FinancePeriod = "this_month" | "last_30_days" | "this_year";

function formatLocalDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function getPeriodBounds(period: FinancePeriod, anchor = new Date()) {
  const end = new Date(anchor.getFullYear(), anchor.getMonth(), anchor.getDate());
  let start: Date;

  if (period === "this_year") {
    start = new Date(anchor.getFullYear(), 0, 1);
  } else if (period === "last_30_days") {
    start = new Date(end);
    start.setDate(start.getDate() - 29);
  } else {
    start = new Date(anchor.getFullYear(), anchor.getMonth(), 1);
  }

  return { start: formatLocalDate(start), end: formatLocalDate(end) };
}

export function filterTransactions<T extends FinanceEntry>(
  transactions: T[],
  period: FinancePeriod,
  anchor = new Date(),
): T[] {
  const bounds = getPeriodBounds(period, anchor);
  return transactions.filter(
    (transaction) =>
      transaction.transaction_date >= bounds.start && transaction.transaction_date <= bounds.end,
  );
}

export function calculateFinancialSummary(transactions: FinanceEntry[]) {
  let revenue = 0;
  let expenses = 0;
  let incomeCount = 0;
  let expenseCount = 0;
  const categoryTotals = new Map<string, number>();

  for (const transaction of transactions) {
    if (transaction.transaction_type === "income") {
      revenue += transaction.amount;
      incomeCount += 1;
    } else if (transaction.transaction_type === "expense") {
      expenses += transaction.amount;
      expenseCount += 1;
      categoryTotals.set(
        transaction.category,
        (categoryTotals.get(transaction.category) ?? 0) + transaction.amount,
      );
    }
  }

  return {
    revenue,
    expenses,
    profit: revenue - expenses,
    profitMargin: revenue > 0 ? ((revenue - expenses) / revenue) * 100 : 0,
    incomeCount,
    expenseCount,
    expenseCategories: [...categoryTotals.entries()]
      .map(([category, amount]) => ({ category, amount }))
      .sort((a, b) => b.amount - a.amount),
  };
}

export function calculateCashRunwayDays(cashBalance: number, monthlyExpenses: number, daysInMonth: number): number | null {
  if (monthlyExpenses <= 0 || daysInMonth <= 0) return null;
  return cashBalance / (monthlyExpenses / daysInMonth);
}

export function buildCashflowSeries(
  transactions: FinanceEntry[],
  period: FinancePeriod,
  anchor = new Date(),
) {
  const bounds = getPeriodBounds(period, anchor);
  const monthly = period === "this_year";
  const bucketCount = monthly ? 12 : 5;
  const start = new Date(`${bounds.start}T00:00:00`);
  const end = new Date(`${bounds.end}T00:00:00`);

  const buckets = Array.from({ length: bucketCount }, (_, index) => {
    if (monthly) {
      const month = new Date(anchor.getFullYear(), index, 1);
      return {
        key: `${month.getFullYear()}-${String(month.getMonth() + 1).padStart(2, "0")}`,
        label: new Intl.DateTimeFormat("ar-EG", { month: "short" }).format(month),
        revenue: 0,
        expenses: 0,
      };
    }

    const bucketStart = new Date(start);
    const bucketEnd = new Date(start);
    const dayCount = Math.max(1, Math.floor((end.getTime() - start.getTime()) / 86_400_000) + 1);
    bucketStart.setDate(start.getDate() + Math.floor((dayCount * index) / bucketCount));
    bucketEnd.setDate(start.getDate() + Math.floor((dayCount * (index + 1)) / bucketCount) - 1);
    if (bucketEnd < bucketStart) bucketEnd.setTime(bucketStart.getTime());
    const formatDay = (date: Date) => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
    return {
      key: formatDay(bucketStart),
      label: bucketCount === 5 ? String(bucketStart.getDate()) : String(index + 1),
      revenue: 0,
      expenses: 0,
    };
  });

  for (const entry of transactions) {
    const bucket = monthly
      ? buckets[Number(entry.transaction_date.slice(5, 7)) - 1]
      : buckets.find((item, index) => {
          const bucketStart = new Date(`${item.key}T00:00:00`);
          const bucketEnd = new Date(start);
          const dayCount = Math.max(1, Math.floor((end.getTime() - start.getTime()) / 86_400_000) + 1);
          bucketEnd.setDate(start.getDate() + Math.floor((dayCount * (index + 1)) / bucketCount) - 1);
          if (bucketEnd < bucketStart) bucketEnd.setTime(bucketStart.getTime());
          return entry.transaction_date >= item.key && entry.transaction_date <= formatLocalDate(bucketEnd);
        });

    if (!bucket) continue;
    if (entry.transaction_type === "income") bucket.revenue += entry.amount;
    else if (entry.transaction_type === "expense") bucket.expenses += entry.amount;
  }

  return buckets;
}