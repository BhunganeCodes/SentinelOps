create extension if not exists "pgcrypto";

create table if not exists public.documents (
  id uuid primary key default gen_random_uuid(),
  filename text not null,
  original_filename text not null,
  mime_type text not null,
  size_bytes bigint not null default 0,
  file_path text not null,
  status text not null default 'processing'
    check (status in ('processing', 'blocked', 'complete', 'failed')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.governance_events (
  id uuid primary key default gen_random_uuid(),
  prompt_snippet text not null,
  action text not null check (action in ('allow', 'flag', 'block')),
  policy_triggered text,
  risk_delta integer not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.procurement_analysis (
  id uuid primary key default gen_random_uuid(),
  document_id uuid references public.documents(id) on delete cascade,
  document_text text,
  analysis_json jsonb,
  supplier_names text[] not null default '{}',
  pricing_details jsonb not null default '{}'::jsonb,
  suspicious_clauses text[] not null default '{}',
  compliance_risks text[] not null default '{}',
  anomaly_score integer not null default 0,
  summary text,
  created_at timestamptz not null default now()
);

create table if not exists public.audit_logs (
  id uuid primary key default gen_random_uuid(),
  event_type text not null,
  severity text not null default 'info'
    check (severity in ('info', 'low', 'medium', 'high', 'critical')),
  message text not null,
  reason text,
  document_id uuid references public.documents(id) on delete set null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

alter table public.documents enable row level security;
alter table public.governance_events enable row level security;
alter table public.procurement_analysis enable row level security;
alter table public.audit_logs enable row level security;

create policy "Service role can manage documents"
  on public.documents for all
  using (auth.role() = 'service_role')
  with check (auth.role() = 'service_role');

create policy "Service role can manage governance events"
  on public.governance_events for all
  using (auth.role() = 'service_role')
  with check (auth.role() = 'service_role');

create policy "Service role can manage procurement analysis"
  on public.procurement_analysis for all
  using (auth.role() = 'service_role')
  with check (auth.role() = 'service_role');

create policy "Service role can manage audit logs"
  on public.audit_logs for all
  using (auth.role() = 'service_role')
  with check (auth.role() = 'service_role');
