import { useMemo, useState } from 'react'
import { ArrowDown, ArrowLeft, ArrowRight, BookOpen, CheckCircle2, ChevronDown, CircleHelp, ClipboardCheck, FileText, Info, Search, ShieldCheck, Sparkles, StickyNote, Wallet, Users, Plane, Package, CalendarCheck, CreditCard, Building2 } from 'lucide-react'
import { Link } from 'react-router'

type Step = { title: string; detail: string; screen?: string }
type ManualSection = { id: string; title: string; subtitle: string; keywords: string; icon: typeof BookOpen; purpose: string; steps: Step[]; automation: string[]; manual: string[]; impact: string[]; warning?: string }

const sections: ManualSection[] = [
  {
    id: 'dashboard', title: 'Dashboard', subtitle: 'Start each working day here', keywords: 'dashboard alerts overview metrics notifications lead follow up supplier overdue departures',
    icon: ClipboardCheck, purpose: 'The Dashboard is your control room. It summarises what is happening across leads, bookings, customer payments and travel operations. It is a reading and navigation screen, not the place to edit the underlying records.',
    steps: [
      { title: 'Open Dashboard', detail: 'Choose Dashboard at the top of the left navigation. On a phone, tap the menu icon first, then Dashboard.' },
      { title: 'Read the summary cards', detail: 'Review the counts and amounts for bookings, deposits, balances and upcoming travel. Treat these as a quick signal, then open the relevant module to inspect the actual records.' },
      { title: 'Open an alert', detail: 'Use the notifications bell in the top bar. Select an alert to jump to the module where the source record is kept.' },
      { title: 'Correct the source record', detail: 'For a late lead response, open Leads and update the lead. For a departure, open Bookings or Travellers. For supplier arrears, open Supplier payments. The dashboard refreshes from those records.' },
    ],
    automation: ['Follow-up alerts are calculated from the lead follow-up date and lead status.', 'Departure alerts are calculated from booking departure dates and booking status.', 'Supplier overdue alerts use the outstanding supplier balance and due date/status.', 'Dashboard totals are calculated from saved records; they are not separate values to type in.'],
    manual: ['Decide which alert needs action and contact the relevant customer or supplier.', 'Verify payments against bank or cash records. A dashboard balance is not proof that money arrived.'],
    impact: ['Changing the source lead, booking or supplier cost changes the figures and alerts that depend on it.', 'Do not try to correct a dashboard number directly. Find and correct the underlying record.'],
  },
  {
    id: 'leads', title: 'Leads: capture an enquiry and manage follow-ups', subtitle: 'From the first WhatsApp message to a qualified customer', keywords: 'lead add create new enquiry full name phone email service source campaign travel period group size followup contacted notes convert',
    icon: Users, purpose: 'A Lead is a potential customer enquiry. It records who contacted the agency, what they want, where the enquiry came from and what should happen next. It is not yet a booking.',
    steps: [
      { title: 'Open Leads', detail: 'Choose Leads in the Customers group of the sidebar. You will see the lead reference, contact details, service, source, status, customer link, received date, follow-up date, follow-up notes and actions.' },
      { title: 'Click Add lead', detail: 'Use the Add lead button at the top of the page. The lead form opens without leaving the list.' },
      { title: 'Enter the person’s details', detail: 'Enter the full name and a reachable phone number. Add an email if supplied. Use the person’s real contact details, not the name of the person who referred them.' },
      { title: 'Describe the enquiry', detail: 'Choose the service of interest: Umrah, Hajj, General Travel or Other Tours. Choose the source such as WhatsApp, Facebook Ads, Instagram Ads, Website, Referral or Walk-in. Enter the preferred travel period and number of travellers.' },
      { title: 'Set the first follow-up', detail: 'If someone needs to be contacted later, select a follow-up date. Set the status to New for an untouched enquiry, Contacted after first contact, Interested when they show intent, or Follow-up Required when another contact is due.' },
      { title: 'Save the lead', detail: 'Select Save record. The new lead appears in the table with a DNC reference. Check the name, phone and status before moving on.' },
      { title: 'Record every follow-up conversation', detail: 'In the Follow-up notes column, click Add note. Write what happened, the date/context, the customer’s objection or question, what you promised, and the next action. Save the note. To correct an earlier entry, open Notes and edit that specific entry. This does not change the lead’s contact details or status.' },
      { title: 'Update the lead status and next date', detail: 'After each meaningful contact, update the lead status using Edit and set the next follow-up date. Keep the conversation history in Follow-up notes, not in the status field.' },
      { title: 'Convert when the person becomes a customer', detail: 'Use Convert in that lead’s Actions column when the person is ready to become an agency customer. The app creates a customer profile linked to the original lead and marks the lead Converted. Do not create a second customer manually.' },
    ],
    automation: ['The app creates the lead’s DNC reference automatically when the record is saved.', 'Received date is set automatically to the current date.', 'Follow-up alerts appear on the Dashboard when the date is due or overdue, unless the lead is Converted, Lost or Not Interested.', 'Convert creates the linked customer record and changes the lead status.'],
    manual: ['You must choose the correct source, service, travel period, group size and follow-up date.', 'You must actually call or message the person. The app records the follow-up; it does not contact the customer for you.', 'Add a separate note after each meaningful conversation. Never overwrite the old note just to record a new call.'],
    impact: ['Converting a lead creates a Customer and connects it using the original lead ID. Customer history can then show where the relationship began.', 'Changing a lead’s status or follow-up date changes the Dashboard follow-up alerts.', 'Follow-up notes are a separate activity history. Editing one does not alter the lead’s main fields.'],
    warning: 'Do not convert a lead simply because they asked for a price. Convert when the agency is genuinely treating them as a customer. Keep Lost and Not Interested records for history.',
  },
  {
    id: 'customers', title: 'Customer records', subtitle: 'The lasting profile for the person who owns the relationship', keywords: 'customer add create lead convert contact phone email nationality city historical customer profile',
    icon: Users, purpose: 'A Customer is the person or organisation the agency deals with. A customer can own several bookings and may pay for travel for other people. The customer is not automatically the traveller.',
    steps: [
      { title: 'Open Customer records', detail: 'Choose Customer records under Customers in the sidebar. Search by name, phone or customer reference to find an existing profile before creating another one.' },
      { title: 'Create a customer', detail: 'Click Add customer only when there is no lead to convert or when you are entering an existing/historical customer directly. Enter full name, phone number, optional email, nationality and city.' },
      { title: 'Choose the customer type', detail: 'Select Current customer for an active relationship. Choose Historical customer for an older relationship that should remain in the records but is not currently active.' },
      { title: 'Save and verify', detail: 'Save the record and confirm the generated CUS reference. Check that the phone number is correct because it is a key contact route.' },
      { title: 'Open the customer record', detail: 'Use View to inspect their booking history, linked travellers and payments. Use Edit to correct their contact details. Use the customer profile as the starting point when creating a booking.' },
    ],
    automation: ['Customer reference is generated automatically.', 'When a lead is converted, the customer profile is linked to the source lead.', 'Booking, traveller and payment records link to a customer profile using the internal customer ID.'],
    manual: ['Search before adding to avoid duplicate customer profiles.', 'Keep the owner/payer’s details on the customer record. Enter each actual passenger separately in Travellers.', 'Correct an incorrect phone number or email using Edit. Do not create a replacement customer just to fix a typo.'],
    impact: ['A customer can own multiple bookings.', 'Payments are associated with a customer and can be linked to a specific booking.', 'The booking owner is fixed after booking creation to protect payment and customer history.', 'A customer with linked records may be protected from deletion.'],
  },
  {
    id: 'packages', title: 'Packages: create the catalogue item', subtitle: 'Set up the offer before taking bookings against it', keywords: 'package add create code price estimated cost availability draft active archive destination duration catalogue',
    icon: Package, purpose: 'Packages are reusable offers in the agency catalogue. A package stores the advertised arrangement and current default selling price. A booking stores the specific price agreed with one customer.',
    steps: [
      { title: 'Open Packages', detail: 'Choose Packages in Travel management and click Add package.' },
      { title: 'Create a package code', detail: 'Enter a short unique internal code that your team can recognise, such as UMRAH-RAM-10D. The package code is entered by the operator; it is not the same as the system-generated DNC, BKG, CUS or PAY references.' },
      { title: 'Describe the offer', detail: 'Enter the package name, category, destination and duration. Be specific enough that staff can distinguish similar packages.' },
      { title: 'Enter the money and capacity', detail: 'Enter the selling price in NGN, estimated cost in NGN and the number of available places. Estimated cost is a planning figure, not a supplier invoice.' },
      { title: 'Choose its status', detail: 'Keep it Draft while preparing. Change to Active only when it is ready to be offered. Use Unavailable or Archived when it should no longer be selected for new bookings.' },
      { title: 'Save and check', detail: 'Save the package and confirm its name, price, availability and status in the table. Only Active packages with available places appear as choices for new bookings.' },
    ],
    automation: ['The package code is stored as entered by the operator.', 'When a booking is created from an active package, its name and price are copied into the booking as an agreed snapshot.', 'Bookings that reserve places affect the available capacity. Enquiry and Cancelled bookings do not reserve places.'],
    manual: ['Check the actual hotel, flight, visa and service inclusions before activating the package.', 'Update availability when the real allocation changes.', 'Update the package catalogue price when the offer changes, but do not assume old bookings will change with it.'],
    impact: ['Changing a package price affects future booking defaults, not the agreed price already saved on existing bookings.', 'A package linked to bookings or payments is protected from deletion. Archive or mark it unavailable instead.', 'Estimated cost does not automatically create supplier costs. Record actual supplier obligations separately.'],
    warning: 'Do not enter a supplier quote as the package estimated cost and assume it has been paid. Package planning figures and supplier liabilities are different records.',
  },
  {
    id: 'bookings', title: 'Bookings: create and manage a reservation', subtitle: 'Connect the customer, package, price and travel dates', keywords: 'booking create new customer package agreed price party size departure return status reservation BKG',
    icon: CalendarCheck, purpose: 'A Booking is the commercial travel arrangement. It connects the customer who owns the booking to the package or custom arrangement, agreed price, travelling party and dates.',
    steps: [
      { title: 'Prepare the parent records', detail: 'Before creating a booking, make sure the customer exists. If using a catalogue offer, make sure the package is Active and has enough available places.' },
      { title: 'Open Bookings and click Create booking', detail: 'Choose Bookings in Travel management, then use Create booking.' },
      { title: 'Select the booking owner', detail: 'Choose the customer from the Customer field. This is the person responsible for the booking relationship and payment, not necessarily every person who will travel.' },
      { title: 'Select a package or custom arrangement', detail: 'Choose an Active package if it exists. The app fills the package name and current selling price. If it is a custom arrangement, leave Package blank and type the arrangement name and agreed price yourself.' },
      { title: 'Review the agreed price', detail: 'The package price is only a default. If the customer negotiated another amount, enter the actual agreed price. That price becomes the booking snapshot and is used for the balance calculation.' },
      { title: 'Enter the travelling party and dates', detail: 'Enter the number of travellers, departure date and return date. The return date must be after departure. Check the dates against the itinerary and supplier confirmation.' },
      { title: 'Choose the booking status', detail: 'Use Enquiry when it is only an enquiry and should not reserve capacity. Use Pending Confirmation while awaiting confirmation. Use Confirmed or the appropriate preparation/travel status as the arrangement progresses.' },
      { title: 'Save the booking', detail: 'Save and check the generated BKG reference. Open View to see the booking details, linked travellers and payments.' },
      { title: 'Add travellers and payments from the booking', detail: 'Use the booking detail actions to add travellers to this booking or record a payment against it. These entry points pass the booking context into the form.' },
    ],
    automation: ['The app generates the BKG reference and booking date.', 'Selecting a package fills the package name and current price. The agreed price remains editable.', 'The app checks package availability and validates party size and dates.', 'Booking status and party size affect package capacity.', 'Selecting the booking in the payment form fills the owner, package, agreed price, dates, party size, status and outstanding balance.'],
    manual: ['Confirm the real-world reservation with the supplier and enter the correct status.', 'Check the actual agreed price before saving.', 'Add each passenger as a Traveller. Party size alone does not create traveller profiles.', 'Keep booking dates accurate when flights or hotels change.'],
    impact: ['The customer link is fixed after creation so payment ownership and history stay consistent.', 'The booking agreed price is a snapshot. Later package price edits do not rewrite it.', 'Confirmed payments reduce the booking balance. Pending, failed or reversed payments do not.', 'Traveller records, customer payments and supplier costs attach to the booking.'],
    warning: 'Do not create another booking just because a customer pays again. Record each instalment as a separate payment on the existing booking.',
  },
  {
    id: 'travellers', title: 'Travellers & operations', subtitle: 'Register each person who will actually travel', keywords: 'traveller add passenger customer owner booking group family documents passport status abroad returned',
    icon: Plane, purpose: 'A Traveller is an individual passenger. One booking can have one traveller or a whole family. The booking owner may be one of those travellers, but the two records serve different purposes.',
    steps: [
      { title: 'Open the booking first', detail: 'The safest route is Bookings → View the correct booking → Add traveller. You can also open Travellers & operations and use Add traveller.' },
      { title: 'Confirm the booking', detail: 'If you start from the booking detail, the booking is already selected. If you start from the Travellers module, select the correct BKG reference.' },
      { title: 'Check the customer profile link', detail: 'The booking owner is selected automatically as the default customer profile. Keep it when the traveller is the owner. If the passenger is another person who has their own customer profile, select that profile. If they have no customer profile, leave it unlinked.' },
      { title: 'Enter the passenger’s own details', detail: 'Enter the traveller’s full name as it appears on their passport. Set nationality and choose the correct travel status.' },
      { title: 'Group family members', detail: 'For people travelling together, use the same group label, for example Aminu Family. Use the same booking and group label for each person in that family. Do not rely on the group label alone to link records.' },
      { title: 'Set document readiness', detail: 'Choose Documents incomplete / pending until the required documents have been checked. Mark complete only after the documents have actually been reviewed.' },
      { title: 'Save and repeat', detail: 'Save the traveller. Repeat for every passenger in the booking until the number of traveller records matches the party size.' },
      { title: 'Update operational status', detail: 'As the trip progresses, update each traveller from Not Started to Documents Pending, Documents Complete, Ready for Travel, Departed, Abroad and Returned as applicable.' },
    ],
    automation: ['Starting from a booking passes the booking ID and booking owner into the form.', 'The owner’s customer profile and name are preselected as defaults, but the traveller name remains editable.', 'Traveller records inherit their booking relationship. Booking dates remain the source itinerary.'],
    manual: ['Check each name against the passport. The app does not read or verify passport data.', 'Upload or store documents in the approved secure location, then save the document link in Documents.', 'Update each traveller’s operational status as events happen.'],
    impact: ['One customer booking can have many traveller records.', 'Traveller group labels organise members of a party but do not create a separate customer or booking.', 'Changing a booking’s dates affects the itinerary context for its travellers.'],
    warning: 'Do not create one traveller record per booking if five people are travelling. Create five individual traveller records, even if one customer owns and pays for the booking.',
  },
  {
    id: 'payments', title: 'Payments & balances', subtitle: 'Record money received from a customer', keywords: 'payment deposit record amount status confirmation booking transaction reference balance PAY',
    icon: CreditCard, purpose: 'A Payment is one actual receipt of money. A booking can have several payments, such as a deposit followed by two instalments. The balance is calculated from the booking price and confirmed payments.',
    steps: [
      { title: 'Open the correct booking or Payments & balances', detail: 'From a booking, use Record payment. Or open Payments & balances and click Record payment.' },
      { title: 'Select the booking', detail: 'Choose the existing BKG reference. The form displays the booking owner, package, agreed price, departure and return dates, party size, status and current outstanding balance.' },
      { title: 'Enter only the transaction details', detail: 'Enter the amount actually received, payment date and payment method. Add the bank or POS transaction reference when available. Do not retype the customer name or package when a booking is selected.' },
      { title: 'Choose the confirmation state', detail: 'Select Pending while the receipt is awaiting verification. Select Confirmed only after checking that the money arrived. A pending payment does not reduce the balance.' },
      { title: 'Save and verify', detail: 'Save the payment. Check that it is linked to the correct booking and that the outstanding balance changes only if the payment is Confirmed.' },
      { title: 'Record later instalments', detail: 'Repeat the same process for each new receipt, always selecting the same booking. Do not edit the previous payment to represent a new transaction.' },
      { title: 'Correct an incorrect confirmed payment', detail: 'Open the payment and use the Reverse payment action where available. Enter a clear reason. Keep the original record for audit history and handle any real bank refund separately.' },
    ],
    automation: ['The PAY reference is generated automatically.', 'Selecting a booking fills its owner, package, price, dates, party size, status and outstanding balance.', 'The app checks that a new booking-linked payment does not exceed the remaining balance.', 'Only Confirmed payments reduce the booking balance.'],
    manual: ['Verify the bank transfer, cash receipt or POS settlement outside the app.', 'Enter the exact amount and transaction reference.', 'Choose Pending or Confirmed honestly. The app cannot verify a bank account for you.'],
    impact: ['Each payment belongs to a customer and can link to a booking and package.', 'A confirmed payment reduces the booking balance. A pending, failed or reversed payment does not.', 'Reversing a payment changes the internal ledger only. It does not send a refund to the bank.'],
    warning: 'Never mark a payment Confirmed merely because a customer sent a screenshot. Verify the funds in the actual account or cash record first.',
  },
  {
    id: 'suppliers', title: 'Supplier costs and supplier payments', subtitle: 'Track what the agency owes and what has actually been sent', keywords: 'supplier cost create record payment supplier obligation outstanding due date invoice',
    icon: Building2, purpose: 'A Supplier cost records an obligation the agency owes for a booking. A Supplier payment records an actual disbursement against that obligation. They are separate records.',
    steps: [
      { title: 'Create the supplier cost', detail: 'Open Supplier payments and choose Record supplier cost. Select the booking, enter the supplier name, describe the cost (for example accommodation, flight or visa), enter the total amount and due date.' },
      { title: 'Save the obligation', detail: 'Save the supplier cost. Check the supplier, booking, total amount and due date in the list.' },
      { title: 'Record money sent', detail: 'When the agency actually pays the supplier, choose Record supplier payment against that supplier cost.' },
      { title: 'Enter the disbursement details', detail: 'Select the correct supplier cost. Enter the amount paid, payment date, payment method and transaction reference.' },
      { title: 'Save and inspect the outstanding amount', detail: 'Save. The supplier cost’s paid total and outstanding amount update from confirmed supplier payments. Repeat for instalments if the supplier is paid in stages.' },
      { title: 'Void an incorrect supplier payment', detail: 'If a payment was recorded incorrectly, use the void action and enter a reason where available. Do not delete the cost to hide a payment mistake.' },
    ],
    automation: ['Supplier outstanding is calculated from the cost total minus confirmed supplier payments.', 'The app prevents a supplier payment from exceeding the remaining supplier cost.', 'Overdue costs can appear in Dashboard alerts.'],
    manual: ['Verify the supplier invoice and bank transfer outside the app.', 'Create the supplier cost from the real obligation, not from an estimated package cost.', 'Enter the correct due date and transaction reference.'],
    impact: ['Supplier costs link to bookings.', 'Supplier payments link to supplier costs, not directly to a customer payment.', 'Changing a supplier cost affects the outstanding supplier balance and overdue alerts.'],
  },
  {
    id: 'documents', title: 'Documents: save secure document links', subtitle: 'Keep the record connected without uploading sensitive files into the app', keywords: 'documents add passport visa flight ticket hotel voucher receipt invoice link url related reference',
    icon: FileText, purpose: 'Documents stores a name, category, related record and secure URL. The app stores the link and metadata; the file itself remains in the approved storage location.',
    steps: [
      { title: 'Store the file securely first', detail: 'Upload the document to the agency-approved Google Drive or other authorised storage location. Set access so only the intended agency users can open it.' },
      { title: 'Open Documents and click Add document link', detail: 'Enter a clear document name and choose the category, such as Passport, Visa, Flight Ticket, Hotel Voucher, Payment Receipt, Invoice or Other.' },
      { title: 'Connect the document to a record', detail: 'Choose the related record type (Customer, Booking, Traveller, Payment or Supplier) and enter its exact visible reference or name as appropriate.' },
      { title: 'Paste the secure link', detail: 'Paste the full HTTPS link. The app rejects insecure HTTP links. Check that the link opens for the authorised agency account.' },
      { title: 'Set review status and save', detail: 'Choose Valid, Expiring Soon or Needs Review. Save the record and use the link to open the file when needed.' },
    ],
    automation: ['The app validates that the document URL is HTTPS.', 'The document record stores its related type, reference, URL, recorded date and review status.'],
    manual: ['The operator uploads the actual file to secure storage and sets sharing permissions.', 'The operator must check that the URL points to the correct person and document.', 'Update review status when a document expires or needs replacement.'],
    impact: ['Deleting or changing the source file in Drive may break the saved link.', 'A document link is not a substitute for checking the original document.'],
    warning: 'Do not paste public links to passports, visas or other sensitive identity documents. Use restricted agency access and share only with people who need the file.',
  },
  {
    id: 'records', title: 'Finding, editing, exporting and deleting records', subtitle: 'Everyday table operations and safe corrections', keywords: 'search filter edit view delete selected bulk export CSV checkbox records find duplicate',
    icon: Search, purpose: 'Most modules use the same table controls. Search and filters help locate the record; View shows its relationships; Edit changes its fields; export and delete actions are available only where the record type supports them.',
    steps: [
      { title: 'Open the correct module', detail: 'Use the sidebar to open Leads, Customer records, Packages, Bookings, Travellers, Payments or Supplier payments. Do not edit a record from a different module just because its name appears in search.' },
      { title: 'Search for the record', detail: 'Use the Search records field above the table. Search by a visible reference, name, phone number or other displayed detail. Search before creating a new record to avoid duplicates.' },
      { title: 'Narrow the list', detail: 'Use the status filter beside search. Clear the filter to return to all statuses. The table shows the matching records.' },
      { title: 'Open or edit', detail: 'Use View to inspect a record and its linked information. Use Edit to change the fields the form allows. Save and check the updated row.' },
      { title: 'Export the filtered records', detail: 'Choose Export CSV to download the records currently in the table after search and status filtering. Open the CSV in a spreadsheet and keep it in the agency-approved storage location.' },
      { title: 'Export only selected records', detail: 'For modules that support selection, tick the checkbox at the start of each row. Use the checkbox in the table header to select all currently visible rows. Choose Export selected to download only those records.' },
      { title: 'Delete selected records only when safe', detail: 'Select the rows and choose Delete selected. Read the confirmation carefully. The database blocks deletion where linked records or financial history would be damaged. If deletion is blocked, retain the record and use its status or archive option instead.' },
    ],
    automation: ['Search and status filters narrow the table without changing the saved record.', 'CSV export is generated in the browser from the current record data.', 'The app asks for confirmation before bulk deletion and the database enforces relationship protections.'],
    manual: ['Check that you selected the correct rows before exporting or deleting.', 'Store exported files securely because they may contain customer contact information.', 'Correct a typo with Edit. Do not delete and recreate a record just to change its name or phone number.'],
    impact: ['Editing a parent record can change linked views, balances or dashboard alerts.', 'Deleting a parent record may be blocked when customers, bookings, travellers, payments or supplier records depend on it.', 'Payments and financial history should be corrected using their reversal/void workflows, not by deleting ledger entries.'],
    warning: 'CSV files are copies, not live links. Editing the CSV does not update Headquarters. Never import an edited export back by assuming it will synchronise automatically.',
  },
  {
    id: 'statuses', title: 'Understanding record statuses', subtitle: 'Use the status that describes what has actually happened', keywords: 'status new contacted follow up interested lost converted booking enquiry pending confirmed cancelled documents abroad returned payment supplier cost',
    icon: CheckCircle2, purpose: 'Statuses communicate where a record is in its workflow. They do not perform the real-world action for you. For example, marking a payment Confirmed does not check the bank account.',
    steps: [
      { title: 'Lead statuses', detail: 'New means no meaningful contact has happened yet. Contacted means the first contact was made. Follow-up Required means another contact is due. Interested means the person has shown intent. Converted means a customer profile was created from the lead. Not Interested and Lost are closed outcomes.' },
      { title: 'Booking statuses', detail: 'Enquiry is not yet a reserved booking. Pending Confirmation is waiting for confirmation. Confirmed is accepted. In Preparation and Ready for Travel describe the preparation stage. Travelling means the party is on the trip. Completed means the trip is finished. Cancelled means it will not proceed.' },
      { title: 'Traveller statuses', detail: 'Not Started is the initial state. Documents Pending means paperwork is incomplete. Documents Complete means it has been checked. Ready for Travel means operational checks are complete. Departed, Abroad and Returned describe the passenger’s travel progress.' },
      { title: 'Payment statuses', detail: 'Pending means the receipt is awaiting verification. Confirmed means the money has been verified and counts against the balance. Failed means the transaction did not complete. Reversed means the app ledger entry has been reversed.' },
      { title: 'Supplier cost statuses', detail: 'Unpaid, Partially Paid, Paid and Overdue describe the amount still owed and its due date. Supplier payment records describe the actual disbursements made against that cost.' },
    ],
    automation: ['Some dashboard alerts and package availability calculations depend on statuses.', 'Only Confirmed customer payments reduce booking balances.', 'Booking statuses such as Enquiry and Cancelled do not reserve package places.'],
    manual: ['Update the status after the real-world event has happened.', 'When a status changes, check the related date, note or transaction reference as well.'],
    impact: ['Changing a booking status can affect package capacity and dashboard departure alerts.', 'Changing a lead status can stop or trigger follow-up alerts.', 'Changing a payment status can change the amount shown as outstanding.'],
    warning: 'Never use a status as a shortcut to make the dashboard look correct. The status must describe the actual situation.',
  },
  {
    id: 'notes', title: 'Notes: agency notes, reminders and guidelines', subtitle: 'Keep operating context and actions in one shared place', keywords: 'notes reminder todo checklist due date priority guidelines save edit delete',
    icon: StickyNote, purpose: 'Notes is the agency’s shared workspace for working notes, reminders and to-do items. Guidelines contains this operator manual.',
    steps: [
      { title: 'Open Notes', detail: 'Choose Notes in the Administration group of the sidebar. The default page is Agency notes.' },
      { title: 'Choose what to create', detail: 'Select Write a note for general context, Add reminder for something that must be revisited, or Create to-do for a task that needs completion.' },
      { title: 'Write a clear title and details', detail: 'Use a short title that explains the task. Add enough detail that another authorised operator can understand what is required without asking you.' },
      { title: 'Set priority and due date', detail: 'Choose Low, Normal or High priority. Add a due date when the task is time-sensitive. Save the item.' },
      { title: 'Find and update an item', detail: 'Use the search box and type filter to find a note, reminder or to-do. Open Edit to change the title, details, priority or date.' },
      { title: 'Complete or delete', detail: 'Use the circle/check control to mark a task complete. Delete only when the note is no longer needed. Completed items remain available under the Completed filter.' },
      { title: 'Open the manual', detail: 'Choose Guidelines in the Notes sub-navigation. Use the search field or contents links to jump to the task you need.' },
    ],
    automation: ['Live Mode saves notes in the shared Supabase database for authorised agency accounts.', 'The page calculates open, completed and overdue counts from saved records.', 'Demo Mode keeps changes temporary and separate from live records.'],
    manual: ['The operator must create the reminder and mark it complete. Notes do not currently send push notifications or automatically assign tasks to staff.', 'Write enough context for the next operator and avoid storing passwords or sensitive identity information.'],
    impact: ['Editing or completing a note does not change customer, booking or payment records.', 'Guidelines are read-only operating instructions; Agency notes are the editable workspace.'],
  },
  {
    id: 'settings', title: 'Settings and account access', subtitle: 'Control the workspace, not the customer records', keywords: 'settings live demo mode account profile integration access sign out',
    icon: ShieldCheck, purpose: 'Settings contains application preferences and integration readiness. Account access and workspace mode determine whether changes reach the live agency database.',
    steps: [
      { title: 'Check the current mode', detail: 'Look at the status area at the bottom of the sidebar. Live indicates the app is connected to the live server. Demo Mode indicates sample records and temporary changes.' },
      { title: 'Use Live Mode for real agency records', detail: 'Sign in with an authorised account and complete the required authenticator verification. Confirm that the connection indicator says Connected to server.' },
      { title: 'Use Demo Mode for practice', detail: 'Use Demo Mode to learn the interface or test a workflow with sample records. Do not enter real customer or payment details in demo data.' },
      { title: 'Review integration readiness', detail: 'Open Settings to inspect the business and integration information available in the current build. A displayed integration status does not mean a provider connection is active unless the app explicitly confirms it.' },
      { title: 'Sign out safely', detail: 'Use the account menu and Sign out when finished on a shared device. Close the browser session if the device is not trusted.' },
    ],
    automation: ['Live and Demo data sources are kept separate.', 'The connection indicator probes the live server and reports when the server cannot be reached.'],
    manual: ['Keep account credentials private and use MFA.', 'Check the mode before creating, editing or deleting records.', 'Do not assume that a listed integration is connected or automated.'],
    impact: ['Demo changes do not enter the live agency database.', 'Live records are protected by authenticated access and database Row Level Security.'],
  },
]

