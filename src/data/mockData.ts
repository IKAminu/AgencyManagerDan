import type { Booking, Customer, DocumentRecord, Lead, Payment, SupplierCost, SupplierPayment, TravelPackage, Traveller } from '@/types'

const iso = (offset: number) => {
  const date = new Date()
  date.setDate(date.getDate() + offset)
  return date.toISOString().slice(0, 10)
}

export const initialLeads: Lead[] = [
  { id: 'l1', reference: 'DNC-2026-7K4P9M2Q', name: 'Amina Bello', phone: '+234 803 441 2098', email: 'amina@example.com', service: 'Umrah', travelPeriod: 'Ramadan 2026', source: 'Facebook Ads', campaign: 'Ramadan Umrah North', status: 'New', receivedAt: iso(-1), followUp: iso(0), groupSize: 2, city: 'Kano' },
  { id: 'l2', reference: 'DNC-2026-8L2H5D1S', name: 'Chinedu Okafor', phone: '+234 806 772 1140', service: 'General Travel', travelPeriod: 'June 2026', source: 'Referral', status: 'Contacted', receivedAt: iso(-3), followUp: iso(2), groupSize: 1, city: 'Abuja' },
  { id: 'l3', reference: 'DNC-2026-3A8R6T4N', name: 'Zainab Musa', phone: '+234 809 126 7802', email: 'zainab@example.com', service: 'Hajj', travelPeriod: 'Hajj 2026', source: 'Instagram Ads', campaign: 'Hajj Early Interest', status: 'Follow-up Required', receivedAt: iso(-6), followUp: iso(-2), groupSize: 4, city: 'Kaduna' },
  { id: 'l4', reference: 'DNC-2026-9Q1W5E7R', name: 'Tunde Adebayo', phone: '+234 802 550 9134', service: 'Umrah', travelPeriod: 'December 2026', source: 'WhatsApp', status: 'Interested', receivedAt: iso(-8), followUp: iso(1), groupSize: 3, city: 'Lagos' },
  { id: 'l5', reference: 'DNC-2026-2M6B4V8C', name: 'Fatima Abdullahi', phone: '+234 701 482 6671', service: 'Umrah', travelPeriod: 'Flexible', source: 'Website', status: 'Converted', receivedAt: iso(-18), groupSize: 1, city: 'Katsina' },
  { id: 'l6', reference: 'DNC-2026-1P7J3F9K', name: 'Maryam Suleiman', phone: '+234 811 220 4706', service: 'General Travel', travelPeriod: 'August 2026', source: 'Walk-in', status: 'New', receivedAt: iso(-2), followUp: iso(0), groupSize: 5, city: 'Abuja' },
]

export const initialCustomers: Customer[] = [
  { id: 'c1', reference: 'CUS-1042', name: 'Fatima Abdullahi', phone: '+234 701 482 6671', email: 'fatima@example.com', nationality: 'Nigerian', city: 'Katsina', leadId: 'l5', createdAt: iso(-16) },
  { id: 'c2', reference: 'CUS-1037', name: 'Ibrahim Lawal', phone: '+234 803 918 3402', email: 'ibrahim@example.com', nationality: 'Nigerian', city: 'Kano', createdAt: iso(-80) },
  { id: 'c3', reference: 'CUS-0984', name: 'Halima Garba', phone: '+234 806 131 9850', nationality: 'Nigerian', city: 'Abuja', historical: true, createdAt: iso(-130) },
  { id: 'c4', reference: 'CUS-1071', name: 'Emeka Nwosu', phone: '+234 805 744 2109', email: 'emeka@example.com', nationality: 'Nigerian', city: 'Lagos', createdAt: iso(-21) },
  { id: 'c5', reference: 'CUS-1075', name: 'Safiya Mohammed', phone: '+234 810 566 2931', nationality: 'Nigerian', city: 'Kaduna', createdAt: iso(-12) },
]

