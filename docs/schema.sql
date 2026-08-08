-- ATS Engine — schema + seed
-- Run this in the Supabase SQL editor (or `supabase db push`).
-- Re-runnable: all inserts use ON CONFLICT DO NOTHING/UPDATE.

create extension if not exists "pgcrypto";

do $$ begin
  create type public.app_role as enum ('employer', 'candidate');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.job_status as enum ('Open','Draft','Closed','Paused');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.application_stage as enum ('Applied','Screening','Interview','Offer','Rejected');
exception when duplicate_object then null; end $$;

create table if not exists public.profiles (
  id uuid primary key,
  role public.app_role not null,
  full_name text,
  headline text,
  location text,
  years_exp int default 0,
  target_roles text[] default '{}',
  skills text[] default '{}',
  links jsonb default '[]'::jsonb,
  resume_text text,
  resume_json jsonb,
  onboarded boolean default false,
  created_at timestamptz default now()
);
grant all on public.profiles to service_role;
alter table public.profiles enable row level security;

create table if not exists public.jobs (
  id text primary key,
  employer_id uuid,
  title text not null,
  department text,
  location text,
  type text default 'Full-time',
  posted_at timestamptz default now(),
  status public.job_status default 'Open',
  applicants int default 0,
  new_count int default 0,
  match_avg int default 0,
  salary text,
  description text,
  tags text[] default '{}'
);
grant all on public.jobs to service_role;
grant select on public.jobs to anon;
alter table public.jobs enable row level security;
drop policy if exists "public read jobs" on public.jobs;
create policy "public read jobs" on public.jobs for select to anon using (true);

create table if not exists public.candidates (
  id text primary key,
  name text, title text, company text, location text,
  years int default 0, match_score int default 0,
  skills text[] default '{}', strengths text[] default '{}', gaps text[] default '{}',
  status text default 'New', applied_for text, ai_insight text,
  portfolio jsonb default '[]'::jsonb, initials text, email text
);
grant all on public.candidates to service_role;
alter table public.candidates enable row level security;

create table if not exists public.applications (
  id text primary key, candidate_id uuid, job_id text,
  job_title text, company text, logo text, applied_on text,
  stage public.application_stage default 'Applied',
  progress int default 0, match_score int default 0, next_step text
);
alter table public.applications add column if not exists job_id text;
grant all on public.applications to service_role;
alter table public.applications enable row level security;

create table if not exists public.job_matches (
  id text primary key, candidate_id uuid,
  title text, company text, location text, salary text,
  match_score int default 0, posted_ago text,
  skills text[] default '{}', reason text, logo text
);
grant all on public.job_matches to service_role;
alter table public.job_matches enable row level security;

create table if not exists public.notifications (
  id text primary key, user_id uuid,
  title text, time text, type text, created_at timestamptz default now()
);
grant all on public.notifications to service_role;
alter table public.notifications enable row level security;

create table if not exists public.skill_radar (
  candidate_id uuid, skill text, you int, target int,
  primary key (candidate_id, skill)
);
grant all on public.skill_radar to service_role;
alter table public.skill_radar enable row level security;

create table if not exists public.roadmap (
  id text primary key, candidate_id uuid,
  week text, title text, detail text, done boolean default false, ord int default 0
);
grant all on public.roadmap to service_role;
alter table public.roadmap enable row level security;

create table if not exists public.analytics_metrics (
  label text primary key, value text, delta text, positive boolean
);
grant all on public.analytics_metrics to service_role;
grant select on public.analytics_metrics to anon;
alter table public.analytics_metrics enable row level security;
drop policy if exists "public read analytics" on public.analytics_metrics;
create policy "public read analytics" on public.analytics_metrics for select to anon using (true);

create table if not exists public.funnel (stage text primary key, count int, ord int);
grant all on public.funnel to service_role;
alter table public.funnel enable row level security;

create table if not exists public.hiring_trend (
  month text primary key, hires int, applications int, ord int
);
grant all on public.hiring_trend to service_role;
alter table public.hiring_trend enable row level security;

create table if not exists public.assistant_threads (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  title text default 'New chat',
  created_at timestamptz default now()
);
grant all on public.assistant_threads to service_role;
alter table public.assistant_threads enable row level security;

create table if not exists public.assistant_messages (
  id uuid primary key default gen_random_uuid(),
  thread_id uuid references public.assistant_threads(id) on delete cascade,
  role text not null,
  content text not null,
  created_at timestamptz default now()
);
grant all on public.assistant_messages to service_role;
alter table public.assistant_messages enable row level security;

