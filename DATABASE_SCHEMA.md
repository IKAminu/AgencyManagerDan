# Proposed database schema

This schema is a proposal and has not been deployed.

Core tables use UUID primary keys and `created_at`/`updated_at` timestamps:

- `leads`: readable unique reference, contact/enquiry fields, status, follow-up, source and optional Meta attribution fields.
- `lead_activities`: lead FK, note/type, actor and timestamp.
- `customers`: unique reference, contact details, optional originating lead FK, historical flag.
- `packages`: unique package code, commercial fields, dates, availability and status.
- `bookings`: unique reference, customer FK, optional package FK, immutable package-name/code snapshots, agreed price, dates and status.
- `traveller_groups`: booking FK, name, type and optional leader traveller FK.
- `travellers`: booking FK, optional group FK, personal and sensitive passport fields, travel status.
- `payments`: booking/customer FKs, amount, date, method and immutable lifecycle status. Corrections use reversal/adjustment records.
- `suppliers`, `supplier_costs`, `supplier_payments`: separate operational cost ledger.
- `documents`: polymorphic related record type/UUID, Drive URL and metadata.

Constraints should enforce positive monetary values, logical date ranges, allowed statuses and unique readable references. Index references, names, phone numbers, booking/customer FKs, travel dates, follow-up dates and payment dates.

RLS should deny anonymous access and allow only explicitly authorised authenticated accounts. Sensitive traveller columns should be exposed through a restricted view or tightly controlled query path. Reference generation and lead conversion should run in database functions/transactions using database time, collision-safe suffixes and idempotency keys.