export const initialPackages: TravelPackage[] = [
  { id: 'abj-001', code: "DNCS-DEC26-ABJ001", name: "December Custom Umrah Package", category: 'Umrah', destination: 'Makkah & Madinah', departureLocation: 'Abuja', departureDate: "15 Dec 2026 – 28 Dec 2026", sourceAgent: "Custom Package (half package from Oasis; ticket from Masarrah Air)", notes: "Custom package; Ethiopian Air return flight; 1-year reusable visa; Accommodation; Sedan car transfers to/from airport; 2 Jumu'ah in Makkah (18 Dec)", duration: "13 days", price: 3500000, estimatedCost: null, currency: 'NGN', availability: null, status: "Active" },
  { id: 'abj-002', code: "DNRD-NOV26-ABJ002", name: "November Umrah Package · 10 Nov Departure", category: 'Umrah', destination: 'Makkah & Madinah', departureLocation: 'Abuja', departureDate: "10 Nov – 24 Nov 2026", sourceAgent: "Raudah Travels", notes: "November Umrah Package; Saudia Airlines (Abuja departure); Umrah visa; Hotels in Madinah & Makkah; Transportation", duration: "14 days", price: 2500000, estimatedCost: null, currency: 'NGN', availability: null, status: "Draft" },
  { id: 'abj-003', code: "DNRD-NOV26-ABJ003", name: "November Umrah Package · 24 Nov Departure", category: 'Umrah', destination: 'Makkah & Madinah', departureLocation: 'Abuja', departureDate: "24 Nov – 08 Dec 2026", sourceAgent: "Raudah Travels", notes: "November Umrah Package; Saudia Airlines (Abuja departure); Umrah visa; Hotels in Madinah & Makkah; Transportation", duration: "14 days", price: 2500000, estimatedCost: null, currency: 'NGN', availability: null, status: "Draft" },
  { id: 'abj-004', code: "DNRD-NOV26-ABJ004", name: "December Umrah Package · 1 Dec Departure", category: 'Umrah', destination: 'Makkah & Madinah', departureLocation: 'Abuja', departureDate: "01 Dec – 15 Dec 2026", sourceAgent: "Raudah Travels", notes: "Umrah Package; Saudia Airlines (Abuja departure); Umrah visa; Hotels in Madinah & Makkah; Transportation", duration: "14 days", price: 2500000, estimatedCost: null, currency: 'NGN', availability: null, status: "Draft" },
  { id: 'abj-005', code: "DNRD-NOV26-ABJ005", name: "December Umrah Package · 8 Dec Departure", category: 'Umrah', destination: 'Makkah & Madinah', departureLocation: 'Abuja', departureDate: "08 Dec – 22 Dec 2026", sourceAgent: "Raudah Travels", notes: "Umrah Package; Saudia Airlines (Abuja departure); Umrah visa; Hotels in Madinah & Makkah; Transportation", duration: "14 days", price: 2500000, estimatedCost: null, currency: 'NGN', availability: null, status: "Draft" },
  { id: 'abj-006', code: "DNOA-FEB27-ABJ006", name: "Ramadan Umrah Option 1 · Abraj Al Tayseer", category: 'Umrah', destination: 'Makkah & Madinah', departureLocation: 'Abuja', departureDate: "09 Feb 2027 – 09 Mar 2027", sourceAgent: "Oasis Air Services", notes: "Ramadan Option 1; EgyptAir; 1-year multiple entry visa; Abraj Al Tayseer Makkah hotel & Madinah accommodation; Transportation", duration: "28 days", price: 4700000, estimatedCost: null, currency: 'NGN', availability: null, status: "Active" },
  { id: 'abj-007', code: "DNOA-FEB27-ABJ007", name: "Ramadan Umrah Option 1 · Diary Al Saad", category: 'Umrah', destination: 'Makkah & Madinah', departureLocation: 'Abuja', departureDate: "09 Feb 2027 – 09 Mar 2027", sourceAgent: "Oasis Air Services", notes: "Ramadan Option 1; EgyptAir; 1-year multiple entry visa; Diary Al Saad Makkah hotel & Madinah accommodation; Transportation", duration: "28 days", price: 5100000, estimatedCost: null, currency: 'NGN', availability: null, status: "Active" },
  { id: 'abj-008', code: "DNOA-FEB27-ABJ008", name: "Ramadan Umrah Option 1 · Ponciana", category: 'Umrah', destination: 'Makkah & Madinah', departureLocation: 'Abuja', departureDate: "09 Feb 2027 – 09 Mar 2027", sourceAgent: "Oasis Air Services", notes: "Ramadan Option 1; EgyptAir; 1-year multiple entry visa; Ponciana Makkah hotel & Madinah accommodation; Transportation", duration: "28 days", price: 5800000, estimatedCost: null, currency: 'NGN', availability: null, status: "Active" },
  { id: 'abj-009', code: "DNOA-FEB27-ABJ009", name: "Ramadan Umrah Option 2 · Abraj Al Tayseer", category: 'Umrah', destination: 'Makkah & Madinah', departureLocation: 'Abuja', departureDate: "22 Feb 2027 – 15 Mar 2027", sourceAgent: "Oasis Air Services", notes: "Ramadan Option 2; EgyptAir; 1-year multiple entry visa; Abraj Al Tayseer Makkah hotel & Madinah accommodation; Transportation", duration: "21 days", price: 4700000, estimatedCost: null, currency: 'NGN', availability: null, status: "Active" },
  { id: 'abj-010', code: "DNOA-FEB27-ABJ010", name: "Ramadan Umrah Option 2 · Diary Al Saad", category: 'Umrah', destination: 'Makkah & Madinah', departureLocation: 'Abuja', departureDate: "22 Feb 2027 – 15 Mar 2027", sourceAgent: "Oasis Air Services", notes: "Ramadan Option 2; EgyptAir; 1-year multiple entry visa; Diary Al Saad Makkah hotel & Madinah accommodation; Transportation", duration: "21 days", price: 5100000, estimatedCost: null, currency: 'NGN', availability: null, status: "Active" },
  { id: 'abj-011', code: "DNOA-FEB27-ABJ011", name: "Ramadan Umrah Option 2 · Ponciana", category: 'Umrah', destination: 'Makkah & Madinah', departureLocation: 'Abuja', departureDate: "22 Feb 2027 – 15 Mar 2027", sourceAgent: "Oasis Air Services", notes: "Ramadan Option 2; EgyptAir; 1-year multiple entry visa; Ponciana Makkah hotel & Madinah accommodation; Transportation", duration: "21 days", price: 5800000, estimatedCost: null, currency: 'NGN', availability: null, status: "Active" },
  { id: 'abj-012', code: "DNOA-FEB27-ABJ012", name: "Ramadan Umrah Option 3 · Abraj Al Tayseer", category: 'Umrah', destination: 'Makkah & Madinah', departureLocation: 'Abuja', departureDate: "28 Feb 2027 – 14 Mar 2027", sourceAgent: "Oasis Air Services", notes: "Ramadan Option 3; EgyptAir; 1-year multiple entry visa; Abraj Al Tayseer Makkah hotel & Madinah accommodation; Transportation", duration: "14 days", price: 4700000, estimatedCost: null, currency: 'NGN', availability: null, status: "Active" },
  { id: 'abj-013', code: "DNOA-FEB27-ABJ013", name: "Ramadan Umrah Option 3 · Diary Al Saad", category: 'Umrah', destination: 'Makkah & Madinah', departureLocation: 'Abuja', departureDate: "28 Feb 2027 – 14 Mar 2027", sourceAgent: "Oasis Air Services", notes: "Ramadan Option 3; EgyptAir; 1-year multiple entry visa; Diary Al Saad Makkah hotel & Madinah accommodation; Transportation", duration: "14 days", price: 5100000, estimatedCost: null, currency: 'NGN', availability: null, status: "Active" },
  { id: 'abj-014', code: "DNOA-FEB27-ABJ014", name: "Ramadan Umrah Option 3 · Ponciana", category: 'Umrah', destination: 'Makkah & Madinah', departureLocation: 'Abuja', departureDate: "28 Feb 2027 – 14 Mar 2027", sourceAgent: "Oasis Air Services", notes: "Ramadan Option 3; EgyptAir; 1-year multiple entry visa; Ponciana Makkah hotel & Madinah accommodation; Transportation", duration: "14 days", price: 5800000, estimatedCost: null, currency: 'NGN', availability: null, status: "Active" },
  { id: 'abj-015', code: "DNOA-FEB27-ABJ015", name: "Ramadan Umrah Option 4 · Abraj Al Tayseer", category: 'Umrah', destination: 'Makkah & Madinah', departureLocation: 'Abuja', departureDate: "28 Feb 2027 – 11 Mar 2027", sourceAgent: "Oasis Air Services", notes: "Ramadan Option 4; EgyptAir; 1-year multiple entry visa; Abraj Al Tayseer Makkah hotel & Madinah accommodation; Transportation", duration: "11 days", price: 4700000, estimatedCost: null, currency: 'NGN', availability: null, status: "Active" },
  { id: 'abj-016', code: "DNOA-FEB27-ABJ016", name: "Ramadan Umrah Option 4 · Diary Al Saad", category: 'Umrah', destination: 'Makkah & Madinah', departureLocation: 'Abuja', departureDate: "28 Feb 2027 – 11 Mar 2027", sourceAgent: "Oasis Air Services", notes: "Ramadan Option 4; EgyptAir; 1-year multiple entry visa; Diary Al Saad Makkah hotel & Madinah accommodation; Transportation", duration: "11 days", price: 5100000, estimatedCost: null, currency: 'NGN', availability: null, status: "Active" },
  { id: 'abj-017', code: "DNOA-FEB27-ABJ017", name: "Ramadan Umrah Option 4 · Ponciana", category: 'Umrah', destination: 'Makkah & Madinah', departureLocation: 'Abuja', departureDate: "28 Feb 2027 – 11 Mar 2027", sourceAgent: "Oasis Air Services", notes: "Ramadan Option 4; EgyptAir; 1-year multiple entry visa; Ponciana Makkah hotel & Madinah accommodation; Transportation", duration: "11 days", price: 5800000, estimatedCost: null, currency: 'NGN', availability: null, status: "Active" },
  { id: 'abj-018', code: "DNOA-FEB27-ABJ018", name: "Ramadan Umrah · Snood Al Hoda (4 flight options)", category: 'Umrah', destination: 'Makkah & Madinah', departureLocation: 'Abuja', departureDate: "09 Feb / 22 Feb / 28 Feb 2027", sourceAgent: "Oasis Air Services", notes: "Ramadan Package (4 flight options); EgyptAir; 1-year multiple entry visa; Snood Al Hoda Makkah hotel & Madinah accommodation; Transportation", duration: "11–28 days", price: 4100000, estimatedCost: null, currency: 'NGN', availability: null, status: "Active" },
]

