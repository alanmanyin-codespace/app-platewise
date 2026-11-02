-- Profiles belong to the authenticated user. Sign-in creates the row on the
-- client after checking for an existing profile; existing preferences are never
-- overwritten by provider metadata on subsequent sign-ins.
create table public.profiles (
    id uuid primary key references auth.users(id) on delete cascade,
    display_name text not null default '',
    household_size integer check (household_size is null or household_size > 0),
    savings_goal text,
    allergies text[] not null default '{}',
    dietary_preferences text[] not null default '{}',
    meal_planning_preferences text[] not null default '{}',
    preferred_stores text[] not null default '{}',
    onboarding_complete boolean not null default false,
    updated_at timestamptz not null default now()
);

alter table public.profiles enable row level security;
grant select, insert, update on public.profiles to authenticated;
create policy "Users can read their profile" on public.profiles
    for select to authenticated using ((select auth.uid()) = id);
create policy "Users can create their profile" on public.profiles
    for insert to authenticated with check ((select auth.uid()) = id);
create policy "Users can update their profile" on public.profiles
    for update to authenticated using ((select auth.uid()) = id)
    with check ((select auth.uid()) = id);
