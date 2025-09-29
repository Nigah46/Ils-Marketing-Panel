'use client'

import { useState, useEffect } from 'react'
import { inquiryApi, type Inquiry, type AssignInquiryData } from '@/lib/inquiryApi'
import { employeeApi } from '@/lib/employeeApi'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import Modal from '@/components/ui/Modal'
import { Table, TableHeader, TableBody, TableRow, TableCell } from '@/components/ui/Table'
import { 
  UserPlusIcon, 
  MagnifyingGlassIcon, 
  FunnelIcon,
  ClockIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline'

interface Employee {
  _id: string
  employeeId: string
  name: string
  email: string
  department: string
  role: string
  isActive: boolean
  statistics?: {
    totalAssigned: number
    converted: number
    conversionRate: string
  }
}

interface LeadAssignmentProps {
  onAssignmentComplete?: () => void
}

export default function LeadAssignment({ onAssignmentComplete }: LeadAssignmentProps) {
  const [unassignedLeads, setUnassignedLeads] = useState<Inquiry[]>([])
  const [employees, setEmployees] = useState<Employee[]>([])
  const [loading, setLoading] = useState(true)
  const [showAssignModal, setShowAssignModal] = useState(false)
  const [selectedLead, setSelectedLead] = useState<Inquiry | null>(null)
  const [assignmentData, setAssignmentData] = useState({
    employeeId: '',
    priority: 'Medium',
    deadline: '',
    assignmentReason: ''
  })
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('All')
  const [assigning, setAssigning] = useState(false)

  useEffect(() => {
    fetchUnassignedLeads()
    fetchEmployees()
  }, [])

  const fetchUnassignedLeads = async () => {
    try {
      const response = await inquiryApi.getAllInquiries({
        assignedTo: '',
        page: 1,
        limit: 50
      })
      setUnassignedLeads(response.data.filter(lead => !lead.assignedTo))
    } catch (error) {
      console.error('Failed to fetch unassigned leads:', error)
    }
  }

  const fetchEmployees = async () => {
    try {
      const response = await employeeApi.getEmployees({
        role: 'counsellor',
        isActive: true
      })
      setEmployees(response.data)
    } catch (error) {
      console.error('Failed to fetch employees:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleAssignLead = (lead: Inquiry) => {
    setSelectedLead(lead)
    setShowAssignModal(true)
    setAssignmentData({
      employeeId: '',
      priority: lead.priority || 'Medium',
      deadline: '',
      assignmentReason: ''
    })
  }

  const handleAssignmentSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedLead || !assignmentData.employeeId) return

    setAssigning(true)
    try {
      await inquiryApi.assignInquiry({
        inquiryId: selectedLead._id,
        employeeId: assignmentData.employeeId,
        priority: assignmentData.priority,
        deadline: assignmentData.deadline || undefined,
        assignmentReason: assignmentData.assignmentReason || undefined
      })

      // Remove assigned lead from unassigned list
      setUnassignedLeads(prev => prev.filter(lead => lead._id !== selectedLead._id))
      setShowAssignModal(false)
      setSelectedLead(null)
      
      if (onAssignmentComplete) {
        onAssignmentComplete()
      }
    } catch (error) {
      console.error('Failed to assign lead:', error)
      alert('Failed to assign lead. Please try again.')
    } finally {
      setAssigning(false)
    }
  }

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'New': return 'bg-blue-100 text-blue-800'
      case 'Contacted': return 'bg-yellow-100 text-yellow-800'
      case 'Interested': return 'bg-green-100 text-green-800'
      case 'Follow Up': return 'bg-purple-100 text-purple-800'
      case 'Converted': return 'bg-green-100 text-green-800'
      case 'Lost': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getPriorityBadgeColor = (priority: string) => {
    switch (priority) {
      case 'Urgent': return 'bg-red-100 text-red-800'
      case 'High': return 'bg-orange-100 text-orange-800'
      case 'Medium': return 'bg-yellow-100 text-yellow-800'
      case 'Low': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const filteredLeads = unassignedLeads.filter(lead => {
    const matchesSearch = searchTerm === '' || 
      lead.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.phone.includes(searchTerm)
    
    const matchesStatus = statusFilter === 'All' || lead.status === statusFilter
    
    return matchesSearch && matchesStatus
  })

  if (loading) {
    return (
      <Card>
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-2 text-secondary-600">Loading leads...</p>
        </div>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <Card>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-semibold text-secondary-900">Unassigned Leads</h3>
            <p className="text-sm text-secondary-600">Assign leads to counsellors for follow-up</p>
          </div>
          <div className="flex items-center space-x-2">
            <ExclamationTriangleIcon className="h-5 w-5 text-orange-500" />
            <span className="text-sm font-medium text-orange-700">
              {unassignedLeads.length} leads pending assignment
            </span>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
          <div className="flex flex-col sm:flex-row gap-4 flex-1">
            <div className="relative flex-1">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-secondary-400" />
              <Input
                placeholder="Search leads..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex items-center gap-2">
              <FunnelIcon className="h-4 w-4 text-secondary-400" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="border border-secondary-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="All">All Status</option>
                <option value="New">New</option>
                <option value="Contacted">Contacted</option>
                <option value="Interested">Interested</option>
                <option value="Follow Up">Follow Up</option>
              </select>
            </div>
          </div>
        </div>

        {/* Leads Table */}
        <Table>
          <TableHeader>
            <TableRow>
              <TableCell header>Customer</TableCell>
              <TableCell header>Contact</TableCell>
              <TableCell header>Type</TableCell>
              <TableCell header>Status</TableCell>
              <TableCell header>Priority</TableCell>
              <TableCell header>Source</TableCell>
              <TableCell header>Created</TableCell>
              <TableCell header>Actions</TableCell>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredLeads.map((lead) => (
              <TableRow key={lead._id}>
                <TableCell>
                  <div>
                    <div className="font-medium text-secondary-900">{lead.customerName}</div>
                    <div className="text-sm text-secondary-500">{lead.inquiryId}</div>
                  </div>
                </TableCell>
                <TableCell>
                  <div>
                    <div className="text-sm text-secondary-900">{lead.email}</div>
                    <div className="text-sm text-secondary-500">{lead.phone}</div>
                  </div>
                </TableCell>
                <TableCell>{lead.type}</TableCell>
                <TableCell>
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadgeColor(lead.status)}`}>
                    {lead.status}
                  </span>
                </TableCell>
                <TableCell>
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getPriorityBadgeColor(lead.priority)}`}>
                    {lead.priority}
                  </span>
                </TableCell>
                <TableCell>{lead.source}</TableCell>
                <TableCell>{formatDate(lead.createdAt)}</TableCell>
                <TableCell>
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => handleAssignLead(lead)}
                  >
                    <UserPlusIcon className="h-4 w-4 mr-1" />
                    Assign
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        {filteredLeads.length === 0 && (
          <div className="text-center py-8">
            <ClockIcon className="h-12 w-12 text-secondary-400 mx-auto mb-4" />
            <p className="text-secondary-500">
              {unassignedLeads.length === 0 
                ? "All leads have been assigned!" 
                : "No leads match your search criteria."
              }
            </p>
          </div>
        )}
      </Card>

      {/* Assignment Modal */}
      <Modal
        isOpen={showAssignModal}
        onClose={() => setShowAssignModal(false)}
        title="Assign Lead"
        size="md"
      >
        {selectedLead && (
          <form onSubmit={handleAssignmentSubmit} className="space-y-4">
            <div className="bg-secondary-50 rounded-lg p-4 mb-4">
              <h4 className="font-medium text-secondary-900 mb-2">Lead Details</h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-secondary-600">Customer:</span>
                  <p className="font-medium">{selectedLead.customerName}</p>
                </div>
                <div>
                  <span className="text-secondary-600">Email:</span>
                  <p className="font-medium">{selectedLead.email}</p>
                </div>
                <div>
                  <span className="text-secondary-600">Phone:</span>
                  <p className="font-medium">{selectedLead.phone}</p>
                </div>
                <div>
                  <span className="text-secondary-600">Type:</span>
                  <p className="font-medium">{selectedLead.type}</p>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-2">
                Assign to Counsellor *
              </label>
              <select
                value={assignmentData.employeeId}
                onChange={(e) => setAssignmentData({ ...assignmentData, employeeId: e.target.value })}
                className="w-full border border-secondary-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
                required
              >
                <option value="">Select a counsellor</option>
                {employees.map(employee => (
                  <option key={employee._id} value={employee._id}>
                    {employee.name} ({employee.employeeId}) - {employee.statistics?.totalAssigned || 0} leads
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-2">
                Priority
              </label>
              <select
                value={assignmentData.priority}
                onChange={(e) => setAssignmentData({ ...assignmentData, priority: e.target.value })}
                className="w-full border border-secondary-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
                <option value="Urgent">Urgent</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-2">
                Deadline (Optional)
              </label>
              <Input
                type="date"
                value={assignmentData.deadline}
                onChange={(e) => setAssignmentData({ ...assignmentData, deadline: e.target.value })}
                min={new Date().toISOString().split('T')[0]}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-2">
                Assignment Reason (Optional)
              </label>
              <textarea
                value={assignmentData.assignmentReason}
                onChange={(e) => setAssignmentData({ ...assignmentData, assignmentReason: e.target.value })}
                className="w-full border border-secondary-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
                rows={3}
                placeholder="Why are you assigning this lead to this counsellor?"
              />
            </div>

            <div className="flex justify-end space-x-3 pt-4">
              <Button
                type="button"
                variant="secondary"
                onClick={() => setShowAssignModal(false)}
                disabled={assigning}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={!assignmentData.employeeId || assigning}
              >
                {assigning ? 'Assigning...' : 'Assign Lead'}
              </Button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  )
}
