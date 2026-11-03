# Implementation status

## Implemented

- Responsive application shell, route structure, dashboard and all requested primary modules.
- Coherent Nigerian demonstration records and derived dashboard/financial calculations.
- Global search without passport data, filters, notifications, mobile navigation and quick actions.
- Session-working forms for leads, customers (including historical), bookings, payments and travellers.
- Traveller records can optionally link to an existing customer profile while dependants remain traveller-only records.
- Customer and traveller tables show their explicit profile relationships; primary mock travellers are linked to their customer profiles.
- Package price snapshots, confirmed/reversed payment rules and separate supplier obligations.
- Supabase client/service boundary, PWA manifest and GitHub Pages workflow.

## Mocked

- All records, notifications and manual writes. Refreshing resets records.
- Demonstration operator identity.
- Google Drive links are sample references only.

## Partially implemented

- Tables provide search and status filters; full column sorting and server pagination await the data backend.
- Main creation flows work; complete edit/archive/convert/reversal/group-management detail workflows need persisted transactions.
- Traveller-to-customer links currently exist in the mock-data model only; they are not persisted to Supabase until the database schema and service layer are implemented.
- Authentication integration points exist, but real protected routes require Supabase Auth.

## Not configured

- Supabase schema, RLS, accounts, backups and database functions.
- Website submission endpoint, Google Drive API and Meta Conversions API.
- Production custom domain and DNS.

Before production, approve and deploy the schema, implement transactional lead conversion and financial reversals, connect authentication, verify all RLS policies, and complete a security review for sensitive traveller information.


## Customer and booking detail views
- Customer records now open a detail panel showing contact information, all bookings, travellers attached to those bookings, and the customer's full payment history (including pending and reversed entries).
- Booking records now open a detail panel showing the booking owner, agreed price, confirmed payments, outstanding balance, supplier, status, travelling party, and linked payment history.
- Booking creation validates the customer relationship and supports selecting an existing package or entering a custom arrangement. The agreed price remains the booking's own snapshot.
- Booking owner is intentionally fixed after creation. Changing it later would require a controlled transfer of associated payments and traveller relationships.
- Detail views use current mock store data and are not yet persisted across refreshes.
