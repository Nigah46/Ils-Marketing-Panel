'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { useRouter } from 'next/navigation'

interface User {
  id: string
  name: string
  email: string
  phone?: string
  role: 'admin' | 'Manager' | 'Employee'
  department: string
  permissions: string[]
  employeeId?: string
  isActive?: boolean
  statistics?: {
    totalAssigned: number
    converted: number
    inProgress: number
    closed: number
    conversionRate: string
    pendingFollowUps: number
  }
}

interface AuthContextType {
  user: User | null
  login: (email: string, password: string) => Promise<boolean>
  logout: () => void
  isLoading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Check if user is logged in on mount
    const savedUser = localStorage.getItem('user')
    if (savedUser && savedUser !== 'undefined') {
      try {
        setUser(JSON.parse(savedUser))
      } catch (error) {
        console.error('Failed to parse saved user data:', error)
        localStorage.removeItem('user')
      }
    }
    setIsLoading(false)
  }, [])

  const login = async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true)
    
    try {
      // Call backend login API
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'}/api/employee/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      })

      const data = await response.json()

      if (data.success && data.data.employee) {
        const employee = data.data.employee
        const token = data.data.token

        // Store token for future API calls
        localStorage.setItem('token', token)

        // Get employee details with statistics
        const detailsResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'}/api/employee/me`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        })

        const detailsData = await detailsResponse.json()

        if (detailsData.success) {
          const employeeWithStats = detailsData.data.employee
          const statistics = detailsData.data.statistics

          const user: User = {
            id: employeeWithStats._id,
            name: employeeWithStats.name,
            email: employeeWithStats.email,
            phone: employeeWithStats.phone,
            role: employeeWithStats.role as 'admin' | 'Manager' | 'Employee',
            department: employeeWithStats.department,
            employeeId: employeeWithStats.employeeId,
            isActive: employeeWithStats.isActive,
            permissions: getRolePermissions(employeeWithStats.role.toLowerCase()),
            statistics
          }

          setUser(user)
          localStorage.setItem('user', JSON.stringify(user))
          setIsLoading(false)

          // Navigate based on role
          navigateByRole(user.role)
          
          return true
        }
      }
      
      setIsLoading(false)
      return false
    } catch (error) {
      console.error('Login error:', error)
      setIsLoading(false)
      return false
    }
  }

  const getRolePermissions = (role: string): string[] => {
    switch (role) {
      case 'admin':
        return ['view_all', 'edit_all', 'delete_all', 'manage_users']
      case 'manager':
        return ['view_all', 'edit_team', 'manage_counsellors', 'view_reports']
      case 'counsellor':
        return ['view_own_leads', 'edit_own_leads', 'view_own_sales']
      default:
        return []
    }
  }

  const navigateByRole = (role: string) => {
    if (typeof window !== 'undefined') {
      switch (role) {
        case 'admin':
          window.location.href = '/dashboard/admin'
          break
        case 'manager':
          window.location.href = '/dashboard/manager'
          break
        case 'counsellor':
          window.location.href = '/dashboard/counsellor'
          break
        default:
          window.location.href = '/dashboard'
      }
    }
  }

  const logout = () => {
    setUser(null)
    // Clear localStorage
    localStorage.removeItem('user')
    localStorage.removeItem('token')
    localStorage.clear()
    
    // Clear sessionStorage
    sessionStorage.clear()
    
    // Navigate to login page
    if (typeof window !== 'undefined') {
      window.location.href = '/login'
    }
  }

  return (
    <AuthContext.Provider value={{ user, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
