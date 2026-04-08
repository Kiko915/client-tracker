insert into public.projects (name, slug, client_name, status)
values ('Demo Website Redesign', 'demo-website-redesign', 'Demo Client', 'in_progress')
on conflict (slug) do nothing;