export const initialBookings: Booking[] = [
  { id: 'b1', reference: 'BKG-2026-0148', customerId: 'c1', partySize: 1, packageId: 'p2', packageName: 'Essential Umrah', agreedPrice: 2450000, currency: 'NGN', bookingDate: iso(-15), departureDate: iso(4), returnDate: iso(14), status: 'In Preparation', supplier: 'Al-Hidayah Travel Services' },
  { id: 'b2', reference: 'BKG-2026-0141', customerId: 'c2', partySize: 2, packageId: 'p1', packageName: 'Ramadan Umrah — Last 10 Nights', agreedPrice: 6500000, currency: 'NGN', bookingDate: iso(-35), departureDate: iso(-6), returnDate: iso(8), status: 'Travelling', supplier: 'Al-Hidayah Travel Services' },
  { id: 'b3', reference: 'BKG-2025-0089', customerId: 'c3', partySize: 1, packageName: 'Custom Umrah Arrangement', agreedPrice: 3000000, currency: 'NGN', bookingDate: iso(-145), departureDate: iso(-120), returnDate: iso(-108), status: 'Completed', historical: true },
  { id: 'b4', reference: 'BKG-2026-0153', customerId: 'c4', partySize: 2, packageId: 'p2', packageName: 'Essential Umrah', agreedPrice: 4900000, currency: 'NGN', bookingDate: iso(-9), departureDate: iso(6), returnDate: iso(16), status: 'Confirmed', supplier: 'Rahma Ground Handling' },
  { id: 'b5', reference: 'BKG-2026-0157', customerId: 'c5', partySize: 1, packageId: 'p3', packageName: 'Hajj Premium Programme', agreedPrice: 8900000, currency: 'NGN', bookingDate: iso(-5), departureDate: iso(45), returnDate: iso(73), status: 'Pending Confirmation' },
]

