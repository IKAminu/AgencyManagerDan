import { supabase } from '@/lib/supabase'

const unavailable = () => {
  throw new Error('Supabase is not configured. Add the public project URL and publishable key.')
}

export const dataSource = 'supabase'

async function getLiveRows(table: string) {
  if (!supabase) return unavailable()
  const { data, error } = await supabase.from(table).select('*').eq('is_demo', false)
  if (error) throw error
  return data ?? []
}

export const recordsService = {
  async getLeads() { return getLiveRows('leads') },
  async getCustomers() { return getLiveRows('customers') },
  async getPackages() { return getLiveRows('packages') },
  async getBookings() { return getLiveRows('bookings') },
  async getTravellers() { return getLiveRows('travellers') },
  async getPayments() { return getLiveRows('payments') },
}
