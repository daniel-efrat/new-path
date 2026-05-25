# Database setup: Supabase on Coolify (Hostinger VPS)

This guide recreates the **new-path** database on a fresh self-hosted Supabase instance deployed via [Coolify](https://coolify.io) on your Hostinger VPS.

## What you are restoring

| Area | Tables / data |
|------|----------------|
| Questionnaire flow | `questionnaires`, `questions`, `questionnaire_submissions`, `answers` |
| Step unlock state | `user_questionnaire_progress` |
| Holland (RIASEC) | `holland_questions`, `holland_results` |
| Occupation statements (step 12) | `designation_statements`, `user_designation_choices` |
| Auth | Supabase `auth.users` (managed by GoTrue) |

The app expects questionnaire id `fbbee5e5-33c0-4b73-8514-0407633e05a2` (inserted by bootstrap SQL).

---

## Part 1 — Deploy Supabase in Coolify

1. In Coolify, add a new resource → **Supabase** (official template / one-click).
2. Set a public domain for the API gateway (Kong), e.g. `https://supabase.yourdomain.com`.
3. After deploy, open the service **Environment** and note:
   - `SERVICE_FQDN_SUPABASEKONG` — public API URL (use as `NEXT_PUBLIC_SUPABASE_URL`)
   - `SERVICE_PASSWORD_JWT` — JWT signing secret (same as `GOTRUE_JWT_SECRET`)
   - `SERVICE_SUPABASEANON_KEY` / `SERVICE_SUPABASESERVICE_KEY` — if present, use them directly
4. Ensure ports **443/8000** are reachable and SSL is configured in Coolify.

If anon/service keys are missing or you rotated `SERVICE_PASSWORD_JWT`, regenerate keys from the repo root:

```bash
# PowerShell
$env:GOTRUE_JWT_SECRET="paste-SERVICE_PASSWORD_JWT-here"
node gen-keys.cjs
```

Copy the printed **ANON KEY** and **SERVICE ROLE KEY** into Coolify env vars and your app `.env.local`.

---

## Part 2 — Auth URLs (required for login)

In Coolify → Supabase stack → **Auth (GoTrue)** environment, set redirect URLs for your app:

| Variable | Example |
|----------|---------|
| `SITE_URL` | `https://new-path-test.vercel.app` or `http://localhost:3000` |
| `ADDITIONAL_REDIRECT_URLS` | `http://localhost:3000/auth/callback,https://new-path-test.vercel.app/auth/callback,https://new-path-test.vercel.app/auth/callback-client` |

For **Google OAuth**, configure the Google Cloud OAuth client with redirect URI:

`https://<your-supabase-domain>/auth/v1/callback`

Enable Email (magic link) and/or Google provider in Studio → Authentication → Providers.

---

## Part 3 — Run SQL migrations (Studio)

Open **Supabase Studio** on your instance → **SQL Editor**.

Run scripts **in this order** (each as one query; wait for success):

| # | File | Purpose |
|---|------|---------|
| 1 | `supabase/bootstrap/01_fresh_schema.sql` | All tables, RLS, default questionnaire |
| 2 | `supabase/migrations/08_add_step3_questions.sql` | English step 3 questions |
| 3 | `supabase/migrations/09_add_step4_questions.sql` | Career anchor step 4 questions |
| 4 | `supabase/migrations/11_create_designation_statements.sql` | ~3000 occupation statements (large; may take 1–2 min) |
| 5 | `supabase_questions_upsert.sql` | Steps 1–8 question bank |

Then reload the API schema cache (if Studio does not do it automatically):

```sql
NOTIFY pgrst, 'reload schema';
```

**Do not run** `supabase/migrations/01_create_questionnaires.sql` on a fresh DB — it conflicts with the normalized schema (see `02_create_normalized_questionnaire_schema.sql`).

---

## Part 4 — Seed Holland questions (local script)

Create `.env.local` from `.env.example` with your new Supabase URL and **service role** key.

```bash
npx tsx scripts/seed-holland-questions.mjs
```

This fills `holland_questions` with RIASEC types mapped in order R→I→A→S→E→C (30 questions).

---

## Part 5 — Wire the Next.js app

`.env.local` (and Vercel project settings):

```env
NEXT_PUBLIC_SUPABASE_URL=https://supabase.yourdomain.com
NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon-key>
SUPABASE_SERVICE_ROLE_KEY=<service-role-key>
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

Restart `npm run dev`. Verify:

1. Sign in (magic link or Google) → `/auth/callback`
2. Start questionnaire → submission row in `questionnaire_submissions`
3. Complete step 11 → row in `holland_results`
4. Step 12 → reads `designation_statements`

---

## Part 6 — Quick verification (SQL)

```sql
SELECT count(*) FROM questionnaires;
SELECT count(*) FROM questions;
SELECT count(*) FROM holland_questions;
SELECT count(*) FROM designation_statements;
```

Expected rough counts: `questionnaires` ≥ 1, `questions` hundreds, `holland_questions` = 30, `designation_statements` thousands.

---

## Troubleshooting

| Symptom | Fix |
|---------|-----|
| `relation "answers" does not exist` | Run `01_fresh_schema.sql` first |
| RLS errors on insert | User must be logged in; submissions must belong to `auth.uid()` |
| PostgREST schema cache stale | `NOTIFY pgrst, 'reload schema';` |
| Auth redirect mismatch | Add exact callback URLs to GoTrue `ADDITIONAL_REDIRECT_URLS` |
| Holland step fails | Run `seed-holland-questions.mjs`; check `holland_questions` count = 30 |
| Wrong JWT / 401 from API | Regenerate keys with `gen-keys.cjs` using current `SERVICE_PASSWORD_JWT` |

---

## Optional: connect via `psql`

From the VPS (or SSH tunnel to Postgres port if exposed):

```bash
psql "postgresql://postgres:<SERVICE_PASSWORD_POSTGRES>@<db-host>:5432/postgres" -f supabase/bootstrap/01_fresh_schema.sql
```

Use Coolify’s internal hostname for `supabase-db` when running from the same Docker network.
