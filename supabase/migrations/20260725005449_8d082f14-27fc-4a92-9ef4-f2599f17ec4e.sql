
-- Enum de planos
create type public.plan_tier as enum ('basico','intermediario','mentoria');

-- PROFILES
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  full_name text,
  avatar_url text,
  riot_id text,
  current_rank text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
grant select, insert, update on public.profiles to authenticated;
grant all on public.profiles to service_role;
alter table public.profiles enable row level security;
create policy "own profile select" on public.profiles for select to authenticated using (auth.uid() = id);
create policy "own profile update" on public.profiles for update to authenticated using (auth.uid() = id) with check (auth.uid() = id);
create policy "own profile insert" on public.profiles for insert to authenticated with check (auth.uid() = id);

-- ENROLLMENTS (plano adquirido)
create table public.enrollments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  plan public.plan_tier not null,
  status text not null default 'active',
  provider text,
  provider_ref text,
  started_at timestamptz not null default now(),
  expires_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id)
);
grant select on public.enrollments to authenticated;
grant all on public.enrollments to service_role;
alter table public.enrollments enable row level security;
create policy "own enrollment select" on public.enrollments for select to authenticated using (auth.uid() = user_id);

-- Rank helper
create or replace function public.plan_rank(_plan public.plan_tier)
returns int language sql immutable set search_path = public as $$
  select case _plan when 'basico' then 1 when 'intermediario' then 2 when 'mentoria' then 3 end
$$;

create or replace function public.current_plan(_user_id uuid)
returns public.plan_tier language sql stable security definer set search_path = public as $$
  select e.plan from public.enrollments e
  where e.user_id = _user_id
    and e.status = 'active'
    and (e.expires_at is null or e.expires_at > now())
  limit 1
$$;

create or replace function public.has_plan_access(_user_id uuid, _required public.plan_tier)
returns boolean language sql stable security definer set search_path = public as $$
  select coalesce(public.plan_rank(public.current_plan(_user_id)) >= public.plan_rank(_required), false)
$$;

-- MODULES
create table public.modules (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  description text,
  tier public.plan_tier not null default 'basico',
  position int not null default 0,
  cover_color text default '#7B2EFF',
  created_at timestamptz not null default now()
);
grant select on public.modules to authenticated;
grant all on public.modules to service_role;
alter table public.modules enable row level security;
create policy "modules readable by members" on public.modules for select to authenticated using (true);

-- LESSONS
create table public.lessons (
  id uuid primary key default gen_random_uuid(),
  module_id uuid not null references public.modules(id) on delete cascade,
  slug text not null unique,
  title text not null,
  description text,
  video_url text,
  duration_seconds int not null default 0,
  materials jsonb not null default '[]'::jsonb,
  position int not null default 0,
  created_at timestamptz not null default now()
);
grant select on public.lessons to authenticated;
grant all on public.lessons to service_role;
alter table public.lessons enable row level security;
create policy "lessons readable with plan" on public.lessons for select to authenticated
using (public.has_plan_access(auth.uid(), (select m.tier from public.modules m where m.id = module_id)));

-- LESSON PROGRESS
create table public.lesson_progress (
  user_id uuid not null references auth.users(id) on delete cascade,
  lesson_id uuid not null references public.lessons(id) on delete cascade,
  completed boolean not null default false,
  completed_at timestamptz,
  last_position_seconds int not null default 0,
  updated_at timestamptz not null default now(),
  primary key (user_id, lesson_id)
);
grant select, insert, update, delete on public.lesson_progress to authenticated;
grant all on public.lesson_progress to service_role;
alter table public.lesson_progress enable row level security;
create policy "own progress" on public.lesson_progress for all to authenticated
using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ANNOUNCEMENTS
create table public.announcements (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  body text not null,
  min_tier public.plan_tier not null default 'basico',
  published boolean not null default true,
  created_at timestamptz not null default now()
);
grant select on public.announcements to authenticated;
grant all on public.announcements to service_role;
alter table public.announcements enable row level security;
create policy "announcements by plan" on public.announcements for select to authenticated
using (published and public.has_plan_access(auth.uid(), min_tier));

-- updated_at trigger
create or replace function public.touch_updated_at()
returns trigger language plpgsql set search_path = public as $$
begin new.updated_at = now(); return new; end; $$;
create trigger profiles_touch before update on public.profiles for each row execute function public.touch_updated_at();
create trigger enrollments_touch before update on public.enrollments for each row execute function public.touch_updated_at();
create trigger progress_touch before update on public.lesson_progress for each row execute function public.touch_updated_at();

