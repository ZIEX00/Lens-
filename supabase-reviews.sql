create table if not exists public.reviews (
    id uuid primary key default gen_random_uuid(),
    name text not null check (char_length(name) between 1 and 100),
    service text not null,
    country text default '',
    image_url text default '',
    flag_url text default '',
    message text default '',
    rating integer default 0 check (rating between 0 and 5),
    type text not null check (type in ('audio', 'written')),
    audio_url text default '',
    status text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
    created_at timestamptz not null default now(),
    reviewed_at timestamptz
);

alter table public.reviews add column if not exists country text default '';
alter table public.reviews add column if not exists image_url text default '';
alter table public.reviews add column if not exists flag_url text default '';

alter table public.reviews enable row level security;

drop policy if exists "Public can submit reviews" on public.reviews;
drop policy if exists "Public can read approved reviews" on public.reviews;
drop policy if exists "Dashboard can read reviews" on public.reviews;
drop policy if exists "Dashboard can moderate reviews" on public.reviews;
drop policy if exists "Dashboard can delete reviews" on public.reviews;

create policy "Public can submit reviews"
on public.reviews for insert to anon
with check (status = 'pending');

create policy "Public can read approved reviews"
on public.reviews for select to anon
using (status = 'approved');

create policy "Dashboard can read reviews"
on public.reviews for select to anon
using (true);

create policy "Dashboard can moderate reviews"
on public.reviews for update to anon
using (true)
with check (status in ('pending', 'approved', 'rejected'));

create policy "Dashboard can delete reviews"
on public.reviews for delete to anon
using (true);

drop policy if exists "Allow public review audio uploads" on storage.objects;
drop policy if exists "Allow public review audio reads" on storage.objects;
drop policy if exists "Allow public review image uploads" on storage.objects;
drop policy if exists "Allow public review image reads" on storage.objects;
drop policy if exists "Allow dashboard review file deletes" on storage.objects;

create policy "Allow public review audio uploads"
on storage.objects for insert to anon
with check (bucket_id = 'lens' and (storage.foldername(name))[1] = 'reviews' and lower(storage.extension(name)) = 'webm');

create policy "Allow public review audio reads"
on storage.objects for select to anon
using (bucket_id = 'lens');

create policy "Allow public review image uploads"
on storage.objects for insert to anon
with check (bucket_id = 'lens' and (storage.foldername(name))[1] = 'reviews' and (storage.foldername(name))[2] in ('photos', 'flags') and lower(storage.extension(name)) in ('jpg', 'jpeg', 'png', 'webp'));

create policy "Allow public review image reads"
on storage.objects for select to anon
using (bucket_id = 'lens' and (storage.foldername(name))[1] = 'reviews');

create policy "Allow dashboard review file deletes"
on storage.objects for delete to anon
using (bucket_id = 'lens' and (storage.foldername(name))[1] = 'reviews');
