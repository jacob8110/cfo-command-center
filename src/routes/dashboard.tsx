import { useMutation } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Activity,
  ArrowDownLeft,
  ArrowLeft,
  ArrowUpLeft,
  ArrowUpRight,
  BarChart3,
  Bell,
  CalendarDays,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  CircleDollarSign,
  CloudDownload,
  CreditCard,
  FileBarChart,
  FileText,
  LayoutDashboard,
  LoaderCircle,
  Menu,
  MoreHorizontal,
  Pencil,
  RotateCcw,
  Plus,
  Search,
  ShieldAlert,
  Trash2,
  TrendingDown,
  TrendingUp,
  Wallet,
  X,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState, type FormEvent, type ReactNode } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  buildCashflowSeries,
  calculateCashRunwayDays,
  calculateFinancialSummary,
  filterTransactions,
  getPeriodBounds,
  type FinancePeriod,
} from "@/lib/finance-math";
import { buildFinancialAlerts } from "@/lib/finance-insights";
import {
  createInitialFinanceDemoSnapshot,
  readFinanceDemoSnapshot,
  saveFinanceDemoSnapshot,
  type FinanceDemoSnapshot,
  type FinanceDemoTransaction,
} from "@/lib/finance-demo-store";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

type Transaction = FinanceDemoTransaction;
type TransactionInput = Omit<Transaction, "id" | "created_at">;
const categories = ["مشروعات", "مبيعات", "خدمات استشارية", "اشتراكات", "رواتب", "إيجارات", "تسويق", "تقنية", "تشغيل", "أخرى"];
const labels = [
  { id: "overview", text: "نظرة عامة", icon: LayoutDashboard },
  { id: "cashflow", text: "تحليل التدفقات", icon: Activity },
  { id: "profit-loss", text: "الأرباح والخسائر", icon: BarChart3 },
  { id: "transactions", text: "الحركات المالية", icon: CreditCard },
  { id: "reports", text: "التقارير المالية", icon: FileBarChart },
];
const siteOrigin = import.meta.env["VITE_SITE_URL"]?.replace(/\/+$/, "") ?? "";
const portfolioImage = siteOrigin ? `${siteOrigin}/portfolio-cover.png` : "/portfolio-cover.png";

export const Route = createFileRoute("/dashboard")({
  head: () => ({
    meta: [
      { title: "مركز المدير المالي | إدارة مالية ومؤشرات نقدية" },
      { name: "description", content: "لوحة مالية باللغة العربية لمتابعة الإيرادات والمصروفات والتدفقات النقدية والتقارير بالجنيه المصري." },
      { property: "og:title", content: "مركز المدير المالي" },
      { property: "og:description", content: "ملخص الوضع المالي والحركات النقدية والأرباح والتقارير بالجنيه المصري." },
      { property: "og:image", content: portfolioImage },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:image", content: portfolioImage },
    ],
  }),
  loader: () => createInitialFinanceDemoSnapshot(),
  staleTime: Infinity,
  pendingComponent: () => <div className="flex min-h-screen items-center justify-center text-sm text-muted-foreground">جارٍ تحميل الملخص المالي...</div>,
  errorComponent: ({ error }) => <div className="flex min-h-screen items-center justify-center px-5 text-sm text-expense">تعذر تحميل البيانات المالية: {error instanceof Error ? error.message : ""}</div>,
  component: FinanceDashboard,
});

const money = (value: number) =>
  new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 }).format(Math.round(value));

const exactMoney = (value: number) =>
  new Intl.NumberFormat("en-US", { maximumFractionDigits: 2, minimumFractionDigits: 0 }).format(value);

const displayDate = (value: string) =>
  new Intl.DateTimeFormat("ar-EG", { day: "numeric", month: "short", year: "numeric", timeZone: "Africa/Cairo" }).format(new Date(`${value}T12:00:00Z`));

