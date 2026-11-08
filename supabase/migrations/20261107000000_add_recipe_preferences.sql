-- Recipe preferences from the profile interview. Ingredient values are platewise-api ingredient keys.
alter table public.profiles
    add column cuisines text[] not null default '{}',
    add column proteins text[] not null default '{}',
    add column disliked_ingredients text[] not null default '{}';
