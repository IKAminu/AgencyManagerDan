import { useMemo, useState } from 'react'
import { ArrowLeft, BookOpen, CheckCircle2, ChevronDown, CircleHelp, Search, StickyNote } from 'lucide-react'
import { Link } from 'react-router'

type GuideSection = {
  id: string
  title: string
  summary: string
  keywords: string
  steps?: string[]
  points?: string[]
  flow?: string
}

const sections: GuideSection[] = [
  {
    id: 'start',
    title: 'Start here: how Headquarters works',
    summary: 'Headquarters is the internal operating record for enquiries, customers, travel arrangements, travellers, money and supporting documents.',
    keywords: 'start getting started live demo login save data operating workflow',
    steps: [
      'Sign in with an authorised account. Live access also requires the configured authenticator verification.',
      'Check the workspace mode before entering information. Live Mode writes to the agency database. Demo Mode uses sample records and changes are temporary.',
      'Use the left navigation to move between modules. On a phone, open it with the menu button. Use Quick action for common entries.',
      'Use the global search for leads, customers, bookings and travellers. Each result opens its module; it does not edit the record.',
      'After saving, watch the save notice. If a save error appears, use Retry Save and confirm that the change is reflected before continuing.'
    ],
    points: [
      'The app is a linked record system, not a collection of independent spreadsheets. Create the parent record first, then attach related records to it.',
      'Use the generated reference numbers when discussing records. Names are not unique and can be shared by several customers.',
      'Do not treat a green-looking status or a saved form as proof that money moved at the bank. Record the actual transaction and retain its bank reference.'
    ]
  },
  {
    id: 'dashboard',
    title: 'Dashboard',
    summary: 'The daily overview of sales activity, customer money, travel operations and items needing attention.',
    keywords: 'dashboard overview metrics alerts followups departure supplier overdue recent activity',
    points: [
      'Use the dashboard to identify what needs attention, not as the place to correct underlying records.',
      'Lead follow-up alerts come from lead follow-up dates and statuses.',
      'Upcoming departure alerts come from booking departure dates and booking statuses.',
      'Supplier overdue alerts come from supplier costs with an outstanding balance and an overdue status or past due date.',
      'Open the relevant module from an alert, inspect the source record and correct it there. Dashboard figures and alerts are derived from those records.'
    ]
  },
  {
    id: 'leads',
    title: 'Leads',
    summary: 'A lead is a potential customer enquiry. It is not yet a confirmed customer booking.',
    keywords: 'lead enquiry prospect source campaign follow up convert status new contacted interested lost',
    steps: [
      'Create a lead when a new enquiry arrives. Record the person, phone number, service, source, preferred travel period and group size.',
      'Set a follow-up date when someone needs to be contacted again. Update the status after each meaningful interaction.',
      'When the person becomes a customer, use Convert. The app creates a customer profile linked to the original lead and marks the lead Converted.',
      'Open the linked customer record to create bookings and maintain the ongoing customer history.'
    ],
    points: [
      'Lead source and campaign fields describe where the enquiry came from. Keep them accurate for later marketing analysis.',
      'Do not create a second customer manually after converting a lead. Check the Customer record link first.',
      'A lead marked Lost or Not Interested should not be converted unless the person genuinely resumes the process.'
    ]
  },
  {
    id: 'customers',
    title: 'Customer records',
    summary: 'The permanent profile for the person who owns or pays for a customer relationship.',
    keywords: 'customer profile owner contact nationality phone email historical lead bookings travellers payments',
    steps: [
      'Create a customer directly when there is no lead to convert, or use Convert from the lead record when the relationship began as an enquiry.',
      'Keep the main contact details and nationality accurate. A customer can have several bookings over time.',
      'Open View to inspect the customer booking history, travellers on those bookings and payment history.',
      'Use Historical for an older customer relationship that should remain on record but is not currently active.'
    ],
    points: [
      'The customer is often the booking owner or payer. The customer is not necessarily the person travelling.',
      'A customer can be linked to a lead, multiple bookings, payments and traveller profiles.',
      'A customer with linked bookings, payments or travellers is protected from deletion. Correct or retain the relationship instead of deleting the profile.'
    ]
  },
  {
    id: 'packages',
    title: 'Travel packages',
    summary: 'The internal catalogue of travel products, prices, estimated costs and available places.',
    keywords: 'package catalogue price cost availability capacity active draft fully booked archived',
    steps: [
      'Create a package before creating bookings against it. Give it a clear code and name, category, destination, duration, selling price, estimated cost and available places.',
      'Use Draft while preparing a package. Set it Active only when it is ready to be booked.',
      'Keep availability current. A booking that reserves places reduces the package availability.',
      'Review package availability and status before confirming a booking.'
    ],
    points: [
      'Estimated cost is an internal planning figure. It is not the same as supplier costs actually recorded under Supplier payments.',
      'Changing a package later does not rewrite the price or package name already stored on an existing booking. The booking keeps a snapshot of the agreed arrangement.',
      'A package linked to bookings or payments is protected from deletion. Archive or mark it unavailable instead of removing its history.'
    ]
  },
  {
    id: 'bookings',
    title: 'Bookings',
    summary: 'The central commercial record connecting a customer, a package, a travelling party, customer payments and supplier costs.',
    keywords: 'booking create package customer agreed price party size dates status reservation capacity snapshot',
    steps: [
      'Select the customer who owns the booking.',
      'Select an active package when the booking is for a catalogue package. The package selection supplies the related package details and current pricing defaults; review the agreed price before saving.',
      'Enter the travelling party size, departure and return dates, and the correct booking status.',
      'Save the booking before adding travellers, recording customer payments or recording supplier costs against it.',
      'Open View on a booking to inspect its travellers and payments. Use the booking detail action to add a traveller already linked to that booking.'
    ],
    points: [
      'The booking stores an agreed-price snapshot. If the package price changes later, the old booking price stays unchanged.',
      'A booking party size and its status affect package availability. Enquiry and Cancelled bookings do not reserve places; active confirmed/preparation/travel stages do.',
      'The return date must be after the departure date. Party size must be a whole number of at least one.',
      'Do not create duplicate bookings just because a customer makes another payment. Record another payment against the existing booking.',
      'A booking with linked travellers, payments or supplier costs cannot be deleted. Keep its history and use the appropriate status.'
    ]
  },
  {
    id: 'travellers',
    title: 'Travellers & operations',
    summary: 'Individual traveller records are attached to a booking and can be grouped into families or travelling parties.',
    keywords: 'traveller passenger group family owner customer profile documents passport readiness status departed abroad returned',
    steps: [
      'Create the booking first. Add travellers from the booking detail or from the Travellers module.',
      'The booking owner is selected as the default customer profile. Keep that link when the traveller is the owner; change it only when the traveller has a separate customer profile.',
      'Enter the traveller’s actual full name. The booking owner may be travelling, but other members of the party need their own traveller records.',
      'Give members of the same family or party the same group name within that booking. Leave the group blank for an individual traveller.',
      'Update document readiness and travel status as the operation progresses.'
    ],
    points: [
      'The booking owner and traveller are different concepts. One customer can own a booking containing several travellers.',
      'Group names are grouped within a booking. Reusing a group name on another booking does not merge the two parties.',
      'Document readiness and travel status are separate. A traveller can have documents marked complete while their travel status is still Not Started.',
      'Passport numbers are not shown in the operational tables or global search. Use approved, access-controlled storage for sensitive documents.',
      'A traveller record inherits booking dates from its linked booking. Correct the booking dates if the itinerary changes.'
    ]
  },
  {
    id: 'payments',
    title: 'Payments & balances',
    summary: 'Records money received from customers. The booking balance is calculated from the agreed booking price and confirmed payments.',
    keywords: 'payment customer money received deposit amount confirmed pending reverse failed transaction reference balance',
    steps: [
      'For a payment against an existing booking, select that booking. The customer, package and booking context should be populated from the selected booking.',
      'Enter the actual amount received, payment date, method and transaction reference where available.',
      'Set Pending if the transaction has not yet been verified. Set Confirmed only after checking that the money was received.',
      'Check the booking balance after confirmation. Only Confirmed payments reduce the amount outstanding.',
      'If a confirmed payment was recorded incorrectly or needs to be undone in the app ledger, use Reverse payment and enter a reason. Keep the original record.'
    ],
    points: [
      'A payment belongs to a customer and can optionally be linked to a booking and package. Prefer linking it to the correct booking so its balance is calculated correctly.',
      'The app prevents a new booking-linked payment from exceeding the remaining booking balance.',
      'Pending, Failed and Reversed payments do not reduce the booking balance.',
      'Reversing a payment changes the internal record. It does not initiate a bank refund or reverse a transfer at the bank. Handle the real-world transaction separately.',
      'Do not edit a confirmed payment simply to make the balance look right. Verify the bank transaction and use the reversal process when appropriate.'
    ]
  },
  {
    id: 'suppliers',
    title: 'Supplier payments',
    summary: 'Tracks what the agency owes suppliers for a booking and the individual payments made against each supplier cost.',
    keywords: 'supplier cost obligation supplier payment disbursement outstanding paid overdue void booking',
    steps: [
      'Create a supplier cost against the relevant booking. Record the supplier, what the cost is for, total amount and due date.',
      'When money is actually sent, use Record payment on that supplier cost.',
      'Enter the amount, date, method and transaction reference. The amount cannot exceed the outstanding supplier cost.',
      'Check the supplier cost status and outstanding amount after recording the payment.',
      'If a supplier payment record is wrong, use Void record and enter a reason. The app restores the outstanding amount while preserving the payment history.'
    ],
    points: [
      'A supplier cost is the obligation. A supplier payment is one disbursement against that obligation. One cost can have several partial payments.',
      'Supplier payments are separate from customer payments. Recording one does not reduce a customer booking balance.',
      'Voiding a supplier payment changes the internal ledger only. It does not reverse money at the bank.',
      'A supplier cost with recorded payments is protected from deletion. Correct the payment history rather than deleting the obligation.'
    ]
  },
  {
    id: 'documents',
    title: 'Documents',
    summary: 'A register of document links and the business record each link belongs to. Headquarters stores the link, not the file itself.',
    keywords: 'documents passport receipt visa hotel voucher link url google drive upload security access',
    steps: [
      'Add a descriptive document name and category.',
      'Choose the related record type and enter its reference or name exactly as shown in the relevant module.',
      'Paste a secure HTTPS link to the file in its approved storage location.',
      'Set the document status to Valid, Expiring Soon or Needs Review and update it when checked.',
      'Use Open link to access the stored file. Confirm that the person opening it has permission in the storage service.'
    ],
    points: [
      'Adding a link does not upload a file to Google Drive. Google Drive is not currently connected.',
      'A valid HTTPS link does not guarantee that the file permissions are safe. Do not use public links for passports, identity documents or sensitive customer records.',
      'Use the customer, booking, traveller, payment or supplier reference to make the relationship clear.',
      'Document status is an operator-maintained review label. It is not an automatic passport-expiry monitor.'
    ]
  },
  {
    id: 'settings',
    title: 'Settings, account and workspace mode',
    summary: 'Shows the business defaults, current access profile, workspace mode and the state of planned integrations.',
    keywords: 'settings account security workspace live demo integration supabase drive meta website currency timezone',
    points: [
      'Business defaults currently show Dandurgu Air Travel & Tours Ltd, NGN, Africa/Lagos and DD MMM YYYY.',
      'Live Mode connects to the agency database. Demo Mode is for sample data and temporary practice. Always check the mode before entering real customer or financial information.',
      'The account centre in the top-right shows the current profile and access mode. Sign out when leaving a shared device.',
      'Integration labels describe the current configuration. A service marked Not configured must not be assumed to be connected.',
      'The operator guide explains the application. It does not grant additional permissions or change account settings.'
    ]
  },
  {
    id: 'relationships',
    title: 'How the records connect',
    summary: 'Use this map to understand which record should be created first and where each change appears.',
    keywords: 'relationship map data model connections linked records parent child dependency flow',
    flow: 'LEAD  →  CUSTOMER  →  BOOKING  →  TRAVELLERS\n                         │         ├── CUSTOMER PAYMENTS\n                         │         └── SUPPLIER COSTS  →  SUPPLIER PAYMENTS\n                         │\nPACKAGE ─────────────────┘\n\nDOCUMENTS can reference a CUSTOMER, BOOKING, TRAVELLER, PAYMENT or SUPPLIER.',
    points: [
      'Lead → Customer: converting a lead creates one customer profile linked to that lead.',
      'Customer → Booking: a customer can own multiple bookings.',
      'Package → Booking: a booking can reference a package, while preserving its own package-name and agreed-price snapshot.',
      'Booking → Travellers: each traveller belongs to one booking. Several travellers can share a group label.',
      'Booking → Customer payments: payments are linked to the customer and, when applicable, the booking they pay towards.',
      'Booking → Supplier costs → Supplier payments: each supplier cost belongs to a booking; one supplier cost can have several disbursements.',
      'Documents are references to other records, not a replacement for those records.'
    ]
  },
  {
    id: 'corrections',
    title: 'If you correct a record, what else changes?',
    summary: 'Understand the downstream effect before editing a record. Some values are copied snapshots; others are calculated from linked transactions.',
    keywords: 'edit correction effect update impact balance availability date price name status reverse',
    points: [
      'Correcting a lead updates the enquiry. If it has already been converted, the customer profile is a separate record; check and correct both where necessary.',
      'Correcting a customer contact detail updates the profile. It does not automatically rename every traveller record because a traveller may be a different person.',
      'Changing a package price affects new bookings and their defaults, not existing booking agreed prices.',
      'Changing booking dates affects the operational dates shown for its travellers and dashboard departure alerts.',
      'Changing booking party size or reservation status can affect package availability. Check remaining places before making an increase.',
      'Adding, confirming or reversing a customer payment changes the calculated booking balance. Only confirmed payments count.',
      'Adding or voiding a supplier payment changes the paid and outstanding amounts and the supplier cost status.',
      'Changing a traveller status or document readiness affects operational counts and group readiness, not the booking price.',
      'Changing a document link or status changes the document register only. It does not alter the underlying customer, booking or travel record.'
    ]
  },
  {
    id: 'daily',
    title: 'Recommended daily operating routine',
    summary: 'A simple sequence that keeps records current and makes the dashboard useful.',
    keywords: 'daily routine checklist start end day operations workflow',
    steps: [
      'Start on the Dashboard and review overdue follow-ups, upcoming departures and supplier obligations.',
      'Process new enquiries in Leads. Assign a realistic follow-up date and update each lead after contact.',
      'Convert qualified enquiries into Customers. Avoid duplicate customer profiles.',
      'Create or update Packages before making new bookings. Check price, status and available places.',
      'Create Bookings and confirm the customer, package, party size, dates and agreed price.',
      'Add each Traveller to the correct booking. Check customer links, group names and document readiness.',
      'Record customer payments only after checking the transaction. Reconcile booking balances.',
      'Record supplier costs and each actual disbursement separately. Review overdue supplier obligations.',
      'Update document links and statuses. Check permissions for sensitive files.',
      'Before leaving, check save notices, resolve any save errors and sign out on shared devices.'
    ]
  },
  {
    id: 'search-export-delete',
    title: 'Search, filters, exports and deletion',
    summary: 'Find records, move data out for reporting and understand when deletion is blocked.',
    keywords: 'search filter export csv selected delete remove linked record dependency',
    points: [
      'Use the search field and status filter in each module to narrow the visible records.',
      'Export CSV downloads the records currently represented by that module action. Export selected downloads only the checked records.',
      'CSV exports contain operational data. Store them securely and do not circulate passport or customer information unnecessarily.',
      'Selected deletion is available only for supported record types. The app blocks deletion when linked records or financial history depend on the selected record.',
      'When deletion is blocked, correct, archive or change the status of the record instead. Do not remove a parent record to hide an error in a child record.',
      'A deletion cannot be undone from the app. Confirm the selected records and export only when there is a legitimate business reason.'
    ]
  },
  {
    id: 'security',
    title: 'Security and handling customer information',
    summary: 'Operational rules for protecting customer, traveller and financial information.',
    keywords: 'security privacy access password mfa personal data passport financial sensitive',
    points: [
      'Use only authorised accounts. Live database access is restricted independently by authentication and database policies.',
      'Never share passwords, authenticator codes or private access links.',
      'Do not place passport numbers or sensitive identity information in notes, group names, search fields or exported spreadsheets.',
      'Use private, access-controlled document storage. A link being HTTPS does not make it private.',
      'Avoid downloading customer CSV files to shared or public computers. Delete local copies when no longer needed.',
      'Report unexpected data, missing records or save errors before attempting repeated edits. Repeatedly submitting a financial record can create duplicate transactions.'
    ]
  }
]

