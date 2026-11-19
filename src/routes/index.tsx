import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowLeft,
  ArrowUpLeft,
  BarChart3,
  Check,
  Download,
  Layers3,
  ShieldCheck,
  Sparkles,
  Wallet,
} from "lucide-react";

const highlights = [
  { value: "04", label: "مؤشرات مالية رئيسية" },
  { value: "03", label: "فترات زمنية للتحليل" },
  { value: "CSV", label: "تقارير قابلة للتصدير" },
];

const features = [
  {
    icon: BarChart3,
    title: "صورة مالية أوضح",
    description: "الإيرادات والمصروفات وصافي الربح والسيولة في لوحة واحدة، مع مقارنة الفترات.",
  },
  {
    icon: Wallet,
    title: "متابعة التدفقات",
    description: "رسم مبسط لحركة النقد، ومؤشرات تساعد على قراءة اتجاه السيولة ومصادر الإنفاق.",
  },
  {
    icon: Download,
    title: "تقارير جاهزة للمشاركة",
    description: "تصفّح الحركات حسب النوع والفترة، ثم صدّر ملخصًا ماليًا بصيغة CSV.",
  },
];

const stack = ["React", "TypeScript", "TanStack Start", "Tailwind CSS", "Vitest"];
const siteOrigin = import.meta.env["VITE_SITE_URL"]?.replace(/\/+$/, "") ?? "";
const portfolioImage = siteOrigin ? `${siteOrigin}/portfolio-cover.png` : "/portfolio-cover.png";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "مركز المدير المالي | مشروع لوحة مالية عربية" },
      {
        name: "description",
        content:
          "مشروع واجهة مالية عربية لمتابعة الإيرادات والمصروفات والسيولة، مع تقارير قابلة للتصدير وتجربة تفاعلية ببيانات افتراضية.",
      },
      { property: "og:title", content: "مركز المدير المالي" },
      {
        property: "og:description",
        content: "لوحة مالية عربية لمتابعة التدفقات النقدية والأرباح والتقارير.",
      },
      { property: "og:image", content: portfolioImage },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:image", content: portfolioImage },
    ],
  }),
  component: PortfolioHome,
});

