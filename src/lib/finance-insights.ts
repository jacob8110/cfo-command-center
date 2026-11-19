export interface DemoTransaction {
  transaction_type: "income" | "expense";
  description: string;
  category: string;
  amount: number;
  transaction_date: string;
}

const seed: Array<[DemoTransaction["transaction_type"], string, string, number, number]> = [
  // [type, description, category, amount, days before anchor]
  ["income", "عقد استشارات مالية", "خدمات استشارية", 285000, 2],
  ["income", "دفعة مشروع تطوير", "مشروعات", 198500, 5],
  ["income", "اشتراكات العملاء", "اشتراكات", 142000, 9],
  ["income", "مبيعات معدات", "مبيعات", 118000, 14],
  ["income", "فاتورة عميل", "مبيعات", 106500, 19],
  ["expense", "رواتب الفريق", "رواتب", 142000, 1],
  ["expense", "إيجار المكتب", "إيجارات", 42000, 3],
  ["expense", "تسويق رقمي", "تسويق", 38500, 7],
  ["expense", "خدمات سحابية", "تقنية", 25750, 10],
  ["expense", "تكاليف تشغيل", "تشغيل", 32250, 16],
  ["expense", "مستلزمات مكتبية", "تشغيل", 39500, 23],
  ["income", "مشروع سابق", "مشروعات", 165000, 40],
  ["expense", "رواتب الشهر السابق", "رواتب", 138000, 35],
  ["expense", "إيجار الشهر السابق", "إيجارات", 42000, 33],
];

export const DEMO_CASH_BALANCE = 240000;

function formatDate(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

/** Sample records dated relative to the anchor so the demo always looks current. */
export function buildDemoTransactions(anchor = new Date()): DemoTransaction[] {
  return seed.map(([transaction_type, description, category, amount, daysAgo]) => {
    const date = new Date(anchor.getFullYear(), anchor.getMonth(), anchor.getDate() - daysAgo);
    return { transaction_type, description, category, amount, transaction_date: formatDate(date) };
  });
}

export type AlertLevel = "danger" | "warning" | "info" | "success";
export interface FinancialAlert { level: AlertLevel; title: string; text: string }

export function buildFinancialAlerts(input: {
  revenue: number;
  expenses: number;
  profit: number;
  runwayDays: number | null;
  expenseCategories: { category: string; amount: number }[];
}): FinancialAlert[] {
  const alerts: FinancialAlert[] = [];
  if (input.profit < 0) {
    alerts.push({ level: "danger", title: "خسارة في الفترة", text: "المصروفات تتجاوز الإيرادات خلال الفترة المحددة." });
  }
  if (input.runwayDays !== null && input.runwayDays < 30) {
    alerts.push({ level: "warning", title: "السيولة أقل من شهر", text: `الرصيد الحالي يغطي المصروفات لنحو ${Math.floor(input.runwayDays)} يومًا فقط.` });
  }
  if (input.revenue > 0 && input.expenses / input.revenue > 0.8) {
    alerts.push({ level: "warning", title: "نسبة مصروفات مرتفعة", text: "المصروفات تتجاوز ٨٠٪ من الإيرادات." });
  }
  const top = input.expenseCategories[0];
  if (top && input.expenses > 0 && top.amount / input.expenses > 0.4) {
    alerts.push({ level: "info", title: `تركّز الإنفاق في «${top.category}»`, text: `يمثل ${Math.round((top.amount / input.expenses) * 100)}٪ من إجمالي المصروفات.` });
  }
  if (alerts.length === 0) {
    alerts.push({ level: "success", title: "الوضع المالي مستقر", text: "لا توجد تنبيهات تستدعي الانتباه في هذه الفترة." });
  }
  return alerts;
}
