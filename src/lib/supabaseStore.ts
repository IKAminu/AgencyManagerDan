import type { Booking, Customer, DocumentRecord, Lead, Payment, SupplierCost, SupplierPayment, TravelPackage, Traveller } from '@/types'
import { supabase } from '@/lib/supabase'

const client = () => {
  if (!supabase) throw new Error('Supabase is not configured. Check the project URL and publishable key.')
  return supabase
}

async function rows(table: string) {
  const pageSize = 500
  const records: Record<string, any>[] = []
  let lastId: string | null = null

  // Keyset pagination avoids the silent 1,000-row API cap and offset drift
  // when new records are inserted while a large table is being loaded.
  while (true) {
    let query = client()
      .from(table)
      .select('*')
      .eq('is_demo', false)
      .order('id', { ascending: true })
      .limit(pageSize)

    if (lastId) query = query.gt('id', lastId)

    const { data, error } = await query
    if (error) throw error

    const page = (data ?? []) as Record<string, any>[]
    records.push(...page)
    if (page.length < pageSize) break

    const nextLastId = page[page.length - 1]?.id
    if (typeof nextLastId !== 'string' || nextLastId === lastId) {
      throw new Error(`Could not continue loading ${table}: pagination did not advance.`)
    }
    lastId = nextLastId
  }

  return records
}

async function loadStore() {
  const [leadRows, customerRows, packageRows, bookingRows, travellerRows, paymentRows, costRows, supplierPaymentRows, documentRows] =
    await Promise.all(['leads','customers','packages','bookings','travellers','payments','supplier_costs','supplier_payments','documents'].map((table) => rows(table)))

  const leads: Lead[] = leadRows.map((r) => ({
    id:r.id, reference:r.reference, name:r.name, phone:r.phone, email:r.email ?? undefined,
    service:r.service, travelPeriod:r.travel_period, source:r.source, campaign:r.campaign ?? undefined,
    status:r.status, receivedAt:r.received_at, followUp:r.follow_up ?? undefined,
    groupSize:r.group_size, city:r.city ?? undefined, notes:r.notes ?? undefined,
  }))
  const customers: Customer[] = customerRows.map((r) => ({
    id:r.id, reference:r.reference, name:r.name, phone:r.phone, email:r.email ?? undefined,
    nationality:r.nationality, city:r.city ?? undefined, leadId:r.lead_id ?? undefined,
    historical:r.historical, notes:r.notes ?? undefined, createdAt:r.created_at,
  }))
  const packages: TravelPackage[] = packageRows.map((r) => ({
    id:r.id, code:r.code, name:r.name, category:r.category, destination:r.destination,
    departureLocation:r.departure_location ?? undefined, notes:r.notes ?? undefined,
    duration:r.duration, price:Number(r.price), estimatedCost:Number(r.estimated_cost),
    currency:r.currency, availability:r.availability, status:r.status,
  }))
  const bookings: Booking[] = bookingRows.map((r) => ({
    id:r.id, reference:r.reference, customerId:r.customer_id, packageId:r.package_id ?? undefined,
    packageName:r.package_name, agreedPrice:Number(r.agreed_price), partySize:r.party_size,
    currency:r.currency, bookingDate:r.booking_date, departureDate:r.departure_date,
    returnDate:r.return_date, status:r.status, supplier:r.supplier ?? undefined, historical:r.historical,
  }))
  const travellers: Traveller[] = travellerRows.map((r) => ({
    id:r.id, name:r.name, customerId:r.customer_id ?? undefined, bookingId:r.booking_id,
    nationality:r.nationality, status:r.status, group:r.group_label ?? undefined,
    documentsComplete:r.documents_complete, passportExpiry:r.passport_expiry ?? undefined,
  }))
  const payments: Payment[] = paymentRows.map((r) => ({
    id:r.id, reference:r.reference, bookingId:r.booking_id ?? undefined, customerId:r.customer_id,
    packageId:r.package_id ?? undefined, purpose:r.purpose, amount:Number(r.amount),
    date:r.payment_date, method:r.method, status:r.status,
    transactionReference:r.transaction_reference ?? undefined, reversalReason:r.reversal_reason ?? undefined,
    historical:r.historical,
  }))
  const supplierCosts: SupplierCost[] = costRows.map((r) => ({
    id:r.id, bookingId:r.booking_id, supplier:r.supplier_name, category:r.category,
    amount:Number(r.amount), dueDate:r.due_date, paid:Number(r.paid), status:r.status,
  }))
  const supplierPayments: SupplierPayment[] = supplierPaymentRows.map((r) => ({
    id:r.id, supplierCostId:r.supplier_cost_id, amount:Number(r.amount), date:r.payment_date,
    method:r.method, reference:r.reference ?? undefined, status:r.status, voidReason:r.void_reason ?? undefined,
  }))
  const documents: DocumentRecord[] = documentRows.map((r) => ({
    id:r.id, name:r.name, category:r.category, relatedType:r.related_type,
    relatedReference:r.related_reference, url:r.url, recordedAt:r.recorded_at, status:r.status,
  }))
  return { leads, customers, packages, bookings, travellers, payments, supplierCosts, supplierPayments, documents }
}