const todayString = () => {
  const today = new Intl.DateTimeFormat("en-CA", { timeZone: "Africa/Cairo", year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date());
  return today.replaceAll("/", "-");
};

function FinanceDashboard() {
  const initialData = Route.useLoaderData();
  const [demoSnapshot, setDemoSnapshot] = useState<FinanceDemoSnapshot>(initialData);
  const snapshotRef = useRef(initialData);
  const [isHydrated, setIsHydrated] = useState(false);
  const [period, setPeriod] = useState<FinancePeriod>("this_month");
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<"all" | "income" | "expense">("all");
  const [page, setPage] = useState(1);
  const [resetOpen, setResetOpen] = useState(false);
  const [activeSection, setActiveSection] = useState("overview");
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingCash, setEditingCash] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Transaction | null>(null);
  const [form, setForm] = useState<TransactionInput>({
    transaction_type: "income",
    description: "",
    category: "مبيعات",
    amount: 0,
    transaction_date: todayString(),
  });
  const [cashInput, setCashInput] = useState(String(initialData.cashBalance));

  const transactions = demoSnapshot.transactions;
  const cashBalance = demoSnapshot.cashBalance;

  useEffect(() => {
    try {
      const savedSnapshot = readFinanceDemoSnapshot();
      const snapshot = savedSnapshot ?? initialData;
      if (!savedSnapshot) saveFinanceDemoSnapshot(snapshot);
      snapshotRef.current = snapshot;
      setDemoSnapshot(snapshot);
      setCashInput(String(snapshot.cashBalance));
      setIsHydrated(true);
    } catch (error) {
      console.error("Unable to load this browser's saved demo data.", error);
      toast.error("تعذر قراءة البيانات المحفوظة في هذا المتصفح. يمكنك استعادة بيانات العرض لإصلاحها.");
      setIsHydrated(true);
    }
  }, [initialData]);
  const currentPeriodTransactions = useMemo(
    () => filterTransactions(transactions, period),
    [transactions, period],
  );
  const currentSummary = useMemo(
    () => calculateFinancialSummary(currentPeriodTransactions),
    [currentPeriodTransactions],
  );
  const previousPeriodTransactions = useMemo(() => {
    const now = new Date();
    if (period === "this_month") {
      const previousMonth = new Date(now.getFullYear(), now.getMonth() - 1, 15);
      return filterTransactions(transactions, "this_month", previousMonth);
    }
    if (period === "this_year") {
      return transactions.filter((entry) => entry.transaction_date.slice(0, 4) === String(now.getFullYear() - 1));
    }
    const start = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 59);
    const end = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 30);
    return transactions.filter((entry) => {
      const date = new Date(`${entry.transaction_date}T12:00:00`);
      return date >= start && date <= end;
    });
  }, [transactions, period]);
  const previousSummary = useMemo(
    () => calculateFinancialSummary(previousPeriodTransactions),
    [previousPeriodTransactions],
  );
  const cashflowSeries = useMemo(
    () => buildCashflowSeries(currentPeriodTransactions, period),
    [currentPeriodTransactions, period],
  );
  const reportRows = useMemo(() => currentSummary.expenseCategories, [currentSummary.expenseCategories]);
  const pageSize = 8;
  const filteredTransactions = useMemo(
    () => currentPeriodTransactions.filter((entry) =>
      (typeFilter === "all" || entry.transaction_type === typeFilter) &&
      `${entry.description} ${entry.category}`.toLowerCase().includes(search.trim().toLowerCase()),
    ),
    [currentPeriodTransactions, search, typeFilter],
  );
  const pageCount = Math.max(1, Math.ceil(filteredTransactions.length / pageSize));
  const currentPage = Math.min(page, pageCount);
  const visibleTransactions = filteredTransactions.slice((currentPage - 1) * pageSize, currentPage * pageSize);
  useEffect(() => setPage(1), [search, typeFilter, period]);

  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      const visible = entries.filter((entry) => entry.isIntersecting).sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
      if (visible) setActiveSection(visible.target.id);
    }, { rootMargin: "-20% 0px -65% 0px", threshold: [0, 0.25, 0.5] });

    labels.forEach((item) => {
      const target = document.getElementById(item.id);
      if (target) observer.observe(target);
    });
    return () => observer.disconnect();
  }, []);

  const transactionMutation = useMutation({
    mutationFn: async (input: TransactionInput & { id?: string }) => {
      const current = snapshotRef.current;
      const existing = input.id
        ? current.transactions.find((transaction) => transaction.id === input.id)
        : undefined;
      const transaction: Transaction = {
        ...input,
        id: existing?.id ?? crypto.randomUUID(),
        created_at: existing?.created_at ?? new Date().toISOString(),
      };
      const next: FinanceDemoSnapshot = {
        ...current,
        transactions: existing
          ? current.transactions.map((item) => item.id === existing.id ? transaction : item)
          : [transaction, ...current.transactions],
      };
      saveFinanceDemoSnapshot(next);
      snapshotRef.current = next;
      setDemoSnapshot(next);
      return next;
    },
    onSuccess: () => {
      setDialogOpen(false);
      setEditingTransaction(null);
      toast.success("تم حفظ الحركة المالية بنجاح");
    },
    onError: (error) => {
      console.error("Unable to save this browser's demo transaction.", error);
      toast.error("تعذر حفظ الحركة في هذا المتصفح. راجع مساحة التخزين وحاول مرة أخرى.");
    },
  });
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const current = snapshotRef.current;
      const next = {
        ...current,
        transactions: current.transactions.filter((transaction) => transaction.id !== id),
      };
      saveFinanceDemoSnapshot(next);
      snapshotRef.current = next;
      setDemoSnapshot(next);
      return next;
    },
    onSuccess: () => {
      setDeleteTarget(null);
      toast.success("تم حذف الحركة المالية");
    },
    onError: (error) => {
      console.error("Unable to delete this browser's demo transaction.", error);
      toast.error("تعذر حذف الحركة من هذا المتصفح.");
    },
  });
  const cashMutation = useMutation({
    mutationFn: async (cashBalance: number) => {
      const next = { ...snapshotRef.current, cashBalance };
      saveFinanceDemoSnapshot(next);
      snapshotRef.current = next;
      setDemoSnapshot(next);
      return next;
    },
    onSuccess: () => {
      setDialogOpen(false);
      setEditingCash(false);
      toast.success("تم تحديث السيولة المتاحة");
    },
    onError: (error) => {
      console.error("Unable to save this browser's demo cash balance.", error);
      toast.error("تعذر تحديث رصيد السيولة في هذا المتصفح.");
    },
  });

  const resetMutation = useMutation({
    mutationFn: async () => {
      const next = createInitialFinanceDemoSnapshot();
      saveFinanceDemoSnapshot(next);
      snapshotRef.current = next;
      setDemoSnapshot(next);
      return next;
    },
    onSuccess: () => {
      setResetOpen(false);
      toast.success("تمت استعادة بيانات المثال في هذا المتصفح");
    },
    onError: (error) => {
      console.error("Unable to reset this browser's finance demo.", error);
      toast.error("تعذرت استعادة البيانات في هذا المتصفح.");
    },
  });

  const periods: { id: FinancePeriod; label: string }[] = [
    { id: "this_month", label: "هذا الشهر" },
    { id: "last_30_days", label: "آخر ٣٠ يومًا" },
    { id: "this_year", label: "هذا العام" },
  ];

  function openNewTransaction(type: "income" | "expense" = "income") {
    setEditingTransaction(null);
    setEditingCash(false);
    setForm({ transaction_type: type, description: "", category: type === "income" ? "مبيعات" : "تشغيل", amount: 0, transaction_date: todayString() });
    setDialogOpen(true);
  }

  function openEditTransaction(transaction: Transaction) {
    setEditingCash(false);
    setEditingTransaction(transaction);
    setForm({ transaction_type: transaction.transaction_type as "income" | "expense", description: transaction.description, category: transaction.category, amount: transaction.amount, transaction_date: transaction.transaction_date });
    setDialogOpen(true);
  }

  function openCashEditor() {
    setEditingCash(true);
    setEditingTransaction(null);
    setCashInput(String(cashBalance));
    setDialogOpen(true);
  }

  function submitTransaction(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!form.description.trim() || !Number.isFinite(form.amount) || form.amount <= 0) {
      toast.error("أدخل وصفًا واضحًا ومبلغًا أكبر من صفر");
      return;
    }
    transactionMutation.mutate({ ...form, ...(editingTransaction ? { id: editingTransaction.id } : {}) });
  }

  function exportFinanceReport() {
    const bounds = getPeriodBounds(period);
    const rows = [
      ["ملخص مالي", "الجنيه المصري"],
      ["الفترة من", bounds.start],
      ["الفترة إلى", bounds.end],
      ["إجمالي الإيرادات", exactMoney(currentSummary.revenue)],
      ["إجمالي المصروفات", exactMoney(currentSummary.expenses)],
      ["صافي الربح", exactMoney(currentSummary.profit)],
      ["السيولة المتاحة", exactMoney(cashBalance)],
      [],
      ["التاريخ", "النوع", "الوصف", "التصنيف", "المبلغ - ج.م"],
      ...currentPeriodTransactions.map((entry) => [entry.transaction_date, entry.transaction_type === "income" ? "إيراد" : "مصروف", entry.description, entry.category, exactMoney(entry.amount)]),
    ];
    const csv = `\uFEFF${rows.map((row) => row.map((cell) => `"${String(cell ?? "").replaceAll('"', '""')}"`).join(",")).join("\r\n")}`;
    const objectUrl = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
    const link = document.createElement("a");
    link.href = objectUrl;
    link.download = `financial-report-${bounds.start}-${bounds.end}.csv`;
    link.click();
    URL.revokeObjectURL(objectUrl);
    toast.success("تم تجهيز التقرير المالي للتنزيل");
  }

  function navigateToSection(id: string) {
    setMobileOpen(false);
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  const windowProfitChange = changePercent(currentSummary.profit, previousSummary.profit);
  const revenueChange = changePercent(currentSummary.revenue, previousSummary.revenue);
  const expenseChange = changePercent(currentSummary.expenses, previousSummary.expenses);
  const runwayDays = calculateCashRunwayDays(
    cashBalance,
    currentSummary.expenses,
    new Date().getDate(),
  );
  const alerts = buildFinancialAlerts({ ...currentSummary, runwayDays });
  const alertTone = { danger: "text-expense", warning: "text-caution", info: "text-signal", success: "text-income" } as const;
  const maxChartValue = Math.max(1, ...cashflowSeries.map((item) => Math.max(item.revenue, item.expenses)));
  const outflowShare = currentSummary.revenue > 0 ? Math.min(100, (currentSummary.expenses / currentSummary.revenue) * 100) : 0;

  if (!isHydrated) {
    return (
      <div dir="rtl" className="flex min-h-screen items-center justify-center bg-background text-foreground">
        <div className="flex flex-col items-center gap-3 text-center" role="status" aria-live="polite">
          <img src="/favicon.svg" alt="" className="size-12 rounded-xl" />
          <LoaderCircle className="size-5 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">جارٍ تجهيز بيانات المثال لهذا المتصفح...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen overflow-x-clip bg-background text-foreground">
      {mobileOpen && <button aria-label="إغلاق القائمة الجانبية" className="fixed inset-0 z-40 bg-background/70 md:hidden" onClick={() => setMobileOpen(false)} />}
      <aside className={`fixed inset-y-0 right-0 z-50 flex w-[272px] flex-col border-l border-sidebar-border bg-sidebar transition-transform duration-200 md:translate-x-0 ${mobileOpen ? "translate-x-0" : "translate-x-full md:translate-x-0"} ${collapsed ? "md:w-[78px]" : "md:w-[252px]"}`}>
        <div className={`flex h-[79px] items-center border-b border-sidebar-border ${collapsed ? "justify-center px-3" : "gap-3 px-5"}`}>
          <img src="/favicon.svg" alt="" className="size-10 shrink-0 rounded-md" />
          {!collapsed && <div className="min-w-0"><p className="text-[14px] font-bold">مركز المدير المالي</p><p className="mt-0.5 text-[10px] tracking-wide text-muted-foreground">FINANCE COMMAND CENTER</p></div>}
          <Button className="mr-auto size-8 md:hidden" size="icon" variant="ghost" aria-label="إغلاق القائمة" onClick={() => setMobileOpen(false)}><X className="size-4" /></Button>
        </div>
        {!collapsed && <div className="px-5 pt-7 text-[10px] font-medium text-muted-foreground">مساحة العمل</div>}
        <nav className={`flex flex-1 flex-col gap-1.5 pt-3 ${collapsed ? "px-3" : "px-3"}`} aria-label="القائمة الرئيسية">
          {labels.map((item) => {
            const Icon = item.icon;
            return <button key={item.id} title={collapsed ? item.text : undefined} aria-current={activeSection === item.id ? "page" : undefined} onClick={() => navigateToSection(item.id)} className={`flex h-10 w-full items-center gap-3 rounded-md px-3 text-right text-[13px] transition-colors ${activeSection === item.id ? "bg-sidebar-accent text-sidebar-primary" : "text-sidebar-foreground/75 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"}`}><Icon className="size-[17px] shrink-0" />{!collapsed && <span className="truncate">{item.text}</span>}{activeSection === item.id && !collapsed && <span className="mr-auto size-1.5 rounded-full bg-primary" />}</button>;
          })}
          <button title={collapsed ? "إضافة إيراد" : undefined} onClick={() => openNewTransaction("income")} className={`mt-2 flex h-10 w-full items-center gap-3 rounded-md border border-dashed border-sidebar-border px-3 text-right text-[13px] text-muted-foreground transition hover:border-primary/60 hover:text-foreground`}><Plus className="size-[17px] shrink-0" />{!collapsed && <span>إضافة حركة جديدة</span>}</button>
          <button title={collapsed ? "استعادة بيانات العرض" : undefined} onClick={() => setResetOpen(true)} className="flex h-10 w-full items-center gap-3 rounded-md px-3 text-right text-[13px] text-sidebar-foreground/75 transition-colors hover:bg-sidebar-accent"><RotateCcw className="size-[17px] shrink-0" />{!collapsed && <span>استعادة بيانات العرض</span>}</button>
          <button title={collapsed ? "تصدير تقرير" : undefined} onClick={exportFinanceReport} className="flex h-10 w-full items-center gap-3 rounded-md px-3 text-right text-[13px] text-sidebar-foreground/75 transition-colors hover:bg-sidebar-accent"><FileText className="size-[17px] shrink-0" />{!collapsed && <span>تصدير تقرير</span>}</button>
        </nav>
        <div className={`border-t border-sidebar-border py-4 ${collapsed ? "px-3" : "px-4"}`}>
          {!collapsed ? <div className="flex items-center gap-3 rounded-md bg-sidebar-accent/60 p-3"><div className="flex size-9 shrink-0 items-center justify-center rounded-md border border-sidebar-border bg-sidebar"><ShieldAlert className="size-4 text-caution" /></div><div className="min-w-0"><p className="text-[11px] font-semibold">بيانات مثال محلية</p><p className="mt-0.5 text-[10px] leading-4 text-muted-foreground">تُحفظ في هذا المتصفح فقط</p></div></div> : <div title="بيانات مثال محلية" className="flex justify-center"><ShieldAlert className="size-5 text-caution" /></div>}
        </div>
        <Button className="absolute left-[-15px] top-[84px] hidden size-[30px] rounded-full border border-border bg-card shadow-sm md:flex" variant="ghost" size="icon" title={collapsed ? "توسيع القائمة" : "طي القائمة"} aria-label={collapsed ? "توسيع القائمة" : "طي القائمة"} onClick={() => setCollapsed(!collapsed)}><ChevronRight className={`size-4 transition-transform ${collapsed ? "rotate-180" : ""}`} /></Button>
      </aside>

      <div className={`min-w-0 flex-1 transition-[margin] duration-200 md:mr-[252px] ${collapsed ? "md:mr-[78px]" : ""}`}>
        <header className="sticky top-0 z-30 flex h-[68px] items-center justify-between gap-3 border-b border-border bg-background/95 px-4 backdrop-blur md:px-7 xl:px-9">
          <div className="flex min-w-0 items-center gap-3"><Button className="size-9 shrink-0 md:hidden" variant="ghost" size="icon" aria-label="فتح القائمة" onClick={() => setMobileOpen(true)}><Menu className="size-[19px]" /></Button><div className="min-w-0"><p className="truncate text-[14px] font-semibold">الحسابات المالية</p><p className="mt-0.5 truncate text-[10px] text-muted-foreground">الرئيسية <span className="mx-1.5">/</span> لوحة المؤشرات</p></div><Link to="/" className="hidden rounded border border-border px-2.5 py-1.5 text-[10px] text-muted-foreground transition hover:border-primary/40 hover:text-foreground sm:inline-flex">عن المشروع</Link></div>
          <div className="flex shrink-0 items-center gap-2 sm:gap-3"><div className="hidden items-center gap-2 rounded-md border border-border bg-card px-3 py-2 sm:flex"><CalendarDays className="size-3.5 text-primary" /><span className="text-[11px] text-muted-foreground">{new Intl.DateTimeFormat("ar-EG", { day: "numeric", month: "long", year: "numeric", timeZone: "Africa/Cairo" }).format(new Date())}</span></div><Popover><PopoverTrigger asChild><Button className="relative size-9" size="icon" variant="outline" aria-label="التنبيهات المالية"><Bell className="size-[17px]" />{alerts[0]?.level !== "success" && <span className="absolute right-2 top-2 size-1.5 rounded-full bg-caution" />}</Button></PopoverTrigger><PopoverContent dir="rtl" align="end" className="w-[300px] border-border bg-popover p-0"><div className="border-b border-border px-4 py-3"><p className="text-[12px] font-semibold">التنبيهات المالية</p><p className="mt-0.5 text-[10px] text-muted-foreground">تحليل تلقائي · {formatPeriod(period)}</p></div><ul className="divide-y divide-border">{alerts.map((alert) => <li key={alert.title} className="px-4 py-3"><p className={`text-[11px] font-semibold ${alertTone[alert.level]}`}>{alert.title}</p><p className="mt-1 text-[10px] leading-5 text-muted-foreground">{alert.text}</p></li>)}</ul></PopoverContent></Popover><div className="hidden size-8 items-center justify-center rounded-full border border-primary/35 bg-primary/10 text-[11px] font-semibold text-primary sm:flex">م</div></div>
        </header>

        <main className="mx-auto max-w-[1600px] px-4 py-5 sm:px-6 sm:py-7 xl:px-9">
          <div className="mb-5 flex items-start justify-between gap-4">
            <div><h1 className="text-xl font-bold sm:text-[26px]">المؤشرات المالية</h1><p className="mt-1.5 max-w-2xl text-[12px] leading-6 text-muted-foreground">نظرة دقيقة على إيراداتك ومصروفاتك وصافي الأرباح والتدفقات النقدية.</p></div>
            <Button className="mt-1 h-9 shrink-0 gap-1.5 px-3 text-[11px]" onClick={() => openNewTransaction("income")}><Plus className="size-4" /><span className="hidden sm:inline">حركة جديدة</span><span className="sm:hidden">إضافة</span></Button>
          </div>

          <div className="mb-5 flex flex-col gap-2 rounded-md border border-caution/25 bg-caution/5 px-3.5 py-2.5 sm:flex-row sm:items-center sm:justify-between">
            <p className="flex items-center gap-2 text-[10px] leading-5 text-muted-foreground sm:text-[11px]"><ShieldAlert className="size-4 shrink-0 text-caution" /><span><span className="font-semibold text-caution">بيانات العرض محفوظة في هذا المتصفح فقط.</span> لا تستخدم معلومات مالية حقيقية أو سرية.</span></p>
            <span className="shrink-0 text-[10px] text-muted-foreground">يُعرض المبلغ بالجنيه المصري · ج.م</span>
          </div>

          <section id="overview" className="scroll-mt-24">
            <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2"><span className="text-[13px] font-semibold">ملخص الأداء المالي</span><span className="text-[10px] text-muted-foreground">· {formatPeriod(period)}</span></div>
              <div className="flex items-center gap-0.5 rounded-md border border-border bg-card p-1" aria-label="الفترة المالية">
                {periods.map((item) => <button key={item.id} type="button" aria-pressed={period === item.id} className={`h-7 rounded px-2.5 text-[10px] transition-colors sm:px-3 ${period === item.id ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`} onClick={() => setPeriod(item.id)}>{item.label}</button>)}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3 xl:grid-cols-4 xl:gap-4">
              <MetricCard label="إجمالي الإيرادات" value={currentSummary.revenue} unit="ج.م" icon={<ArrowDownLeft className="size-[17px]" />} color="text-income" change={revenueChange} helper="مقارنة بالفترة السابقة" data-testid="kpi-revenue" />
              <MetricCard label="إجمالي المصروفات" value={currentSummary.expenses} unit="ج.م" icon={<ArrowUpRight className="size-[17px]" />} color="text-expense" change={expenseChange} helper="مقارنة بالفترة السابقة" data-testid="kpi-expenses" expense />
              <MetricCard label="صافي الربح" value={currentSummary.profit} unit="ج.م" icon={<TrendingUp className="size-[17px]" />} color="text-primary" change={windowProfitChange} helper={`هامش صافي الربح ${currentSummary.profitMargin.toFixed(1)}٪`} data-testid="kpi-profit" profit />
              <MetricCard label="السيولة المتاحة" value={cashBalance} unit="ج.م" icon={<Wallet className="size-[17px]" />} color="text-signal" helper={runwayDays === null ? "أضف مصروفات لحساب مدة التغطية" : `تغطية المصروفات لنحو ${Math.floor(runwayDays)} يومًا`} data-testid="kpi-cash" action={<button type="button" className="flex size-8 items-center justify-center rounded-md text-muted-foreground transition hover:bg-accent hover:text-foreground" aria-label="تعديل السيولة المتاحة" title="تعديل السيولة المتاحة" onClick={openCashEditor}><Pencil className="size-3.5" /></button>} />
            </div>
          </section>

          <section id="cashflow" className="mt-5 scroll-mt-24">
            <SectionHeading title="الإيرادات والمصروفات" eyebrow="تحليل التدفقات النقدية" trailing={<span className="flex items-center gap-3 text-[10px]"><span className="flex items-center gap-1.5 text-income"><i className="size-2 rounded-full bg-income" />الإيرادات</span><span className="flex items-center gap-1.5 text-expense"><i className="size-2 rounded-full bg-expense" />المصروفات</span></span>} />
            <div className="grid gap-4 xl:grid-cols-[minmax(0,1.8fr)_minmax(250px,0.8fr)]">
              <section className="rounded-md border border-border bg-card p-4 sm:p-5">
                <div className="mb-4 flex items-center justify-between"><div><h2 className="text-[12px] font-semibold">حركة النقد حسب الفترة</h2><p className="mt-1 text-[10px] text-muted-foreground">توزيع الإيرادات والمصروفات الفعلية · ج.م</p></div><span className="rounded border border-border bg-background px-2 py-1 text-[9px] text-muted-foreground">{period === "this_year" ? "شهري" : "حسب الأسبوع"}</span></div>
                <CashflowChart rows={cashflowSeries} maxValue={maxChartValue} />
                <div className="mt-2 flex justify-between border-t border-border pt-3 text-[9px] text-muted-foreground"><span>الإيرادات المسجلة <strong className="mr-1 font-mono font-medium text-income">{money(currentSummary.revenue)}</strong></span><span>المصروفات المسجلة <strong className="mr-1 font-mono font-medium text-expense">{money(currentSummary.expenses)}</strong></span></div>
              </section>
              <section className="rounded-md border border-border bg-card p-4 sm:p-5">
                <div className="flex items-start justify-between gap-2"><div><h2 className="text-[12px] font-semibold">موقف السيولة</h2><p className="mt-1 text-[10px] text-muted-foreground">التوازن النقدي خلال الفترة</p></div><span className="flex size-8 items-center justify-center rounded-md bg-signal/10 text-signal"><Wallet className="size-[17px]" /></span></div>
                <div className="mt-5 flex items-baseline gap-2"><span className="font-mono text-[27px] font-medium leading-none" dir="ltr">{money(cashBalance)}</span><span className="text-[10px] text-muted-foreground">ج.م</span></div>
                <p className="mt-2 flex items-center gap-1 text-[10px] text-muted-foreground">الرصيد النقدي الحالي <span className="mr-auto text-[9px] text-primary">قابل للتعديل</span></p>
                <div className="mt-5 border-t border-border pt-4"><div className="mb-2 flex items-center justify-between"><span className="text-[10px] text-muted-foreground">المصروفات من الإيرادات</span><span className="font-mono text-[10px] text-foreground">{outflowShare.toFixed(1)}٪</span></div><div className="h-1.5 overflow-hidden rounded-full bg-muted"><div className="h-full rounded-full bg-expense transition-[width]" style={{ width: `${outflowShare}%` }} /></div><p className="mt-2.5 flex items-center gap-1.5 text-[9px] text-muted-foreground"><TrendingDown className="size-3.5 text-primary" />{currentSummary.revenue > 0 ? "السيولة وصافي التدفقات بناءً على الحركات المسجلة" : "أضف حركات مالية لمتابعة التدفقات النقدية"}</p></div>
              </section>
            </div>
          </section>

          <section id="profit-loss" className="mt-5 scroll-mt-24">
            <SectionHeading title="قائمة الأرباح والخسائر" eyebrow="التقرير المالي" trailing={<span className="text-[10px] text-muted-foreground">{formatPeriod(period)}</span>} />
            <div className="grid gap-4 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)]">
              <div className="rounded-md border border-border bg-card p-4 sm:p-5">
                <div className="mb-4 flex items-center justify-between border-b border-border pb-3"><div><h2 className="text-[12px] font-semibold">ملخص الدخل والمصروفات</h2><p className="mt-1 text-[10px] text-muted-foreground">التدفقات المسجلة فعليًا للفترة</p></div><span className="flex size-8 items-center justify-center rounded-md bg-primary/10 text-primary"><FileText className="size-4" /></span></div>
                <div className="space-y-3"><PnlRow title="الإيرادات" value={currentSummary.revenue} tone="text-income"/><PnlRow title="المصروفات التشغيلية" value={currentSummary.expenses} tone="text-expense"/><div className="my-1 border-t border-dashed border-border"/><PnlRow title="صافي الربح" value={currentSummary.profit} tone={currentSummary.profit >= 0 ? "text-primary" : "text-expense"} bold/><div className="flex items-center justify-between rounded-md border border-primary/15 bg-primary/5 px-3 py-2.5"><span className="text-[10px] text-muted-foreground">هامش صافي الربح</span><span className="font-mono text-[12px] font-semibold text-primary">{currentSummary.profitMargin.toFixed(1)}٪</span></div></div>
              </div>
              <div className="rounded-md border border-border bg-card p-4 sm:p-5">
                <div className="mb-4 flex items-center justify-between"><div><h2 className="text-[12px] font-semibold">المصروفات حسب التصنيف</h2><p className="mt-1 text-[10px] text-muted-foreground">أعلى بنود الإنفاق الفعلية</p></div><span className="flex size-8 items-center justify-center rounded-md bg-metric-icon text-foreground"><BarChart3 className="size-4" /></span></div>
                {reportRows.length > 0 ? <div className="space-y-4">{reportRows.slice(0, 5).map((item) => <div key={item.category}><div className="mb-1.5 flex items-center justify-between gap-3"><span className="truncate text-[10px] text-muted-foreground">{item.category}</span><span className="shrink-0 font-mono text-[10px]">{money(item.amount)} <span className="font-sans text-muted-foreground">ج.م</span></span></div><div className="h-1 overflow-hidden rounded-full bg-muted"><div className="h-full rounded-full bg-signal transition-[width]" style={{ width: `${Math.max(2, item.amount / Math.max(1, reportRows[0]?.amount ?? 1) * 100)}%` }} /></div></div>)}</div> : <EmptyState title="لا توجد مصروفات مسجلة" text="أضف حركات مصروفات حتى يظهر توزيع الإنفاق." />}
                {reportRows.length > 5 && <p className="mt-3 text-left text-[9px] text-muted-foreground">إجمالي التصنيفات: {reportRows.length}</p>}
              </div>
            </div>
          </section>

          <section id="transactions" className="mt-5 scroll-mt-24">
            <SectionHeading title="أحدث الحركات المالية" eyebrow="سجل العمليات" trailing={<div className="flex items-center gap-2"><div className="flex items-center gap-0.5 rounded-md border border-border bg-card p-0.5" aria-label="نوع الحركة">{([["all", "الكل"], ["income", "إيرادات"], ["expense", "مصروفات"]] as const).map(([id, text]) => <button key={id} type="button" aria-pressed={typeFilter === id} onClick={() => setTypeFilter(id)} className={`h-7 rounded px-2 text-[10px] transition-colors ${typeFilter === id ? "bg-accent text-foreground" : "text-muted-foreground hover:text-foreground"}`}>{text}</button>)}</div><div className="relative"><Search className="pointer-events-none absolute right-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" /><Input aria-label="البحث في الحركات المالية" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="بحث في الحركات..." className="h-8 w-[140px] pr-8 text-[10px] sm:w-[170px]" /></div><Button className="h-8 gap-1 px-2.5 text-[10px]" size="sm" variant="outline" onClick={() => openNewTransaction()}><Plus className="size-3.5"/>إضافة حركة</Button></div>} />
            <div className="overflow-hidden rounded-md border border-border bg-card">
              <Table><TableHeader><TableRow className="border-border hover:bg-transparent"><TableHead className="h-10 text-right text-[10px]">الوصف</TableHead><TableHead className="hidden h-10 text-right text-[10px] sm:table-cell">التصنيف</TableHead><TableHead className="hidden h-10 text-right text-[10px] md:table-cell">التاريخ</TableHead><TableHead className="h-10 text-left text-[10px]">المبلغ · ج.م</TableHead><TableHead className="h-10 w-[74px] text-center text-[10px]">إجراء</TableHead></TableRow></TableHeader><TableBody>
                {visibleTransactions.map((entry) => <TableRow key={entry.id} className="border-border/70 hover:bg-accent/40"><TableCell className="max-w-[180px] py-3"><div className="flex items-center gap-2.5"><span className={`flex size-8 shrink-0 items-center justify-center rounded-md ${entry.transaction_type === "income" ? "bg-income/10 text-income" : "bg-expense/10 text-expense"}`}>{entry.transaction_type === "income" ? <ArrowDownLeft className="size-4"/> : <ArrowUpLeft className="size-4"/>}</span><div className="min-w-0"><p className="truncate text-[10px] font-medium sm:text-[11px]">{entry.description}</p><p className="mt-0.5 text-[9px] text-muted-foreground md:hidden">{displayDate(entry.transaction_date)}</p></div></div></TableCell><TableCell className="hidden py-3 text-[10px] text-muted-foreground sm:table-cell">{entry.category}</TableCell><TableCell className="hidden py-3 text-[10px] text-muted-foreground md:table-cell">{displayDate(entry.transaction_date)}</TableCell><TableCell className={`whitespace-nowrap py-3 text-left font-mono text-[10px] font-medium sm:text-[11px] ${entry.transaction_type === "income" ? "text-income" : "text-expense"}`} dir="ltr">{entry.transaction_type === "income" ? "+" : "−"}{money(entry.amount)}</TableCell><TableCell className="py-3"><div className="flex items-center justify-center gap-0.5"><button className="flex size-7 items-center justify-center rounded text-muted-foreground transition hover:bg-accent hover:text-foreground" title={`تعديل ${entry.description}`} aria-label={`تعديل ${entry.description}`} onClick={() => openEditTransaction(entry)}><Pencil className="size-3.5"/></button><button className="flex size-7 items-center justify-center rounded text-muted-foreground transition hover:bg-expense/10 hover:text-expense" title={`حذف ${entry.description}`} aria-label={`حذف ${entry.description}`} onClick={() => setDeleteTarget(entry)}><Trash2 className="size-3.5"/></button></div></TableCell></TableRow>)}
                {visibleTransactions.length === 0 && <TableRow><TableCell colSpan={5} className="py-9"><EmptyState title="لا توجد حركات في هذه الفترة" text={search ? "غيّر عبارة البحث أو أضف حركة مالية جديدة." : "أضف إيرادًا أو مصروفًا لبدء عرض الحركة النقدية."} /></TableCell></TableRow>}
              </TableBody></Table>
              <div className="flex items-center justify-between border-t border-border px-4 py-2.5"><span className="text-[9px] text-muted-foreground">عرض {visibleTransactions.length} من {filteredTransactions.length} حركة</span><div className="flex items-center gap-1"><Button size="icon" variant="ghost" className="size-7" aria-label="الصفحة السابقة" disabled={currentPage <= 1} onClick={() => setPage(currentPage - 1)}><ChevronRight className="size-3.5"/></Button><span className="flex h-7 min-w-7 items-center justify-center rounded bg-accent px-2 text-[9px] text-foreground">{currentPage.toLocaleString("ar-EG")} / {pageCount.toLocaleString("ar-EG")}</span><Button size="icon" variant="ghost" className="size-7" aria-label="الصفحة التالية" disabled={currentPage >= pageCount} onClick={() => setPage(currentPage + 1)}><ChevronLeft className="size-3.5"/></Button></div></div>
            </div>
          </section>

          <section id="reports" className="mt-5 scroll-mt-24">
            <SectionHeading title="التقارير المالية" eyebrow="تقارير قابلة للتصدير" trailing={<span className="text-[10px] text-muted-foreground">{formatPeriod(period)}</span>} />
            <div className="grid gap-3 md:grid-cols-2">
              <ReportCard icon={<FileBarChart className="size-4"/>} title="قائمة الأرباح والخسائر" detail={`الإيرادات ${money(currentSummary.revenue)} · صافي الربح ${money(currentSummary.profit)} ج.م`} onDownload={exportFinanceReport}/>
              <ReportCard icon={<Activity className="size-4"/>} title="التدفقات النقدية والحركات" detail={`${currentPeriodTransactions.length} حركة مالية · رصيد متاح ${money(cashBalance)} ج.م`} onDownload={exportFinanceReport}/>
            </div>
            <div className="mt-3 flex flex-col gap-3 rounded-md border border-border bg-card px-4 py-3 sm:flex-row sm:items-center sm:justify-between"><div className="flex items-center gap-2.5"><div className="flex size-8 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary"><CloudDownload className="size-4"/></div><div><p className="text-[11px] font-medium">تنزيل التقرير المالي للفترة المحددة</p><p className="mt-0.5 text-[9px] text-muted-foreground">ملخص الأرباح والحركات بصيغة CSV · يتضمن الأرقام والتواريخ المحددة</p></div></div><Button className="h-8 shrink-0 gap-1.5 text-[10px]" variant="outline" onClick={exportFinanceReport}><CloudDownload className="size-3.5"/>تنزيل التقرير</Button></div>
          </section>

          <footer className="mt-6 flex flex-col items-center justify-between gap-2 border-t border-border py-4 text-center text-[9px] text-muted-foreground sm:flex-row sm:text-right"><span>مركز المدير المالي · لوحة متابعة وإدارة مالية</span><span>الأرقام افتراضية، والتعديلات محلية على هذا الجهاز · © {new Date().getFullYear()}</span></footer>
        </main>
      </div>

      <Dialog open={dialogOpen} onOpenChange={(open) => { setDialogOpen(open); if (!open) { setEditingCash(false); setEditingTransaction(null); } }}>
        <DialogContent dir="rtl" className="max-w-[440px] border-border bg-card text-foreground sm:rounded-md">
          {editingCash ? <form onSubmit={(event) => { event.preventDefault(); const amount = Number(cashInput); if (!Number.isFinite(amount) || amount < 0) { toast.error("أدخل رصيدًا صحيحًا غير سالب"); return; } cashMutation.mutate(amount); }}><DialogHeader className="text-right"><DialogTitle>تحديث السيولة المتاحة</DialogTitle><DialogDescription>أدخل رصيد النقد المتاح بالجنيه المصري. هذا الرصيد يُسجّل يدويًا.</DialogDescription></DialogHeader><div className="mt-5 space-y-2"><Label htmlFor="cash-balance">الرصيد النقدي · ج.م</Label><Input id="cash-balance" aria-label="الرصيد النقدي المتاح بالجنيه المصري" type="number" inputMode="decimal" min="0" step="0.01" value={cashInput} onChange={(event) => setCashInput(event.target.value)} required className="font-mono"/></div><DialogFooter className="mt-5"><Button type="submit" disabled={cashMutation.isPending} className="w-full sm:w-auto">{cashMutation.isPending ? "جارٍ الحفظ..." : "حفظ الرصيد"}</Button></DialogFooter></form> : <form onSubmit={submitTransaction}><DialogHeader className="text-right"><DialogTitle>{editingTransaction ? "تعديل الحركة المالية" : "إضافة حركة مالية"}</DialogTitle><DialogDescription>أدخل تفاصيل الحركة، وستُضاف إلى المؤشرات والتقارير فور حفظها.</DialogDescription></DialogHeader><div className="mt-5 grid gap-4"><div className="grid grid-cols-2 gap-3"><div className="space-y-2"><Label htmlFor="transaction-type">نوع الحركة</Label><Select value={form.transaction_type} onValueChange={(value: "income" | "expense") => setForm((current) => ({ ...current, transaction_type: value, category: value === "income" ? "مبيعات" : "تشغيل" }))}><SelectTrigger id="transaction-type"><SelectValue/></SelectTrigger><SelectContent><SelectItem value="income">إيراد</SelectItem><SelectItem value="expense">مصروف</SelectItem></SelectContent></Select></div><div className="space-y-2"><Label htmlFor="transaction-category">التصنيف</Label><Select value={form.category} onValueChange={(value) => setForm((current) => ({ ...current, category: value }))}><SelectTrigger id="transaction-category"><SelectValue/></SelectTrigger><SelectContent>{categories.map((item) => <SelectItem key={item} value={item}>{item}</SelectItem>)}</SelectContent></Select></div></div><div className="space-y-2"><Label htmlFor="transaction-description">الوصف</Label><Input id="transaction-description" aria-label="وصف الحركة المالية" maxLength={180} value={form.description} onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))} placeholder="مثال: تحصيل فاتورة عميل" required/></div><div className="grid grid-cols-2 gap-3"><div className="space-y-2"><Label htmlFor="transaction-amount">المبلغ · ج.م</Label><Input id="transaction-amount" aria-label="مبلغ الحركة بالجنيه المصري" type="number" inputMode="decimal" min="0.01" max="999999999999.99" step="0.01" value={form.amount || ""} onChange={(event) => setForm((current) => ({ ...current, amount: Number(event.target.value) }))} placeholder="0.00" required/></div><div className="space-y-2"><Label htmlFor="transaction-date">التاريخ</Label><Input id="transaction-date" aria-label="تاريخ الحركة المالية" type="date" value={form.transaction_date} onChange={(event) => setForm((current) => ({ ...current, transaction_date: event.target.value }))} required/></div></div></div><DialogFooter className="mt-5"><Button type="submit" disabled={transactionMutation.isPending} className="w-full sm:w-auto">{transactionMutation.isPending ? "جارٍ الحفظ..." : editingTransaction ? "حفظ التعديلات" : "حفظ الحركة"}</Button></DialogFooter></form>}
        </DialogContent>
      </Dialog>

      <AlertDialog open={resetOpen} onOpenChange={setResetOpen}>
        <AlertDialogContent dir="rtl" className="border-border bg-card text-foreground sm:rounded-md"><AlertDialogHeader className="text-right"><AlertDialogTitle>استعادة بيانات المثال لهذا المتصفح؟</AlertDialogTitle><AlertDialogDescription>سيتم استبدال التعديلات المحفوظة في هذا المتصفح ببيانات المثال وإعادة السيولة إلى ٢٤٠٬٠٠٠ ج.م. لن تتأثر بيانات أي زائر آخر.</AlertDialogDescription></AlertDialogHeader><AlertDialogFooter><AlertDialogCancel>إلغاء</AlertDialogCancel><AlertDialogAction disabled={resetMutation.isPending} onClick={(event) => { event.preventDefault(); resetMutation.mutate(); }}>{resetMutation.isPending ? "جارٍ الاستعادة..." : "استعادة البيانات"}</AlertDialogAction></AlertDialogFooter></AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={deleteTarget !== null} onOpenChange={(open) => { if (!open) setDeleteTarget(null); }}>
        <AlertDialogContent dir="rtl" className="border-border bg-card text-foreground sm:rounded-md"><AlertDialogHeader className="text-right"><AlertDialogTitle>حذف الحركة المالية؟</AlertDialogTitle><AlertDialogDescription>سيتم حذف «{deleteTarget?.description}» من بيانات المثال المحفوظة في هذا المتصفح فقط.</AlertDialogDescription></AlertDialogHeader><AlertDialogFooter><AlertDialogCancel>إلغاء</AlertDialogCancel><AlertDialogAction disabled={deleteMutation.isPending} className="bg-expense text-expense-foreground hover:bg-expense/90" onClick={() => { if (deleteTarget) deleteMutation.mutate(deleteTarget.id); }}>{deleteMutation.isPending ? "جارٍ الحذف..." : "تأكيد الحذف"}</AlertDialogAction></AlertDialogFooter></AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function changePercent(current: number, previous: number) {
  if (previous === 0) return current === 0 ? 0 : null;
  return ((current - previous) / Math.abs(previous)) * 100;
}