const idTypes = [
  { prefix: 'DNC', example: 'DNC-2026-A1B2C3D4', name: 'Lead', detail: 'Lead reference prefix. Created when a new lead is saved.' },
  { prefix: 'BKG', example: 'BKG-2026-E5F6A7B8', name: 'Booking', detail: 'Booking reference. Created when a booking is saved.' },
  { prefix: 'CUS', example: 'CUS-9A8B7C6D', name: 'Customer', detail: 'Customer profile reference. Created for direct customers and lead conversions.' },
  { prefix: 'PAY', example: 'PAY-1A2B3C4D', name: 'Customer payment', detail: 'Payment receipt reference. Each separate payment gets its own reference.' },
]

function FlowDiagram({ items }: { items: { label: string; detail: string; icon: typeof BookOpen }[] }) {
  return <div className="manual-flow">{items.map((item, index) => { const Icon = item.icon; return <div className="manual-flow-step" key={item.label}><div className="manual-flow-card"><span><Icon size={19} /></span><strong>{item.label}</strong><small>{item.detail}</small></div>{index < items.length - 1 && <div className="manual-flow-arrow"><ArrowRight size={17} /><ArrowDown size={17} /></div>}</div> })}</div>
}

function ScreenIllustration({ id }: { id: string }) {
  const screens: Record<string, { title: string; fields: string[]; result: string; tag: string }> = {
    dashboard: { title: 'Daily overview', fields: ['Upcoming departures', 'Lead follow-ups due', 'Outstanding customer balances'], result: 'Open an alert to reach the record that needs attention.', tag: 'OVERVIEW' },
    leads: { title: 'Add lead', fields: ['Full name · Phone number', 'Service · Lead source', 'Travel period · Number of travellers', 'Follow-up date · Status'], result: 'Save lead → DNC reference created → Follow-up notes added over time', tag: 'NEW ENQUIRY' },
    customers: { title: 'Add customer', fields: ['Full name · Phone number', 'Email · Nationality · City', 'Current or historical customer'], result: 'Save customer → CUS reference created → Ready to own bookings', tag: 'CUSTOMER PROFILE' },
    packages: { title: 'Create package', fields: ['Package code · Package name', 'Category · Destination · Duration', 'Selling price · Estimated cost', 'Available places · Status'], result: 'Activate package → Select it when creating a booking', tag: 'CATALOGUE' },
    bookings: { title: 'Create booking', fields: ['Customer / booking owner', 'Select package → name and price fill in', 'Agreed price · Party size', 'Departure date · Return date · Status'], result: 'Save booking → BKG reference → Add travellers and payments', tag: 'BOOKING' },
    travellers: { title: 'Add traveller', fields: ['Select existing booking', 'Booking owner profile preselected', 'Traveller full name · Nationality', 'Group · Document readiness · Travel status'], result: 'Save one traveller per passenger in the booking', tag: 'PASSENGER' },
    payments: { title: 'Record payment', fields: ['Select existing booking', 'Owner · Package · Price · Dates fill in', 'Outstanding balance shown automatically', 'Amount received · Date · Method · Confirmation'], result: 'Save payment → PAY reference → Confirmed amount reduces balance', tag: 'MONEY RECEIVED' },
    suppliers: { title: 'Supplier cost → payment', fields: ['Choose booking · Supplier · Cost', 'Total amount · Due date', 'Record each actual supplier payment', 'Amount · Date · Method · Reference'], result: 'Outstanding = supplier cost − confirmed supplier payments', tag: 'MONEY PAID OUT' },
    documents: { title: 'Add document link', fields: ['Document name · Category', 'Related record type · Reference', 'Secure HTTPS document link', 'Review status'], result: 'Save link → Open the secure file from the related record', tag: 'DOCUMENT' },
    records: { title: 'Find and manage records', fields: ['Search by name, phone or reference', 'Filter by current status', 'Select rows for CSV export', 'Edit or delete only when safe'], result: 'Export current filtered rows or only selected records', tag: 'TABLE TOOLS' },
    statuses: { title: 'Record status', fields: ['Choose the status that matches reality', 'Check dates and notes alongside it', 'Review the linked dashboard alerts', 'Use reversal for financial corrections'], result: 'Status changes affect the workflow, not the real-world event', tag: 'WORKFLOW CONTROL' },
    notes: { title: 'Agency notes', fields: ['Title · Details', 'Note / Reminder / To-do', 'Priority · Optional due date'], result: 'Save → Search, edit, complete or delete later', tag: 'WORKSPACE' },
    settings: { title: 'Workspace status', fields: ['Live Mode · Authenticated account', 'MFA verification · Server connection', 'Demo Mode · Temporary sample data'], result: 'Check the mode before changing real agency records', tag: 'ACCESS' },
  }
  const screen = screens[id] || screens.dashboard
  return <div className="manual-screen-illustration" aria-label={`Illustration of the ${screen.title} screen`}>
    <div className="manual-screen-top"><span><i></i><i></i><i></i></span><strong>{screen.title}</strong><small>{screen.tag}</small></div>
    <div className="manual-screen-fields">{screen.fields.map((field, index) => <div className="manual-screen-field" key={field}><span>{String(index + 1).padStart(2, '0')}</span><b>{field}</b><i></i></div>)}</div>
    <div className="manual-screen-result"><CheckCircle2 size={15} /><span>{screen.result}</span></div>
  </div>
}

