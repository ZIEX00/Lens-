drop policy if exists "Allow public review audio uploads" on storage.objects;
drop policy if exists "Allow public review audio reads" on storage.objects;
drop policy if exists "Allow public review image uploads" on storage.objects;
drop policy if exists "Allow public review image reads" on storage.objects;
drop policy if exists "Allow dashboard review file deletes" on storage.objects;

create policy "Allow public review audio uploads"
on storage.objects
for insert
to anon
with check (
  bucket_id = 'lens'
  and (storage.foldername(name))[1] = 'reviews'
  and lower(storage.extension(name)) = 'webm'
);

create policy "Allow public review audio reads"
on storage.objects
for select
to anon
using (bucket_id = 'lens');

create policy "Allow public review image uploads"
on storage.objects
for insert
to anon
with check (
  bucket_id = 'lens'
  and (storage.foldername(name))[1] = 'reviews'
  and (storage.foldername(name))[2] in ('photos', 'flags')
  and lower(storage.extension(name)) in ('jpg', 'jpeg', 'png', 'webp')
);

create policy "Allow public review image reads"
on storage.objects
for select
to anon
using (bucket_id = 'lens' and (storage.foldername(name))[1] = 'reviews');

create policy "Allow dashboard review file deletes"
on storage.objects
for delete
to anon
using (bucket_id = 'lens' and (storage.foldername(name))[1] = 'reviews');