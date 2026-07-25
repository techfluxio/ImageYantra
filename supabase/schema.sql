-- ImageYantra admin backend schema.
-- Run this once in your Supabase project's SQL editor (Database → SQL Editor → New query).
-- Safe to re-run: every statement is guarded with IF NOT EXISTS / CREATE OR REPLACE.

-- ─────────────────────────────────────────────────────────────
-- 1. CATEGORIES
-- ─────────────────────────────────────────────────────────────
create table if not exists public.categories (
  id           uuid primary key default gen_random_uuid(),
  slug         text unique not null,        -- e.g. "image-tools" — used in the URL
  name         text not null,               -- e.g. "Image Tools"
  description  text default '',
  icon         text default 'sparkles',     -- lucide-react icon name
  color        text default 'purple',       -- one of the TONE keys in utils/tone.js
  sort_order   int default 0,
  created_at   timestamptz default now()
);

-- Seed the 6 categories that already exist in the codebase so nothing
-- changes visually on day one — the admin panel just starts managing them.
insert into public.categories (slug, name, description, icon, color, sort_order)
values
  ('image-tools',    'Image Tools',    'Compress, resize, crop, convert and edit images in seconds.', 'image',    'purple', 1),
  ('pdf-tools',       'PDF Tools',      'Merge, split, compress and transform PDF files effortlessly.', 'file-text','red',    2),
  ('exam-tools',      'Exam Tools',     'Official photo, signature and document specs for every major exam.', 'graduation-cap','green',3),
  ('id-photo-sizes',  'ID Photo Sizes', 'Passport, PAN and other official ID photo size specifications.', 'id-card',  'blue',   4),
  ('social-tools',    'Social Tools',   'Resize images to the exact size every social platform expects.', 'share-2',  'yellow', 5),
  ('other-tools',     'Other Tools',    'QR codes, color picking, text and data utilities.', 'grid',     'black',  6)
on conflict (slug) do nothing;

-- ─────────────────────────────────────────────────────────────
-- 2. TOOLS
-- ─────────────────────────────────────────────────────────────
create table if not exists public.tools (
  id               uuid primary key default gen_random_uuid(),
  slug             text unique not null,
  name             text not null,
  "desc"           text default '',
  category_slug    text references public.categories(slug) on delete set null,
  icon             text default 'file-output',
  seo_title        text default '',
  meta_description text default '',
  faqs             jsonb default '[]'::jsonb,   -- [{ q, a }]
  sort_order       int default 0,
  active           boolean default true,
  -- Populated only for tools added via the "upload code" flow. Points at the
  -- auto-discovered component so ToolPage.jsx's import.meta.glob can find it.
  component_path   text,
  build_status     text default 'live',         -- 'live' | 'pending_build' | 'build_failed'
  created_at       timestamptz default now(),
  updated_at       timestamptz default now()
);

-- ─────────────────────────────────────────────────────────────
-- 3. BLOG POSTS
-- ─────────────────────────────────────────────────────────────
create table if not exists public.blog_posts (
  id           uuid primary key default gen_random_uuid(),
  slug         text unique not null,
  title        text not null,
  excerpt      text default '',
  body         text default '',
  category     text default 'Image',
  author       text default 'ImageYantra Team',
  read_time    int default 4,
  published    boolean default true,
  date         date default current_date,
  created_at   timestamptz default now(),
  updated_at   timestamptz default now()
);

-- ─────────────────────────────────────────────────────────────
-- 4. FOOTER LINKS
-- ─────────────────────────────────────────────────────────────
create table if not exists public.footer_links (
  id           uuid primary key default gen_random_uuid(),
  group_name   text not null,       -- e.g. "Categories", "Popular Tools"
  group_sort   int default 0,
  label        text not null,
  url          text not null,
  external     boolean default false,
  sort_order   int default 0
);

-- ─────────────────────────────────────────────────────────────
-- 5. AD PLACEMENTS
--    `placement` must match a `placement="..."` prop already wired into
--    the code (<AdBanner placement="..." /> / <AdColumn placement="..." />).
--    A brand-new placement key here does nothing until a developer adds
--    that one line of code somewhere — the admin panel doesn't create
--    new ad locations on the page, only manages the pre-wired ones.
-- ─────────────────────────────────────────────────────────────
create table if not exists public.ad_placements (
  id           uuid primary key default gen_random_uuid(),
  placement    text unique not null,
  label        text not null,
  slot         text default '',
  ad_format    text default 'auto',   -- 'auto' | 'rectangle' | 'horizontal' | 'vertical'
  enabled      boolean default true
);

