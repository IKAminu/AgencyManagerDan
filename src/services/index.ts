import { appConfig } from '@/config/app'
import { initialBookings, initialCustomers, initialLeads, initialPackages, initialPayments, initialTravellers } from '@/data/mockData'
import { supabase } from '@/lib/supabase'

const unavailable = () => {
  throw new Error('Supabase is not configured. Add the public project URL and anonymous key, then apply the proposed schema.')
}

export const dataSource = appConfig.useMockData ? 'mock' : 'supabase'

export const recordsService = {
  async getLeads() { return appConfig.useMockData ? structuredClone(initialLeads) : supabase ? (await supabase.from('leads').select('*')).data ?? [] : unavailable() },
  async getCustomers() { return appConfig.useMockData ? structuredClone(initialCustomers) : supabase ? (await supabase.from('customers').select('*')).data ?? [] : unavailable() },
  async getPackages() { return appConfig.useMockData ? structuredClone(initialPackages) : supabase ? (await supabase.from('packages').select('*')).data ?? [] : unavailable() },
  async getBookings() { return appConfig.useMockData ? structuredClone(initialBookings) : supabase ? (await supabase.from('bookings').select('*')).data ?? [] : unavailable() },
  async getTravellers() { return appConfig.useMockData ? structuredClone(initialTravellers) : supabase ? (await supabase.from('travellers').select('*')).data ?? [] : unavailable() },
  async getPayments() { return appConfig.useMockData ? structuredClone(initialPayments) : supabase ? (await supabase.from('payments').select('*')).data ?? [] : unavailable() },
}
