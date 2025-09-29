'use client'

import React, { useState, useEffect, useMemo, useRef, useCallback, memo } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { inquiryApi, type Inquiry } from '@/lib/inquiryApi'
import { 
  CurrencyDollarIcon,
  ChartBarIcon,
  ArrowRightIcon,
  EyeIcon,
  UserIcon,
  PlusIcon,
  ArrowUpIcon,
  ArrowTrendingUpIcon,
  CalendarDaysIcon,
  RocketLaunchIcon,
  FunnelIcon,
  MagnifyingGlassIcon,
  AdjustmentsHorizontalIcon,
  TrophyIcon,
  ClipboardDocumentListIcon,
  PhoneIcon,
  EnvelopeIcon,
  BellIcon
} from '@heroicons/react/24/outline'

// Fallback for JSX typing if tsconfig misses DOM/JSX libs
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-namespace */
declare global {
  namespace JSX {
    interface IntrinsicElements {
      [elemName: string]: any
    }
  }
}
/* eslint-enable @typescript-eslint/no-namespace */
/* eslint-enable @typescript-eslint/no-explicit-any */

const pipelineStages = [
  'Qualified Lead',
  'Contacted', 
  'Proposal Sent',
  'Follow-up',
  'Closed-Won',
  'Closed-Lost'
]

// Real-time activity templates
const activityTemplates = [
  { 
    type: 'proposal', 
    messages: [
      'Proposal sent to {name}',
      'Quote delivered to {name}',
      'Pricing proposal shared with {name}'
    ], 
    icon: ClipboardDocumentListIcon, 
    color: 'bg-blue-400' 
  },
  { 
    type: 'follow-up', 
    messages: [
      'Follow-up scheduled with {name}',
      'Meeting booked with {name}',
      'Demo arranged for {name}'
    ], 
    icon: CalendarDaysIcon, 
    color: 'bg-yellow-400' 
  },
  { 
    type: 'contact', 
    messages: [
      'Initial contact made with {name}',
      'First call completed with {name}',
      'Inquiry received from {name}'
    ], 
    icon: PhoneIcon, 
    color: 'bg-green-400' 
  },
  { 
    type: 'conversion', 
    messages: [
      'Deal closed with {name}',
      'Contract signed by {name}',
      'Payment received from {name}'
    ], 
    icon: TrophyIcon, 
    color: 'bg-purple-400' 
  }
]

const sampleNames = ['Sneha Gupta', 'Priya Patel', 'Amit Kumar', 'Rahul Singh', 'Anita Sharma', 'Vikash Yadav', 'Pooja Mehta', 'Ravi Verma']
const courses = ['Digital Marketing', 'Data Science', 'UI/UX Design', 'Web Development', 'Mobile App Development', 'Cloud Computing']
const amounts = [25000, 35000, 45000, 55000, 65000, 75000, 85000, 95000]

// Initial activities
const initialActivities = [
  { 
    id: 1, 
    type: 'proposal', 
    message: 'Proposal sent to Sneha Gupta', 
    details: 'Digital Marketing • ₹45,000', 
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
    icon: ClipboardDocumentListIcon,
    color: 'bg-blue-400'
  },
  { 
    id: 2, 
    type: 'follow-up', 
    message: 'Follow-up scheduled with Priya Patel', 
    details: 'Data Science • ₹65,000', 
    timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000),
    icon: CalendarDaysIcon,
    color: 'bg-yellow-400'
  },
  { 
    id: 3, 
    type: 'contact', 
    message: 'Initial contact made with Amit Kumar', 
    details: 'UI/UX Design • ₹35,000', 
    timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000),
    icon: PhoneIcon,
    color: 'bg-green-400'
  }
]

type DealStatus = typeof pipelineStages[number]

type Deal = {
  id: string
  inquiryId: string
  studentName: string
  course?: string
  amount?: number
  status: DealStatus
  createdAt: string
  closedAt?: string
  assignedCounsellor?: string
  counsellorId?: string
}

type DealCardProps = {
  sale: Deal
  stage: DealStatus
  userRole?: string
  onMove: (saleId: string, newStage: DealStatus) => void
  getStageColor: (stage: string) => string
  formatCurrency: (value: number) => string
  density: 'comfortable' | 'compact'
}

