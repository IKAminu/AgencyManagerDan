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
- Lead and package status filters include all supported statuses, with explicit empty states when no package matches the current search or filter.
- Dashboard follow-up alerts now exclude converted, lost and not-interested leads; dashboard lists show clear empty states instead of blank sections.
- Header notifications are generated from current follow-ups, upcoming departures and overdue supplier costs rather than hardcoded demo messages; alerts navigate to the relevant module and can be dismissed with Escape.
- Mobile usability refinements improve table horizontal scrolling, touch target sizes, modal sizing and sticky form actions. These are responsive CSS changes and have not yet been manually tested on a physical phone.
- Operational date calculations and newly created record dates now use the Africa/Lagos calendar date, avoiding UTC date shifts around midnight.
- Payment and supplier-cost forms validate date values before saving; upcoming-departure dashboard counts exclude cancelled and completed bookings.
- New bookings can only select active packages with available places; package price, estimated cost and availability values are validated, and booking dates must be valid and ordered.
- Document links must use valid HTTPS URLs, and the related record reference is required. Links remain references only; files are not uploaded or permission-checked by the app.
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