-- ============================================================
-- SEED
-- ============================================================
insert into public.profiles (id, role, full_name, headline, onboarded) values
  ('11111111-1111-1111-1111-111111111111','employer','Julianne Deitch','Head of Talent · ATS Engine',true),
  ('22222222-2222-2222-2222-222222222222','candidate','Jordan Rivera','Senior Designer',false)
on conflict (id) do nothing;

insert into public.jobs (id,employer_id,title,department,location,type,status,applicants,new_count,match_avg,salary,description,tags) values
  ('JOB-4092','11111111-1111-1111-1111-111111111111','Senior Product Designer','Design','Remote · US','Full-time','Open',82,14,78,'$180k – $220k','Lead end-to-end product design for our recruiting workspace.','{"Figma","Design Systems","B2B SaaS"}'),
  ('JOB-4088','11111111-1111-1111-1111-111111111111','Senior Staff Engineer','Engineering','Remote · Global','Full-time','Open',124,21,84,'$240k – $310k','Own architecture for our ranking pipeline.','{"TypeScript","Rust","Distributed Systems"}'),
  ('JOB-4083','11111111-1111-1111-1111-111111111111','Machine Learning Engineer','AI','New York, NY','Full-time','Open',96,8,71,'$190k – $250k','Embedding models and semantic search.','{"PyTorch","LLMs","Embeddings"}'),
  ('JOB-4071','11111111-1111-1111-1111-111111111111','Head of Talent','People','San Francisco, CA','Full-time','Paused',47,0,66,'$210k – $260k','Build our talent function.','{"Recruiting","Ops","Leadership"}'),
  ('JOB-4065','11111111-1111-1111-1111-111111111111','Growth Marketing Lead','Marketing','Remote · US','Full-time','Closed',210,0,72,'$160k – $200k','Top-of-funnel across paid, content, lifecycle.','{"B2B","Paid","Lifecycle"}'),
  ('JOB-4059','11111111-1111-1111-1111-111111111111','Frontend Engineer, Platform','Engineering','Remote · EU','Full-time','Open',168,3,76,'$150k – $195k','React, TanStack, beautiful design system.','{"React","TypeScript","TanStack"}')
on conflict (id) do nothing;

insert into public.candidates (id,name,title,company,location,years,match_score,skills,strengths,gaps,status,applied_for,ai_insight,portfolio,initials,email) values
  ('C-8811','Sarah Chen','Senior Product Designer','Ex-Linear, Uber','Brooklyn, NY',8,98,'{"Figma","Design Systems","Prototyping","Motion","Research"}','{"Design Systems mastery","Cross-functional lead","Craft at scale"}','{"Limited B2B recruiting domain"}','Final Round','Senior Product Designer','Matches 9/10 core competencies. Recommend fast-track to final panel.','[{"label":"sarahchen.design","url":"#"}]','SC','sarah.chen@mail.co'),
  ('C-8807','Marcus Thorne','Senior Designer','Stripe','Remote · CA',6,94,'{"Figma","Interaction","Prototyping","Brand"}','{"Payments UX","Systems thinking"}','{"No formal team lead experience"}','Interviewing','Senior Product Designer','Portfolio depth in top 5% of pool.','[{"label":"marcusthorne.co","url":"#"}]','MT','marcus@mail.co'),
  ('C-8802','Elena Rostova','Staff Engineer','Ex-Stripe','Berlin, DE',9,96,'{"Rust","Go","Distributed Systems","PostgreSQL"}','{"Deep systems background","Rust proficiency"}','{"Prefers async-only teams"}','Screening','Senior Staff Engineer','Highest-scoring active applicant.','[{"label":"github.com/elenar","url":"#"}]','ER','elena@mail.co'),
  ('C-8798','Liam Henderson','Principal Engineer','Vercel','London, UK',11,91,'{"TypeScript","Edge Runtime","React","Perf"}','{"Perf & DX leadership"}','{"Limited Rust exposure"}','Interviewing','Senior Staff Engineer','Excellent DX leadership signal.','[{"label":"liamh.dev","url":"#"}]','LH','liam@mail.co'),
  ('C-8790','Anika Sharma','Product Designer','Notion','Toronto, CA',5,86,'{"Figma","Editorial","Micro-interactions"}','{"Editorial systems","Fast iteration"}','{"No leadership scope yet"}','New','Senior Product Designer','Recommend screen call.','[{"label":"anika.co","url":"#"}]','AS','anika@mail.co'),
  ('C-8785','David Grant','ML Engineer','Anthropic','SF Bay Area',4,89,'{"PyTorch","Embeddings","RAG","Python"}','{"LLM productization"}','{"Limited ranking systems experience"}','Screening','Machine Learning Engineer','Aligns tightly with our ranking roadmap.','[{"label":"github.com/dgrant","url":"#"}]','DG','david@mail.co'),
  ('C-8779','Priya Patel','Frontend Engineer','Figma','Remote · IN',6,83,'{"React","TanStack","Vite","TS"}','{"Design engineer profile"}','{"No SSR-at-scale experience"}','New','Frontend Engineer, Platform','Rare design-engineer bridge.','[{"label":"priya.dev","url":"#"}]','PP','priya@mail.co'),
  ('C-8770','Jonas Weber','Full-stack Engineer','Independent','Munich, DE',7,74,'{"Next.js","Postgres","tRPC"}','{"Ships fast"}','{"Less depth on infra"}','Rejected','Senior Staff Engineer','Solid generalist, role favors distributed systems.','[{"label":"jonasw.dev","url":"#"}]','JW','jonas@mail.co')
