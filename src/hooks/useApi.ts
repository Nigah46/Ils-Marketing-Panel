// Custom hooks for data fetching with SWR

import useSWR from 'swr'
import { api, fetcher, SWR_KEYS } from '@/lib/api'
import { Lead, Sale, Student, MetricData } from '@/lib/mockData'

// Leads hooks
export function useLeads() {
  const { data, error, isLoading, mutate } = useSWR(SWR_KEYS.LEADS, fetcher)
  
  return {
    leads: data as Lead[] | undefined,
    isLoading,
    isError: error,
    mutate,
    createLead: async (leadData: Omit<Lead, 'id' | 'createdAt'>) => {
      const newLead = await api.createLead(leadData)
      const currentData = data as Lead[] || []
      mutate([...currentData, newLead], false)
      return newLead
    },
    updateLead: async (id: string, updates: Partial<Lead>) => {
      const updatedLead = await api.updateLead(id, updates)
      const currentData = data as Lead[] || []
      mutate(
        currentData.map((lead: Lead) => lead.id === id ? updatedLead : lead),
        false
      )
      return updatedLead
    }
  }
}

// Sales hooks
export function useSales() {
  const { data, error, isLoading, mutate } = useSWR(SWR_KEYS.SALES, fetcher)
  
  return {
    sales: data as Sale[] | undefined,
    isLoading,
    isError: error,
    mutate,
    updateSale: async (id: string, updates: Partial<Sale>) => {
      const updatedSale = await api.updateSale(id, updates)
      const currentData = data as Sale[] || []
      mutate(
        currentData.map((sale: Sale) => sale.id === id ? updatedSale : sale),
        false
      )
      return updatedSale
    }
  }
}

// Students hooks
export function useStudents() {
  const { data, error, isLoading, mutate } = useSWR(SWR_KEYS.STUDENTS, fetcher)
  
  return {
    students: data as Student[] | undefined,
    isLoading,
    isError: error,
    mutate,
    updateStudent: async (id: string, updates: Partial<Student>) => {
      const updatedStudent = await api.updateStudent(id, updates)
      const currentData = data as Student[] || []
      mutate(
        currentData.map((student: Student) => student.id === id ? updatedStudent : student),
        false
      )
      return updatedStudent
    }
  }
}

// Metrics hooks
export function useMetrics() {
  const { data, error, isLoading } = useSWR(SWR_KEYS.METRICS, fetcher)
  
  return {
    metrics: data as MetricData[] | undefined,
    isLoading,
    isError: error
  }
}

// Chart data hooks
export function useChartData() {
  const { data, error, isLoading } = useSWR(SWR_KEYS.CHART_DATA, fetcher)
  
  return {
    chartData: data,
    isLoading,
    isError: error
  }
}