-- Pre-wired placements that already exist in the code today.
insert into public.ad_placements (placement, label, slot, ad_format, enabled) values
  ('tool-result-banner', 'Below tool results', '', 'horizontal', false),
  ('rail-top',           'Left rail — top square', '', 'rectangle', false),
  ('rail-bottom',        'Left rail — bottom square', '', 'rectangle', false)
on conflict (placement) do nothing;

-- ─────────────────────────────────────────────────────────────
-- 6. PAGE VIEWS  (fed by useAnalyticsBeacon.js on every route change)
-- ─────────────────────────────────────────────────────────────
create table if not exists public.page_views (
  id             bigint generated always as identity primary key,
  path           text not null,
  tool_slug      text,                 -- derived client-side from /tools/:slug, else null
  session_id     text,
  device_type    text,                 -- 'mobile' | 'tablet' | 'desktop'
  referrer_host  text,
  created_at     timestamptz default now()
);
create index if not exists page_views_created_at_idx on public.page_views (created_at);
create index if not exists page_views_tool_slug_idx on public.page_views (tool_slug);

-- ─────────────────────────────────────────────────────────────
-- 7. ERROR REPORTS ("glitches")
--    Deliberately narrow: no file content, no personal data. Just enough
--    to diagnose "Background Remove keeps failing on Safari".
-- ─────────────────────────────────────────────────────────────
create table if not exists public.error_reports (
  id             bigint generated always as identity primary key,
  tool_slug      text not null,
  message        text not null,        -- short error message / error.name
  user_agent     text,
  device_type    text,
  created_at     timestamptz default now()
);
create index if not exists error_reports_created_at_idx on public.error_reports (created_at);
create index if not exists error_reports_tool_slug_idx on public.error_reports (tool_slug);

-- ─────────────────────────────────────────────────────────────
-- ROW LEVEL SECURITY
--  - Site-content tables: anyone can read; only a signed-in admin can write.
--  - page_views / error_reports: anyone can INSERT (that's the whole point —
--    anonymous visitors send these), nobody can SELECT except an admin.
-- ─────────────────────────────────────────────────────────────
alter table public.categories    enable row level security;
alter table public.tools         enable row level security;
alter table public.blog_posts    enable row level security;
alter table public.footer_links  enable row level security;
alter table public.ad_placements enable row level security;
alter table public.page_views    enable row level security;
alter table public.error_reports enable row level security;

-- Public read policies
drop policy if exists "public read categories" on public.categories;
create policy "public read categories" on public.categories for select using (true);
drop policy if exists "public read tools" on public.tools;
create policy "public read tools" on public.tools for select using (true);
drop policy if exists "public read blog" on public.blog_posts;
create policy "public read blog" on public.blog_posts for select using (true);
drop policy if exists "public read footer" on public.footer_links;
create policy "public read footer" on public.footer_links for select using (true);
drop policy if exists "public read ads" on public.ad_placements;
create policy "public read ads" on public.ad_placements for select using (true);

-- Admin (any authenticated user — this project assumes a single owner
-- account, so "authenticated" == "the admin") write policies
drop policy if exists "admin write categories" on public.categories;
create policy "admin write categories" on public.categories for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');
drop policy if exists "admin write tools" on public.tools;
create policy "admin write tools" on public.tools for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');
drop policy if exists "admin write blog" on public.blog_posts;
create policy "admin write blog" on public.blog_posts for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');
drop policy if exists "admin write footer" on public.footer_links;
create policy "admin write footer" on public.footer_links for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');
drop policy if exists "admin write ads" on public.ad_placements;
create policy "admin write ads" on public.ad_placements for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

-- Analytics/error tables: public can insert only; only an admin can read/delete.
drop policy if exists "public insert page_views" on public.page_views;
create policy "public insert page_views" on public.page_views for insert with check (true);
drop policy if exists "admin read page_views" on public.page_views;
create policy "admin read page_views" on public.page_views for select using (auth.role() = 'authenticated');
drop policy if exists "admin delete page_views" on public.page_views;
create policy "admin delete page_views" on public.page_views for delete using (auth.role() = 'authenticated');

drop policy if exists "public insert error_reports" on public.error_reports;
create policy "public insert error_reports" on public.error_reports for insert with check (true);
drop policy if exists "admin read error_reports" on public.error_reports;
create policy "admin read error_reports" on public.error_reports for select using (auth.role() = 'authenticated');
drop policy if exists "admin delete error_reports" on public.error_reports;
create policy "admin delete error_reports" on public.error_reports for delete using (auth.role() = 'authenticated');