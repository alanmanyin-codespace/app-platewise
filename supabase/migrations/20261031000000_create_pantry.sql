-- Pantry inventory is scoped to a Supabase Auth user. Photos live in a
-- private Storage bucket; photo_path is the object name, not a public URL.
create table public.pantry_items (
    id uuid primary key default gen_random_uuid(),
    user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
    ingredient_id text not null check (ingredient_id ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
    name text not null check (char_length(btrim(name)) between 1 and 200),
    quantity numeric not null check (quantity > 0 and quantity <> 'NaN'::numeric and quantity <> 'Infinity'::numeric),
    unit text not null check (unit in ('g', 'kg', 'ml', 'l', 'piece')),
    photo_path text,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),
    constraint pantry_items_user_ingredient_unique unique (user_id, ingredient_id),
    constraint pantry_items_photo_owner check (
        photo_path is null or (
            split_part(photo_path, '/', 1) = user_id::text
            and length(split_part(photo_path, '/', 2)) > 0
        )
    )
);

alter table public.pantry_items enable row level security;
grant select, insert, update, delete on public.pantry_items to authenticated;

create policy "Users can read their pantry" on public.pantry_items
    for select to authenticated using ((select auth.uid()) = user_id);
create policy "Users can add to their pantry" on public.pantry_items
    for insert to authenticated with check ((select auth.uid()) = user_id);
create policy "Users can update their pantry" on public.pantry_items
    for update to authenticated using ((select auth.uid()) = user_id)
    with check ((select auth.uid()) = user_id);
create policy "Users can delete from their pantry" on public.pantry_items
    for delete to authenticated using ((select auth.uid()) = user_id);

create function public.set_pantry_updated_at() returns trigger
language plpgsql set search_path = '' as $$
begin
    new.updated_at = now();
    return new;
end;
$$;

create trigger pantry_items_set_updated_at
    before update on public.pantry_items
    for each row execute function public.set_pantry_updated_at();

-- Objects are named <auth user UUID>/<file name>. A row deletion does not
-- delete the corresponding Storage object; the client must clean it up.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('pantry-photos', 'pantry-photos', false, 1048576, array['image/jpeg']);

create policy "Users can read their pantry photos" on storage.objects
    for select to authenticated using (
        bucket_id = 'pantry-photos' and (storage.foldername(name))[1] = (select auth.uid())::text
    );
create policy "Users can upload their pantry photos" on storage.objects
    for insert to authenticated with check (
        bucket_id = 'pantry-photos' and (storage.foldername(name))[1] = (select auth.uid())::text
    );
create policy "Users can update their pantry photos" on storage.objects
    for update to authenticated using (
        bucket_id = 'pantry-photos' and (storage.foldername(name))[1] = (select auth.uid())::text
    ) with check (
        bucket_id = 'pantry-photos' and (storage.foldername(name))[1] = (select auth.uid())::text
    );
create policy "Users can delete their pantry photos" on storage.objects
    for delete to authenticated using (
        bucket_id = 'pantry-photos' and (storage.foldername(name))[1] = (select auth.uid())::text
    );
