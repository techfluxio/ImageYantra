# ImageYantra Admin Panel — Setup Guide

Everything below is free to run. Total moving parts: **Supabase** (database +
auth + two small server functions) and **Vercel** (where your site already
deploys from `vercel.json`), plus a **GitHub token** so the admin panel can
commit new tool files.

---

## 1. Create the Supabase project

1. Go to [supabase.com](https://supabase.com) → New project (free tier: 500MB
   Postgres, Auth, 1GB storage — plenty for this site).
2. Once it's created, go to **SQL Editor → New query**, paste in the entire
   contents of `supabase/schema.sql`, and run it. This creates every table
   (categories, tools, blog_posts, footer_links, ad_placements, page_views,
   error_reports) with the right Row Level Security policies, and seeds your
   6 existing categories + 3 existing ad placements so nothing changes
   visually on day one.
3. Go to **Project Settings → API**. Copy:
   - `Project URL` → this is `VITE_SUPABASE_URL`
   - `anon` `public` key → this is `VITE_SUPABASE_ANON_KEY`

   Put both in your local `.env` (copy `.env.example` → `.env`) **and** in
   Vercel → your project → **Settings → Environment Variables** (so the
   deployed build has them too).

## 2. Create your admin login

Go to **Authentication → Users → Add user** in Supabase, create yourself an
email + password. That's the only account you need — every write to the
database requires being signed in as *some* authenticated user, so one
account is enough for a single-owner admin panel. Log in at `/admin/login`
with those credentials.

## 3. Deploy the two Edge Functions

These are the only two pieces that need real server-side secrets (a GitHub
token, the Vercel deploy hook URL) — everything else talks to Supabase
straight from the browser.

```bash
npm install -g supabase          # if you don't have the CLI yet
supabase login
supabase link --project-ref YOUR_PROJECT_REF   # found in your project's URL
supabase functions deploy upload-tool
supabase functions deploy deploy-webhook        # optional, see step 6
```

Then set the secrets it needs:

```bash
supabase secrets set GITHUB_TOKEN=github_pat_xxxxxxxx
supabase secrets set GITHUB_REPO=your-username/imageyantra-frontend
supabase secrets set GITHUB_BRANCH=main
supabase secrets set VERCEL_DEPLOY_HOOK=https://api.vercel.com/v1/integrations/deploy/xxxxx
```

### Creating the GitHub token

GitHub → Settings → Developer settings → **Fine-grained personal access
tokens** → Generate new token → restrict it to **only this one repository**
→ under Repository permissions, set **Contents: Read and write**. Nothing
else. This token can only ever touch this one repo, and only file contents.

### Creating the Vercel Deploy Hook

Vercel → your project → **Settings → Git → Deploy Hooks** → give it a name
(e.g. "admin-panel-rebuild") → choose the `main` branch → Create. Copy the
URL it gives you — that's `VERCEL_DEPLOY_HOOK`.

## 4. The commit workflow

By default, `upload-tool` commits straight to `main` and immediately
triggers a rebuild. This is safe in practice because Vercel's deploys are
atomic — if an uploaded tool file has a syntax error and the build fails,
**Vercel keeps serving the last successful deployment**; your site doesn't
go down, the new tool just doesn't appear until the file is fixed and
re-uploaded. If you'd rather review each upload before it goes live, change
`GITHUB_BRANCH` to a staging branch, have that branch auto-deploy to a
Vercel Preview URL, and manually hit the Deploy Hook (or merge to `main`)
once you've checked it.

## 5. Rebuild frequency & free-tier limits

Content edits (tool text, blog posts, ad on/off, footer links) show up
**instantly** without any rebuild — the site reads Supabase directly at
runtime. Rebuilds are only needed for real static HTML (better SEO) and for
brand-new code (uploaded tools, new categories getting their own
prerendered page). `package.json`'s `prebuild` script pulls a fresh
snapshot of your Supabase content into the build every time, so whenever a
rebuild does happen, it picks up everything that's changed.

Vercel's free (Hobby) plan includes 6,000 build-minutes/month, which is a
lot of headroom for a site this size — but if you're making many small
edits in a row, it's worth batching them before manually triggering a
rebuild rather than firing the Deploy Hook on every keystroke.

## 6. (Optional) Close the "Building…" status loop

The admin Tools screen shows "Building…" for a freshly uploaded tool until
its `build_status` flips to `live`. Nothing does that automatically unless
you wire up `deploy-webhook`: in Vercel, go to **Account/Team Settings →
Webhooks → Add Webhook**, event `deployment.succeeded`, URL:

```
https://YOUR_PROJECT_REF.supabase.co/functions/v1/deploy-webhook?secret=YOUR_SECRET
```

(and run `supabase secrets set DEPLOY_WEBHOOK_SECRET=YOUR_SECRET` to match).
If you skip this, everything still works — the status badge just won't
update itself; you can flip a tool's `build_status` to `live` by hand in
Supabase's table editor if you want it accurate.

## 7. What you get without doing any of this

If you never touch Supabase at all, the site behaves **exactly as it does
today** — every live-data fetch fails gracefully and every page falls back
to the bundled static data, ad rail placeholders show as before, and the
admin panel simply won't be able to log in. Nothing about the public site's
current behavior depends on this setup existing.

---

## Quick reference — what's admin-manageable vs. what still needs a developer

| Task | Needs a developer? |
|---|---|
| Add/edit/delete a tool in an existing category | No |
| Create a brand-new category | No — gets a real page + shows in navigation automatically |
| Turn an ad placement on/off, change its slot ID | No |
| Register a **new** placement at an already-wired code location | No |
| Add an ad slot to a **brand-new spot** on a page that has none | **Yes** — one line of code (`<AdBanner placement="..." />`), then it's fully admin-manageable |
| Add a new working tool via code upload | No wiring needed — but the `.jsx` file itself must contain real working logic, written by you or a developer |
| Edit blog posts / footer links | No |
