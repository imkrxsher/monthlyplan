create table public.projects (
  id uuid primary key default gen_random_uuid(),
  client_name text not null,
  email text,
  whatsapp text,
  service text not null,
  details text not null,
  deadline date,
  status text not null default 'todo' check (status in ('todo', 'wip', 'done')),
  result_url text,
  published boolean not null default false,
  created_at timestamptz not null default now()
);

alter table public.projects enable row level security;

create policy "Authenticated users can read projects"
  on public.projects for select
  to authenticated
  using (true);

create policy "Authenticated users can update projects"
  on public.projects for update
  to authenticated
  using (true)
  with check (true);

create policy "Public can read published projects"
  on public.projects for select
  to anon
  using (published = true and status = 'done');

insert into storage.buckets (id, name, public)
values ('project-results', 'project-results', true)
on conflict (id) do nothing;

create policy "Authenticated users can upload project results"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'project-results');

create policy "Public can read project results"
  on storage.objects for select
  to anon, authenticated
  using (bucket_id = 'project-results');