function formatPeriod(period: FinancePeriod) {
  if (period === "this_year") return "السنة الحالية";
  if (period === "last_30_days") return "آخر ٣٠ يومًا";
  return new Intl.DateTimeFormat("ar-EG", { month: "long", year: "numeric" }).format(new Date());
}

function MetricCard({ label, value, unit, icon, color, change, helper, action, expense = false, profit = false, "data-testid": testId }: {
  label: string; value: number; unit: string; icon: ReactNode; color: string; change?: number | null; helper: string; action?: ReactNode; expense?: boolean; profit?: boolean; "data-testid"?: string;
}) {
  const positive = change !== null && change !== undefined && (expense ? change <= 0 : change >= 0);
  return <article data-testid={testId} className="rounded-md border border-border bg-card p-3.5 transition-colors hover:border-border/80 sm:p-4"><div className="flex items-start justify-between gap-2"><div className="flex min-w-0 items-center gap-2.5"><span className={`flex size-9 shrink-0 items-center justify-center rounded-md bg-metric-icon ${color}`}>{icon}</span><span className="truncate text-[10px] font-medium text-muted-foreground sm:text-[11px]">{label}</span></div>{action ?? <span className="mt-0.5 text-muted-foreground/60"><MoreHorizontal className="size-4"/></span>}</div><div className="mt-4 flex flex-wrap items-baseline gap-x-1.5 gap-y-1" dir="ltr"><span className="font-mono text-[25px] font-medium leading-none tracking-normal sm:text-[28px]">{money(value)}</span><span className="text-[9px] text-muted-foreground">{unit}</span></div><div className="mt-3 flex flex-wrap items-center gap-1.5 border-t border-border/75 pt-2.5">{change !== undefined && <span className={`flex items-center gap-0.5 font-mono text-[9px] ${positive ? "text-income" : change === null ? "text-muted-foreground" : "text-expense"}`}>{change === null ? <span>—</span> : <>{positive ? <TrendingUp className="size-3"/> : <TrendingDown className="size-3"/>}{change > 0 ? "+" : ""}{change.toFixed(1)}٪</>}</span>}<span className="truncate text-[9px] text-muted-foreground">{change !== undefined ? helper : helper}</span></div>{profit && <span className="sr-only">قيمة الأرباح خلال الفترة المحددة</span>}</article>;
}