-- Auto profile on signup
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, email, full_name, avatar_url)
  values (new.id, new.email,
          coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name', split_part(coalesce(new.email,''),'@',1)),
          new.raw_user_meta_data->>'avatar_url')
  on conflict (id) do nothing;
  return new;
end; $$;
create trigger on_auth_user_created after insert on auth.users for each row execute function public.handle_new_user();

-- SEED
insert into public.modules (slug, title, description, tier, position, cover_color) values
 ('fundamentos','Fundamentos Radiantes','A base mental e mecânica que sustenta todo Radiante.','basico',1,'#7B2EFF'),
 ('mira-movimento','Mira & Movimento','Rotina de treino, crosshair placement e controle de recuo.','basico',2,'#6F4BFF'),
 ('leitura-de-jogo','Leitura de Jogo','Como Radiantes leem rounds, economia e timings.','intermediario',3,'#00AEEF'),
 ('macro-e-calls','Macro & Calls','Estruturas de execução, defaults e comunicação eficiente.','intermediario',4,'#00F5FF'),
 ('mentoria-elite','Mentoria Elite','Conteúdos exclusivos, VOD reviews e sessões 1:1.','mentoria',5,'#7B2EFF');

insert into public.lessons (module_id, slug, title, description, video_url, duration_seconds, position, materials)
select m.id, l.slug, l.title, l.description, l.video_url, l.duration, l.position, l.materials::jsonb
from public.modules m
join (values
 ('fundamentos','fund-01','A mentalidade do Radiante','O que separa um jogador travado no Ouro de um Radiante — e por que não é a mira.','https://cdn.coverr.co/videos/coverr-typing-on-a-keyboard-1584/1080p.mp4',720,1,'[{"name":"Guia de Mentalidade (PDF)","url":"#"}]'),
 ('fundamentos','fund-02','Rotina de treino que funciona','Como montar 30 minutos de treino com retorno real.','https://cdn.coverr.co/videos/coverr-typing-on-a-keyboard-1584/1080p.mp4',900,2,'[{"name":"Planilha de Rotina","url":"#"}]'),
 ('mira-movimento','mira-01','Crosshair placement na prática','Onde a mira deve estar antes do duelo começar.','https://cdn.coverr.co/videos/coverr-typing-on-a-keyboard-1584/1080p.mp4',840,1,'[]'),
 ('mira-movimento','mira-02','Movimento e counter-strafe','Parar, atirar e reposicionar sem perder tempo.','https://cdn.coverr.co/videos/coverr-typing-on-a-keyboard-1584/1080p.mp4',780,2,'[]'),
 ('leitura-de-jogo','leitura-01','Lendo a economia inimiga','Prever o buy do inimigo e adaptar o round.','https://cdn.coverr.co/videos/coverr-typing-on-a-keyboard-1584/1080p.mp4',960,1,'[{"name":"Tabela de Economia","url":"#"}]'),
 ('leitura-de-jogo','leitura-02','Timings e rotações','Quando girar, quando segurar, quando forçar.','https://cdn.coverr.co/videos/coverr-typing-on-a-keyboard-1584/1080p.mp4',1020,2,'[]'),
 ('macro-e-calls','macro-01','Defaults que ganham rounds','Estrutura de ataque que funciona em qualquer elo.','https://cdn.coverr.co/videos/coverr-typing-on-a-keyboard-1584/1080p.mp4',1080,1,'[]'),
 ('macro-e-calls','macro-02','Comunicação de alto nível','Calls curtas, úteis e no tempo certo.','https://cdn.coverr.co/videos/coverr-typing-on-a-keyboard-1584/1080p.mp4',900,2,'[]'),
 ('mentoria-elite','mentoria-01','VOD Review: do Diamante ao Imortal','Análise completa de uma partida real com correções.','https://cdn.coverr.co/videos/coverr-typing-on-a-keyboard-1584/1080p.mp4',1500,1,'[{"name":"Checklist de VOD Review","url":"#"}]'),
 ('mentoria-elite','mentoria-02','Plano individual de evolução','Como estruturar suas próximas 8 semanas.','https://cdn.coverr.co/videos/coverr-typing-on-a-keyboard-1584/1080p.mp4',1200,2,'[]')
) as l(module_slug, slug, title, description, video_url, duration, position, materials)
on m.slug = l.module_slug;

insert into public.announcements (title, body, min_tier) values
 ('Bem-vindo ao Projeto Radiante','Comece pelo módulo Fundamentos Radiantes. Assista na ordem e marque as aulas como concluídas para acompanhar seu progresso.','basico'),
 ('Nova sessão de VOD Review','As sessões ao vivo da Mentoria acontecem toda quinta-feira às 20h.','mentoria');
