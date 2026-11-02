# Supabase setup

Supabase is not connected in this repository.

1. Create a dedicated Supabase project.
2. Review `DATABASE_SCHEMA.md` and the proposed migration before applying anything.
3. Apply the approved migration in a controlled environment.
4. Enable email/password authentication and invite only the two authorised users. Do not enable public registration.
5. Review and test Row Level Security for every table with an authenticated test account.
6. Copy the project URL and public anonymous/publishable key into `.env.local`.
7. Keep service-role keys only in secure server-side functions.
8. Set `VITE_USE_MOCK_DATA=false` only after the service mappings match the deployed schema.
9. Test create, update, archive, conversion and financial reversal operations before using real records.
10. Configure database backups and perform a restoration test.

The current UI is a frontend demonstration. A login page alone would not protect data; Supabase Auth and RLS must enforce access.
