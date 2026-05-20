create policy "Owners can delete own venues"
  on venues for delete
  using (auth.uid() = owner_id);
