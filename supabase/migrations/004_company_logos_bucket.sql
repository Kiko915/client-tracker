insert into storage.buckets (id, name, public)
values ('company-logos', 'company-logos', true)
on conflict (id) do update set public = true;

drop policy if exists "public_read_company_logos" on storage.objects;
create policy "public_read_company_logos"
on storage.objects
for select
to public
using (bucket_id = 'company-logos');