function StepList({ steps }: { steps: Step[] }) {
  return <ol className="manual-step-list">{steps.map((step, index) => <li key={step.title}><span className="manual-step-number">{String(index + 1).padStart(2, '0')}</span><div><h4>{step.title}</h4><p>{step.detail}</p>{step.screen && <small>{step.screen}</small>}</div></li>)}</ol>
}

export function GuidePage() {
  const [query, setQuery] = useState('')
  const filtered = useMemo(() => {
    const value = query.trim().toLowerCase()
    if (!value) return sections
    return sections.filter((section) => `${section.title} ${section.subtitle} ${section.purpose} ${section.keywords} ${section.steps.map((step) => step.title + ' ' + step.detail).join(' ')} ${section.automation.join(' ')} ${section.manual.join(' ')}`.toLowerCase().includes(value))
  }, [query])

  return <div className="page operator-guide manual-page">
    <div className="guide-back"><Link to="/notes"><ArrowLeft size={15} /> Back to Notes</Link></div>
    <div className="notes-subnav"><Link to="/notes"><StickyNote size={16} /> Agency notes</Link><Link className="notes-subnav-active" to="/notes/guidelines"><BookOpen size={16} /> Guidelines</Link></div>
    <header className="manual-hero">
      <div className="manual-hero-copy"><div className="guide-eyebrow"><BookOpen size={15} /> DANDURGU HEADQUARTERS · OPERATOR MANUAL</div><h1>The Headquarters operating manual</h1><p>A practical, click-by-click guide to running the agency in this app. Follow the workflows, use the diagrams to understand how records connect, and check the automation notes to know what the system does for you.</p><div className="manual-hero-meta"><span><CheckCircle2 size={14} /> Step-by-step instructions</span><span><Sparkles size={14} /> Automation explained</span><span><ShieldCheck size={14} /> Live-data cautions</span></div></div>
      <div className="manual-hero-illustration"><div className="manual-hero-orbit orbit-one"></div><div className="manual-hero-orbit orbit-two"></div><div className="manual-hero-icon"><BookOpen size={46} /></div><span className="hero-chip chip-lead">Leads</span><span className="hero-chip chip-booking">Bookings</span><span className="hero-chip chip-money">Payments</span><span className="hero-chip chip-travel">Travellers</span></div>
    </header>
    <div className="manual-search"><Search size={18} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Find a task, field, reference or workflow…" aria-label="Search operator manual" /></div>

    <section className="manual-overview">
      <div className="manual-section-kicker">THE BIG PICTURE</div><h2>How the agency records fit together</h2><p>Start with the enquiry or customer, create the booking, then attach the people and money to that booking. This is the backbone of the system.</p>
      <FlowDiagram items={[
        { label: 'Lead', detail: 'Potential enquiry', icon: Users },
        { label: 'Customer', detail: 'Relationship owner', icon: Users },
        { label: 'Booking', detail: 'Agreed travel plan', icon: CalendarCheck },
        { label: 'Travellers', detail: 'Actual passengers', icon: Plane },
      ]} />
      <div className="manual-branches"><div className="manual-branch"><CreditCard size={18} /><strong>Customer payments</strong><span>Money received against a customer and optionally a booking.</span></div><div className="manual-branch"><Wallet size={18} /><strong>Supplier costs & payments</strong><span>Money the agency owes suppliers and later sends to them.</span></div><div className="manual-branch"><FileText size={18} /><strong>Documents</strong><span>Secure links connected to customers, bookings, travellers or payments.</span></div></div>
    </section>

    <section className="manual-id-section">
      <div className="manual-section-kicker">REFERENCE NUMBERS</div><h2>Understand the IDs before you use them</h2><p>These are human-readable references shown in the app. The database also assigns a separate UUID behind the scenes. Operators normally use the visible reference when discussing a record.</p>
      <div className="manual-id-grid">{idTypes.map((item) => <article className="manual-id-card" key={item.prefix}><div className="manual-id-name"><strong>{item.name}</strong><span>{item.prefix}</span></div><code>{item.example}</code><p>{item.detail}</p><div className="manual-id-parts"><span className="id-prefix">{item.prefix}</span>{item.example.split('-').slice(1).map((part, index) => <span className={index === 0 && part.length === 4 ? 'id-year' : 'id-random'} key={index}>{part}</span>)}</div></article>)}</div>
      <div className="manual-id-breakdown"><div><strong>For DNC and BKG</strong><p><code>DNC</code> or <code>BKG</code> identifies the record type. The next block is the year the record was created. The last eight characters are generated from a random UUID fragment.</p></div><div><strong>For CUS and PAY</strong><p>The prefix identifies the type. The final eight characters are generated from a random UUID fragment. These references do not contain a year.</p></div></div>
      <div className="manual-callout"><Info size={18} /><p><strong>Can an operator invent a new reference?</strong> No. Do not type or manufacture DNC, BKG, CUS or PAY references. The app generates them when a record is saved. This avoids duplicates. Package codes are different: the operator enters those manually, and should use a clear, unique code.</p></div>
      <div className="manual-uuid"><span>Visible reference</span><code>DNC-2026-A1B2C3D4</code><ArrowRight size={18} /><span>Internal database ID</span><code>UUID generated automatically</code></div>
      <p className="manual-small-note">The examples above are illustrations only, not real customer records. The random part is generated by the browser’s cryptographic UUID function; it is not a sequential customer number and should not be guessed.</p>
    </section>

    <div className="manual-section-title"><div className="manual-section-kicker">MODULE-BY-MODULE INSTRUCTIONS</div><h2>How to do the work</h2><p>Each chapter shows the exact route, the steps to follow, what Headquarters fills automatically and what the operator must still do.</p></div>
    <nav className="manual-toc" aria-label="Manual chapters">{filtered.map((section, index) => { const Icon = section.icon; return <a href={`#manual-${section.id}`} key={section.id}><Icon size={15} /><span>{String(index + 1).padStart(2, '0')} · {section.title}</span></a> })}{!filtered.length && <span>No chapters match that search.</span>}</nav>

    <div className="manual-chapters">{filtered.map((section, index) => { const Icon = section.icon; return <section className="manual-chapter" id={`manual-${section.id}`} key={section.id}>
      <div className="manual-chapter-header"><div className="manual-chapter-icon"><Icon size={23} /></div><div><span>CHAPTER {String(index + 1).padStart(2, '0')}</span><h2>{section.title}</h2><p>{section.subtitle}</p></div></div>
      <div className="manual-purpose"><strong>What this area is for</strong><p>{section.purpose}</p></div>
      <div className="manual-workflow-label"><ClipboardCheck size={16} /> FOLLOW THESE STEPS</div>
      <StepList steps={section.steps} />
      <div className="manual-explain-grid"><div className="manual-explain-card automated"><div className="manual-explain-heading"><Sparkles size={17} /><strong>What the app does automatically</strong></div><ul>{section.automation.map((item) => <li key={item}>{item}</li>)}</ul></div><div className="manual-explain-card operator"><div className="manual-explain-heading"><Users size={17} /><strong>What the operator must do</strong></div><ul>{section.manual.map((item) => <li key={item}>{item}</li>)}</ul></div></div>
      <div className="manual-impact"><div><Info size={17} /><strong>What changes elsewhere when you edit this</strong></div><ul>{section.impact.map((item) => <li key={item}>{item}</li>)}</ul></div>
      {section.warning && <div className="manual-warning"><CircleHelp size={18} /><p>{section.warning}</p></div>}
    </section> })}{!filtered.length && <div className="guide-empty">No chapters match “{query}”. Try another search.</div>}</div>

    <section className="manual-practices">
      <div className="manual-section-kicker">KEEP THE RECORDS CLEAN</div><h2>Best practices for daily operations</h2>
      <div className="manual-practice-grid"><article><span>01</span><h3>Search before creating</h3><p>Check for an existing lead, customer or booking before adding a new one. Duplicate profiles split history and make balances harder to trust.</p></article><article><span>02</span><h3>Use the right parent record</h3><p>Customer first, then booking, then travellers and payments. Start from the booking when adding a passenger or recording an instalment.</p></article><article><span>03</span><h3>Keep a trail</h3><p>Write follow-up notes after every meaningful lead conversation. Add clear transaction references and reversal reasons for financial records.</p></article><article><span>04</span><h3>Verify money outside the app</h3><p>Confirm bank transfers, cash and supplier payments using the actual account or receipt. Headquarters is a ledger, not a bank connection.</p></article><article><span>05</span><h3>Protect sensitive documents</h3><p>Use restricted storage links for passports, visas and receipts. Never paste passwords, card details or public identity-document links into Notes.</p></article><article><span>06</span><h3>Check Live vs Demo</h3><p>Live Mode writes to the agency database. Demo Mode is for practice and is temporary. Check the sidebar status before saving real work.</p></article></div>
    </section>
    <footer className="guide-footer"><CheckCircle2 size={17} /><span>This manual describes the current Headquarters workflows. When a form or permission behaves differently, stop before making a financial or destructive change and have the workflow checked.</span></footer>
    <details className="guide-collapse"><summary>Quick reference: the operating sequence <ChevronDown size={15} /></summary><p>Enquiry → Lead → Customer → Booking → Travellers → Customer payments. Separately, a booking can have supplier costs and supplier payments. Documents are linked by record type and reference. A package is a reusable catalogue offer; the booking stores the actual agreed price.</p></details>
  </div>
}