export function GuidePage() {
  const [query, setQuery] = useState('')
  const filtered = useMemo(() => {
    const value = query.trim().toLowerCase()
    if (!value) return sections
    return sections.filter((section) => `${section.title} ${section.summary} ${section.keywords} ${section.steps?.join(' ') || ''} ${section.points?.join(' ') || ''} ${section.flow || ''}`.toLowerCase().includes(value))
  }, [query])

  return <div className="page operator-guide">
    <div className="guide-back"><Link to="/notes"><ArrowLeft size={15} /> Back to Notes</Link></div>
    <div className="notes-subnav"><Link to="/notes"><StickyNote size={16} /> Agency notes</Link><Link className="notes-subnav-active" to="/notes/guidelines"><BookOpen size={16} /> Guidelines</Link></div>
    <header className="page-header guide-header">
      <div><div className="guide-eyebrow"><BookOpen size={15} /> OPERATIONS HANDBOOK</div><h1>Headquarters operator guide</h1><p>How to use each module, connect records and correct information without breaking the rest of the workflow.</p></div>
      <span className="guide-version">Operator reference</span>
    </header>
    <div className="guide-search"><Search size={18} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search the guide, e.g. booking balance, traveller group…" aria-label="Search operator guide" /></div>
    <div className="guide-intro"><CircleHelp size={19} /><p><strong>First principle:</strong> create the parent record before its related records. A customer owns a booking; a booking contains travellers and can have customer payments and supplier costs. When in doubt, open the parent record and follow its links.</p></div>
    <nav className="guide-index" aria-label="Guide contents">
      {filtered.map((section) => <a key={section.id} href={`#guide-${section.id}`}>{section.title}</a>)}
      {!filtered.length && <span>No matching topics. Try a broader search.</span>}
    </nav>
    <div className="guide-sections">
      {filtered.map((section, index) => <section className="guide-section" id={`guide-${section.id}`} key={section.id}>
        <div className="guide-section-heading"><span>{String(index + 1).padStart(2, '0')}</span><div><h2>{section.title}</h2><p>{section.summary}</p></div></div>
        {section.flow && <pre className="guide-flow">{section.flow}</pre>}
        {section.steps && <div className="guide-subsection"><h3>How to operate it</h3><ol>{section.steps.map((step) => <li key={step}>{step}</li>)}</ol></div>}
        {section.points && <div className="guide-subsection"><h3>{section.steps ? 'Important details' : 'What operators need to know'}</h3><ul>{section.points.map((point) => <li key={point}>{point}</li>)}</ul></div>}
      </section>)}
      {!filtered.length && <div className="guide-empty">No topics match “{query}”. Try another term.</div>}
    </div>
    <footer className="guide-footer"><CheckCircle2 size={16} /><span>Use this guide alongside the live record. If the screen and this guide appear to disagree, stop before making a financial or destructive change and have the workflow checked.</span></footer>
    <details className="guide-collapse"><summary>Quick reminder <ChevronDown size={15} /></summary><p>Lead → Customer → Booking → Travellers. Customer payments reduce customer balances only when confirmed. Supplier payments reduce supplier obligations. Package changes do not rewrite existing booking prices.</p></details>
  </div>
}
