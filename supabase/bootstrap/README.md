# Supabase bootstrap (fresh instance)

Use these files when the hosted database was deleted and you are standing up **self-hosted Supabase on Coolify**.

## Order of execution

1. `01_fresh_schema.sql` - schema + RLS + default questionnaire
2. `batches/questions_01.sql` - questionnaire question catalog
3. `batches/holland_seed.sql` - Holland scoring map
4. `batches/designation_01.sql` through `batches/designation_13.sql` - occupation statements

The batch files are idempotent and are the preferred seed source for a hosted
Supabase project or MCP-driven bootstrap.

Full instructions: [docs/database-setup-coolify.md](../../docs/database-setup-coolify.md)

## Skip on fresh install

- `01_create_questionnaires.sql` — conflicts with normalized schema
- `02_create_normalized_questionnaire_schema.sql` — superseded by `01_fresh_schema.sql`
- `03`–`07` — already incorporated in `01_fresh_schema.sql`
- `10_add_is_correct_and_step_to_questions.sql` — columns included in bootstrap
