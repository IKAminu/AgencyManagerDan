# Implementation status

## Implemented

- Responsive application shell, route structure, dashboard and all requested primary modules.
- Coherent Nigerian demonstration records and derived dashboard/financial calculations.
- Global search without passport data, filters, notifications, mobile navigation and quick actions.
- Session-working forms for leads, customers (including historical), bookings, payments and travellers.
- Traveller records can optionally link to an existing customer profile while dependants remain traveller-only records.
- Customer and traveller tables show their explicit profile relationships; primary mock travellers are linked to their customer profiles.
- Traveller operations include booking-specific family/group summaries, member counts, document-readiness totals and individual travel statuses. Each traveller retains their own name independently of an optional linked customer profile.
- Traveller document readiness is tracked separately from travel status.
- Payment confirmation validates the booking's remaining balance, including when confirming a previously pending payment.
- Payment and supplier transaction forms validate positive finite amounts and required transaction dates; supplier costs also validate their due date and optional booking reference.
- Supplier disbursement history records confirmed and voided payment records with a required reason; voiding an incorrect or failed record restores the related supplier obligation and recalculates its status.
- Recording a supplier payment from an individual supplier-cost row preselects that exact cost, reducing the risk of allocating money to the wrong obligation.
- The demonstration supplier ledger is seeded with sample payment entries that reconcile to the paid totals shown on its supplier costs.
- Lead conversion carries the latest edited contact details into the lead record and creates a linked customer only when one does not already exist for that lead.
- Customer payment history labels payment corrections as reversals, while supplier disbursement corrections are labelled as voided records.
- Traveller overview metrics are presented in responsive summary cards, with supporting descriptions and a distinct attention state.
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
