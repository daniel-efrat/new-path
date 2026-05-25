# Supabase bootstrap (fresh instance)

Use these files when the hosted database was deleted and you are standing up **self-hosted Supabase on Coolify**.

## Order of execution

1. `01_fresh_schema.sql` — schema + RLS + default questionnaire
2. `../migrations/08_add_step3_questions.sql`
3. `../migrations/09_add_step4_questions.sql`
4. `../migrations/11_create_designation_statements.sql`
5. `../../supabase_questions_upsert.sql` (repo root)
6. `npx tsx scripts/seed-holland-questions.mjs`

Full instructions: [docs/database-setup-coolify.md](../../docs/database-setup-coolify.md)

## Skip on fresh install

- `01_create_questionnaires.sql` — conflicts with normalized schema
- `02_create_normalized_questionnaire_schema.sql` — superseded by `01_fresh_schema.sql`
- `03`–`07` — already incorporated in `01_fresh_schema.sql`
- `10_add_is_correct_and_step_to_questions.sql` — columns included in bootstrap
