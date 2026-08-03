
create policy "mentorship files mentors all" on storage.objects
  for all to authenticated
  using (bucket_id = 'mentorship-files' and public.is_mentor())
  with check (bucket_id = 'mentorship-files' and public.is_mentor());

create policy "mentorship files owner read" on storage.objects
  for select to authenticated
  using (bucket_id = 'mentorship-files' and (storage.foldername(name))[1] = auth.uid()::text);