export const initialTravellers: Traveller[] = [
  { id: 't1', name: 'Fatima Abdullahi', customerId: 'c1', bookingId: 'b1', nationality: 'Nigerian', status: 'Documents Pending', documentsComplete: false },
  { id: 't2', name: 'Ibrahim Lawal', customerId: 'c2', bookingId: 'b2', nationality: 'Nigerian', status: 'Abroad', group: 'Lawal Family', documentsComplete: true },
  { id: 't3', name: 'Hauwa Lawal', bookingId: 'b2', nationality: 'Nigerian', status: 'Abroad', group: 'Lawal Family', documentsComplete: true },
  { id: 't4', name: 'Halima Garba', customerId: 'c3', bookingId: 'b3', nationality: 'Nigerian', status: 'Returned', documentsComplete: true },
  { id: 't5', name: 'Emeka Nwosu', customerId: 'c4', bookingId: 'b4', nationality: 'Nigerian', status: 'Ready for Travel', group: 'Nwosu Couple', documentsComplete: true },
  { id: 't6', name: 'Adaeze Nwosu', bookingId: 'b4', nationality: 'Nigerian', status: 'Documents Pending', group: 'Nwosu Couple', documentsComplete: false },
  { id: 't7', name: 'Safiya Mohammed', customerId: 'c5', bookingId: 'b5', nationality: 'Nigerian', status: 'Not Started', documentsComplete: false },
]

