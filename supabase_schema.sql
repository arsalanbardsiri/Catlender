-- Create the tasks table
create table tasks (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  text text not null,
  date text not null, -- Format: YYYY-MM-DD
  completed boolean default false,
  user_id uuid references auth.users(id) default auth.uid()
);

-- Enable Row Level Security (RLS)
-- This is CRITICAL. It ensures users can only see their OWN tasks.
alter table tasks enable row level security;

-- Policy: Users can view their own tasks
create policy "Users can view their own tasks"
  on tasks for select
  using (auth.uid() = user_id);

-- Policy: Users can insert their own tasks
create policy "Users can insert their own tasks"
  on tasks for insert
  with check (auth.uid() = user_id);

-- Policy: Users can update their own tasks
create policy "Users can update their own tasks"
  on tasks for update
  using (auth.uid() = user_id);

-- Policy: Users can delete their own tasks
create policy "Users can delete their own tasks"
  on tasks for delete
  using (auth.uid() = user_id);