const DealCard = memo(function DealCard({ sale, stage, userRole, onMove, getStageColor, formatCurrency, density }: DealCardProps): React.ReactElement {
  const initials = useMemo(() => {
    const parts = (sale.studentName || '').split(' ').filter(Boolean)
    return (parts[0]?.[0] || '') + (parts[1]?.[0] || '')
  }, [sale.studentName])

  const stageIndex = useMemo(() => pipelineStages.indexOf(stage), [stage])
  const progress = useMemo(() => Math.max(0, Math.min(100, Math.round(((stageIndex + 1) / pipelineStages.length) * 100))), [stageIndex])

  return (
    <div className="bg-white rounded-xl overflow-hidden shadow-sm border border-secondary-200 transition-all hover:shadow-md hover:-translate-y-0.5 ring-1 ring-transparent hover:ring-secondary-200">
      <div className={density === 'compact' ? 'p-3' : 'p-4'}>
        <div className="flex items-start justify-between">
          <div className="flex items-start space-x-3">
            <div className={density === 'compact' ? 'h-8 w-8 rounded-full bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center text-slate-700 text-xs font-semibold border border-slate-200' : 'h-10 w-10 rounded-full bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center text-slate-700 text-sm font-semibold border border-slate-200'}>
              {initials}
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h4 className={density === 'compact' ? 'font-semibold text-secondary-900 text-sm' : 'font-semibold text-secondary-900'}>{sale.studentName}</h4>
                <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${getStageColor(sale.status)}`}>
                  {sale.status}
                </span>
              </div>
              <p className={density === 'compact' ? 'text-[11px] text-secondary-600 mt-0.5' : 'text-xs text-secondary-600 mt-0.5'}>{sale.course || 'General'}</p>
              {userRole === 'admin' && sale.assignedCounsellor && (
                <p className="text-[11px] text-blue-600 mt-0.5">
                  Counsellor: {sale.assignedCounsellor}
                </p>
              )}
            </div>
          </div>
          <div className="text-right">
            <div className={density === 'compact' ? 'text-[11px] text-secondary-500' : 'text-xs text-secondary-500'}>Value</div>
            <div className={density === 'compact' ? 'text-[13px] font-semibold text-green-600' : 'text-sm font-semibold text-green-600'}>{formatCurrency(sale.amount || 0)}</div>
          </div>
        </div>

        <div className={density === 'compact' ? 'mt-2' : 'mt-3'}>
          <div className={density === 'compact' ? 'h-1 w-full bg-secondary-100 rounded-full overflow-hidden' : 'h-1.5 w-full bg-secondary-100 rounded-full overflow-hidden'}>
            <div className="h-full bg-gradient-to-r from-blue-500 to-indigo-500" style={{ width: `${progress}%` }} />
          </div>
          <div className={density === 'compact' ? 'mt-1 flex items-center justify-between text-[10px] text-secondary-500' : 'mt-1.5 flex items-center justify-between text-[10px] text-secondary-500'}>
            <span>{pipelineStages[0]}</span>
            <span>{pipelineStages[pipelineStages.length - 1]}</span>
          </div>
        </div>

        <div className={density === 'compact' ? 'mt-2 flex items-center justify-between' : 'mt-3 flex items-center justify-between'}>
          <div className="flex items-center space-x-2">
            <button type="button" className={density === 'compact' ? 'px-1.5 py-1 text-secondary-700 hover:bg-secondary-50 rounded' : 'px-2 py-1 text-secondary-700 hover:bg-secondary-50 rounded'}>
              <EyeIcon className="h-4 w-4" />
            </button>
          </div>
          <div className="flex items-center space-x-2">
            {stage !== pipelineStages[0] && (
              <button
                type="button"
                onClick={() => {
                  const currentIndex = pipelineStages.indexOf(stage)
                  const prevStage = pipelineStages[currentIndex - 1]
                  onMove(sale.id, prevStage as DealStatus)
                }}
                className={density === 'compact' ? 'text-[11px] px-1.5 py-1 text-secondary-700 hover:bg-secondary-50 rounded' : 'text-xs px-2 py-1 text-secondary-700 hover:bg-secondary-50 rounded'}
              >
                ← Back
              </button>
            )}
            {stage !== pipelineStages[pipelineStages.length - 1] && stage !== pipelineStages[pipelineStages.length - 2] && (
              <button
                type="button"
                onClick={() => {
                  const currentIndex = pipelineStages.indexOf(stage)
                  const nextStage = pipelineStages[currentIndex + 1]
                  onMove(sale.id, nextStage as DealStatus)
                }}
                className={density === 'compact' ? 'text-[11px] px-1.5 py-1 text-secondary-700 hover:bg-secondary-50 rounded inline-flex items-center' : 'text-xs px-2 py-1 text-secondary-700 hover:bg-secondary-50 rounded inline-flex items-center'}
              >
                Next <ArrowRightIcon className="h-3.5 w-3.5 ml-1" />
              </button>
            )}
            {stage === 'Follow-up' && (
              <div className="flex space-x-1">
                <button
                  type="button"
                  onClick={() => onMove(sale.id, 'Closed-Won')}
                  className="text-xs px-2 py-1 text-green-600 hover:bg-green-50 rounded"
                >
                  Win
                </button>
                <button
                  type="button"
                  onClick={() => onMove(sale.id, 'Closed-Lost')}
                  className="text-xs px-2 py-1 text-red-600 hover:bg-red-50 rounded"
                >
                  Lose
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
})

export default function SalesPage() {
  const { user } = useAuth()
  const [sales, setSales] = useState<Deal[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [sortBy, setSortBy] = useState<'recent' | 'value' | 'stage' | 'name'>('recent')
  const [statusFilter, setStatusFilter] = useState('all')
  const [viewMode, setViewMode] = useState<'table' | 'kanban'>('table')
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(50)
  const intervalRef = useRef<number | null>(null)
  const isInitialLoadRef = useRef(true)
  const isFetchingRef = useRef(false)
  const viewDensity: 'comfortable' = 'comfortable'
  const [collapsedStages, setCollapsedStages] = useState<Record<string, boolean>>({})
  
  // Real-time activity state
  const [recentActivities, setRecentActivities] = useState(initialActivities)
  const [newActivityCount, setNewActivityCount] = useState(0)
  const [isLive, setIsLive] = useState(true)
  const [performanceMetrics, setPerformanceMetrics] = useState({
    dealsInPipeline: 0,
    avgDealSize: 0,
    dealsWon: 0,
    dealsLost: 0,
    totalRevenue: 0
  })

  // Real-time activity functions
  const generateRandomActivity = () => {
    const template = activityTemplates[Math.floor(Math.random() * activityTemplates.length)]
    const name = sampleNames[Math.floor(Math.random() * sampleNames.length)]
    const course = courses[Math.floor(Math.random() * courses.length)]
    const amount = amounts[Math.floor(Math.random() * amounts.length)]

    let message = template.messages[Math.floor(Math.random() * template.messages.length)]
    message = message.replace('{name}', name)

    return {
      id: Date.now() + Math.random(),
      type: template.type,
      message,
      details: `${course} • ₹${amount.toLocaleString()}`,
      timestamp: new Date(),
      icon: template.icon,
      color: template.color
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
      const newActivities = [activity, ...prev].slice(0, 8) // Keep only latest 8
      return newActivities
    })
    setNewActivityCount(prev => prev + 1)
    
    // Auto-reset new activity count after 3 seconds
    setTimeout(() => {
      setNewActivityCount(0)
    }, 3000)
  }

  const updatePerformanceMetrics = () => {
    // Simulate performance metric updates
    setPerformanceMetrics(prev => ({
      dealsInPipeline: prev.dealsInPipeline + Math.floor(Math.random() * 3) - 1, // -1 to +1
      avgDealSize: prev.avgDealSize + Math.floor(Math.random() * 5000) - 2500, // -2500 to +2500
      dealsWon: prev.dealsWon + (Math.random() > 0.8 ? 1 : 0), // 20% chance to increment
      dealsLost: prev.dealsLost + (Math.random() > 0.9 ? 1 : 0), // 10% chance to increment
      totalRevenue: prev.totalRevenue + (Math.random() > 0.7 ? Math.floor(Math.random() * 50000) : 0)
    }))
  }

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (!user) return
    // Initial fetch
    fetchSales()
    // Clear any existing interval first
    if (intervalRef.current) clearInterval(intervalRef.current)
    // Poll for near real-time updates every 15s
    intervalRef.current = window.setInterval(fetchSales, 30000)
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [user?.id, user?.role])

  // Real-time activity simulation
  useEffect(() => {
    if (!isLive) return

    const activityInterval = setInterval(() => {
      // Generate new activity every 20-40 seconds
      const randomDelay = Math.random() * 20000 + 20000
      setTimeout(() => {
        const newActivity = generateRandomActivity()
        addNewActivity(newActivity)
        
        // Also update performance metrics occasionally
        if (Math.random() > 0.6) {
          updatePerformanceMetrics()
        }
      }, randomDelay)
    }, 25000) // Check every 25 seconds

    return () => clearInterval(activityInterval)
  }, [isLive])

  // Pause polling when the tab is hidden; resume on visible
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    const handleVisibility = () => {
      if (!user) return
      if (document.hidden) {
        if (intervalRef.current) clearInterval(intervalRef.current)
        intervalRef.current = null
      } else {
        // Resume polling and refresh immediately
        fetchSales()
        if (intervalRef.current) clearInterval(intervalRef.current)
        intervalRef.current = window.setInterval(fetchSales, 30000)
      }
    }
    document.addEventListener('visibilitychange', handleVisibility)
    return () => document.removeEventListener('visibilitychange', handleVisibility)
  }, [user?.id, user?.role])

  const mapInquiryToDeal = (inq: Inquiry): Deal => {
    // Map Inquiry.status to pipeline Deal status
    const statusMap: Record<Inquiry['status'], DealStatus> = {
      'New': 'Qualified Lead',
      'Contacted': 'Contacted',
      'Interested': 'Proposal Sent',
      'Follow Up': 'Follow-up',
      'Converted': 'Closed-Won',
      'Closed': 'Closed-Lost',
      'Lost': 'Closed-Lost',
    }

    return {
      id: inq._id,
      inquiryId: inq.inquiryId,
      studentName: inq.customerName,
      course: inq.courseInterest,
      amount: 0, // No amount on Inquiry; default to 0 or fetch from related data if available
      status: statusMap[inq.status],
      createdAt: inq.createdAt,
      assignedCounsellor: inq.assignedTo?.name,
      counsellorId: inq.assignedTo?._id,
    }
  }

  const fetchSales = async () => {
    try {
      if (isFetchingRef.current) return
      isFetchingRef.current = true
      if (isInitialLoadRef.current) setLoading(true)
      // Use inquiries as the live data source
      if (user?.role === 'Manager') {
        const res = await inquiryApi.getAllInquiries({ limit: 1000 })
        const newDeals = res.data.map(mapInquiryToDeal)
        setSales((prev: Deal[]) => (areDealsEqual(prev, newDeals) ? prev : newDeals))
      } else {
        const res = await inquiryApi.getMyInquiries({ limit: 1000 })
        const newDeals = res.data.map(mapInquiryToDeal)
        setSales((prev: Deal[]) => (areDealsEqual(prev, newDeals) ? prev : newDeals))
      }
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Failed to fetch sales:', error)
    } finally {
      if (isInitialLoadRef.current) {
        setLoading(false)
        isInitialLoadRef.current = false
      }
      isFetchingRef.current = false
    }
  }

  const areDealsEqual = (a: Deal[], b: Deal[]) => {
    if (a.length !== b.length) return false
    const sig = (d: Deal) => `${d.id}|${d.status}|${d.amount ?? 0}|${d.assignedCounsellor ?? ''}`
    const mapA = new Map(a.map(d => [d.id, sig(d)]))
    for (const d of b) {
      if (mapA.get(d.id) !== sig(d)) return false
    }
    return true
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value)
  }

  const getStageColor = (stage: string) => {
    switch (stage) {
      case 'Qualified Lead': return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'Contacted': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'Proposal Sent': return 'bg-purple-100 text-purple-800 border-purple-200'
      case 'Follow-up': return 'bg-orange-100 text-orange-800 border-orange-200'
      case 'Closed-Won': return 'bg-green-100 text-green-800 border-green-200'
      case 'Closed-Lost': return 'bg-red-100 text-red-800 border-red-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getTotalValue = (salesList: Deal[]) => {
    return salesList.reduce((sum, sale) => sum + (sale.amount || 0), 0)
  }

  // Filter and sort for display (must come before any use)
  const displayedSales = useMemo(() => {
    let list = sales
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      list = list.filter((s: Deal) =>
        s.studentName.toLowerCase().includes(q) ||
        (s.course || '').toLowerCase().includes(q) ||
        (s.assignedCounsellor || '').toLowerCase().includes(q)
      )
    }
    if (sortBy === 'value') {
      list = [...list].sort((a, b) => (b.amount || 0) - (a.amount || 0))
    } else if (sortBy === 'stage') {
      const idx = (s: Deal) => pipelineStages.indexOf(s.status)
      list = [...list].sort((a, b) => idx(a) - idx(b))
    } else {
      // recent
      list = [...list].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    }
    return list
  }, [sales, searchQuery, sortBy])

  // Calculate summary metrics (memoized) from displayed list
  const openDeals = useMemo(() => displayedSales.filter((sale: Deal) => !sale.status.includes('Closed')), [displayedSales])
  const wonDeals = useMemo(() => displayedSales.filter((sale: Deal) => sale.status === 'Closed-Won'), [displayedSales])
  const totalPipelineValue = useMemo(() => getTotalValue(openDeals), [openDeals])
  const totalWonValue = useMemo(() => getTotalValue(wonDeals), [wonDeals])
  const conversionRate = useMemo(() => (displayedSales.length > 0 ? (wonDeals.length / displayedSales.length) * 100 : 0), [displayedSales, wonDeals])

  const salesByStage = useMemo(() => {
    const groups: Record<string, Deal[]> = {}
    for (const s of pipelineStages) groups[s] = []
    for (const d of displayedSales) {
      if (!groups[d.status]) groups[d.status] = []
      groups[d.status].push(d)
    }
    return groups
  }, [displayedSales])

  const getSalesForStage = (stage: string): Deal[] => {
    return (salesByStage[stage] || []) as Deal[]
  }

  // Filtered and sorted sales for table view
  const filteredAndSortedSales = useMemo(() => {
    let list = sales
    
    // Apply status filter
    if (statusFilter !== 'all') {
      list = list.filter((sale: Deal) => sale.status === statusFilter)
    }
    
    // Apply search filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      list = list.filter((s: Deal) =>
        s.studentName.toLowerCase().includes(q) ||
        (s.course || '').toLowerCase().includes(q) ||
        (s.assignedCounsellor || '').toLowerCase().includes(q)
      )
    }
    
    // Apply sorting
    if (sortBy === 'value') {
      list = [...list].sort((a, b) => (b.amount || 0) - (a.amount || 0))
    } else if (sortBy === 'stage') {
      const idx = (s: Deal) => pipelineStages.indexOf(s.status)
      list = [...list].sort((a, b) => idx(a) - idx(b))
    } else if (sortBy === 'name') {
      list = [...list].sort((a, b) => a.studentName.localeCompare(b.studentName))
    } else {
      // recent
      list = [...list].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    }
    
    return list
  }, [sales, statusFilter, searchQuery, sortBy])

  // Pagination logic
  const totalPages = Math.ceil(filteredAndSortedSales.length / itemsPerPage)
  const paginatedSales = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage
    const endIndex = startIndex + itemsPerPage
    return filteredAndSortedSales.slice(startIndex, endIndex)
  }, [filteredAndSortedSales, currentPage, itemsPerPage])

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1)
  }, [statusFilter, searchQuery, sortBy])

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const moveSale = useCallback(async (saleId: string, newStage: Deal['status']) => {
    // Map Deal status back to Inquiry status for persistence
    const reverseMap: Record<DealStatus, Inquiry['status']> = {
      'Qualified Lead': 'New',
      'Contacted': 'Contacted',
      'Proposal Sent': 'Interested',
      'Follow-up': 'Follow Up',
      'Closed-Won': 'Converted',
      'Closed-Lost': 'Closed', // or 'Lost' depending on your semantics
    }

    const targetInquiryStatus = reverseMap[newStage]

    // Optimistic UI update
    setSales((prev: Deal[]) => prev.map((s: Deal) => s.id === saleId ? { ...s, status: newStage, closedAt: newStage.includes('Closed') ? new Date().toISOString() : s.closedAt } : s))

    try {
      await inquiryApi.updateInquiryStatus(saleId, { status: targetInquiryStatus })
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error('Failed to persist status change, reverting...', e)
      // Re-fetch to ensure consistency
      fetchSales()
    }
  }, [])

  // (moved displayedSales and metrics above salesByStage)

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <div className="text-gray-600">Loading sales pipeline...</div>
        </div>
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
                  <FunnelIcon className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
                    {user?.role === 'Employee' ? 'My Sales Pipeline' : 'Sales Pipeline'}
                  </h1>
                  <p className="text-sm text-gray-500">
                    {user?.role === 'Employee' ? 'Track your deals through the sales process' : 'Manage your sales opportunities'}
                  </p>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <div className="relative">
                <MagnifyingGlassIcon className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search deals..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="recent">Most Recent</option>
                <option value="value">Deal Value</option>
                <option value="stage">Pipeline Stage</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      <div className="px-6 py-8 space-y-8">
        {/* Enhanced Metrics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-200/50">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Pipeline Value</p>
                <p className="text-3xl font-bold text-gray-900">{formatCurrency(totalPipelineValue)}</p>
                <p className="text-sm text-blue-600 mt-1">Active deals</p>
              </div>
              <ChartBarIcon className="h-12 w-12 text-blue-600" />
            </div>
          </div>
          
          <div className="bg-gradient-to-r from-emerald-50 to-teal-50 rounded-2xl p-6 border border-emerald-200/50">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Won This Month</p>
                <p className="text-3xl font-bold text-gray-900">{formatCurrency(totalWonValue)}</p>
                <p className="text-sm text-emerald-600 mt-1">Revenue generated</p>
              </div>
              <CurrencyDollarIcon className="h-12 w-12 text-emerald-600" />
            </div>
          </div>
          
          <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl p-6 border border-purple-200/50">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Deals Won</p>
                <p className="text-3xl font-bold text-gray-900">{wonDeals.length}</p>
                <p className="text-sm text-purple-600 mt-1">Successful closes</p>
              </div>
              <div className="h-12 w-12 bg-purple-100 rounded-full flex items-center justify-center">
                <span className="text-purple-600 font-bold text-lg">{wonDeals.length}</span>
              </div>
            </div>
          </div>
          
          <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-2xl p-6 border border-amber-200/50">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Conversion Rate</p>
                <p className="text-3xl font-bold text-gray-900">{conversionRate.toFixed(1)}%</p>
                <p className="text-sm text-amber-600 mt-1">Success rate</p>
              </div>
              <ArrowTrendingUpIcon className="h-12 w-12 text-amber-600" />
            </div>
          </div>
        </div>

        {/* Excel-style Sales Table */}
        <div className="bg-white/70 backdrop-blur-sm rounded-2xl border border-gray-200/50 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold text-gray-900 flex items-center">
              <RocketLaunchIcon className="h-6 w-6 mr-2 text-blue-600" />
              Sales Pipeline
            </h3>
            <div className="flex items-center space-x-4">
              <div className="flex items-center gap-4 text-sm text-gray-600">
                <span className="inline-flex items-center gap-1">
                  <span className="w-2 h-2 bg-green-500 rounded-full"></span> 
                  Won {wonDeals.length}
                </span>
                <span className="inline-flex items-center gap-1">
                  <span className="w-2 h-2 bg-blue-500 rounded-full"></span> 
                  Open {openDeals.length}
                </span>
              </div>
              <button 
                onClick={() => setViewMode(viewMode === 'table' ? 'kanban' : 'table')}
                className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
              >
                {viewMode === 'table' ? 'Kanban View' : 'Table View'}
              </button>
            </div>
          </div>

          {/* Table View */}
          {viewMode === 'table' && (
            <div className="space-y-4">
              {/* Filters */}
              <div className="flex flex-wrap gap-4 p-4 bg-gray-50 rounded-lg">
                <div className="flex-1 min-w-[200px]">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
                  <div className="relative">
                    <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search by name, course, or counsellor..."
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                </div>
                
                <div className="min-w-[150px]">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Status Filter</label>
                  <select
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                  >
                    <option value="all">All Status</option>
                    {pipelineStages.map(stage => (
                      <option key={stage} value={stage}>{stage}</option>
                    ))}
                  </select>
                </div>
                
                <div className="min-w-[150px]">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Sort By</label>
                  <select
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as 'recent' | 'value' | 'stage' | 'name')}
                  >
                    <option value="recent">Most Recent</option>
                    <option value="value">Deal Value</option>
                    <option value="stage">Pipeline Stage</option>
                    <option value="name">Student Name</option>
                  </select>
                </div>
              </div>

              {/* Table Container */}
              <div className="border border-gray-200 rounded-lg overflow-hidden">
                <div className="overflow-x-auto max-h-[600px] overflow-y-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 sticky top-0 z-10">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                            onClick={() => setSortBy('name')}
                        >
                          Student Name
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Course
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                            onClick={() => setSortBy('value')}
                        >
                          Amount
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                            onClick={() => setSortBy('stage')}
                        >
                          Status
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Counsellor
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                            onClick={() => setSortBy('recent')}
                        >
                          Created
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {paginatedSales.map((sale: Deal) => (
                        <tr key={sale.id} className="hover:bg-gray-50 transition-colors">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">{sale.studentName}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-600">{sale.course || 'General'}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-bold text-green-600">{formatCurrency(sale.amount || 0)}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStageColor(sale.status)}`}>
                              {sale.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-blue-600">{sale.assignedCounsellor || 'Unassigned'}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-600">{new Date(sale.createdAt).toLocaleDateString()}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <div className="flex items-center space-x-2">
                              <button className="text-blue-600 hover:text-blue-900 p-1 rounded hover:bg-blue-50">
                                <EyeIcon className="h-4 w-4" />
                              </button>
                              <select
                                className="text-xs border border-gray-300 rounded px-2 py-1 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                value={sale.status}
                                onChange={(e) => moveSale(sale.id, e.target.value as DealStatus)}
                              >
                                {pipelineStages.map(stage => (
                                  <option key={stage} value={stage}>{stage}</option>
                                ))}
                              </select>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                
                {paginatedSales.length === 0 && (
                  <div className="text-center py-12 text-gray-400">
                    <p className="text-sm">No sales data found</p>
                  </div>
                )}
                
                {/* Pagination Controls */}
                {totalPages > 1 && (
                  <div className="bg-gray-50 px-6 py-3 border-t border-gray-200">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2 text-sm text-gray-600">
                        <span>Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, filteredAndSortedSales.length)} of {filteredAndSortedSales.length} records</span>
                        <select
                          className="ml-2 border border-gray-300 rounded px-2 py-1 text-sm"
                          value={itemsPerPage}
                          onChange={(e) => {
                            setItemsPerPage(Number(e.target.value))
                            setCurrentPage(1)
                          }}
                        >
                          <option value={25}>25 per page</option>
                          <option value={50}>50 per page</option>
                          <option value={100}>100 per page</option>
                        </select>
                      </div>
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                          disabled={currentPage === 1}
                          className={`px-3 py-1 text-sm rounded ${currentPage === 1 ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'}`}
                        >
                          Previous
                        </button>
                        <span className="text-sm text-gray-600">
                          Page {currentPage} of {totalPages}
                        </span>
                        <button
                          onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                          disabled={currentPage === totalPages}
                          className={`px-3 py-1 text-sm rounded ${currentPage === totalPages ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'}`}
                        >
                          Next
                        </button>
                      </div>
                    </div>
                  </div>
                )}
                
                {/* Pagination Info */}
                <div className="bg-gray-50 px-6 py-3 border-t border-gray-200">
                  <div className="flex items-center justify-between text-sm text-gray-600">
                    <span>Last updated: {new Date().toLocaleTimeString()}</span>
                    <span>Total records: {filteredAndSortedSales.length}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Kanban View (Original) */}
          {viewMode === 'kanban' && (
            <div className="grid grid-cols-1 lg:grid-cols-6 gap-4 overflow-x-auto">
              {pipelineStages.map((stage, stageIndex) => {
                const stageDeals = getSalesForStage(stage)
                const stageValue = getTotalValue(stageDeals)
                const isCollapsed = !!collapsedStages[stage]
                
                const stageColors = {
                  'Qualified Lead': 'from-blue-500 to-blue-600',
                  'Contacted': 'from-yellow-500 to-orange-500', 
                  'Proposal Sent': 'from-purple-500 to-indigo-500',
                  'Follow-up': 'from-orange-500 to-red-500',
                  'Closed-Won': 'from-green-600 to-emerald-600',
                  'Closed-Lost': 'from-gray-500 to-gray-600'
                }
                
                return (
                  <div key={stage} className="relative">
                    {/* Stage Header */}
                    <div className={`bg-gradient-to-r ${stageColors[stage as keyof typeof stageColors] || 'from-gray-500 to-gray-600'} rounded-t-2xl p-4 text-white`}>
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-semibold text-sm">{stage}</h4>
                        <span className="text-xs bg-white/20 px-2 py-1 rounded-full font-medium">{stageDeals.length}</span>
                      </div>
                      <div className="text-xs opacity-90">{formatCurrency(stageValue)} total</div>
                    </div>

                    {/* Deals Container */}
                    <div className="bg-gray-50/50 rounded-b-2xl min-h-[400px] p-4 space-y-3 border-l border-r border-b border-gray-200/50 max-h-[500px] overflow-y-auto">
                      {stageDeals.map((sale: Deal) => (
                        <div
                          key={sale.id}
                          className="bg-white rounded-xl p-4 shadow-sm hover:shadow-lg transition-all duration-300 cursor-pointer border border-gray-200/50 group hover:border-blue-300"
                        >
                          <div className="flex items-start justify-between mb-3">
                            <h5 className="font-semibold text-sm text-gray-900 group-hover:text-blue-600 transition-colors leading-tight">
                              {sale.studentName}
                            </h5>
                            <span className="text-sm font-bold text-green-600 bg-green-50 px-2 py-1 rounded-lg">
                              {formatCurrency(sale.amount || 0)}
                            </span>
                          </div>
                          
                          <div className="space-y-3">
                            <div className="flex items-center text-xs text-gray-600">
                              <UserIcon className="h-3 w-3 mr-2 text-gray-400" />
                              <span className="font-medium">{sale.course || 'General'}</span>
                            </div>
                            
                            {sale.assignedCounsellor && (
                              <div className="text-xs text-blue-600">
                                Counsellor: {sale.assignedCounsellor}
                              </div>
                            )}

                            {/* Action Buttons */}
                            <div className="flex items-center justify-between pt-2">
                              <div className="flex items-center space-x-2">
                                <button className="px-2 py-1 text-gray-700 hover:bg-gray-50 rounded">
                                  <EyeIcon className="h-4 w-4" />
                                </button>
                              </div>
                              <div className="flex items-center space-x-2">
                                {stage !== pipelineStages[0] && (
                                  <button
                                    onClick={() => {
                                      const currentIndex = pipelineStages.indexOf(stage)
                                      const prevStage = pipelineStages[currentIndex - 1]
                                      moveSale(sale.id, prevStage as DealStatus)
                                    }}
                                    className="text-xs px-2 py-1 text-gray-700 hover:bg-gray-50 rounded"
                                  >
                                    ← Back
                                  </button>
                                )}
                                {stage !== pipelineStages[pipelineStages.length - 1] && stage !== pipelineStages[pipelineStages.length - 2] && (
                                  <button
                                    onClick={() => {
                                      const currentIndex = pipelineStages.indexOf(stage)
                                      const nextStage = pipelineStages[currentIndex + 1]
                                      moveSale(sale.id, nextStage as DealStatus)
                                    }}
                                    className="text-xs px-2 py-1 text-gray-700 hover:bg-gray-50 rounded inline-flex items-center"
                                  >
                                    Next <ArrowRightIcon className="h-3.5 w-3.5 ml-1" />
                                  </button>
                                )}
                                {stage === 'Follow-up' && (
                                  <div className="flex space-x-1">
                                    <button
                                      onClick={() => moveSale(sale.id, 'Closed-Won')}
                                      className="text-xs px-2 py-1 text-green-600 hover:bg-green-50 rounded"
                                    >
                                      Win
                                    </button>
                                    <button
                                      onClick={() => moveSale(sale.id, 'Closed-Lost')}
                                      className="text-xs px-2 py-1 text-red-600 hover:bg-red-50 rounded"
                                    >
                                      Lose
                                    </button>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                      
                      {stageDeals.length === 0 && (
                        <div className="text-center py-8 text-gray-400 bg-white/60 rounded-xl border border-gray-200/60">
                          <p className="text-sm">No deals in this stage</p>
                        </div>
                      )}
                    </div>

                    {/* Pipeline Arrow */}
                    {stageIndex < pipelineStages.length - 1 && (
                      <div className="hidden lg:block absolute top-1/2 -right-2 transform -translate-y-1/2 z-10">
                        <div className="w-4 h-4 bg-white border-2 border-gray-300 rounded-full flex items-center justify-center shadow-sm">
                          <ArrowUpIcon className="h-2 w-2 text-gray-600 rotate-90" />
                        </div>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white/70 backdrop-blur-sm rounded-2xl border border-gray-200/50 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                <BellIcon className="h-5 w-5 mr-2 text-blue-600" />
                Recent Sales Activity
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
            <div className="space-y-3 max-h-80 overflow-y-auto">
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
                        activity.type === 'conversion' ? 'bg-gradient-to-r from-purple-500 to-pink-500' :
                        activity.type === 'proposal' ? 'bg-gradient-to-r from-blue-500 to-indigo-500' :
                        activity.type === 'follow-up' ? 'bg-gradient-to-r from-yellow-500 to-orange-500' :
                        'bg-gradient-to-r from-green-500 to-emerald-500'
                      }`}>
                        <IconComponent className="h-4 w-4 text-white" />
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-900 font-medium">{activity.message}</p>
                      <div className="flex items-center justify-between mt-1">
                        <p className="text-xs text-gray-500">{activity.details} • {formatTimeAgo(activity.timestamp)}</p>
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

          <div className="bg-white/70 backdrop-blur-sm rounded-2xl border border-gray-200/50 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Performance This Month</h3>
              <div className="flex items-center space-x-2">
                <div className={`w-2 h-2 rounded-full ${isLive ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`}></div>
                <span className="text-xs text-gray-500">Real-time</span>
              </div>
            </div>
            <div className="space-y-4">
              <div className="flex justify-between items-center p-3 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg">
                <span className="text-sm text-gray-600 font-medium">Deals in Pipeline</span>
                <div className="flex items-center space-x-2">
                  <span className="font-bold text-gray-900">
                    {sales.filter((s: Deal) => !s.status.includes('Closed')).length + performanceMetrics.dealsInPipeline}
                  </span>
                  {performanceMetrics.dealsInPipeline !== 0 && (
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      performanceMetrics.dealsInPipeline > 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                    }`}>
                      {performanceMetrics.dealsInPipeline > 0 ? '+' : ''}{performanceMetrics.dealsInPipeline}
                    </span>
                  )}
                </div>
              </div>
              
              <div className="flex justify-between items-center p-3 bg-gradient-to-r from-emerald-50 to-teal-50 rounded-lg">
                <span className="text-sm text-gray-600 font-medium">Average Deal Size</span>
                <div className="flex items-center space-x-2">
                  <span className="font-bold text-gray-900">
                    {formatCurrency((sales.length > 0 ? getTotalValue(sales) / sales.length : 50000) + performanceMetrics.avgDealSize)}
                  </span>
                  {performanceMetrics.avgDealSize !== 0 && (
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      performanceMetrics.avgDealSize > 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                    }`}>
                      {performanceMetrics.avgDealSize > 0 ? '+' : ''}{formatCurrency(performanceMetrics.avgDealSize)}
                    </span>
                  )}
                </div>
              </div>
              
              <div className="flex justify-between items-center p-3 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg">
                <span className="text-sm text-gray-600 font-medium">Deals Won</span>
                <div className="flex items-center space-x-2">
                  <span className="font-bold text-green-600">
                    {wonDeals.length + performanceMetrics.dealsWon}
                  </span>
                  {performanceMetrics.dealsWon > 0 && (
                    <span className="text-xs px-2 py-1 rounded-full bg-green-100 text-green-700 animate-pulse">
                      +{performanceMetrics.dealsWon}
                    </span>
                  )}
                </div>
              </div>
              
              <div className="flex justify-between items-center p-3 bg-gradient-to-r from-amber-50 to-orange-50 rounded-lg">
                <span className="text-sm text-gray-600 font-medium">Deals Lost</span>
                <div className="flex items-center space-x-2">
                  <span className="font-bold text-red-600">
                    {sales.filter((s: Deal) => s.status === 'Closed-Lost').length + performanceMetrics.dealsLost}
                  </span>
                  {performanceMetrics.dealsLost > 0 && (
                    <span className="text-xs px-2 py-1 rounded-full bg-red-100 text-red-700">
                      +{performanceMetrics.dealsLost}
                    </span>
                  )}
                </div>
              </div>
              
              <div className="pt-4 border-t border-gray-200">
                <div className="flex justify-between items-center p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg">
                  <span className="text-sm font-medium text-gray-900">Total Revenue</span>
                  <div className="flex items-center space-x-2">
                    <span className="font-bold text-xl text-green-600">
                      {formatCurrency(totalWonValue + performanceMetrics.totalRevenue)}
                    </span>
                    {performanceMetrics.totalRevenue > 0 && (
                      <span className="text-xs px-2 py-1 rounded-full bg-green-100 text-green-700 animate-pulse">
                        +{formatCurrency(performanceMetrics.totalRevenue)}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
