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
  { id: 'p1', code: 'UMR-RAM-26', name: 'Ramadan Umrah — Last 10 Nights', category: 'Umrah', destination: 'Makkah & Madinah', duration: '14 days', price: 3250000, estimatedCost: 2675000, currency: 'NGN', availability: 7, status: 'Active' },
  { id: 'p2', code: 'UMR-ESS-26', name: 'Essential Umrah', category: 'Umrah', destination: 'Makkah & Madinah', duration: '10 days', price: 2450000, estimatedCost: 1950000, currency: 'NGN', availability: 12, status: 'Active' },
  { id: 'p3', code: 'HAJ-PRE-26', name: 'Hajj Premium Programme', category: 'Hajj', destination: 'Saudi Arabia', duration: '28 days', price: 8900000, estimatedCost: 7600000, currency: 'NGN', availability: 0, status: 'Fully Booked' },
  { id: 'p4', code: 'DXB-FAM-26', name: 'Dubai Family Escape', category: 'Other Tours', destination: 'Dubai', duration: '7 days', price: 4100000, estimatedCost: 3380000, currency: 'NGN', availability: 15, status: 'Draft' },
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
