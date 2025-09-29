'use client'

import { useState, useEffect, useRef } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { 
  UserGroupIcon, 
  ChartBarIcon, 
  CurrencyDollarIcon,
  ArrowTrendingUpIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  ClipboardDocumentListIcon,
  UsersIcon,
  BellIcon,
  CalendarDaysIcon,
  TrophyIcon,
  FireIcon,
  SparklesIcon,
  RocketLaunchIcon,
  EyeIcon,
  PlusIcon,
  ArrowRightIcon,
  ClockIcon,
  CheckCircleIcon,
  ExclamationCircleIcon,
  PhoneIcon,
  EnvelopeIcon,
  MapPinIcon,
  Cog6ToothIcon,
  FunnelIcon,
  ArrowRightOnRectangleIcon
} from '@heroicons/react/24/outline'
import { 
  UserGroupIcon as UserGroupIconSolid,
  ClipboardDocumentListIcon as ClipboardIconSolid,
  CurrencyDollarIcon as CurrencyIconSolid,
  ArrowTrendingUpIcon as TrendingIconSolid,
  BellIcon as BellIconSolid
} from '@heroicons/react/24/solid'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell, AreaChart, Area } from 'recharts'
import Card from '@/components/ui/Card'
import NotificationPanel from '@/components/manager/NotificationPanel'
import MyLeads from '@/components/employee/MyLeads'
import { inquiryApi } from '@/lib/inquiryApi'
import { employeeApi } from '@/lib/employeeApi'

interface ChartPoint {
  month: string
  leads: number
  sales: number
  revenue?: number
}

interface Activity {
  id: string
  type: 'lead' | 'sale' | 'task' | 'meeting' | 'call'
  message: string
  timestamp: Date
  icon: any
  priority: 'high' | 'medium' | 'low'
  user?: string
}

interface QuickAction {
  id: string
  title: string
  description: string
  icon: any
  color: string
  action: () => void
}