function SectionHeading({ title, eyebrow, trailing }: { title: string; eyebrow: string; trailing?: ReactNode }) {
  return <div className="mb-3 flex flex-wrap items-end justify-between gap-2"><div><p className="mb-1 text-[9px] font-medium text-primary">{eyebrow}</p><h2 className="text-[13px] font-semibold">{title}</h2></div>{trailing}</div>;
}

function PnlRow({ title, value, tone, bold = false }: { title: string; value: number; tone: string; bold?: boolean }) {
  return <div className={`flex items-center justify-between gap-3 ${bold ? "py-1" : "py-0.5"}`}><span className={`text-[11px] ${bold ? "font-semibold text-foreground" : "text-muted-foreground"}`}>{title}</span><span className={`font-mono text-[12px] ${bold ? "font-semibold" : "font-medium"} ${tone}`} dir="ltr">{money(value)} <span className="font-sans text-[9px] font-normal">ج.م</span></span></div>;
}

function EmptyState({ title, text }: { title: string; text: string }) {
  return <div className="py-2 text-center"><p className="text-[11px] font-medium">{title}</p><p className="mt-1 text-[10px] text-muted-foreground">{text}</p></div>;
}

function ReportCard({ icon, title, detail, onDownload }: { icon: ReactNode; title: string; detail: string; onDownload: () => void }) {
  return <div className="flex min-w-0 items-center gap-3 rounded-md border border-border bg-card p-3.5"><span className="flex size-9 shrink-0 items-center justify-center rounded-md bg-signal/10 text-signal">{icon}</span><div className="min-w-0 flex-1"><p className="truncate text-[11px] font-medium">{title}</p><p className="mt-1 truncate text-[9px] text-muted-foreground">{detail}</p></div><Button className="size-8 shrink-0" size="icon" variant="ghost" aria-label={`تنزيل تقرير ${title}`} title="تنزيل التقرير المالي" onClick={onDownload}><CloudDownload className="size-4"/></Button></div>;
}

