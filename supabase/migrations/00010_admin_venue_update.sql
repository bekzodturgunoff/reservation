-- Allow admins to view pending venues (SELECT only — no direct update access)
drop policy if exists "Admins can view all venues" on venues;
create policy "Admins can view all venues"
  on venues for select
  using (auth.uid() in (select id from profiles where role = 'admin'));
