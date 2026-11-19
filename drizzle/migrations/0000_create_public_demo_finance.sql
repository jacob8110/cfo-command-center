CREATE TABLE public.financial_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  transaction_type TEXT NOT NULL CHECK (transaction_type IN ('income', 'expense')),
  description TEXT NOT NULL CHECK (char_length(description) BETWEEN 1 AND 180),
  category TEXT NOT NULL DEFAULT 'أخرى' CHECK (char_length(category) BETWEEN 1 AND 80),
  amount NUMERIC(14, 2) NOT NULL CHECK (amount > 0),
  transaction_date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.financial_transactions TO anon;
GRANT ALL ON public.financial_transactions TO service_role;
ALTER TABLE public.financial_transactions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone may read public demo transactions" ON public.financial_transactions FOR SELECT TO anon USING (true);
CREATE POLICY "Anyone may add public demo transactions" ON public.financial_transactions FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "Anyone may edit public demo transactions" ON public.financial_transactions FOR UPDATE TO anon USING (true) WITH CHECK (true);
CREATE POLICY "Anyone may delete public demo transactions" ON public.financial_transactions FOR DELETE TO anon USING (true);
CREATE INDEX financial_transactions_date_idx ON public.financial_transactions (transaction_date DESC, created_at DESC);

CREATE TABLE public.finance_dashboard_settings (
  id SMALLINT PRIMARY KEY NOT NULL DEFAULT 1 CHECK (id = 1),
  cash_balance NUMERIC(14, 2) NOT NULL DEFAULT 0 CHECK (cash_balance >= 0),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.finance_dashboard_settings TO anon;
GRANT ALL ON public.finance_dashboard_settings TO service_role;
ALTER TABLE public.finance_dashboard_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone may read public demo cash settings" ON public.finance_dashboard_settings FOR SELECT TO anon USING (true);
CREATE POLICY "Anyone may set public demo cash settings" ON public.finance_dashboard_settings FOR INSERT TO anon WITH CHECK (id = 1 AND cash_balance >= 0);
CREATE POLICY "Anyone may update public demo cash settings" ON public.finance_dashboard_settings FOR UPDATE TO anon USING (id = 1) WITH CHECK (id = 1 AND cash_balance >= 0);

INSERT INTO public.finance_dashboard_settings (id, cash_balance) VALUES (1, 240000);
INSERT INTO public.financial_transactions (transaction_type, description, category, amount, transaction_date) VALUES
('income','عقد استشارات مالية','خدمات استشارية',285000,'2026-11-17'),
('income','دفعة مشروع تطوير','مشروعات',198500,'2026-11-14'),
('income','اشتراكات العملاء','اشتراكات',142000,'2026-11-10'),
('income','مبيعات معدات','مبيعات',118000,'2026-11-05'),
('income','فاتورة عميل','مبيعات',106500,'2026-10-31'),
('expense','رواتب الفريق','رواتب',142000,'2026-11-18'),
('expense','إيجار المكتب','إيجارات',42000,'2026-11-16'),
('expense','تسويق رقمي','تسويق',38500,'2026-11-12'),
('expense','خدمات سحابية','تقنية',25750,'2026-11-09'),
('expense','تكاليف تشغيل','تشغيل',32250,'2026-11-03'),
('expense','مستلزمات مكتبية','تشغيل',39500,'2026-10-27');