on conflict (id) do nothing;

insert into public.applications (id,candidate_id,job_title,company,logo,applied_on,stage,progress,match_score,next_step) values
  ('APP-2201','22222222-2222-2222-2222-222222222222','Senior Product Designer','Linear','LN','Oct 12','Interview',60,96,'Portfolio review · Oct 18, 2:00 PM'),
  ('APP-2189','22222222-2222-2222-2222-222222222222','Product Designer','Vercel','▲','Oct 08','Screening',30,89,'Recruiter call · scheduling'),
  ('APP-2178','22222222-2222-2222-2222-222222222222','Design Lead','Stripe','S','Oct 04','Offer',90,93,'Offer review · Oct 20'),
  ('APP-2163','22222222-2222-2222-2222-222222222222','Senior Designer','Notion','N','Sep 28','Rejected',100,71,null),
  ('APP-2140','22222222-2222-2222-2222-222222222222','Staff Designer','Figma','F','Sep 20','Applied',10,84,null)
on conflict (id) do nothing;

insert into public.job_matches (id,candidate_id,title,company,location,salary,match_score,posted_ago,skills,reason,logo) values
  ('M-1','22222222-2222-2222-2222-222222222222','Senior Product Designer','Linear','Remote · US','$190k – $230k',96,'1 day ago','{"Figma","Systems","Motion"}','9/10 skills match.','LN'),
  ('M-2','22222222-2222-2222-2222-222222222222','Design Lead','Stripe','Remote · Global','$220k – $280k',93,'2 days ago','{"Leadership","Payments"}','Leadership scope matches your experience.','S'),
  ('M-3','22222222-2222-2222-2222-222222222222','Product Designer','Vercel','Remote · EU','$170k – $210k',89,'3 days ago','{"React","DX","Docs"}','Design-engineer bridge — strong fit.','▲'),
  ('M-4','22222222-2222-2222-2222-222222222222','Senior Designer','Notion','New York, NY','$180k – $220k',86,'5 days ago','{"Editorial","Systems"}','Editorial craft matches your case studies.','N'),
  ('M-5','22222222-2222-2222-2222-222222222222','Staff Designer','Figma','San Francisco','$210k – $260k',84,'1 week ago','{"Tooling"}','Portfolio depth in top 8%.','F')
on conflict (id) do nothing;

insert into public.notifications (id,user_id,title,time,type) values
  ('n1','11111111-1111-1111-1111-111111111111','Sarah Chen advanced to Final Round','12m ago','candidate'),
  ('n2','11111111-1111-1111-1111-111111111111','3 new matches for Senior Staff Engineer','1h ago','match'),
  ('n3','11111111-1111-1111-1111-111111111111','Interview with Marcus Thorne · Tomorrow 2:00 PM','3h ago','interview'),
  ('cn1','22222222-2222-2222-2222-222222222222','New match: Senior Product Designer at Linear (96%)','5m ago','match'),
  ('cn2','22222222-2222-2222-2222-222222222222','Interview scheduled with Linear · Oct 18','2h ago','interview'),
  ('cn3','22222222-2222-2222-2222-222222222222','Offer received from Stripe','1d ago','offer')
on conflict (id) do nothing;

insert into public.skill_radar (candidate_id,skill,you,target) values
  ('22222222-2222-2222-2222-222222222222','React',92,90),
  ('22222222-2222-2222-2222-222222222222','TypeScript',88,90),
  ('22222222-2222-2222-2222-222222222222','Systems Design',68,85),
  ('22222222-2222-2222-2222-222222222222','Leadership',74,80),
  ('22222222-2222-2222-2222-222222222222','Testing',60,75),
  ('22222222-2222-2222-2222-222222222222','Perf',71,80)
on conflict do nothing;

