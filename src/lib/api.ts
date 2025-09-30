// API utilities and mock data fetching with SWR integration

import { Lead, Sale, Student, MetricData } from './mockData'

// Mock API delay to simulate real API calls
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

// API endpoints simulation
export const api = {
  // Leads API
  getLeads: async (): Promise<Lead[]> => {
    await delay(500)
    const { mockLeads } = await import('./mockData')
    return mockLeads
  },

  createLead: async (leadData: Omit<Lead, 'id' | 'createdAt'>): Promise<Lead> => {
    await delay(300)
    const newLead: Lead = {
      id: Date.now().toString(),
      ...leadData,
      createdAt: new Date().toISOString()
    }
    return newLead
  },

  updateLead: async (id: string, updates: Partial<Lead>): Promise<Lead> => {
    await delay(300)
    const { mockLeads } = await import('./mockData')
    const lead = mockLeads.find(l => l.id === id)
    if (!lead) throw new Error('Lead not found')
    return { ...lead, ...updates }
  },

  // Sales API
  getSales: async (): Promise<Sale[]> => {
    await delay(500)
    const { mockSales } = await import('./mockData')
    return mockSales
  },

  updateSale: async (id: string, updates: Partial<Sale>): Promise<Sale> => {
    await delay(300)
    const { mockSales } = await import('./mockData')
    const sale = mockSales.find(s => s.id === id)
    if (!sale) throw new Error('Sale not found')
    return { ...sale, ...updates }
  },

  // Students API
  getStudents: async (): Promise<Student[]> => {
    await delay(500)
    const { mockStudents } = await import('./mockData')
    return mockStudents
  },

  updateStudent: async (id: string, updates: Partial<Student>): Promise<Student> => {
    await delay(300)
    const { mockStudents } = await import('./mockData')
    const student = mockStudents.find(s => s.id === id)
    if (!student) throw new Error('Student not found')
    return { ...student, ...updates }
  },

  // Metrics API
  getMetrics: async (): Promise<MetricData[]> => {
    await delay(300)
    const { mockMetrics } = await import('./mockData')
    return mockMetrics
  },

  // Dashboard chart data
  getChartData: async () => {
    await delay(300)
    const { chartData } = await import('./mockData')
    return chartData
  }
}

// SWR key constants
export const SWR_KEYS = {
  LEADS: '/api/leads',
  SALES: '/api/sales', 
  STUDENTS: '/api/students',
  METRICS: '/api/metrics',
  CHART_DATA: '/api/chart-data'
}

// Error handling utility
export class ApiError extends Error {
  constructor(message: string, public status?: number) {
    super(message)
    this.name = 'ApiError'
  }
}

// Generic fetcher function for SWR
export const fetcher = async (url: string) => {
  switch (url) {
    case SWR_KEYS.LEADS:
      return api.getLeads()
    case SWR_KEYS.SALES:
      return api.getSales()
    case SWR_KEYS.STUDENTS:
      return api.getStudents()
    case SWR_KEYS.METRICS:
      return api.getMetrics()
    case SWR_KEYS.CHART_DATA:
      return api.getChartData()
    default:
      throw new ApiError(`Unknown endpoint: ${url}`, 404)
  }
}
