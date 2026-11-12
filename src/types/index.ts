export type StatusTone = 'neutral' | 'info' | 'success' | 'warning' | 'danger' | 'brand'

export interface Lead {
  id: string
  reference: string
  name: string
  phone: string
  email?: string
  service: string
  travelPeriod: string
  preferredDepartureDate?: string
  departureLocation?: string
  state?: string
  travelTiming?: string
  paymentPlan?: string
  source: string
  campaign?: string
  status: 'New' | 'Contacted' | 'Follow-up Required' | 'Interested' | 'Nurture' | 'Converted' | 'Not Interested' | 'Lost'
  receivedAt: string
  followUp?: string
  groupSize: number
  city?: string
  notes?: string
}

export interface Customer {
  id: string
  reference: string
  name: string
  phone: string
  email?: string
  nationality: string
  city?: string
  leadId?: string
  historical?: boolean
  notes?: string
  createdAt: string
}

export interface TravelPackage {
  id: string
  code: string
  name: string
  category: string
  destination: string
  departureLocation?: string
  departureDate?: string
  sourceAgent?: string
  notes?: string
  duration: string
  price: number
  estimatedCost: number | null
  currency: 'NGN'
  availability: number | null
  status: 'Draft' | 'Active' | 'Fully Booked' | 'Unavailable' | 'Archived'
}

export interface Booking {
  id: string
  reference: string
  customerId: string
  packageId?: string
  packageName: string
  agreedPrice: number
  partySize: number
  currency: 'NGN'
  bookingDate: string
  departureDate: string
  returnDate: string
  status: 'Enquiry' | 'Pending Confirmation' | 'Confirmed' | 'In Preparation' | 'Ready for Travel' | 'Travelling' | 'Completed' | 'Cancelled'
  supplier?: string
  historical?: boolean
}

export interface Traveller {
  id: string
  name: string
  customerId?: string
  bookingId: string
  nationality: string
  status: 'Not Started' | 'Documents Pending' | 'Documents Complete' | 'Ready for Travel' | 'Departed' | 'Abroad' | 'Returned'
  group?: string
  documentsComplete: boolean
  passportExpiry?: string
}

export interface Payment {
  id: string
  reference: string
  bookingId?: string
  customerId: string
  packageId?: string
  purpose: string
  amount: number
  date: string
  method: 'Bank Transfer' | 'Cash' | 'POS' | 'Other'
  status: 'Pending' | 'Confirmed' | 'Reversed' | 'Failed'
  transactionReference?: string
  reversalReason?: string
  historical?: boolean
}

export interface SupplierCost {
  id: string
  bookingId: string
  supplier: string
  category: string
  amount: number
  dueDate: string
  paid: number
  status: 'Unpaid' | 'Partially Paid' | 'Paid' | 'Overdue'
}

export interface SupplierPayment {
  id: string
  supplierCostId: string
  amount: number
  date: string
  method: 'Bank Transfer' | 'Cash' | 'POS' | 'Other'
  reference?: string
  status?: 'Confirmed' | 'Voided'
  voidReason?: string
}

export interface DocumentRecord {
  id: string
  name: string
  category: string
  relatedType: 'Customer' | 'Booking' | 'Traveller' | 'Payment' | 'Supplier'
  relatedReference: string
  url: string
  recordedAt: string
  status: 'Valid' | 'Expiring Soon' | 'Needs Review'
}

export type QuickActionType = 'lead' | 'customer' | 'booking' | 'payment' | 'traveller' | 'package' | 'supplier-cost' | 'supplier-payment' | 'document'