insert into public.roadmap (id,candidate_id,week,title,detail,done,ord) values
  ('r1','22222222-2222-2222-2222-222222222222','Week 1','Systems Design foundations','Read DDIA ch. 1–3.',true,1),
  ('r2','22222222-2222-2222-2222-222222222222','Week 2','Leadership case studies','Draft 3 STAR-format stories.',true,2),
  ('r3','22222222-2222-2222-2222-222222222222','Week 3','Testing depth','Ship 1 OSS PR with meaningful tests.',false,3),
  ('r4','22222222-2222-2222-2222-222222222222','Week 4','Mock interview loop','Complete 4 AI mock interviews.',false,4)
on conflict (id) do nothing;

insert into public.analytics_metrics (label,value,delta,positive) values
  ('Time to hire','18d','-4d',true),
  ('Offer acceptance','92%','+5%',true),
  ('Applicants / role','68','+12',true),
  ('Interview → offer','34%','-2%',false)
on conflict (label) do update set value=excluded.value, delta=excluded.delta, positive=excluded.positive;

insert into public.funnel (stage,count,ord) values
  ('Applied',820,1),('Screened',412,2),('Interview',168,3),('Final',62,4),('Offer',24,5)
on conflict (stage) do update set count=excluded.count;

insert into public.hiring_trend (month,hires,applications,ord) values
  ('May',6,240,1),('Jun',8,310,2),('Jul',12,380,3),('Aug',9,420,4),('Sep',14,510,5),('Oct',11,480,6)
on conflict (month) do update set hires=excluded.hires, applications=excluded.applications;

-- ---------------------------------------------------------------------------
-- Interviews + question bank (employer interviews page, candidate mock loop)
-- ---------------------------------------------------------------------------
create table if not exists public.interviews (
  id text primary key,
  candidate_name text,
  role text,
  type text,
  round text,
  scheduled_at timestamptz
);
alter table public.interviews enable row level security;
grant all on public.interviews to service_role;

create table if not exists public.interview_questions (
  id bigserial primary key,
  category text not null check (category in ('behavioral','technical','system')),
  question text not null,
  role text,
  ord int default 0
);
alter table public.interview_questions enable row level security;
grant all on public.interview_questions to service_role;

-- ---------------------------------------------------------------------------
-- Auto-apply agent (candidate)
-- ---------------------------------------------------------------------------
create table if not exists public.auto_apply_settings (
  user_id uuid primary key,
  enabled boolean not null default false,
  min_score int not null default 85,
  daily_limit int not null default 5,
  updated_at timestamptz default now()
);
alter table public.auto_apply_settings enable row level security;
grant all on public.auto_apply_settings to service_role;

create table if not exists public.auto_apply_log (
  id text primary key,
  user_id uuid not null,
  job_title text,
  company text,
  match_score int,
  status text not null default 'applied',
  reason text,
  created_at timestamptz not null default now()
);
create index if not exists auto_apply_log_user_idx
  on public.auto_apply_log (user_id, created_at desc);
alter table public.auto_apply_log enable row level security;
grant all on public.auto_apply_log to service_role;

-- Auto-apply writes applications on behalf of a candidate.
alter table public.applications add column if not exists user_id uuid;

-- ---------------------------------------------------------------------------
-- Job Hunt agent (candidate) — replaces the older auto_apply_* tables
-- ---------------------------------------------------------------------------
create table if not exists public.job_hunt_settings (
  user_id uuid primary key,
  enabled boolean not null default false,
  mode text not null default 'review',          -- 'review' | 'auto'
  min_score int not null default 75,
  daily_limit int not null default 5,
  titles text[] not null default '{}',
  locations text[] not null default '{}',
  remote_only boolean not null default false,
  use_resume boolean not null default true,
  use_portfolio boolean not null default true,
  use_github boolean not null default true,
  github_url text default '',
  portfolio_url text default '',
  updated_at timestamptz default now()
);
alter table public.job_hunt_settings enable row level security;
grant all on public.job_hunt_settings to service_role;

create table if not exists public.job_hunt_proposals (
  id text primary key,
  user_id uuid not null,
  job_id text,
  job_title text,
  company text,
  location text,
  match_score int,
  reason text,
  status text not null default 'pending',        -- pending | applied | denied
  created_at timestamptz not null default now()
);
create index if not exists job_hunt_proposals_user_idx
  on public.job_hunt_proposals (user_id, status, match_score desc);
alter table public.job_hunt_proposals enable row level security;
grant all on public.job_hunt_proposals to service_role;

create table if not exists public.job_hunt_log (
  id text primary key,
  user_id uuid not null,
  job_title text,
  company text,
  match_score int,
  status text not null default 'applied',        -- applied | denied | skipped
  reason text,
  created_at timestamptz not null default now()
);
create index if not exists job_hunt_log_user_idx
  on public.job_hunt_log (user_id, created_at desc);
alter table public.job_hunt_log enable row level security;
grant all on public.job_hunt_log to service_role;
