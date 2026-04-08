alter table public.project_updates
add column if not exists media jsonb not null default '[]'::jsonb;

-- Backfill from legacy image_url into media array
update public.project_updates
set media = jsonb_build_array(
  jsonb_build_object('type', 'image', 'url', image_url)
)
where image_url is not null
  and trim(image_url) <> ''
  and coalesce(jsonb_array_length(media), 0) = 0;