function PortfolioHome() {
  return (
    <div dir="rtl" className="min-h-screen overflow-hidden bg-[#071220] text-[#e7f1f7]">
      <header className="sticky top-0 z-30 border-b border-white/10 bg-[#071220]/90 backdrop-blur-xl">
        <div className="mx-auto flex h-[72px] max-w-7xl items-center justify-between gap-5 px-5 sm:px-8">
          <a
            href="#"
            className="flex items-center gap-3"
            aria-label="مركز المدير المالي، الصفحة الرئيسية"
          >
            <img src="/favicon.svg" alt="" className="size-10 rounded-xl" />
            <span>
              <span className="block text-sm font-bold">مركز المدير المالي</span>
              <span className="mt-0.5 block text-[9px] tracking-[0.16em] text-slate-400" dir="ltr">
                FINANCE COMMAND CENTER
              </span>
            </span>
          </a>
          <nav
            className="hidden items-center gap-7 text-xs text-slate-300 md:flex"
            aria-label="روابط الصفحة"
          >
            <a className="transition hover:text-white" href="#project">
              عن المشروع
            </a>
            <a className="transition hover:text-white" href="#features">
              المزايا
            </a>
            <a className="transition hover:text-white" href="#technology">
              التقنيات
            </a>
          </nav>
          <Link
            to="/dashboard"
            className="inline-flex h-10 items-center gap-2 whitespace-nowrap rounded-xl bg-[#08c9ad] px-4 text-xs font-bold text-[#071b25] transition hover:bg-[#47ddc5] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#08c9ad]"
          >
            جرّب اللوحة <ArrowLeft className="size-4" />
          </Link>
        </div>
      </header>

      <main>
        <section className="relative isolate">
          <div className="pointer-events-none absolute -right-36 top-8 -z-10 size-[520px] rounded-full bg-[#08c9ad]/10 blur-[120px]" />
          <div className="mx-auto grid max-w-7xl items-center gap-12 px-5 pb-16 pt-14 sm:px-8 sm:pb-24 sm:pt-20 lg:grid-cols-[0.92fr_1.08fr] lg:gap-16 lg:pt-24">
            <div className="max-w-2xl">
              <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-[#08c9ad]/25 bg-[#08c9ad]/[0.07] px-3 py-1.5 text-[10px] font-medium text-[#66e5d2]">
                <Sparkles className="size-3.5" />
                مشروع لوحة إدارة مالية باللغة العربية
              </div>
              <h1 className="max-w-xl text-4xl font-bold leading-[1.35] tracking-tight sm:text-5xl lg:text-[58px]">
                وضوح مالي.
                <span className="block text-[#08c9ad]">قرارات أسرع.</span>
              </h1>
              <p className="mt-6 max-w-xl text-sm leading-8 text-slate-300 sm:text-base">
                تجربة CFO عربية تجمع حركة النقد، قراءة الأداء، وإدارة الحركات المالية في مساحة واحدة
                — من اليمين إلى اليسار، وبالجنيه المصري.
              </p>
              <div className="mt-8 flex flex-wrap items-center gap-3">
                <Link
                  to="/dashboard"
                  className="inline-flex h-12 items-center gap-2 rounded-xl bg-[#08c9ad] px-5 text-sm font-bold text-[#071b25] shadow-[0_12px_35px_-16px_rgba(8,201,173,0.8)] transition hover:-translate-y-0.5 hover:bg-[#47ddc5]"
                >
                  استكشف لوحة التحكم <ArrowUpLeft className="size-4" />
                </Link>
                <a
                  href="#project"
                  className="inline-flex h-12 items-center rounded-xl border border-white/15 px-5 text-sm font-medium text-slate-200 transition hover:border-white/30 hover:bg-white/[0.04]"
                >
                  اعرف تفاصيل المشروع
                </a>
              </div>
              <div className="mt-8 flex flex-wrap gap-2">
                {["واجهة عربية RTL", "الجنيه المصري · EGP", "تجربة ببيانات افتراضية"].map(
                  (item) => (
                    <span
                      key={item}
                      className="rounded-full border border-white/10 bg-white/[0.035] px-3 py-1.5 text-[10px] text-slate-300"
                    >
                      {item}
                    </span>
                  ),
                )}
              </div>
            </div>

            <div className="relative mx-auto w-full max-w-[650px]">
              <div className="absolute -left-4 top-12 h-32 w-32 rounded-full bg-cyan-400/10 blur-3xl sm:-left-10" />
              <div className="absolute -right-3 bottom-4 h-40 w-40 rounded-full bg-[#08c9ad]/15 blur-3xl" />
              <div className="relative rounded-[26px] border border-white/15 bg-[#0b1a2c] p-2.5 shadow-[0_35px_100px_-45px_rgba(0,0,0,0.9)] sm:rounded-[30px] sm:p-3">
                <div className="mb-2 flex items-center justify-between px-3 py-2" dir="ltr">
                  <span className="flex items-center gap-1.5">
                    <i className="size-2 rounded-full bg-[#ff746d]" />
                    <i className="size-2 rounded-full bg-[#f2bb51]" />
                    <i className="size-2 rounded-full bg-[#08c9ad]" />
                  </span>
                  <span className="text-[9px] tracking-wide text-slate-500">
                    CFO COMMAND CENTER
                  </span>
                </div>
                <div className="aspect-[1.42] overflow-hidden rounded-[18px] border border-white/10 bg-[#071220] sm:rounded-[22px]">
                  <DashboardPreview />
                </div>
                <div className="absolute -bottom-5 right-4 flex items-center gap-3 rounded-2xl border border-white/10 bg-[#102338]/95 px-4 py-3 shadow-2xl backdrop-blur sm:-bottom-6 sm:right-8">
                  <span className="flex size-9 items-center justify-center rounded-xl bg-[#08c9ad]/10 text-[#08c9ad]">
                    <BarChart3 className="size-4" />
                  </span>
                  <span>
                    <span className="block text-[10px] text-slate-400">نظرة موحّدة على</span>
                    <span className="mt-0.5 block text-xs font-semibold">
                      الإيراد · المصروف · السيولة
                    </span>
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section
          className="mx-auto max-w-7xl px-5 pb-16 sm:px-8 sm:pb-20"
          aria-label="ملخص إمكانات المشروع"
        >
          <div className="grid overflow-hidden rounded-2xl border border-white/10 bg-white/[0.035] sm:grid-cols-3">
            {highlights.map((item, index) => (
              <div
                key={item.label}
                className={`flex items-center gap-4 px-5 py-5 sm:px-8 sm:py-6 ${index > 0 ? "border-t border-white/10 sm:border-r sm:border-t-0" : ""}`}
              >
                <span
                  className="font-mono text-2xl font-medium tracking-tight text-[#08c9ad] sm:text-3xl"
                  dir="ltr"
                >
                  {item.value}
                </span>
                <span className="text-xs leading-5 text-slate-300">{item.label}</span>
              </div>
            ))}
          </div>
        </section>

        <section id="project" className="scroll-mt-24 border-y border-white/[0.07] bg-[#0a1828]">
          <div className="mx-auto grid max-w-7xl gap-10 px-5 py-16 sm:px-8 sm:py-20 lg:grid-cols-[0.72fr_1.28fr] lg:gap-20">
            <div>
              <p className="mb-3 text-[10px] font-semibold tracking-[0.18em] text-[#08c9ad]">
                عن المشروع
              </p>
              <h2 className="text-2xl font-bold leading-relaxed sm:text-3xl">
                الأرقام أوضح
                <span className="block text-slate-400">لما تكون في مكان واحد.</span>
              </h2>
            </div>
            <div className="max-w-2xl">
              <p className="text-sm leading-8 text-slate-300">
                صمّمت هذه التجربة لتقريب المؤشرات المالية اليومية من صاحب القرار: تسجيل حركة، فهم
                أثرها على الأداء، ثم مراجعة النتيجة في تقرير بسيط — من دون واجهة مزدحمة أو اعتماد
                على لغة واحدة.
              </p>
              <div className="mt-7 grid gap-3 sm:grid-cols-2">
                {[
                  "بناء واجهة عربية واتجاه RTL من البداية",
                  "تنظيم الحسابات حول الإيرادات والمصروفات والسيولة",
                  "فصل الحسابات المالية في دوال نقية قابلة للاختبار",
                  "تجربة تفاعلية بلا تسجيل دخول أو بيانات حقيقية",
                ].map((item) => (
                  <div
                    key={item}
                    className="flex items-start gap-2.5 rounded-xl border border-white/[0.08] bg-white/[0.025] p-3.5 text-xs leading-6 text-slate-300"
                  >
                    <Check className="mt-1 size-4 shrink-0 text-[#08c9ad]" />
                    {item}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section
          id="features"
          className="scroll-mt-24 mx-auto max-w-7xl px-5 py-16 sm:px-8 sm:py-20"
        >
          <div className="mb-8 flex flex-col justify-between gap-4 sm:mb-10 sm:flex-row sm:items-end">
            <div>
              <p className="mb-2 text-[10px] font-semibold tracking-[0.18em] text-[#08c9ad]">
                مصممة للاستخدام اليومي
              </p>
              <h2 className="text-2xl font-bold sm:text-3xl">من الحركة إلى الصورة الكاملة</h2>
            </div>
            <p className="max-w-md text-xs leading-6 text-slate-400">
              تفاصيل عملية، من إدخال معاملة إلى قراءة مؤشرات الفترة وتصدير التقرير.
            </p>
          </div>
          <div className="grid gap-3 md:grid-cols-3">
            {features.map(({ icon: Icon, title, description }, index) => (
              <article
                key={title}
                className="group rounded-2xl border border-white/10 bg-[#0b1a2b] p-5 transition duration-200 hover:-translate-y-1 hover:border-[#08c9ad]/35 sm:p-6"
              >
                <div className="flex items-center justify-between">
                  <span className="flex size-11 items-center justify-center rounded-xl border border-[#08c9ad]/15 bg-[#08c9ad]/[0.08] text-[#08c9ad] transition group-hover:bg-[#08c9ad]/15">
                    <Icon className="size-5" />
                  </span>
                  <span className="font-mono text-xs text-slate-600" dir="ltr">
                    0{index + 1}
                  </span>
                </div>
                <h3 className="mt-6 text-sm font-semibold">{title}</h3>
                <p className="mt-2 text-xs leading-7 text-slate-400">{description}</p>
              </article>
            ))}
          </div>
        </section>

        <section id="technology" className="scroll-mt-24 border-y border-white/[0.07] bg-[#0a1828]">
          <div className="mx-auto grid max-w-7xl gap-8 px-5 py-14 sm:px-8 sm:py-16 md:grid-cols-[0.8fr_1.2fr] md:items-center">
            <div>
              <p className="mb-2 text-[10px] font-semibold tracking-[0.18em] text-[#08c9ad]">
                التقنيات والتنفيذ
              </p>
              <h2 className="text-xl font-bold sm:text-2xl">
                واجهة تفاعلية، وحسابات قابلة للتحقق.
              </h2>
              <p className="mt-3 max-w-lg text-xs leading-7 text-slate-400">
                حسابات المؤشرات معزولة عن العرض ومغطاة باختبارات، بينما تحفظ تعديلات التجربة داخل
                المتصفح نفسه.
              </p>
            </div>
            <div className="flex flex-wrap gap-2.5">
              {stack.map((item) => (
                <span
                  key={item}
                  className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-[#071220] px-3.5 py-2.5 text-xs font-medium text-slate-200"
                >
                  <Layers3 className="size-3.5 text-[#08c9ad]" />
                  {item}
                </span>
              ))}
            </div>
          </div>
        </section>

        <section id="demo" className="mx-auto max-w-7xl px-5 py-16 sm:px-8 sm:py-20">
          <div className="relative overflow-hidden rounded-[26px] border border-[#08c9ad]/20 bg-gradient-to-br from-[#0c2632] via-[#0b1a2b] to-[#0b1a2b] px-6 py-9 sm:px-10 sm:py-11">
            <div className="pointer-events-none absolute -left-16 -top-20 size-64 rounded-full bg-[#08c9ad]/10 blur-[90px]" />
            <div className="relative flex flex-col gap-7 md:flex-row md:items-center md:justify-between">
              <div className="max-w-2xl">
                <div className="mb-3 flex items-center gap-2 text-[10px] font-medium text-[#74dfcf]">
                  <ShieldCheck className="size-4" />
                  تجربة مستقلة على هذا المتصفح
                </div>
                <h2 className="text-2xl font-bold sm:text-3xl">جرّب اللوحة بنفسك</h2>
                <p className="mt-3 text-xs leading-7 text-slate-300 sm:text-sm">
                  أضف وعدّل واحذف الحركات كما تشاء. تُحفظ التغييرات في متصفحك فقط، ويمكنك استعادة
                  بيانات المثال في أي وقت. لا تستخدم معلومات مالية حقيقية أو سرية.
                </p>
              </div>
              <Link
                to="/dashboard"
                className="inline-flex h-12 shrink-0 items-center justify-center gap-2 rounded-xl bg-[#08c9ad] px-5 text-sm font-bold text-[#071b25] transition hover:bg-[#47ddc5]"
              >
                ابدأ التجربة <ArrowLeft className="size-4" />
              </Link>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-white/10">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 px-5 py-6 text-center sm:flex-row sm:px-8 sm:text-right">
          <span className="text-xs font-medium text-slate-300">مركز المدير المالي</span>
          <div className="flex items-center gap-4 text-[10px] text-slate-500">
            <Link to="/dashboard" className="transition hover:text-slate-200">
              فتح لوحة التحكم
            </Link>
            <span>تجربة ببيانات افتراضية · {new Date().getFullYear()}</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

function DashboardPreview() {
  const metrics = [
    { label: "إجمالي الإيرادات", value: "850,000", tone: "text-[#08c9ad]" },
    { label: "المصروفات", value: "320,000", tone: "text-[#ff746d]" },
    { label: "صافي الربح", value: "530,000", tone: "text-[#08c9ad]" },
    { label: "السيولة المتاحة", value: "240,000", tone: "text-[#65c8e8]" },
  ];

  return (
    <div
      dir="rtl"
      className="grid h-full grid-cols-[minmax(0,1fr)_58px] bg-[#071220] sm:grid-cols-[minmax(0,1fr)_82px]"
    >
      <div className="min-w-0 p-2.5 sm:p-4">
        <div className="mb-2 flex items-center justify-between gap-2 sm:mb-3">
          <div>
            <p className="text-[8px] text-slate-500 sm:text-[10px]">لوحة المؤشرات</p>
            <p className="mt-1 text-[10px] font-semibold sm:text-xs">ملخص الأداء المالي</p>
          </div>
          <span className="rounded border border-white/10 px-2 py-1 text-[7px] text-slate-400 sm:text-[9px]">
            هذا الشهر
          </span>
        </div>
        <div className="grid grid-cols-2 gap-1.5 sm:gap-2">
          {metrics.map((metric) => (
            <div
              key={metric.label}
              className="min-w-0 rounded-lg border border-white/10 bg-[#0b1a2c] px-2 py-2 sm:rounded-xl sm:px-3 sm:py-2.5"
            >
              <p className="truncate text-[7px] text-slate-500 sm:text-[9px]">{metric.label}</p>
              <p
                className={`mt-1 truncate font-mono text-[11px] font-medium sm:text-sm ${metric.tone}`}
                dir="ltr"
              >
                {metric.value}
              </p>
              <span className="mt-1 block text-[6px] text-slate-600 sm:text-[8px]">
                ج.م · بيانات افتراضية
              </span>
            </div>
          ))}
        </div>
        <div className="mt-1.5 grid min-h-0 grid-cols-[1.35fr_0.85fr] gap-1.5 sm:mt-2 sm:gap-2">
          <div className="rounded-lg border border-white/10 bg-[#0b1a2c] p-2 sm:rounded-xl sm:p-3">
            <div className="flex items-center justify-between gap-1">
              <p className="truncate text-[7px] font-medium sm:text-[9px]">حركة التدفقات النقدية</p>
              <span className="size-1.5 shrink-0 rounded-full bg-[#08c9ad]" />
            </div>
            <div className="mt-2 flex h-[68px] items-end gap-1 border-b border-white/10 px-1 sm:h-[96px] sm:gap-1.5">
              {[34, 57, 46, 72, 90, 62, 82].map((height, index) => (
                <span
                  key={index}
                  className="flex-1 rounded-t-sm bg-gradient-to-t from-[#08c9ad]/20 to-[#08c9ad]"
                  style={{ height: `${height}%`, opacity: 0.55 + index * 0.06 }}
                />
              ))}
            </div>
            <div className="mt-1.5 flex justify-between text-[6px] text-slate-600 sm:text-[8px]">
              <span>الأسبوع الأول</span>
              <span>الأسبوع الأخير</span>
            </div>
          </div>
          <div className="flex flex-col justify-between rounded-lg border border-white/10 bg-[#0b1a2c] p-2 sm:rounded-xl sm:p-3">
            <div>
              <p className="text-[7px] text-slate-500 sm:text-[9px]">هامش الربح</p>
              <p
                className="mt-1 font-mono text-sm font-semibold text-[#08c9ad] sm:text-xl"
                dir="ltr"
              >
                62.3%
              </p>
            </div>
            <div>
              <div className="mb-1 flex justify-between text-[6px] text-slate-600 sm:text-[8px]">
                <span>المصروفات</span>
                <span>37.7%</span>
              </div>
              <div className="h-1 overflow-hidden rounded-full bg-white/10">
                <span className="block h-full w-[38%] rounded-full bg-[#ff746d]" />
              </div>
              <p className="mt-2 text-[6px] leading-3 text-slate-500 sm:text-[8px] sm:leading-4">
                توزيع الإنفاق حسب التصنيف
              </p>
            </div>
          </div>
        </div>
      </div>
      <aside className="flex flex-col items-center gap-2 border-r border-white/10 bg-[#0a1828] py-3 sm:gap-3 sm:py-4">
        <img src="/favicon.svg" alt="" className="size-6 rounded-md sm:size-8" />
        <span className="my-1 h-px w-7 bg-white/10" />
        {["نظرة عامة", "التدفقات", "الأرباح", "الحركات", "التقارير"].map((item, index) => (
          <span
            key={item}
            className={`flex w-full items-center justify-center px-1 py-1.5 text-[6px] sm:py-2 sm:text-[8px] ${index === 0 ? "border-l-2 border-[#08c9ad] bg-white/[0.04] text-white" : "text-slate-500"}`}
          >
            {item}
          </span>
        ))}
        <span className="mt-auto rounded border border-[#f2bb51]/20 bg-[#f2bb51]/[0.05] p-1 text-[6px] text-[#f2bb51] sm:text-[8px]">
          تجربة آمنة
        </span>
      </aside>
    </div>
  );
}