export default function Dashboard() {
  const { user, logout } = useAuth()
  const [stats, setStats] = useState({
    totalLeads: 0,
    newLeads: 0,
    myLeads: 0,
    converted: 0,
    conversionRate: 0,
    totalCounsellors: 0,
    activeEmployees: 0,
    monthlyRevenue: 0,
    avgResponseTime: 0
  })
  const [loading, setLoading] = useState(true)
  const [salesData, setSalesData] = useState<ChartPoint[]>([])
  const [conversionData, setConversionData] = useState<{ month: string; rate: number }[]>([])
  
  // Real-time activity state
  const [recentActivities, setRecentActivities] = useState<Activity[]>([])
  const [isLive, setIsLive] = useState(true)
  const [newActivityCount, setNewActivityCount] = useState(0)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  // Logout function
  const handleLogout = () => {
    logout()
    window.location.href = '/login'
  }

  // Real data from APIs
  const [performanceData, setPerformanceData] = useState<ChartPoint[]>([])
  const [statusDistribution, setStatusDistribution] = useState<{name: string, value: number, color: string}[]>([])
  const [inquiries, setInquiries] = useState<any[]>([])
  const [employees, setEmployees] = useState<any[]>([])

  useEffect(() => {
    if (user) {
      fetchDashboardData()
      initializeRealTimeData()
    }
  }, [user])

  // Real-time activity simulation - depends on real data
  useEffect(() => {
    if (!isLive || inquiries.length === 0 || employees.length === 0) return

    const interval = setInterval(() => {
      const randomDelay = Math.random() * 30000 + 15000
      setTimeout(() => {
        const newActivity = generateRealActivity()
        addNewActivity(newActivity)
      }, randomDelay)
    }, 25000)

    intervalRef.current = interval
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [isLive, inquiries, employees])

  // Real-time activity functions using real data
  const generateRealActivity = (): Activity => {
    if (inquiries.length === 0 || employees.length === 0) {
      return {
        id: Date.now().toString() + Math.random(),
        type: 'lead',
        message: 'System activity - Loading real data...',
        timestamp: new Date(),
        icon: ClipboardDocumentListIcon,
        priority: 'low',
        user: 'System'
      }
    }

    const recentInquiry = inquiries[Math.floor(Math.random() * Math.min(inquiries.length, 10))]
    const employee = employees[Math.floor(Math.random() * employees.length)]
    
    const activityTypes = [
      {
        type: 'lead',
        message: `New inquiry received from ${recentInquiry.customerName} for ${recentInquiry.courseInterest || 'course inquiry'}`,
        icon: ClipboardDocumentListIcon,
        priority: 'medium'
      },
      {
        type: 'sale',
        message: `${employee.name} converted inquiry from ${recentInquiry.customerName}`,
        icon: TrophyIcon,
        priority: 'high'
      },
      {
        type: 'task',
        message: `${employee.name} updated inquiry status for ${recentInquiry.customerName}`,
        icon: CheckCircleIcon,
        priority: 'low'
      },
      {
        type: 'call',
        message: `${employee.name} contacted ${recentInquiry.customerName} via ${recentInquiry.phone}`,
        icon: PhoneIcon,
        priority: 'medium'
      }
    ]

    const activity = activityTypes[Math.floor(Math.random() * activityTypes.length)]

    return {
      id: Date.now().toString() + Math.random(),
      type: activity.type as any,
      message: activity.message,
      timestamp: new Date(),
      icon: activity.icon,
      priority: activity.priority as any,
      user: employee.name
    }
  }

  const addNewActivity = (activity: Activity) => {
    setRecentActivities(prev => {
      const newActivities = [activity, ...prev].slice(0, 10)
      return newActivities
    })
    setNewActivityCount(prev => prev + 1)
    
    setTimeout(() => {
      setNewActivityCount(0)
    }, 3000)
  }

  const initializeRealTimeData = () => {
    // Initialize with real data activities
    const initialActivities: Activity[] = []
    for (let i = 0; i < 5; i++) {
      const activity = generateRealActivity()
      activity.timestamp = new Date(Date.now() - (i + 1) * 30 * 60 * 1000)
      initialActivities.push(activity)
    }
    setRecentActivities(initialActivities)
  }

  const formatTimeAgo = (timestamp: Date) => {
    const now = new Date()
    const diffInSeconds = Math.floor((now.getTime() - timestamp.getTime()) / 1000)
    
    if (diffInSeconds < 60) return 'Just now'
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`
    return `${Math.floor(diffInSeconds / 86400)}d ago`
  }

  const fetchDashboardData = async () => {
    try {
      setLoading(true)
      
      if (user?.role === 'admin' || user?.role === 'Manager') {
        // Admin sees all leads and counsellors
        const [inquiriesResponse, employeesResponse] = await Promise.all([
          inquiryApi.getAllInquiries({ limit: 1000 }),
          employeeApi.getEmployees({ role: 'Employee', limit: 1000 })
        ])
        
        const totalLeads = inquiriesResponse.data.length
        const newLeads = inquiriesResponse.data.filter(lead => lead.status === 'New').length
        const converted = inquiriesResponse.data.filter(lead => lead.status === 'Converted').length
        const conversionRate = totalLeads > 0 ? (converted / totalLeads) * 100 : 0
        const totalCounsellors = employeesResponse.data.length
        const activeEmployees = employeesResponse.data.filter(emp => emp.isActive).length
        
        // Store raw data for real-time activities
        setInquiries(inquiriesResponse.data)
        setEmployees(employeesResponse.data)
        
        // Build charts and status distribution from real data
        buildCharts(inquiriesResponse.data)
        buildStatusDistribution(inquiriesResponse.data)
        
        setStats({
          totalLeads,
          newLeads,
          myLeads: 0,
          converted,
          conversionRate,
          totalCounsellors,
          activeEmployees,
          monthlyRevenue: converted * 45000, // Estimated revenue based on conversions
          avgResponseTime: calculateAvgResponseTime(inquiriesResponse.data)
        })
      } else if (user?.role === 'Employee') {
        // Counsellor sees only their assigned leads
        const response = await inquiryApi.getMyInquiries({ limit: 1000 })
        
        const myLeads = response.data.length
        const newLeads = response.data.filter(lead => lead.status === 'New').length
        const converted = response.data.filter(lead => lead.status === 'Converted').length
        const conversionRate = myLeads > 0 ? (converted / myLeads) * 100 : 0
        
        // Store data for activities
        setInquiries(response.data)
        setEmployees([{ name: user.name, _id: user.id }]) // Current user as employee
        
        buildCharts(response.data)
        buildStatusDistribution(response.data)
        
        setStats({
          totalLeads: 0,
          newLeads,
          myLeads,
          converted,
          conversionRate,
          totalCounsellors: 0,
          activeEmployees: 1, // Just the current user
          monthlyRevenue: converted * 45000, // Estimated revenue based on conversions
          avgResponseTime: calculateAvgResponseTime(response.data)
        })
      }
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  const buildCharts = (inquiries: Array<{ createdAt: string; status: string }>) => {
    // Build last 6 months labels
    const now = new Date()
    const months: { key: string; label: string }[] = []
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
      const label = d.toLocaleString('en-US', { month: 'short' })
      months.push({ key, label })
    }

    const counts = months.map(m => ({ month: m.label, leads: 0, sales: 0 }))

    for (const inq of inquiries) {
      const d = new Date(inq.createdAt)
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
      const idx = months.findIndex(mm => mm.key === key)
      if (idx !== -1) {
        counts[idx].leads += 1
        if (inq.status === 'Converted') counts[idx].sales += 1
      }
    }

    setSalesData(counts)

    const conversionSeries = counts.map(c => ({
      month: c.month,
      rate: c.leads > 0 ? (c.sales / c.leads) * 100 : 0,
    }))
    setConversionData(conversionSeries)
    
    // Also update performance data for the area chart
    setPerformanceData(counts.map(c => ({
      ...c,
      conversions: c.sales,
      revenue: c.sales * 45000 // Estimated revenue per conversion
    })))
  }

  const buildStatusDistribution = (inquiries: Array<{ status: string }>) => {
    const statusCounts = inquiries.reduce((acc, inquiry) => {
      acc[inquiry.status] = (acc[inquiry.status] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    const total = inquiries.length
    const distribution = [
      { name: 'New', value: Math.round(((statusCounts['New'] || 0) / total) * 100), color: '#3B82F6' },
      { name: 'Contacted', value: Math.round(((statusCounts['Contacted'] || 0) / total) * 100), color: '#F59E0B' },
      { name: 'Interested', value: Math.round(((statusCounts['Interested'] || 0) / total) * 100), color: '#8B5CF6' },
      { name: 'Follow Up', value: Math.round(((statusCounts['Follow Up'] || 0) / total) * 100), color: '#F97316' },
      { name: 'Converted', value: Math.round(((statusCounts['Converted'] || 0) / total) * 100), color: '#10B981' },
      { name: 'Closed', value: Math.round(((statusCounts['Closed'] || 0) / total) * 100), color: '#EF4444' },
      { name: 'Lost', value: Math.round(((statusCounts['Lost'] || 0) / total) * 100), color: '#6B7280' },
    ].filter(item => item.value > 0) // Only show statuses that exist

    setStatusDistribution(distribution)
  }

  const calculateAvgResponseTime = (inquiries: Array<{ createdAt: string; updatedAt?: string }>) => {
    if (inquiries.length === 0) return 0

    const responseTimes = inquiries
      .filter(inquiry => inquiry.updatedAt && inquiry.createdAt !== inquiry.updatedAt)
      .map(inquiry => {
        const created = new Date(inquiry.createdAt)
        const updated = new Date(inquiry.updatedAt!)
        return (updated.getTime() - created.getTime()) / (1000 * 60 * 60) // Hours
      })

    if (responseTimes.length === 0) return 0
    
    const avgHours = responseTimes.reduce((sum, time) => sum + time, 0) / responseTimes.length
    return Math.round(avgHours * 10) / 10 // Round to 1 decimal place
  }

  // Quick Actions
  const quickActions: QuickAction[] = [
    {
      id: '1',
      title: 'Add New Lead',
      description: 'Create a new inquiry',
      icon: PlusIcon,
      color: 'from-blue-500 to-indigo-600',
      action: () => window.location.href = '/dashboard/inquiries'
    },
    {
      id: '2',
      title: 'View Reports',
      description: 'Analytics & insights',
      icon: ChartBarIcon,
      color: 'from-emerald-500 to-teal-600',
      action: () => window.location.href = '/dashboard/reports'
    },
    {
      id: '3',
      title: 'Team Management',
      description: 'Manage employees',
      icon: UserGroupIcon,
      color: 'from-purple-500 to-pink-600',
      action: () => window.location.href = '/dashboard/employees'
    },
    {
      id: '4',
      title: 'Settings',
      description: 'System configuration',
      icon: Cog6ToothIcon,
      color: 'from-amber-500 to-orange-600',
      action: () => window.location.href = '/dashboard/settings'
    }
  ]

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-4"></div>
          <div className="text-xl font-semibold text-gray-700">Loading Dashboard...</div>
          <div className="text-sm text-gray-500 mt-2">Fetching your latest data</div>
        </div>
      </div>
    )
  }

  const renderAdminDashboard = () => (
    <>
      {/* Admin Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <UserGroupIcon className="h-8 w-8 text-primary-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Total Leads</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalLeads}</p>
              <p className="text-sm text-green-600 flex items-center">
                <ArrowUpIcon className="h-4 w-4 mr-1" />
                +12% from last month
              </p>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <ClipboardDocumentListIcon className="h-8 w-8 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">New Leads</p>
              <p className="text-2xl font-bold text-gray-900">{stats.newLeads}</p>
              <p className="text-sm text-green-600 flex items-center">
                <ArrowUpIcon className="h-4 w-4 mr-1" />
                +8% from last week
              </p>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <CurrencyDollarIcon className="h-8 w-8 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Conversions</p>
              <p className="text-2xl font-bold text-gray-900">{stats.converted}</p>
              <p className="text-sm text-green-600 flex items-center">
                <ArrowUpIcon className="h-4 w-4 mr-1" />
                +15% from last month
              </p>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <UsersIcon className="h-8 w-8 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Active Counsellors</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalCounsellors}</p>
              <p className="text-sm text-gray-600">
                Managing leads
              </p>
            </div>
          </div>
        </Card>
      </div>
    </>
  )

  const renderCounsellorDashboard = () => (
    <>
      {/* Counsellor Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <ClipboardDocumentListIcon className="h-8 w-8 text-primary-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">My Total Leads</p>
              <p className="text-2xl font-bold text-gray-900">{stats.myLeads}</p>
              <p className="text-sm text-gray-600">
                Assigned to you
              </p>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <UserGroupIcon className="h-8 w-8 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">New Leads</p>
              <p className="text-2xl font-bold text-gray-900">{stats.newLeads}</p>
              <p className="text-sm text-blue-600">
                Need attention
              </p>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <CurrencyDollarIcon className="h-8 w-8 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Conversions</p>
              <p className="text-2xl font-bold text-gray-900">{stats.converted}</p>
              <p className="text-sm text-green-600">
                Successfully converted
              </p>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <ArrowTrendingUpIcon className="h-8 w-8 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Conversion Rate</p>
              <p className="text-2xl font-bold text-gray-900">{stats.conversionRate.toFixed(1)}%</p>
              <p className="text-sm text-purple-600">
                Your performance
              </p>
            </div>
          </div>
        </Card>
      </div>
    </>
  )

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Modern Header */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-gray-200/50 sticky top-0 z-40">
        <div className="px-6 py-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
                {user?.role === 'admin' ? 'Admin Dashboard' : user?.role === 'Manager' ? 'Manager Dashboard' : 'My Dashboard'}
              </h1>
              <p className="text-gray-600 mt-2">
                {user?.role === 'admin' 
                  ? 'Complete system overview and management' 
                  : user?.role === 'Manager'
                    ? 'Team performance and business insights'
                    : `Welcome back, ${user?.name}! Track your progress and manage your leads.`
                }
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className={`w-3 h-3 rounded-full ${isLive ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`}></div>
                <span className="text-sm text-gray-600">{isLive ? 'Live Data' : 'Paused'}</span>
                <button
                  onClick={() => setIsLive(!isLive)}
                  className="text-sm text-blue-600 hover:text-blue-800"
                >
                  {isLive ? 'Pause' : 'Resume'}
                </button>
              </div>
              <div className="relative">
                <BellIconSolid className="h-6 w-6 text-gray-600" />
                {newActivityCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center animate-pulse">
                    {newActivityCount}
                  </span>
                )}
              </div>
              
              {/* Logout Button - Only for Employees */}
              {user?.role === 'Employee' && (
                <button
                  onClick={handleLogout}
                  className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg hover:from-red-600 hover:to-red-700 transition-all duration-200 transform hover:scale-105 shadow-lg"
                >
                  <ArrowRightOnRectangleIcon className="h-5 w-5" />
                  <span className="text-sm font-medium">Logout</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="px-6 py-8 space-y-8">
        {/* Enhanced Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div 
            className="group relative overflow-hidden bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl p-6 text-white cursor-pointer transform hover:scale-105 transition-all duration-300 hover:shadow-2xl"
            onClick={() => window.location.href = '/dashboard/inquiries'}
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16"></div>
            <div className="relative">
              <div className="flex items-center justify-between mb-4">
                <ClipboardIconSolid className="h-8 w-8 text-white/90" />
                <span className="text-xs font-medium bg-white/20 px-2 py-1 rounded-full">Leads</span>
              </div>
              <div>
                <p className="text-3xl font-bold mb-1">{user?.role === 'Employee' ? stats.myLeads : stats.totalLeads}</p>
                <p className="text-blue-100 text-sm">{user?.role === 'Employee' ? 'My Leads' : 'Total Leads'}</p>
                <div className="flex items-center mt-2 text-xs">
                  <ArrowUpIcon className="h-3 w-3 mr-1" />
                  <span>{stats.newLeads} new this week</span>
                </div>
              </div>
            </div>
          </div>

          <div 
            className="group relative overflow-hidden bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl p-6 text-white cursor-pointer transform hover:scale-105 transition-all duration-300 hover:shadow-2xl"
            onClick={() => window.location.href = '/dashboard/sales'}
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16"></div>
            <div className="relative">
              <div className="flex items-center justify-between mb-4">
                <TrophyIcon className="h-8 w-8 text-white/90" />
                <span className="text-xs font-medium bg-white/20 px-2 py-1 rounded-full">Sales</span>
              </div>
              <div>
                <p className="text-3xl font-bold mb-1">{stats.converted}</p>
                <p className="text-emerald-100 text-sm">Conversions</p>
                <div className="flex items-center mt-2 text-xs">
                  <TrendingIconSolid className="h-3 w-3 mr-1" />
                  <span>{stats.conversionRate.toFixed(1)}% rate</span>
                </div>
              </div>
            </div>
          </div>

          <div 
            className="group relative overflow-hidden bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl p-6 text-white cursor-pointer transform hover:scale-105 transition-all duration-300 hover:shadow-2xl"
            onClick={() => window.location.href = '/dashboard/employees'}
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16"></div>
            <div className="relative">
              <div className="flex items-center justify-between mb-4">
                <UserGroupIconSolid className="h-8 w-8 text-white/90" />
                <span className="text-xs font-medium bg-white/20 px-2 py-1 rounded-full">Team</span>
              </div>
              <div>
                <p className="text-3xl font-bold mb-1">{user?.role === 'Employee' ? '1' : stats.totalCounsellors}</p>
                <p className="text-purple-100 text-sm">{user?.role === 'Employee' ? 'You' : 'Team Members'}</p>
                <div className="flex items-center mt-2 text-xs">
                  <CheckCircleIcon className="h-3 w-3 mr-1" />
                  <span>{stats.activeEmployees} active</span>
                </div>
              </div>
            </div>
          </div>

          <div 
            className="group relative overflow-hidden bg-gradient-to-br from-amber-500 to-orange-600 rounded-2xl p-6 text-white cursor-pointer transform hover:scale-105 transition-all duration-300 hover:shadow-2xl"
            onClick={() => window.location.href = '/dashboard/reports'}
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16"></div>
            <div className="relative">
              <div className="flex items-center justify-between mb-4">
                <CurrencyIconSolid className="h-8 w-8 text-white/90" />
                <span className="text-xs font-medium bg-white/20 px-2 py-1 rounded-full">Revenue</span>
              </div>
              <div>
                <p className="text-3xl font-bold mb-1">₹{(stats.monthlyRevenue / 100000).toFixed(1)}L</p>
                <p className="text-amber-100 text-sm">This Month</p>
                <div className="flex items-center mt-2 text-xs">
                  <ArrowUpIcon className="h-3 w-3 mr-1" />
                  <span>+{((stats.monthlyRevenue / 850000) * 100).toFixed(0)}% growth</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white/70 backdrop-blur-sm rounded-2xl border border-gray-200/50 p-6">
          <h3 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
            <RocketLaunchIcon className="h-6 w-6 mr-2 text-blue-600" />
            Quick Actions
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {quickActions.map((action) => {
              const IconComponent = action.icon
              return (
                <button
                  key={action.id}
                  onClick={action.action}
                  className={`group relative overflow-hidden bg-gradient-to-r ${action.color} rounded-xl p-4 text-white hover:shadow-lg transition-all duration-300 transform hover:scale-105`}
                >
                  <div className="flex items-center space-x-3">
                    <div className="flex-shrink-0">
                      <IconComponent className="h-6 w-6" />
                    </div>
                    <div className="text-left">
                      <p className="font-semibold text-sm">{action.title}</p>
                      <p className="text-xs opacity-90">{action.description}</p>
                    </div>
                  </div>
                  <ArrowRightIcon className="h-4 w-4 absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                </button>
              )
            })}
          </div>
        </div>

        {/* Charts and Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Performance Chart */}
          <div className="lg:col-span-2">
            <div className="bg-white/70 backdrop-blur-sm rounded-2xl border border-gray-200/50 p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-gray-900">Performance Overview</h3>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                  <span className="text-sm text-gray-600">Leads</span>
                  <div className="w-3 h-3 bg-emerald-500 rounded-full ml-4"></div>
                  <span className="text-sm text-gray-600">Conversions</span>
                </div>
              </div>
              <ResponsiveContainer width="100%" height={350}>
                <AreaChart data={performanceData}>
                  <defs>
                    <linearGradient id="colorLeads" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#3B82F6" stopOpacity={0.1}/>
                    </linearGradient>
                    <linearGradient id="colorConversions" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10B981" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#10B981" stopOpacity={0.1}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="month" stroke="#6b7280" />
                  <YAxis stroke="#6b7280" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'rgba(255, 255, 255, 0.95)', 
                      border: 'none', 
                      borderRadius: '12px',
                      boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)'
                    }} 
                  />
                  <Area type="monotone" dataKey="leads" stroke="#3B82F6" fillOpacity={1} fill="url(#colorLeads)" strokeWidth={2} />
                  <Area type="monotone" dataKey="conversions" stroke="#10B981" fillOpacity={1} fill="url(#colorConversions)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Real-time Activity Feed */}
          <div>
            <div className="bg-white/70 backdrop-blur-sm rounded-2xl border border-gray-200/50 p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-gray-900 flex items-center">
                  <BellIcon className="h-5 w-5 mr-2 text-blue-600" />
                  Live Activity
                  {newActivityCount > 0 && (
                    <span className="ml-2 bg-red-500 text-white text-xs px-2 py-1 rounded-full animate-pulse">
                      {newActivityCount}
                    </span>
                  )}
                </h3>
                <button
                  onClick={() => setIsLive(!isLive)}
                  className="text-sm text-blue-600 hover:text-blue-800"
                >
                  {isLive ? 'Pause' : 'Resume'}
                </button>
              </div>
              <div className="space-y-4 max-h-80 overflow-y-auto">
                {recentActivities.map((activity, index) => {
                  const IconComponent = activity.icon
                  const isNew = index < newActivityCount
                  
                  return (
                    <div 
                      key={activity.id}
                      className={`flex items-start space-x-3 p-3 rounded-xl transition-all duration-300 ${
                        isNew 
                          ? 'bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 shadow-md transform scale-[1.02]' 
                          : 'hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex-shrink-0">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                          activity.priority === 'high' ? 'bg-gradient-to-r from-red-500 to-pink-500' :
                          activity.priority === 'medium' ? 'bg-gradient-to-r from-blue-500 to-indigo-500' :
                          'bg-gradient-to-r from-gray-500 to-slate-500'
                        }`}>
                          <IconComponent className="h-4 w-4 text-white" />
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-gray-900 font-medium">{activity.message}</p>
                        <div className="flex items-center justify-between mt-1">
                          <p className="text-xs text-gray-500">{formatTimeAgo(activity.timestamp)}</p>
                          {isNew && (
                            <div className="w-2 h-2 bg-green-500 rounded-full animate-ping"></div>
                          )}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Status Distribution */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white/70 backdrop-blur-sm rounded-2xl border border-gray-200/50 p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-6">Lead Status Distribution</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={statusDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={120}
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
            <div className="grid grid-cols-2 gap-4 mt-4">
              {statusDistribution.map((item, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></div>
                  <span className="text-sm text-gray-600">{item.name}: {item.value}%</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white/70 backdrop-blur-sm rounded-2xl border border-gray-200/50 p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-6">Key Metrics</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl">
                <div className="flex items-center space-x-3">
                  <ClockIcon className="h-6 w-6 text-blue-600" />
                  <span className="font-medium text-gray-900">Avg Response Time</span>
                </div>
                <span className="text-xl font-bold text-blue-600">{stats.avgResponseTime}h</span>
              </div>
              
              <div className="flex items-center justify-between p-4 bg-gradient-to-r from-emerald-50 to-teal-50 rounded-xl">
                <div className="flex items-center space-x-3">
                  <TrophyIcon className="h-6 w-6 text-emerald-600" />
                  <span className="font-medium text-gray-900">Success Rate</span>
                </div>
                <span className="text-xl font-bold text-emerald-600">{stats.conversionRate.toFixed(1)}%</span>
              </div>
              
              <div className="flex items-center justify-between p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl">
                <div className="flex items-center space-x-3">
                  <UserGroupIcon className="h-6 w-6 text-purple-600" />
                  <span className="font-medium text-gray-900">Active Team</span>
                </div>
                <span className="text-xl font-bold text-purple-600">{stats.activeEmployees}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Employee Leads Section */}
        {user?.role === 'Employee' && (
          <div className="bg-white/70 backdrop-blur-sm rounded-2xl border border-gray-200/50 p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-gray-900 flex items-center">
                <ClipboardDocumentListIcon className="h-6 w-6 mr-2 text-blue-600" />
                My Assigned Leads
              </h3>
              <button
                onClick={() => window.location.href = '/dashboard/leads'}
                className="text-sm text-blue-600 hover:text-blue-800 flex items-center"
              >
                View All
                <ArrowRightIcon className="h-4 w-4 ml-1" />
              </button>
            </div>
            <div className="max-h-96 overflow-y-auto">
              <MyLeads className="border-0 shadow-none bg-transparent" />
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
