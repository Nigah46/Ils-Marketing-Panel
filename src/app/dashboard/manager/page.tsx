'use client'

import { useState, useEffect, useRef } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { 
  UserGroupIcon, 
  ChartBarIcon, 
  CurrencyDollarIcon,
  ArrowTrendingUpIcon,
  ArrowUpIcon,
  PlusIcon,
  UsersIcon,
  UserIcon,
  ClipboardDocumentListIcon,
  ArrowRightOnRectangleIcon,
  BellIcon,
  Cog6ToothIcon,
  EyeIcon,
  CalendarDaysIcon,
  PhoneIcon,
  EnvelopeIcon,
  MapPinIcon,
  TrophyIcon,
  FireIcon,
  SparklesIcon,
  RocketLaunchIcon
} from '@heroicons/react/24/outline'
import { 
  UserGroupIcon as UserGroupIconSolid,
  ClipboardDocumentListIcon as ClipboardIconSolid,
  CurrencyDollarIcon as CurrencyIconSolid,
  ArrowTrendingUpIcon as TrendingIconSolid
} from '@heroicons/react/24/solid'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts'
import Card from '@/components/ui/Card'
import DataTable from '@/components/ui/DataTable'
import Button from '@/components/ui/Button'
import { inquiryApi } from '@/lib/inquiryApi'
import { employeeApi, type CreateEmployeeData, type CreateInquiryData } from '@/lib/employeeApi'
import LeadAssignment from '@/components/manager/LeadAssignment'
import NotificationPanel from '@/components/manager/NotificationPanel'
import * as XLSX from 'xlsx'

interface Employee {
  _id: string
  employeeId: string
  name: string
  email: string
  phone: string
  role: string
  department: string
  isActive: boolean
  joiningDate: string
  statistics?: {
    totalAssigned: number
    converted: number
    conversionRate: string
  }
}

// Real-time data will be fetched from APIs

// Initial activities data - will be replaced by real-time data
const initialActivities = [
  { id: 1, type: 'conversion', message: 'Sarah Johnson converted a lead worth ₹25,000', timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), icon: TrophyIcon, priority: 'high' },
  { id: 2, type: 'inquiry', message: 'New inquiry from Mumbai for Web Development', timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000), icon: ClipboardDocumentListIcon, priority: 'medium' },
  { id: 3, type: 'follow-up', message: 'Mike Chen scheduled follow-up with 3 prospects', timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000), icon: CalendarDaysIcon, priority: 'low' },
  { id: 4, type: 'target', message: 'Team achieved 95% of monthly target', timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000), icon: RocketLaunchIcon, priority: 'high' },
]

// Real-time activity templates for simulation
const activityTemplates = [
  { type: 'conversion', messages: [
    'converted a lead worth ₹{amount}',
    'closed a deal for ₹{amount}',
    'successfully converted prospect to ₹{amount} deal'
  ], icon: TrophyIcon, priority: 'high' },
  { type: 'inquiry', messages: [
    'received new inquiry from {city} for {service}',
    'new lead from {city} interested in {service}',
    'prospect from {city} inquired about {service}'
  ], icon: ClipboardDocumentListIcon, priority: 'medium' },
  { type: 'follow-up', messages: [
    'scheduled follow-up with {count} prospects',
    'completed follow-up calls with {count} leads',
    'sent follow-up emails to {count} potential clients'
  ], icon: CalendarDaysIcon, priority: 'low' },
  { type: 'meeting', messages: [
    'scheduled demo meeting with {company}',
    'booked consultation call with {company}',
    'arranged product presentation for {company}'
  ], icon: CalendarDaysIcon, priority: 'medium' },
  { type: 'proposal', messages: [
    'sent proposal to {company} worth ₹{amount}',
    'submitted quote for ₹{amount} to {company}',
    'delivered project proposal to {company}'
  ], icon: ClipboardDocumentListIcon, priority: 'medium' }
]

const employees = ['Sarah Johnson', 'Mike Chen', 'Emily Davis', 'Alex Kumar', 'Lisa Wong', 'David Brown', 'Jennifer Lee']
const cities = ['Mumbai', 'Delhi', 'Bangalore', 'Chennai', 'Hyderabad', 'Pune', 'Kolkata']
const services = ['Web Development', 'Mobile App', 'Data Science', 'Cloud Migration', 'Digital Marketing', 'UI/UX Design']
const companies = ['TechCorp', 'StartupXYZ', 'Enterprise Ltd', 'Innovation Inc', 'Digital Solutions', 'Future Systems']


