create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  created_at timestamptz not null default now()
);

create table if not exists public.projects (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  client_name text not null,
  status text not null check (status in ('planning', 'in_progress', 'on_hold', 'done')),
  share_token uuid not null unique default gen_random_uuid(),
  created_at timestamptz not null default now()
);

create table if not exists public.project_updates (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  title text not null,
  body text not null,
  progress_percent int not null check (progress_percent between 0 and 100),
  image_url text,
  created_at timestamptz not null default now()
);

create index if not exists idx_project_updates_project_id on public.project_updates(project_id);
create index if not exists idx_projects_share_token on public.projects(share_token);
