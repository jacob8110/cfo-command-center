begin;

drop policy if exists "Anyone may add public demo transactions" on public.financial_transactions;
drop policy if exists "Anyone may edit public demo transactions" on public.financial_transactions;
drop policy if exists "Anyone may delete public demo transactions" on public.financial_transactions;
drop policy if exists "Anyone may set public demo cash settings" on public.finance_dashboard_settings;
drop policy if exists "Anyone may update public demo cash settings" on public.finance_dashboard_settings;

revoke insert, update, delete, truncate, references, trigger
  on table public.financial_transactions
  from anon, authenticated, public;
revoke insert, update, delete, truncate, references, trigger
  on table public.finance_dashboard_settings
  from anon, authenticated, public;

grant select on table public.financial_transactions to anon;
grant select on table public.finance_dashboard_settings to anon;

commit;