export const initialPayments: Payment[] = [
  { id: 'pay1', reference: 'PAY-00482', bookingId: 'b1', customerId: 'c1', packageId: 'p2', purpose: 'Essential Umrah', amount: 1000000, date: iso(-12), method: 'Bank Transfer', status: 'Confirmed', transactionReference: 'NIP-881204' },
  { id: 'pay2', reference: 'PAY-00461', bookingId: 'b2', customerId: 'c2', packageId: 'p1', purpose: 'Ramadan Umrah — Last 10 Nights', amount: 4000000, date: iso(-28), method: 'Bank Transfer', status: 'Confirmed' },
  { id: 'pay3', reference: 'PAY-00474', bookingId: 'b2', customerId: 'c2', packageId: 'p1', purpose: 'Ramadan Umrah — Last 10 Nights', amount: 2500000, date: iso(-10), method: 'POS', status: 'Confirmed' },
  { id: 'pay4', reference: 'PAY-00312', bookingId: 'b3', customerId: 'c3', purpose: 'Custom Umrah Arrangement', amount: 3000000, date: iso(-138), method: 'Cash', status: 'Confirmed', historical: true },
  { id: 'pay5', reference: 'PAY-00491', bookingId: 'b4', customerId: 'c4', packageId: 'p2', purpose: 'Essential Umrah', amount: 1500000, date: iso(-5), method: 'Bank Transfer', status: 'Confirmed' },
  { id: 'pay6', reference: 'PAY-00492', bookingId: 'b4', customerId: 'c4', packageId: 'p2', purpose: 'Essential Umrah', amount: 250000, date: iso(-4), method: 'Bank Transfer', status: 'Reversed' },
  { id: 'pay7', reference: 'PAY-00499', bookingId: 'b5', customerId: 'c5', packageId: 'p3', purpose: 'Hajj Premium Programme', amount: 2000000, date: iso(-2), method: 'Bank Transfer', status: 'Pending' },
]

export const supplierCosts: SupplierCost[] = [
  { id: 'sc1', bookingId: 'b1', supplier: 'Al-Hidayah Travel Services', category: 'Flight & visa', amount: 1750000, dueDate: iso(2), paid: 1000000, status: 'Partially Paid' },
  { id: 'sc2', bookingId: 'b2', supplier: 'Al-Hidayah Travel Services', category: 'Ground package', amount: 5000000, dueDate: iso(-8), paid: 5000000, status: 'Paid' },
  { id: 'sc3', bookingId: 'b4', supplier: 'Rahma Ground Handling', category: 'Accommodation', amount: 2100000, dueDate: iso(-1), paid: 0, status: 'Overdue' },
  { id: 'sc4', bookingId: 'b5', supplier: 'Makkah Hospitality Co.', category: 'Hajj services', amount: 7200000, dueDate: iso(24), paid: 0, status: 'Unpaid' },
]

export const initialSupplierPayments: SupplierPayment[] = [
  { id: 'sp1', supplierCostId: 'sc1', amount: 1000000, date: iso(-10), method: 'Bank Transfer', reference: 'SUP-TRF-2104', status: 'Confirmed' },
  { id: 'sp2', supplierCostId: 'sc2', amount: 5000000, date: iso(-30), method: 'Bank Transfer', reference: 'SUP-TRF-1987', status: 'Confirmed' },
]

export const documents: DocumentRecord[] = [
  { id: 'd1', name: 'Fatima passport scan', category: 'Passport', relatedType: 'Traveller', relatedReference: 'Fatima Abdullahi', url: 'https://drive.google.com/', recordedAt: iso(-10), status: 'Needs Review' },
  { id: 'd2', name: 'Lawal family flight tickets', category: 'Flight Ticket', relatedType: 'Booking', relatedReference: 'BKG-2026-0141', url: 'https://drive.google.com/', recordedAt: iso(-8), status: 'Valid' },
  { id: 'd3', name: 'Payment receipt PAY-00482', category: 'Payment Receipt', relatedType: 'Payment', relatedReference: 'PAY-00482', url: 'https://drive.google.com/', recordedAt: iso(-12), status: 'Valid' },
]
