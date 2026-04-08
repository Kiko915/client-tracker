alter table public.profiles enable row level security;
alter table public.projects enable row level security;
alter table public.project_updates enable row level security;

drop policy if exists "admin_profiles_all" on public.profiles;
create policy "admin_profiles_all"
on public.profiles
for all
to authenticated
using (true)
with check (true);

drop policy if exists "admin_projects_all" on public.projects;
create policy "admin_projects_all"
on public.projects
for all
to authenticated
using (true)
with check (true);

drop policy if exists "admin_updates_all" on public.project_updates;
create policy "admin_updates_all"
on public.project_updates
for all
to authenticated
using (true)
with check (true);