export default function ManagerDashboard() {
  const { user, logout } = useAuth()
  const [employees, setEmployees] = useState<Employee[]>([])
  const [stats, setStats] = useState({
    totalCounsellors: 0,
    totalLeads: 0,
    totalConversions: 0,
    avgConversionRate: 0,
    activeLeads: 0
  })
  
  // Real-time data state
  const [performanceData, setPerformanceData] = useState<any[]>([])
  const [statusDistribution, setStatusDistribution] = useState<any[]>([])
  const [topPerformers, setTopPerformers] = useState<any[]>([])
  const [inquiries, setInquiries] = useState<any[]>([])
  
  // Real-time activity state
  const [recentActivities, setRecentActivities] = useState<any[]>([])
  const [newActivityCount, setNewActivityCount] = useState(0)
  const [isLive, setIsLive] = useState(true)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  // Bulk upload state
  const [bulkRows, setBulkRows] = useState<any[]>([])
  const [bulkParsing, setBulkParsing] = useState(false)
  const [bulkImporting, setBulkImporting] = useState(false)
  const [bulkProgress, setBulkProgress] = useState({ success: 0, failed: 0 })
  const [bulkErrors, setBulkErrors] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddEmployee, setShowAddEmployee] = useState(false)
  const [showAddInquiry, setShowAddInquiry] = useState(false)
  const [inquiryMode, setInquiryMode] = useState<'manual' | 'excel'>('manual')
  const [newEmployee, setNewEmployee] = useState({
    employeeId: '',
    name: '',
    email: '',
    phone: '',
    department: '',
    role: 'Employee',
    specialization: [] as string[],
    address: {
      street: '',
      city: '',
      state: '',
      pincode: '',
      country: 'India'
    },
    workingHours: {
      start: '09:00',
      end: '18:00'
    },
    password: ''
  })
  const [newInquiry, setNewInquiry] = useState({
    type: 'Counselling',
    customerName: '',
    email: '',
    phone: '',
    alternatePhone: '',
    address: {
      street: '',
      city: '',
      state: '',
      pincode: '',
      country: 'India'
    },
    message: '',
    courseInterested: '',
    status: 'New',
    priority: 'Medium',
    source: 'Website',
    assignedTo: '',
    nextFollowUp: '',
    managerRemarks: ''
  })
  const [showOtherCourse, setShowOtherCourse] = useState(false)
  const [otherCourse, setOtherCourse] = useState('')
  
  const courseOptions = [
    'Web Development',
    'Mobile App Development',
    'Data Science',
    'Machine Learning',
    'Digital Marketing',
    'Graphic Design',
    'UI/UX Design',
    'Cybersecurity',
    'Cloud Computing',
    'DevOps',
    'Other'
  ]

  // Real-time activity functions
  const generateRandomActivity = () => {
    if (inquiries.length === 0 || employees.length === 0) return null
    
    const template = activityTemplates[Math.floor(Math.random() * activityTemplates.length)]
    const employee = employees[Math.floor(Math.random() * employees.length)]
    const inquiry = inquiries[Math.floor(Math.random() * inquiries.length)]
    const city = cities[Math.floor(Math.random() * cities.length)]
    const service = services[Math.floor(Math.random() * services.length)]
    const company = companies[Math.floor(Math.random() * companies.length)]
    const amount = (Math.floor(Math.random() * 100) + 20) * 1000 // 20K to 120K
    const count = Math.floor(Math.random() * 5) + 1 // 1 to 5

    let message = template.messages[Math.floor(Math.random() * template.messages.length)]
    
    // Use real data when available
    const realCity = inquiry.customerName || city
    const realService = inquiry.courseInterest || service
    
    message = message
      .replace('{amount}', amount.toLocaleString())
      .replace('{city}', realCity)
      .replace('{service}', realService)
      .replace('{company}', company)
      .replace('{count}', count.toString())

    return {
      id: Date.now() + Math.random(),
      type: template.type,
      message: `${employee.name} ${message}`,
      timestamp: new Date(),
      icon: template.icon,
      priority: template.priority
    }
  }

  const formatTimeAgo = (timestamp: Date) => {
    const now = new Date()
    const diffInSeconds = Math.floor((now.getTime() - timestamp.getTime()) / 1000)
    
    if (diffInSeconds < 60) return 'Just now'
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`
    return `${Math.floor(diffInSeconds / 86400)}d ago`
  }

  const addNewActivity = (activity: any) => {
    setRecentActivities(prev => {
      const newActivities = [activity, ...prev].slice(0, 10) // Keep only latest 10
      return newActivities
    })
    setNewActivityCount(prev => prev + 1)
    
    // Auto-reset new activity count after 3 seconds
    setTimeout(() => {
      setNewActivityCount(0)
    }, 3000)
  }

  useEffect(() => {
    if (user?.role === 'Manager') {
      fetchDashboardData()
    }
  }, [user])

  // Real-time activity simulation
  useEffect(() => {
    if (!isLive) return

    const interval = setInterval(() => {
      // Generate new activity every 15-45 seconds
      const randomDelay = Math.random() * 30000 + 15000
      setTimeout(() => {
        const newActivity = generateRandomActivity()
        addNewActivity(newActivity)
      }, randomDelay)
    }, 30000) // Check every 30 seconds

    return () => clearInterval(interval)
  }, [isLive, employees])

  // Real-time data refresh every 60 seconds
  useEffect(() => {
    if (!isLive) return

    const dataRefreshInterval = setInterval(() => {
      fetchDashboardData()
    }, 60000) // Refresh data every 60 seconds

    return () => clearInterval(dataRefreshInterval)
  }, [isLive])

  const fetchDashboardData = async () => {
    try {
      setLoading(true)
      
      // Fetch team members (counsellors)
      const employeesResponse = await employeeApi.getEmployees({ 
        role: 'Employee', 
        limit: 100 
      })
      
      // Fetch all inquiries for team performance
      const inquiriesResponse = await inquiryApi.getAllInquiries({ limit: 1000 })
      
      const teamEmployees = employeesResponse.data || []
      const allInquiries = inquiriesResponse.data || []
      
      // Calculate team statistics
      const totalLeads = allInquiries.length
      const totalConversions = allInquiries.filter(lead => lead.status === 'Converted').length
      const activeLeads = allInquiries.filter(lead => 
        ['New', 'Contacted', 'Interested', 'Follow Up'].includes(lead.status)
      ).length
      const avgConversionRate = totalLeads > 0 ? (totalConversions / totalLeads) * 100 : 0
      
      setEmployees(teamEmployees)
      setInquiries(allInquiries)
      setStats({
        totalCounsellors: teamEmployees.length,
        totalLeads,
        totalConversions,
        avgConversionRate,
        activeLeads
      })
      
      // Build real-time charts and data
      buildPerformanceData(allInquiries)
      buildStatusDistribution(allInquiries)
      buildTopPerformers(teamEmployees, allInquiries)
      initializeRealTimeActivities(allInquiries, teamEmployees)
      
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  // Build performance data from real inquiries
  const buildPerformanceData = (inquiries: any[]) => {
    const monthlyData = []
    const currentDate = new Date()
    
    for (let i = 5; i >= 0; i--) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1)
      const monthName = date.toLocaleDateString('en-US', { month: 'short' })
      
      const monthInquiries = inquiries.filter(inq => {
        const inquiryDate = new Date(inq.createdAt)
        return inquiryDate.getMonth() === date.getMonth() && 
               inquiryDate.getFullYear() === date.getFullYear()
      })
      
      const conversions = monthInquiries.filter(inq => inq.status === 'Converted').length
      const leads = monthInquiries.length
      const revenue = conversions * 45000 // Estimated revenue per conversion
      const target = Math.max(conversions, Math.ceil(leads * 0.25)) // 25% target or actual conversions
      
      monthlyData.push({
        month: monthName,
        leads,
        conversions,
        target,
        revenue
      })
    }
    
    setPerformanceData(monthlyData)
  }

  // Build status distribution from real data
  const buildStatusDistribution = (inquiries: any[]) => {
    const statusCounts = inquiries.reduce((acc, inq) => {
      acc[inq.status] = (acc[inq.status] || 0) + 1
      return acc
    }, {} as Record<string, number>)
    
    const total = inquiries.length
    if (total === 0) {
      setStatusDistribution([])
      return
    }
    
    const distribution = [
      { name: 'New', value: Math.round(((statusCounts['New'] || 0) / total) * 100), color: '#3B82F6' },
      { name: 'In Progress', value: Math.round((((statusCounts['Contacted'] || 0) + (statusCounts['Interested'] || 0) + (statusCounts['Follow Up'] || 0)) / total) * 100), color: '#F59E0B' },
      { name: 'Converted', value: Math.round(((statusCounts['Converted'] || 0) / total) * 100), color: '#10B981' },
      { name: 'Closed', value: Math.round((((statusCounts['Closed'] || 0) + (statusCounts['Lost'] || 0)) / total) * 100), color: '#EF4444' },
    ].filter(item => item.value > 0)
    
    setStatusDistribution(distribution)
  }

  // Build top performers from real data
  const buildTopPerformers = (employees: any[], inquiries: any[]) => {
    const performerStats = employees.map(emp => {
      const empInquiries = inquiries.filter(inq => inq.assignedTo?._id === emp._id)
      const conversions = empInquiries.filter(inq => inq.status === 'Converted').length
      const revenue = conversions * 45000
      const conversionRate = empInquiries.length > 0 ? (conversions / empInquiries.length) * 100 : 0
      
      return {
        name: emp.name,
        conversions,
        revenue,
        growth: `+${Math.round(conversionRate)}%`,
        totalLeads: empInquiries.length
      }
    })
    
    // Sort by conversions and take top 4
    const topPerfs = performerStats
      .filter(p => p.conversions > 0)
      .sort((a, b) => b.conversions - a.conversions)
      .slice(0, 4)
    
    setTopPerformers(topPerfs)
  }

  // Initialize real-time activities from real data
  const initializeRealTimeActivities = (inquiries: any[], employees: any[]) => {
    const activities: any[] = []
    const recentInquiries = inquiries
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 5)
    
    recentInquiries.forEach((inq, index) => {
      const employee = employees.find(emp => emp._id === inq.assignedTo?._id)
      const timestamp = new Date(Date.now() - (index + 1) * 30 * 60 * 1000)
      
      if (inq.status === 'Converted' && employee) {
        activities.push({
          id: Date.now() + index,
          type: 'conversion',
          message: `${employee.name} converted a lead worth ₹45,000`,
          timestamp,
          icon: TrophyIcon,
          priority: 'high'
        })
      } else if (inq.status === 'New') {
        activities.push({
          id: Date.now() + index,
          type: 'inquiry',
          message: `New inquiry from ${inq.customerName} for ${inq.courseInterest || 'course inquiry'}`,
          timestamp,
          icon: ClipboardDocumentListIcon,
          priority: 'medium'
        })
      }
    })
    
    setRecentActivities(activities)
  }

  const handleAddInquiry = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const inquiryData: CreateInquiryData = {
        ...newInquiry,
        subject: newInquiry.message || 'Inquiry',
        assignedTo: newInquiry.assignedTo || undefined,
        nextFollowUp: newInquiry.nextFollowUp || undefined,
      }
      
      const response = await employeeApi.createInquiry(inquiryData)
      if (response.success) {
        setShowAddInquiry(false)
        setNewInquiry({
          type: 'Counselling',
          customerName: '',
          email: '',
          phone: '',
          alternatePhone: '',
          address: {
            street: '',
            city: '',
            state: '',
            pincode: '',
            country: 'India'
          },
          message: '',
          courseInterested: '',
          status: 'New',
          priority: 'Medium',
          source: 'Website',
          assignedTo: '',
          nextFollowUp: '',
          managerRemarks: ''
        })
        setShowOtherCourse(false)
        setOtherCourse('')
        fetchDashboardData() // Refresh data
        alert('Inquiry added successfully!')
      }
    } catch (error) {
      console.error('Failed to add inquiry:', error)
      alert(`Failed to add inquiry: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  const handleExcelFile = async (file: File) => {
    try {
      setBulkParsing(true)
      setBulkErrors([])
      setBulkRows([])
      const data = await file.arrayBuffer()
      const workbook = XLSX.read(data, { type: 'array' })
      const firstSheet = workbook.SheetNames[0]
      const sheet = workbook.Sheets[firstSheet]
      const rows = XLSX.utils.sheet_to_json<any>(sheet, { defval: '' })
      setBulkRows(rows)
    } catch (e: any) {
      setBulkErrors([e?.message || 'Failed to parse the spreadsheet'])
    } finally {
      setBulkParsing(false)
    }
  }

  const normalizeRowToInquiry = (row: any): CreateInquiryData => {
    // Expect headers like: type, customerName, email, phone, alternatePhone, subject, message, courseInterested, preferredBatch, budget, status, priority, source, assignedTo, nextFollowUp, address.street, address.city, address.state, address.pincode, address.country
    const get = (k: string) => row[k] ?? row[k.toLowerCase()] ?? ''
    const address = {
      street: row['address.street'] ?? row['street'] ?? '',
      city: row['address.city'] ?? row['city'] ?? '',
      state: row['address.state'] ?? row['state'] ?? '',
      pincode: row['address.pincode'] ?? row['pincode'] ?? '',
      country: row['address.country'] ?? row['country'] ?? 'India',
    }
    const budgetVal = get('budget')
    const budget = budgetVal !== '' && !isNaN(Number(budgetVal)) ? Number(budgetVal) : undefined
    const nextFollowUp = get('nextFollowUp') || get('next_follow_up') || get('next follow up')
    return {
      type: (get('type') || 'General') as string,
      customerName: get('customerName') || get('name') || '',
      email: get('email') || '',
      phone: get('phone') || '',
      alternatePhone: get('alternatePhone') || get('altPhone') || undefined,
      address,
      subject: get('subject') || '-',
      message: get('message') || '-',
      courseInterested: get('courseInterested') || undefined,
      preferredBatch: get('preferredBatch') || undefined,
      budget,
      status: (get('status') || 'New') as string,
      priority: (get('priority') || 'Medium') as string,
      source: (get('source') || 'Website') as string,
      assignedTo: get('assignedTo') || undefined,
      nextFollowUp: nextFollowUp || undefined,
    }
  }

  const importInquiriesFromExcel = async () => {
    if (!bulkRows.length) return
    setBulkImporting(true)
    setBulkProgress({ success: 0, failed: 0 })
    setBulkErrors([])
    try {
      for (let i = 0; i < bulkRows.length; i++) {
        const row = bulkRows[i]
        try {
          const payload = normalizeRowToInquiry(row)
          // Basic validation
          if (!payload.customerName || !payload.email || !payload.phone || !payload.type) {
            throw new Error(`Row ${i + 1}: Missing required fields (customerName, email, phone, type)`) 
          }
          const res = await employeeApi.createInquiry(payload)
          if (!res.success) throw new Error(`Row ${i + 1}: API returned failure`)
          setBulkProgress(p => ({ ...p, success: p.success + 1 }))
        } catch (err: any) {
          setBulkProgress(p => ({ ...p, failed: p.failed + 1 }))
          setBulkErrors(prev => [...prev, err?.message || `Row ${i + 1}: Unknown error`])
        }
      }
      fetchDashboardData()
    } finally {
      setBulkImporting(false)
    }
  }

  const handleAddEmployee = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      // Generate employee ID if not provided
      const employeeData = {
        ...newEmployee,
        employeeId: newEmployee.employeeId || `EMP${Date.now()}`,
        reportingManager: user?.id // Set current manager as reporting manager
      }
      
      const response = await employeeApi.createEmployee(employeeData)
      if (response.success) {
        setShowAddEmployee(false)
        setNewEmployee({
          employeeId: '',
          name: '',
          email: '',
          phone: '',
          department: '',
          role: 'Employee',
          specialization: [],
          address: {
            street: '',
            city: '',
            state: '',
            pincode: '',
            country: 'India'
          },
          workingHours: {
            start: '09:00',
            end: '18:00'
          },
          password: ''
        })
        fetchDashboardData() // Refresh data
        alert('Employee added successfully!')
      }
    } catch (error) {
      console.error('Failed to add employee:', error)
      alert(`Failed to add employee: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  const employeeColumns = [
    {
      key: 'employeeId',
      label: 'Employee ID',
    },
    {
      key: 'name',
      label: 'Name',
    },
    {
      key: 'email',
      label: 'Email',
    },
    {
      key: 'department',
      label: 'Department',
    },
    {
      key: 'isActive',
      label: 'Status',
      render: (value: boolean) => (
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
          value 
            ? 'bg-green-100 text-green-800' 
            : 'bg-red-100 text-red-800'
        }`}>
          {value ? 'Active' : 'Inactive'}
        </span>
      )
    },
    {
      key: 'statistics',
      label: 'Performance',
      render: (stats: any) => (
        <div className="text-sm">
          <div>Leads: {stats?.totalAssigned || 0}</div>
          <div>Conversions: {stats?.converted || 0}</div>
          <div className="text-green-600">Rate: {stats?.conversionRate || '0'}%</div>
        </div>
      )
    }
  ]

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Modern Header */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-gray-200/50 sticky top-0 z-40">
        <div className="px-6 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center">
                  <ChartBarIcon className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
                    Manager Dashboard
                  </h1>
                  <p className="text-sm text-gray-500">Welcome back, {user?.name}</p>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              {/* Real-time Data Indicator */}
              <div className="flex items-center space-x-2 px-3 py-2 bg-green-50 rounded-lg">
                <div className={`w-2 h-2 rounded-full ${isLive ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`}></div>
                <span className="text-sm text-gray-600">{isLive ? 'Live Data' : 'Paused'}</span>
                <button
                  onClick={() => setIsLive(!isLive)}
                  className="text-xs text-blue-600 hover:text-blue-800"
                >
                  {isLive ? 'Pause' : 'Resume'}
                </button>
              </div>
              
              <Button onClick={() => setShowAddInquiry(true)} className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white border-0">
                <ClipboardDocumentListIcon className="h-4 w-4 mr-2" />
                Add Inquiry
              </Button>
              <Button onClick={() => setShowAddEmployee(true)} className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white border-0">
                <PlusIcon className="h-4 w-4 mr-2" />
                Add Employee
              </Button>
              <Button onClick={logout} variant="outline" className="border-gray-300 hover:bg-gray-50">
                <ArrowRightOnRectangleIcon className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>

      <div className="px-6 py-8 space-y-8">
        {/* Enhanced Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div 
            className="group relative overflow-hidden bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-6 text-white cursor-pointer transform hover:scale-105 transition-all duration-300 hover:shadow-2xl"
            onClick={() => window.location.href = '/dashboard/employees'}
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16"></div>
            <div className="relative">
              <div className="flex items-center justify-between mb-4">
                <UserGroupIconSolid className="h-8 w-8 text-white/90" />
                <span className="text-xs font-medium bg-white/20 px-2 py-1 rounded-full">Team</span>
              </div>
              <div>
                <p className="text-3xl font-bold mb-1">{stats.totalCounsellors}</p>
                <p className="text-blue-100 text-sm">Active Team Members</p>
                <div className="flex items-center mt-2 text-xs">
                  <ArrowUpIcon className="h-3 w-3 mr-1" />
                  <span>+2 this month</span>
                </div>
              </div>
            </div>
          </div>

          <div 
            className="group relative overflow-hidden bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-2xl p-6 text-white cursor-pointer transform hover:scale-105 transition-all duration-300 hover:shadow-2xl"
            onClick={() => window.location.href = '/dashboard/leads'}
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16"></div>
            <div className="relative">
              <div className="flex items-center justify-between mb-4">
                <ClipboardIconSolid className="h-8 w-8 text-white/90" />
                <span className="text-xs font-medium bg-white/20 px-2 py-1 rounded-full">Leads</span>
              </div>
              <div>
                <p className="text-3xl font-bold mb-1">{stats.totalLeads}</p>
                <p className="text-emerald-100 text-sm">Total Inquiries</p>
                <div className="flex items-center mt-2 text-xs">
                  <FireIcon className="h-3 w-3 mr-1" />
                  <span>{stats.activeLeads} active</span>
                </div>
              </div>
            </div>
          </div>

          <div 
            className="group relative overflow-hidden bg-gradient-to-br from-amber-500 to-orange-500 rounded-2xl p-6 text-white cursor-pointer transform hover:scale-105 transition-all duration-300 hover:shadow-2xl"
            onClick={() => window.location.href = '/dashboard/sales'}
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16"></div>
            <div className="relative">
              <div className="flex items-center justify-between mb-4">
                <CurrencyIconSolid className="h-8 w-8 text-white/90" />
                <span className="text-xs font-medium bg-white/20 px-2 py-1 rounded-full">Sales</span>
              </div>
              <div>
                <p className="text-3xl font-bold mb-1">{stats.totalConversions}</p>
                <p className="text-amber-100 text-sm">Conversions</p>
                <div className="flex items-center mt-2 text-xs">
                  <TrophyIcon className="h-3 w-3 mr-1" />
                  <span>₹1.2M revenue</span>
                </div>
              </div>
            </div>
          </div>

          <div 
            className="group relative overflow-hidden bg-gradient-to-br from-purple-500 to-indigo-600 rounded-2xl p-6 text-white cursor-pointer transform hover:scale-105 transition-all duration-300 hover:shadow-2xl"
            onClick={() => window.location.href = '/dashboard/admissions'}
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16"></div>
            <div className="relative">
              <div className="flex items-center justify-between mb-4">
                <TrendingIconSolid className="h-8 w-8 text-white/90" />
                <span className="text-xs font-medium bg-white/20 px-2 py-1 rounded-full">Rate</span>
              </div>
              <div>
                <p className="text-3xl font-bold mb-1">{stats.avgConversionRate.toFixed(1)}%</p>
                <p className="text-purple-100 text-sm">Conversion Rate</p>
                <div className="flex items-center mt-2 text-xs">
                  <SparklesIcon className="h-3 w-3 mr-1" />
                  <span>+5.2% vs last month</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white/70 backdrop-blur-sm rounded-2xl border border-gray-200/50 p-6">
          <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                  <BellIcon className="h-5 w-5 mr-2 text-blue-600" />
                  Recent Activity
                  {newActivityCount > 0 && (
                    <span className="ml-2 bg-red-500 text-white text-xs px-2 py-1 rounded-full animate-pulse">
                      {newActivityCount} new
                    </span>
                  )}
                </h3>
                <div className="flex items-center space-x-2">
                  <div className={`w-2 h-2 rounded-full ${isLive ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`}></div>
                  <span className="text-xs text-gray-500">{isLive ? 'Live' : 'Paused'}</span>
                  <button
                    onClick={() => setIsLive(!isLive)}
                    className="text-xs text-blue-600 hover:text-blue-800 ml-2"
                  >
                    {isLive ? 'Pause' : 'Resume'}
                  </button>
                </div>
              </div>
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {recentActivities.map((activity, index) => {
                  const IconComponent = activity.icon
                  const isNew = index < newActivityCount
                  const priorityColors = {
                    high: 'from-red-100 to-pink-100 border-red-200',
                    medium: 'from-yellow-100 to-orange-100 border-yellow-200',
                    low: 'from-blue-100 to-indigo-100 border-blue-200'
                  }
                  
                  return (
                    <div 
                      key={activity.id} 
                      className={`flex items-start space-x-3 p-3 rounded-xl transition-all duration-300 border ${
                        isNew 
                          ? 'bg-gradient-to-r from-green-50 to-emerald-50 border-green-200 shadow-md transform scale-[1.02]' 
                          : `bg-gradient-to-r ${priorityColors[activity.priority as keyof typeof priorityColors] || priorityColors.low} hover:shadow-sm`
                      }`}
                    >
                      <div className="flex-shrink-0">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                          activity.priority === 'high' 
                            ? 'bg-gradient-to-r from-red-500 to-pink-500' 
                            : activity.priority === 'medium'
                            ? 'bg-gradient-to-r from-yellow-500 to-orange-500'
                            : 'bg-gradient-to-r from-blue-500 to-indigo-500'
                        }`}>
                          <IconComponent className="h-4 w-4 text-white" />
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-gray-900 font-medium">{activity.message}</p>
                        <div className="flex items-center justify-between mt-1">
                          <p className="text-xs text-gray-500">{formatTimeAgo(activity.timestamp)}</p>
                          <span className={`text-xs px-2 py-1 rounded-full ${
                            activity.priority === 'high' 
                              ? 'bg-red-100 text-red-700' 
                              : activity.priority === 'medium'
                              ? 'bg-yellow-100 text-yellow-700'
                              : 'bg-blue-100 text-blue-700'
                          }`}>
                            {activity.priority}
                          </span>
                        </div>
                      </div>
                      {isNew && (
                        <div className="flex-shrink-0">
                          <div className="w-2 h-2 bg-green-500 rounded-full animate-ping"></div>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
              
              {/* Activity Stats */}
              <div className="mt-4 pt-4 border-t border-gray-200/50">
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <p className="text-lg font-semibold text-gray-900">{recentActivities.filter(a => a.type === 'conversion').length}</p>
                    <p className="text-xs text-gray-500">Conversions</p>
                  </div>
                  <div>
                    <p className="text-lg font-semibold text-gray-900">{recentActivities.filter(a => a.type === 'inquiry').length}</p>
                    <p className="text-xs text-gray-500">New Inquiries</p>
                  </div>
                  <div>
                    <p className="text-lg font-semibold text-gray-900">{recentActivities.filter(a => a.priority === 'high').length}</p>
                    <p className="text-xs text-gray-500">High Priority</p>
                  </div>
                </div>
              </div>
            </div>
        </div>

        {/* Enhanced Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Performance Chart */}
          <div className="lg:col-span-2">
            <div className="bg-white/70 backdrop-blur-sm rounded-2xl border border-gray-200/50 p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900">Team Performance</h3>
                <div className="flex items-center space-x-2">
                  <span className="text-xs text-gray-500">Last 6 months</span>
                </div>
              </div>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={performanceData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="month" stroke="#6b7280" fontSize={12} />
                  <YAxis stroke="#6b7280" fontSize={12} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'rgba(255, 255, 255, 0.95)', 
                      border: 'none', 
                      borderRadius: '12px',
                      boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)'
                    }} 
                  />
                  <Bar dataKey="leads" fill="url(#blueGradient)" name="Leads" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="conversions" fill="url(#greenGradient)" name="Conversions" radius={[4, 4, 0, 0]} />
                  <defs>
                    <linearGradient id="blueGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#3B82F6" />
                      <stop offset="100%" stopColor="#1D4ED8" />
                    </linearGradient>
                    <linearGradient id="greenGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#10B981" />
                      <stop offset="100%" stopColor="#059669" />
                    </linearGradient>
                  </defs>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Status Distribution */}
          <div className="lg:col-span-1">
            <div className="bg-white/70 backdrop-blur-sm rounded-2xl border border-gray-200/50 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">Lead Status</h3>
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie
                    data={statusDistribution}
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {statusDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <div className="mt-4 space-y-2">
                {statusDistribution.map((item, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: item.color }}></div>
                      <span className="text-sm text-gray-600">{item.name}</span>
                    </div>
                    <span className="text-sm font-medium text-gray-900">{item.value}%</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Top Performers */}
        <div className="bg-white/70 backdrop-blur-sm rounded-2xl border border-gray-200/50 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
            <TrophyIcon className="h-5 w-5 mr-2 text-amber-500" />
            Top Performers
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {topPerformers.map((performer, index) => (
              <div key={index} className="relative p-4 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl hover:shadow-lg transition-all duration-300">
                <div className="flex items-center justify-between mb-3">
                  <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                    {(() => {
                      if (!performer.name) return '';
                      const names = performer.name.split(' ');
                      return names.map((n: string) => n && n[0] || '').join('');
                    })()}
                  </div>
                  <span className="text-xs font-medium text-green-600 bg-green-100 px-2 py-1 rounded-full">
                    {performer.growth}
                  </span>
                </div>
                <h4 className="font-medium text-gray-900 mb-1">{performer.name || 'Unknown'}</h4>
                <p className="text-sm text-gray-600 mb-2">{performer.conversions} conversions</p>
                <p className="text-xs text-gray-500">₹{(performer.revenue / 1000).toFixed(0)}K revenue</p>
              </div>
            ))}
          </div>
        </div>

      {/* Add Employee Modal */}
      {showAddEmployee && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Add New Employee</h3>
            <form onSubmit={handleAddEmployee} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Employee ID</label>
                  <input
                    type="text"
                    value={newEmployee.employeeId}
                    onChange={(e) => setNewEmployee({...newEmployee, employeeId: e.target.value})}
                    placeholder="Auto-generated if empty"
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Name *</label>
                  <input
                    type="text"
                    required
                    value={newEmployee.name}
                    onChange={(e) => setNewEmployee({...newEmployee, name: e.target.value})}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Email *</label>
                  <input
                    type="email"
                    required
                    value={newEmployee.email}
                    onChange={(e) => setNewEmployee({...newEmployee, email: e.target.value})}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Phone *</label>
                  <input
                    type="tel"
                    required
                    value={newEmployee.phone}
                    onChange={(e) => setNewEmployee({...newEmployee, phone: e.target.value})}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Department *</label>
                  <select
                    required
                    value={newEmployee.department}
                    onChange={(e) => setNewEmployee({...newEmployee, department: e.target.value})}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                  >
                    <option value="">Select Department</option>
                    <option value="Marketing">Marketing</option>
                    <option value="Sales">Sales</option>
                    <option value="Admissions">Admissions</option>
                    <option value="Counselling">Counselling</option>
                    <option value="HR">HR</option>
                    <option value="IT">IT</option>
                    <option value="Finance">Finance</option>
                    <option value="Operations">Operations</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Role</label>
                  <select
                    value={newEmployee.role}
                    onChange={(e) => setNewEmployee({...newEmployee, role: e.target.value})}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                  >
                    <option value="Employee">Employee</option>
                    <option value="Manager">Manager</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Specialization</label>
                <div className="mt-2 grid grid-cols-2 gap-2">
                  {['Admission', 'Counselling', 'Job', 'Course', 'General'].map((spec) => (
                    <label key={spec} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={newEmployee.specialization.includes(spec)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setNewEmployee({
                              ...newEmployee,
                              specialization: [...newEmployee.specialization, spec]
                            })
                          } else {
                            setNewEmployee({
                              ...newEmployee,
                              specialization: newEmployee.specialization.filter(s => s !== spec)
                            })
                          }
                        }}
                        className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                      />
                      <span className="ml-2 text-sm text-gray-700">{spec}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Address</label>
                <div className="mt-2 space-y-2">
                  <input
                    type="text"
                    placeholder="Street Address"
                    value={newEmployee.address?.street || ''}
                    onChange={(e) => setNewEmployee({
                      ...newEmployee,
                      address: { ...newEmployee.address, street: e.target.value }
                    })}
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                  />
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="text"
                      placeholder="City"
                      value={newEmployee.address?.city || ''}
                      onChange={(e) => setNewEmployee({
                        ...newEmployee,
                        address: { ...newEmployee.address, city: e.target.value }
                      })}
                      className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                    />
                    <input
                      type="text"
                      placeholder="State"
                      value={newEmployee.address?.state || ''}
                      onChange={(e) => setNewEmployee({
                        ...newEmployee,
                        address: { ...newEmployee.address, state: e.target.value }
                      })}
                      className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="text"
                      placeholder="Pincode"
                      value={newEmployee.address?.pincode || ''}
                      onChange={(e) => setNewEmployee({
                        ...newEmployee,
                        address: { ...newEmployee.address, pincode: e.target.value }
                      })}
                      className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                    />
                    <input
                      type="text"
                      placeholder="Country"
                      value={newEmployee.address?.country || 'India'}
                      onChange={(e) => setNewEmployee({
                        ...newEmployee,
                        address: { ...newEmployee.address, country: e.target.value }
                      })}
                      className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Working Hours</label>
                <div className="mt-2 grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-gray-500">Start Time</label>
                    <input
                      type="time"
                      value={newEmployee.workingHours.start}
                      onChange={(e) => setNewEmployee({
                        ...newEmployee,
                        workingHours: { ...newEmployee.workingHours, start: e.target.value }
                      })}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500">End Time</label>
                    <input
                      type="time"
                      value={newEmployee.workingHours.end}
                      onChange={(e) => setNewEmployee({
                        ...newEmployee,
                        workingHours: { ...newEmployee.workingHours, end: e.target.value }
                      })}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Password *</label>
                <input
                  type="password"
                  required
                  value={newEmployee.password}
                  onChange={(e) => setNewEmployee({...newEmployee, password: e.target.value})}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                />
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => setShowAddEmployee(false)}
                >
                  Cancel
                </Button>
                <Button type="submit">
                  Add Employee
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Inquiry Modal */}
      {showAddInquiry && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Add New Inquiry</h3>
            {/* Mode Toggle */}
            <div className="mb-4 inline-flex rounded-md shadow-sm border border-gray-200 overflow-hidden">
              <button
                type="button"
                onClick={() => setInquiryMode('manual')}
                className={`px-4 py-2 text-sm ${inquiryMode === 'manual' ? 'bg-primary-50 text-primary-700' : 'bg-white text-gray-700 hover:bg-gray-50'}`}
              >
                Manual Entry
              </button>
              <button
                type="button"
                onClick={() => setInquiryMode('excel')}
                className={`px-4 py-2 text-sm border-l border-gray-200 ${inquiryMode === 'excel' ? 'bg-primary-50 text-primary-700' : 'bg-white text-gray-700 hover:bg-gray-50'}`}
              >
                Excel Upload
              </button>
            </div>

            {inquiryMode === 'manual' ? (
              <form onSubmit={handleAddInquiry} className="space-y-6">
                {/* Basic Information */}
                <div className="border-b border-gray-200 pb-4">
                  <h4 className="text-md font-medium text-gray-800 mb-3">Basic Information</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Inquiry Type *</label>
                      <select
                        required
                        value={newInquiry.type}
                        onChange={(e) => setNewInquiry({...newInquiry, type: e.target.value})}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                      >
                        <option value="Admission">Admission</option>
                        <option value="Counselling">Counselling</option>
                        <option value="Job">Job</option>
                        <option value="Course">Course</option>
                        <option value="General">General</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Priority</label>
                      <select
                        value={newInquiry.priority}
                        onChange={(e) => setNewInquiry({...newInquiry, priority: e.target.value})}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                      >
                        <option value="Low">Low</option>
                        <option value="Medium">Medium</option>
                        <option value="High">High</option>
                        <option value="Urgent">Urgent</option>
                      </select>
                    </div>
                  </div>
                  <div className="mt-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Source</label>
                      <select
                        value={newInquiry.source}
                        onChange={(e) => setNewInquiry({...newInquiry, source: e.target.value})}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                      >
                        <option value="Website">Website</option>
                        <option value="Phone">Phone</option>
                        <option value="Email">Email</option>
                        <option value="Social Media">Social Media</option>
                        <option value="Referral">Referral</option>
                        <option value="Walk-in">Walk-in</option>
                        <option value="Advertisement">Advertisement</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Customer Information */}
                <div className="border-b border-gray-200 pb-4">
                  <h4 className="text-md font-medium text-gray-800 mb-3">Customer Information</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Customer Name *</label>
                      <input
                        type="text"
                        required
                        value={newInquiry.customerName}
                        onChange={(e) => setNewInquiry({...newInquiry, customerName: e.target.value})}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Email *</label>
                      <input
                        type="email"
                        required
                        value={newInquiry.email}
                        onChange={(e) => setNewInquiry({...newInquiry, email: e.target.value})}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Phone *</label>
                      <input
                        type="tel"
                        required
                        value={newInquiry.phone}
                        onChange={(e) => setNewInquiry({...newInquiry, phone: e.target.value})}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Alternate Phone</label>
                      <input
                        type="tel"
                        value={newInquiry.alternatePhone}
                        onChange={(e) => setNewInquiry({...newInquiry, alternatePhone: e.target.value})}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                      />
                    </div>
                  </div>

                  <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Address</label>
                    <div className="space-y-2">
                      <input
                        type="text"
                        placeholder="Street Address"
                        value={newInquiry.address.street}
                        onChange={(e) => setNewInquiry({
                          ...newInquiry,
                          address: { ...newInquiry.address, street: e.target.value }
                        })}
                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                      />
                      <div className="grid grid-cols-2 gap-2">
                        <input
                          type="text"
                          placeholder="City"
                          value={newInquiry.address.city}
                          onChange={(e) => setNewInquiry({
                            ...newInquiry,
                            address: { ...newInquiry.address, city: e.target.value }
                          })}
                          className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                        />
                        <input
                          type="text"
                          placeholder="State"
                          value={newInquiry.address.state}
                          onChange={(e) => setNewInquiry({
                            ...newInquiry,
                            address: { ...newInquiry.address, state: e.target.value }
                          })}
                          className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <input
                          type="text"
                          placeholder="Pincode"
                          value={newInquiry.address.pincode}
                          onChange={(e) => setNewInquiry({
                            ...newInquiry,
                            address: { ...newInquiry.address, pincode: e.target.value }
                          })}
                          className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                        />
                        <input
                          type="text"
                          placeholder="Country"
                          value={newInquiry.address.country}
                          onChange={(e) => setNewInquiry({
                            ...newInquiry,
                            address: { ...newInquiry.address, country: e.target.value }
                          })}
                          className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Inquiry Details */}
                <div className="border-b border-gray-200 pb-4">
                  <h4 className="text-md font-medium text-gray-800 mb-3">Inquiry Details</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Course Interested</label>
                      <select
                        value={newInquiry.courseInterested}
                        onChange={(e) => {
                          const value = e.target.value
                          setNewInquiry({...newInquiry, courseInterested: value})
                          setShowOtherCourse(value === 'Other')
                          if (value !== 'Other') {
                            setOtherCourse('')
                          }
                        }}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                      >
                        <option value="">Select Course</option>
                        {courseOptions.map(course => (
                          <option key={course} value={course}>{course}</option>
                        ))}
                      </select>
                      {showOtherCourse && (
                        <input
                          type="text"
                          placeholder="Please specify other course"
                          value={otherCourse}
                          onChange={(e) => {
                            setOtherCourse(e.target.value)
                            setNewInquiry({...newInquiry, courseInterested: e.target.value})
                          }}
                          className="mt-2 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                        />
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Assigned To</label>
                      <select
                        value={newInquiry.assignedTo}
                        onChange={(e) => setNewInquiry({...newInquiry, assignedTo: e.target.value})}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                      >
                        <option value="">Select Employee</option>
                        {employees.map(employee => (
                          <option key={employee._id} value={employee._id}>
                            {employee.name} ({employee.employeeId})
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Status</label>
                      <select
                        value={newInquiry.status}
                        onChange={(e) => setNewInquiry({...newInquiry, status: e.target.value})}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                      >
                        <option value="New">New</option>
                        <option value="Contacted">Contacted</option>
                        <option value="Interested">Interested</option>
                        <option value="Follow Up">Follow Up</option>
                        <option value="Converted">Converted</option>
                        <option value="Closed">Closed</option>
                        <option value="Lost">Lost</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Next Follow Up</label>
                      <input
                        type="date"
                        value={newInquiry.nextFollowUp}
                        onChange={(e) => setNewInquiry({...newInquiry, nextFollowUp: e.target.value})}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                      />
                    </div>
                  </div>
                  <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-700">Message</label>
                    <textarea
                      rows={3}
                      value={newInquiry.message}
                      onChange={(e) => setNewInquiry({...newInquiry, message: e.target.value})}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                    />
                  </div>
                  <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-700">Manager Remarks</label>
                    <textarea
                      rows={2}
                      value={newInquiry.managerRemarks}
                      onChange={(e) => setNewInquiry({...newInquiry, managerRemarks: e.target.value})}
                      placeholder="Add any remarks or notes about this inquiry..."
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                    />
                  </div>
                </div>

                <div className="flex justify-end space-x-3 pt-2">
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() => setShowAddInquiry(false)}
                  >
                    Cancel
                  </Button>
                  <Button type="submit">
                    Add Inquiry
                  </Button>
                </div>
              </form>
            ) : (
              <div className="space-y-6">
                <div className="border-b border-gray-200 pb-4">
                  <h4 className="text-md font-medium text-gray-800 mb-3">Upload Excel</h4>
                  <p className="text-sm text-gray-600 mb-2">Accepted formats: .xlsx, .xls, .csv. Include headers like: type, customerName, email, phone, subject, message, courseInterested, preferredBatch, budget, status, priority, source, assignedTo, nextFollowUp, address.street, address.city, address.state, address.pincode, address.country.</p>
                  <input
                    type="file"
                    accept=".xlsx,.xls,.csv"
                    onChange={(e) => {
                      const f = e.target.files?.[0]
                      if (f) void handleExcelFile(f)
                    }}
                    className="block w-full text-sm text-gray-700 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100"
                  />
                  {bulkParsing && (
                    <div className="mt-2 text-sm text-gray-600">Parsing file...</div>
                  )}
                  {!!bulkRows.length && (
                    <div className="mt-3 text-sm text-gray-700">
                      Detected {bulkRows.length} rows ready to import.
                    </div>
                  )}
                  {!!bulkErrors.length && (
                    <div className="mt-3 text-sm text-red-600 space-y-1">
                      {bulkErrors.slice(0,5).map((err, i) => (
                        <div key={i}>• {err}</div>
                      ))}
                      {bulkErrors.length > 5 && (
                        <div>...and {bulkErrors.length - 5} more</div>
                      )}
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between">
                  <div className="text-sm text-gray-700">
                    Success: <span className="text-green-600 font-medium">{bulkProgress.success}</span> • Failed: <span className="text-red-600 font-medium">{bulkProgress.failed}</span>
                  </div>
                  <div className="space-x-3">
                    <Button
                      type="button"
                      variant="secondary"
                      onClick={() => setShowAddInquiry(false)}
                    >
                      Close
                    </Button>
                    <Button
                      type="button"
                      onClick={() => void importInquiriesFromExcel()}
                      disabled={!bulkRows.length || bulkImporting}
                    >
                      {bulkImporting ? 'Importing...' : 'Import Inquiries'}
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
    </div>
  )
}