async function save(table: string, records: Record<string, unknown>[]) {
  if (!records.length) return
  const payload = records.map((record) => ({ ...record, is_demo: false }))
  const { error } = await client().from(table).upsert(payload, { onConflict: 'id' })
  if (error) throw error
}

async function saveStore(data: {
  leads: Lead[]; customers: Customer[]; packages: TravelPackage[]; bookings: Booking[];
  travellers: Traveller[]; payments: Payment[]; supplierCosts: SupplierCost[];
  supplierPayments: SupplierPayment[]; documents: DocumentRecord[]
}) {
  // Keep parent records ahead of their dependants so foreign keys remain valid.
  await save('leads', data.leads.map((r) => ({
    id:r.id, reference:r.reference, name:r.name, phone:r.phone, email:r.email ?? null,
    service:r.service, travel_period:r.travelPeriod, source:r.source, campaign:r.campaign ?? null,
    status:r.status, received_at:r.receivedAt, follow_up:r.followUp ?? null,
    group_size:r.groupSize, city:r.city ?? null, notes:r.notes ?? null,
  })))
  await save('customers', data.customers.map((r) => ({
    id:r.id, reference:r.reference, name:r.name, phone:r.phone, email:r.email ?? null,
    nationality:r.nationality, city:r.city ?? null, lead_id:r.leadId ?? null,
    historical:r.historical ?? false, notes:r.notes ?? null, created_at:r.createdAt,
  })))
  await save('packages', data.packages.map((r) => ({
    id:r.id, code:r.code, name:r.name, category:r.category, destination:r.destination,
    departure_location:r.departureLocation ?? null, notes:r.notes ?? null,
    duration:r.duration, price:r.price, estimated_cost:r.estimatedCost, currency:r.currency,
    availability:r.availability, status:r.status,
  })))
  await save('bookings', data.bookings.map((r) => ({
    id:r.id, reference:r.reference, customer_id:r.customerId, package_id:r.packageId ?? null,
    package_name:r.packageName, agreed_price:r.agreedPrice, party_size:r.partySize,
    currency:r.currency, booking_date:r.bookingDate, departure_date:r.departureDate,
    return_date:r.returnDate, status:r.status, supplier:r.supplier ?? null, historical:r.historical ?? false,
  })))
  await save('travellers', data.travellers.map((r) => ({
    id:r.id, name:r.name, customer_id:r.customerId ?? null, booking_id:r.bookingId,
    nationality:r.nationality, status:r.status, group_label:r.group ?? null,
    documents_complete:r.documentsComplete, passport_expiry:r.passportExpiry ?? null,
  })))
  await save('payments', data.payments.map((r) => ({
    id:r.id, reference:r.reference, booking_id:r.bookingId ?? null, customer_id:r.customerId,
    package_id:r.packageId ?? null, purpose:r.purpose, amount:r.amount, payment_date:r.date,
    method:r.method, status:r.status, transaction_reference:r.transactionReference ?? null,
    reversal_reason:r.reversalReason ?? null, historical:r.historical ?? false,
  })))
  await save('supplier_costs', data.supplierCosts.map((r) => ({
    id:r.id, booking_id:r.bookingId, supplier_name:r.supplier, category:r.category,
    amount:r.amount, due_date:r.dueDate, paid:r.paid, status:r.status,
  })))
  await save('supplier_payments', data.supplierPayments.map((r) => ({
    id:r.id, supplier_cost_id:r.supplierCostId, amount:r.amount, payment_date:r.date,
    method:r.method, reference:r.reference ?? null, status:r.status ?? 'Confirmed', void_reason:r.voidReason ?? null,
  })))
  await save('documents', data.documents.map((r) => ({
    id:r.id, name:r.name, category:r.category, related_type:r.relatedType,
    related_reference:r.relatedReference, url:r.url, recorded_at:r.recordedAt, status:r.status,
  })))
}


export const loadLiveStore = () => loadStore()
export const saveLiveStore = (data: Parameters<typeof saveStore>[0]) => saveStore(data)


export async function deleteLiveRecords(table: string, ids: string[]) {
  if (!ids.length) return
  const { data, error } = await client().from(table).delete().in('id', ids).eq('is_demo', false).select('id')
  if (error) throw error
  if ((data?.length ?? 0) !== ids.length) throw new Error('Not all selected records could be deleted. Check permissions or whether a record has linked data.')
}
