insert into storage.buckets (id, name, public)
values ('timeline-media', 'timeline-media', true)
on conflict (id) do update set public = true;

drop policy if exists "public_read_timeline_media" on storage.objects;
create policy "public_read_timeline_media"
on storage.objects
for select
to public
using (bucket_id = 'timeline-media');
