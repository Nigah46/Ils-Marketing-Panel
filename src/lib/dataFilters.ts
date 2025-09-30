// Data filtering utilities for counsellor-specific views

import { Lead, Sale, Student, MetricData } from './mockData'

export interface User {
  id: string
  name: string
  email: string
  role: 'admin' | 'counsellor' | 'manager'
  counsellorId?: string
  department?: string
  permissions: string[]
}

// Filter data based on user role and permissions
export class DataFilter {
  static filterLeads(leads: Lead[], user: User): Lead[] {
    if (user.role === 'admin') {
      return leads
    }
    
    if (user.role === 'manager') {
      // Managers can see all leads in their department
      return leads.filter(lead => {
        // For now, filter by counsellor ID or show all if no specific assignment
        return true // In real implementation, filter by department
      })
    }
    
    if (user.role === 'counsellor') {
      // Counsellors can only see their own leads
      return leads.filter(lead => lead.counsellorId === user.counsellorId)
    }
    
    return []
  }

  static filterSales(sales: Sale[], user: User): Sale[] {
    if (user.role === 'admin') {
      return sales
    }
    
    if (user.role === 'manager') {
      // Managers can see all sales in their department
      return sales.filter(sale => {
        // For now, show all sales
        return true // In real implementation, filter by department
      })
    }
    
    if (user.role === 'counsellor') {
      // Counsellors can only see their own sales
      return sales.filter(sale => sale.counsellorId === user.counsellorId)
    }
    
    return []
  }

  static filterStudents(students: Student[], user: User): Student[] {
    if (user.role === 'admin') {
      return students
    }
    
    if (user.role === 'manager') {
      // Managers can see all students in their department
      return students.filter(student => {
        // For now, show all students
        return true // In real implementation, filter by department
      })
    }
    
    if (user.role === 'counsellor') {
      // Counsellors can only see their own students
      return students.filter(student => student.counsellorId === user.counsellorId)
    }
    
    return []
  }

  static calculateMetrics(leads: Lead[], sales: Sale[], students: Student[], user: User): MetricData[] {
    const filteredLeads = this.filterLeads(leads, user)
    const filteredSales = this.filterSales(sales, user)
    const filteredStudents = this.filterStudents(students, user)

    // Calculate counsellor-specific metrics
    const today = new Date()
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)
    
    const todayLeads = filteredLeads.filter(lead => {
      const leadDate = new Date(lead.createdAt)
      return leadDate.toDateString() === today.toDateString()
    }).length

    const weekStart = new Date(today)
    weekStart.setDate(today.getDate() - 7)
    const weekLeads = filteredLeads.filter(lead => {
      const leadDate = new Date(lead.createdAt)
      return leadDate >= weekStart
    }).length

    const monthStart = new Date(today)
    monthStart.setMonth(today.getMonth() - 1)
    const monthSales = filteredSales.filter(sale => {
      const saleDate = new Date(sale.createdAt)
      return saleDate >= monthStart && sale.status === 'Closed-Won'
    }).length

    const monthRevenue = filteredSales
      .filter(sale => {
        const saleDate = new Date(sale.createdAt)
        return saleDate >= monthStart && sale.status === 'Closed-Won'
      })
      .reduce((sum, sale) => sum + sale.amount, 0)

    return [
      {
        label: user.role === 'counsellor' ? 'My New Leads Today' : 'New Leads Today',
        value: todayLeads,
        change: 8.2, // Mock change percentage
        period: 'vs yesterday'
      },
      {
        label: user.role === 'counsellor' ? 'My Leads This Week' : 'Leads This Week',
        value: weekLeads,
        change: 15.3,
        period: 'vs last week'
      },
      {
        label: user.role === 'counsellor' ? 'My Sales This Month' : 'Sales This Month',
        value: monthSales,
        change: -2.1,
        period: 'vs last month'
      },
      {
        label: user.role === 'counsellor' ? 'My Revenue This Month' : 'Revenue This Month',
        value: monthRevenue,
        change: 12.5,
        period: 'vs last month'
      }
    ]
  }

  static hasPermission(user: User, permission: string): boolean {
    return user.permissions.includes(permission) || user.permissions.includes('edit_all') || user.permissions.includes('view_all')
  }

  static canViewAllData(user: User): boolean {
    return user.role === 'admin' || user.permissions.includes('view_all')
  }

  static canEditAllData(user: User): boolean {
    return user.role === 'admin' || user.permissions.includes('edit_all')
  }

  static canManageUsers(user: User): boolean {
    return user.role === 'admin' || user.permissions.includes('manage_users')
  }
}
