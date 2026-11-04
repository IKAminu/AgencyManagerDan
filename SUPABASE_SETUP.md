# Supabase operations and setup

Supabase is connected to the live Dandurgu Headquarters application. This document describes the current deployment rather than the original prototype plan.

## Current application connection

The browser application uses the Supabase JavaScript client with a public publishable key:

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_PUBLISHABLE_KEY`

For backward compatibility, `VITE_SUPABASE_ANON_KEY` is still accepted if the publishable-key variable is absent. Prefer the publishable key for new configuration.

Set these values in a local `.env.local` file for development and as GitHub Actions repository or environment variables for Pages deployment. Never commit real environment files or place a Supabase secret/service-role key in a `VITE_*` variable. Browser variables are public by design.

## Authentication and access

- Live access uses Supabase email/password authentication.
- The application checks an explicit authorised-account allowlist.
- Authenticator-based TOTP MFA is required; live data access requires AAL2.
- Database Row Level Security independently checks the authenticated role, AAL2 assurance, authorised email claim, and `is_demo = false`.
- Anonymous users have no direct table grants.
- Guest/demo mode uses bundled sample records and does not write to the live database. Notes created in Demo Mode are held only in the current browser session.

The frontend allowlist is a user-experience gate, not the security boundary. Supabase RLS is the database enforcement layer. Keep the frontend allowlist and database policies in agreement when authorised accounts change.

## Live data model

The live public schema currently contains the agency operations tables, including leads, customers, packages, bookings, travellers, payments, supplier costs, supplier payments, documents, suppliers, lead activities and the shared `agency_notes` workspace. All public tables must retain RLS.

The current policy grants live access only to the approved MFA accounts. Do not replace these policies with a generic `TO authenticated` policy: authenticated role membership alone is not sufficient authorisation.

## Deployment

The GitHub Actions workflow installs from the committed pnpm lockfile, runs TypeScript checks, builds the application, and deploys the static output to GitHub Pages.

After changing Supabase configuration variables, rerun the deployment workflow so the values are included in the browser build. The publishable key is safe to expose; a secret/service-role key is not.

## Operational safeguards and remaining work

- Keep a verified database backup schedule and periodically test restoration.
- Enable Supabase leaked-password protection in Authentication → Settings → Password Security.
- Review RLS policies and database advisors after schema changes.
- Schema changes should be reviewed and committed as SQL migrations. The remote database migration history includes the initial operations schema, the authorised-MFA RLS policy optimisation and the shared agency notes workspace. The applied migrations are preserved under `supabase/migrations`.
- The browser store currently loads records in pages and persists table snapshots. Deletions are serialised with pending saves, but multi-table writes are not atomic. A future server-side transactional persistence layer is recommended before introducing concurrent staff editing or complex workflows.

## Document handling

The app stores secure document links; it does not upload passport files or receipts to Google Drive. Do not use public links for passports, identity documents or other sensitive traveller information. Configure private storage and explicit access controls before adding file uploads.
