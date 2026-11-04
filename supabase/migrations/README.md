# Supabase migrations

SQL migrations in this folder are applied to the live Supabase project and committed here for reproducibility.

Current recorded migrations:

- `20261103211226_create_agency_operations_schema.sql` — core agency operations tables.
- `20261104134844_optimize_authorized_mfa_rls_policies.sql` — authorised MFA access policies.
- `20261104153025_create_shared_agency_notes.sql` — shared Notes workspace for authorised agency operators.

Before applying a new migration, review its table relationships, constraints, indexes and Row Level Security policies. Keep the SQL file in version control and verify the migration history in Supabase after applying it. Never weaken the authorised-account and AAL2 requirements for live data.
