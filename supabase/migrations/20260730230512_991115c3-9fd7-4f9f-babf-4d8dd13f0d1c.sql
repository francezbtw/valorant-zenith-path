
-- storage policies (admin-managed buckets; playback/downloads via signed URLs)
create policy "admins manage course videos" on storage.objects for all to authenticated
  using (bucket_id = 'course-videos' and public.is_admin())
  with check (bucket_id = 'course-videos' and public.is_admin());

create policy "admins manage course materials" on storage.objects for all to authenticated
  using (bucket_id = 'course-materials' and public.is_admin())
  with check (bucket_id = 'course-materials' and public.is_admin());

alter table public.lessons add column if not exists video_path text;

alter table public.plans add column if not exists stripe_price_id text;
alter table public.plans add column if not exists mercadopago_price_cents integer;

create unique index if not exists enrollments_user_id_key on public.enrollments(user_id);
create unique index if not exists payments_provider_ref_key on public.payments(provider, provider_ref) where provider_ref is not null;

create table if not exists public.payment_events (
  id uuid primary key default gen_random_uuid(),
  provider text not null,
  event_id text,
  event_type text,
  payload jsonb not null default '{}'::jsonb,
  processed boolean not null default false,
  error text,
  created_at timestamptz not null default now()
);

grant select on public.payment_events to authenticated;
grant all on public.payment_events to service_role;

alter table public.payment_events enable row level security;

create policy "admins read payment events" on public.payment_events
  for select to authenticated using (public.is_admin());

create unique index if not exists payment_events_provider_event_key on public.payment_events(provider, event_id) where event_id is not null;