function CashflowChart({ rows, maxValue }: { rows: ReturnType<typeof buildCashflowSeries>; maxValue: number }) {
  const width = 680;
  const height = 190;
  const pad = { top: 12, right: 14, bottom: 25, left: 46 };
  const chartWidth = width - pad.left - pad.right;
  const chartHeight = height - pad.top - pad.bottom;
  const x = (index: number) => pad.left + (rows.length === 1 ? chartWidth / 2 : (index / (rows.length - 1)) * chartWidth);
  const y = (value: number) => pad.top + chartHeight - (value / maxValue) * chartHeight;
  const linePath = (key: "revenue" | "expenses") => rows.map((row, index) => `${index === 0 ? "M" : "L"}${x(index)},${y(row[key])}`).join(" ");
  const revenueArea = `${linePath("revenue")} L${x(rows.length - 1)},${pad.top + chartHeight} L${x(0)},${pad.top + chartHeight} Z`;
  const ticks = [0, 0.5, 1];
  return <div className="relative w-full" role="img" aria-label="رسم بياني يقارن إيرادات الفترة بمصروفاتها"><svg className="h-auto w-full overflow-visible" viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none" aria-hidden="true"><defs><linearGradient id="revenue-fill" x1="0" x2="0" y1="0" y2="1"><stop offset="0%" stopColor="var(--color-income)" stopOpacity="0.22"/><stop offset="100%" stopColor="var(--color-income)" stopOpacity="0.01"/></linearGradient></defs>{ticks.map((tick) => { const amount = maxValue * tick; const yy = y(amount); return <g key={tick}><line x1={pad.left} x2={width - pad.right} y1={yy} y2={yy} stroke="var(--color-border)" strokeDasharray="3 4" strokeOpacity="0.8"/><text x={pad.left - 8} y={yy + 3} textAnchor="end" className="fill-muted-foreground" style={{ fontSize: "9px", fontFamily: "var(--font-mono)" }}>{tick === 0 ? "0" : money(amount / 1000) + "k"}</text></g>; })}<path d={revenueArea} fill="url(#revenue-fill)"/><path d={linePath("revenue")} fill="none" stroke="var(--color-income)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/><path d={linePath("expenses")} fill="none" stroke="var(--color-expense)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" strokeDasharray="5 4"/>{rows.map((row, index) => <g key={row.key}><circle cx={x(index)} cy={y(row.revenue)} r="3" fill="var(--color-income)" stroke="var(--color-card)" strokeWidth="2"/><circle cx={x(index)} cy={y(row.expenses)} r="2.5" fill="var(--color-expense)" stroke="var(--color-card)" strokeWidth="1.5"/><text x={x(index)} y={height - 5} textAnchor="middle" className="fill-muted-foreground" style={{ fontSize: "9px", fontFamily: "var(--font-sans)" }}>{row.label}</text></g>)}</svg></div>;
}