-- Enable necessary extensions
create extension if not exists "uuid-ossp";

-- Stories table
create table public.stories (
  id uuid default uuid_generate_v4() primary key,
  title text not null,
  author text not null,
  description text not null,
  cover_image_url text not null,
  audio_url text not null,
  tags text[] not null default '{}',
  is_premium boolean not null default false,
  duration_minutes integer not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Episodes table
create table public.episodes (
  id uuid default uuid_generate_v4() primary key,
  story_id uuid references public.stories(id) on delete cascade not null,
  title text not null,
  duration text not null,
  listens text not null default '0',
  is_premium boolean not null default false,
  episode_number integer not null,
  audio_url text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Categories table
create table public.categories (
  id uuid default uuid_generate_v4() primary key,
  title text not null,
  description text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Category stories junction table
create table public.category_stories (
  category_id uuid references public.categories(id) on delete cascade not null,
  story_id uuid references public.stories(id) on delete cascade not null,
  position integer not null default 0,
  primary key (category_id, story_id)
);

-- User profiles table (extends Supabase auth.users)
create table public.profiles (
  id uuid references auth.users on delete cascade primary key,
  email text not null,
  display_name text,
  photo_url text,
  subscription_tier text not null default 'free',
  stripe_customer_id text,
  is_admin boolean not null default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- User favorites table
create table public.user_favorites (
  user_id uuid references public.profiles(id) on delete cascade not null,
  story_id uuid references public.stories(id) on delete cascade not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  primary key (user_id, story_id)
);

-- User listening progress table
create table public.listening_progress (
  user_id uuid references public.profiles(id) on delete cascade not null,
  story_id uuid references public.stories(id) on delete cascade not null,
  episode_id uuid references public.episodes(id) on delete cascade,
  position_seconds integer not null default 0,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  primary key (user_id, story_id, episode_id)
);

-- Create indexes for better performance
create index idx_stories_tags on public.stories using gin (tags);
create index idx_stories_is_premium on public.stories (is_premium);
create index idx_episodes_story_id on public.episodes (story_id);
create index idx_category_stories_category_id on public.category_stories (category_id);
create index idx_user_favorites_user_id on public.user_favorites (user_id);
create index idx_listening_progress_user_id on public.listening_progress (user_id);

-- Row Level Security (RLS) policies
alter table public.stories enable row level security;
alter table public.episodes enable row level security;
alter table public.categories enable row level security;
alter table public.category_stories enable row level security;
alter table public.profiles enable row level security;
alter table public.user_favorites enable row level security;
alter table public.listening_progress enable row level security;

-- Public read access for stories, episodes, categories
create policy "Stories are viewable by everyone" on public.stories for select using (true);
create policy "Episodes are viewable by everyone" on public.episodes for select using (true);
create policy "Categories are viewable by everyone" on public.categories for select using (true);
create policy "Category stories are viewable by everyone" on public.category_stories for select using (true);

-- User profile policies
create policy "Public profiles are viewable by everyone" on public.profiles for select using (true);
create policy "Users can insert their own profile" on public.profiles for insert with check (auth.uid() = id);
create policy "Users can update their own profile" on public.profiles for update using (auth.uid() = id);

-- User favorites policies
create policy "Users can view their own favorites" on public.user_favorites for select using (auth.uid() = user_id);
create policy "Users can insert their own favorites" on public.user_favorites for insert with check (auth.uid() = user_id);
create policy "Users can delete their own favorites" on public.user_favorites for delete using (auth.uid() = user_id);

-- Listening progress policies
create policy "Users can view their own progress" on public.listening_progress for select using (auth.uid() = user_id);
create policy "Users can insert their own progress" on public.listening_progress for insert with check (auth.uid() = user_id);
create policy "Users can update their own progress" on public.listening_progress for update using (auth.uid() = user_id);

-- Function to handle user creation
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, display_name)
  values (new.id, new.email, new.raw_user_meta_data->>'display_name');
  return new;
end;
$$ language plpgsql security definer;

-- Trigger to create profile on user signup
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Function to update updated_at timestamp
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = timezone('utc'::text, now());
  return new;
end;
$$ language plpgsql;

-- Triggers for updated_at
create trigger handle_updated_at before update on public.stories
  for each row execute procedure public.handle_updated_at();
create trigger handle_updated_at before update on public.profiles
  for each row execute procedure public.handle_updated_at();