-- Resources Table Setup for Supabase
-- Run this in Supabase Dashboard → SQL Editor → New Query

-- 1. Create the resources table
create table if not exists resources (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  description text not null,
  url text not null,
  category text default 'tutorial' check (category in ('tutorial', 'guide', 'code', 'tool')),
  difficulty text default 'beginner' check (difficulty in ('beginner', 'intermediate', 'advanced')),
  duration text,
  thumbnail text,
  tags text[],
  author text,
  published_at timestamptz default now(),
  views int default 0,
  rating numeric default 0,
  is_featured boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- 2. Enable RLS for resources table
alter table resources enable row level security;

-- 3. Add RLS policies
-- Public can read all resources
do $$ begin
  if not exists (select 1 from pg_policies where tablename='resources' and policyname='Public Read Resources') then
    create policy "Public Read Resources" on resources for select using (true);
  end if;
end $$;

-- Only authenticated users can insert resources
do $$ begin
  if not exists (select 1 from pg_policies where tablename='resources' and policyname='Authenticated Insert Resources') then
    create policy "Authenticated Insert Resources" on resources for insert with check (auth.role() = 'authenticated');
  end if;
end $$;

-- Only authenticated users can update resources
do $$ begin
  if not exists (select 1 from pg_policies where tablename='resources' and policyname='Authenticated Update Resources') then
    create policy "Authenticated Update Resources" on resources for update using (auth.role() = 'authenticated');
  end if;
end $$;

-- 4. Create indexes for better performance
create index if not exists idx_resources_category on resources(category);
create index if not exists idx_resources_difficulty on resources(difficulty);
create index if not exists idx_resources_featured on resources(is_featured);
create index if not exists idx_resources_published on resources(published_at desc);

-- 5. Add trigger for updated_at
create or replace function update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

do $$ begin
  if not exists (select 1 from pg_trigger where tgname = 'set_resources_updated_at') then
    create trigger set_resources_updated_at
      before update on resources
      for each row execute function update_updated_at_column();
  end if;
end $$;

-- 6. Enable realtime for resources (optional, for live updates)
-- Uncomment the line below if you want realtime updates:
-- alter publication supabase_realtime add table resources;

-- 7. Insert some sample data
insert into resources (title, description, url, category, difficulty, duration, tags, author) values
('React Hooks Guide', 'Learn how to use React hooks effectively', 'https://react.dev/reference/react', 'tutorial', 'intermediate', '30 minutes', '{"react", "hooks"}', 'React Team'),
('JavaScript ES6+ Features', 'Modern JavaScript features you should know', 'https://developer.mozilla.org/en-US/docs/Web/JavaScript', 'guide', 'beginner', '45 minutes', '{"javascript", "es6"}', 'MDN'),
('CSS Grid Layout', 'Master CSS Grid for modern layouts', 'https://css-tricks.com/snippets/css/complete-guide-grid/', 'tutorial', 'intermediate', '20 minutes', '{"css", "grid"}', 'CSS Tricks'),
('Git Best Practices', 'Essential Git practices for developers', 'https://git-scm.com/book/en/v2', 'guide', 'beginner', '15 minutes', '{"git", "version-control"}', 'Git Team'),
('Node.js API Development', 'Build RESTful APIs with Node.js', 'https://nodejs.org/en/docs/', 'code', 'advanced', '60 minutes', '{"nodejs", "api"}', 'Node.js Foundation'),
('VS Code Extensions', 'Must-have VS Code extensions for developers', 'https://marketplace.visualstudio.com/', 'tool', 'beginner', '10 minutes', '{"vscode", "tools"}', 'Microsoft'),
('Docker Basics', 'Introduction to containerization with Docker', 'https://docs.docker.com/get-started/', 'tutorial', 'beginner', '30 minutes', '{"docker", "containers"}', 'Docker Team'),
('TypeScript Fundamentals', 'Learn TypeScript from scratch', 'https://www.typescriptlang.org/docs/', 'guide', 'intermediate', '40 minutes', '{"typescript", "javascript"}', 'Microsoft'),
('Web Performance Optimization', 'Optimize your web applications for speed', 'https://web.dev/fast/', 'guide', 'advanced', '25 minutes', '{"performance", "web"}', 'Google'),
('Accessibility in Web Development', 'Make your websites accessible to everyone', 'https://www.w3.org/WAI/fundamentals/accessibility-intro/', 'tutorial', 'intermediate', '35 minutes', '{"accessibility", "a11y"}', 'W3C');