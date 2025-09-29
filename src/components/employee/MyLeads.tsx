'use client'

import { useState, useEffect } from 'react'
import { inquiryApi, type Inquiry, type UpdateInquiryStatusData, type AddCommunicationData } from '@/lib/inquiryApi'
import { useAuth } from '@/contexts/AuthContext'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import Modal from '@/components/ui/Modal'
import { Table, TableHeader, TableBody, TableRow, TableCell } from '@/components/ui/Table'
import { 
  PhoneIcon, 
  EnvelopeIcon, 
  ClockIcon, 
  CheckCircleIcon, 
  XCircleIcon,
  EyeIcon,
  PencilIcon,
  ChatBubbleLeftRightIcon,
  CalendarIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline'

interface MyLeadsProps {
  className?: string
}

export default function MyLeads({ className = '' }: MyLeadsProps) {
  const { user } = useAuth()
  const [leads, setLeads] = useState<Inquiry[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedLead, setSelectedLead] = useState<Inquiry | null>(null)
  const [showDetailsModal, setShowDetailsModal] = useState(false)
  const [showUpdateModal, setShowUpdateModal] = useState(false)
  const [showCommunicationModal, setShowCommunicationModal] = useState(false)
  
  const [filters, setFilters] = useState({
    status: '',
    priority: '',
    search: ''
  })

  const [updateData, setUpdateData] = useState<UpdateInquiryStatusData>({
    status: '',
    notes: '',
    nextFollowUp: '',
    remarks: '',
    notifyManager: true
  })

  const [communicationData, setCommunicationData] = useState<AddCommunicationData>({
    type: 'Call',
    details: '',
    outcome: ''
  })

  const [stats, setStats] = useState({
    total: 0,
    new: 0,
    contacted: 0,
    interested: 0,
    converted: 0,
    overdue: 0
  })

  useEffect(() => {
    if (user?.role === 'Employee') {
      fetchMyLeads()
    }
  }, [user, filters])

  const fetchMyLeads = async () => {
    try {
      setLoading(true)
      const response = await inquiryApi.getMyInquiries({
        status: filters.status || undefined,
        priority: filters.priority || undefined,
        page: 1,
        limit: 100
      })
      
      let filteredLeads = response.data
      
      // Apply search filter
      if (filters.search) {
        filteredLeads = filteredLeads.filter(lead => 
          lead.customerName.toLowerCase().includes(filters.search.toLowerCase()) ||
          lead.email.toLowerCase().includes(filters.search.toLowerCase()) ||
          lead.phone.includes(filters.search) ||
          lead.inquiryId.toLowerCase().includes(filters.search.toLowerCase())
        )
      }
      
      setLeads(filteredLeads)
      
      // Calculate stats
      const now = new Date()
      const total = filteredLeads.length
      const newLeads = filteredLeads.filter(lead => lead.status === 'New').length
      const contacted = filteredLeads.filter(lead => lead.status === 'Contacted').length
      const interested = filteredLeads.filter(lead => lead.status === 'Interested').length
      const converted = filteredLeads.filter(lead => lead.status === 'Converted').length
      const overdue = filteredLeads.filter(lead => 
        lead.nextFollowUp && new Date(lead.nextFollowUp) < now
      ).length
      
      setStats({ total, new: newLeads, contacted, interested, converted, overdue })
    } catch (error) {
      console.error('Failed to fetch my leads:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleViewDetails = (lead: Inquiry) => {
    setSelectedLead(lead)
    setShowDetailsModal(true)
  }

  const handleUpdateStatus = (lead: Inquiry) => {
    setSelectedLead(lead)
    setUpdateData({
      status: lead.status,
      notes: '',
      nextFollowUp: lead.nextFollowUp ? lead.nextFollowUp.split('T')[0] : '',
      remarks: '',
      notifyManager: true
    })
    setShowUpdateModal(true)
  }

  const handleAddCommunication = (lead: Inquiry) => {
    setSelectedLead(lead)
    setCommunicationData({
      type: 'Call',
      details: '',
      outcome: ''
    })
    setShowCommunicationModal(true)
  }

  const handleStatusUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedLead) return

    try {
      await inquiryApi.updateInquiryStatus(selectedLead._id, {
        ...updateData,
        nextFollowUp: updateData.nextFollowUp ? new Date(updateData.nextFollowUp).toISOString() : undefined
      })
      
      setShowUpdateModal(false)
      fetchMyLeads() // Refresh the list
    } catch (error) {
      console.error('Failed to update status:', error)
      alert('Failed to update status. Please try again.')
    }
  }

  const handleCommunicationSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedLead) return

    try {
      await inquiryApi.addCommunication(selectedLead._id, communicationData)
      setShowCommunicationModal(false)
      fetchMyLeads() // Refresh the list
    } catch (error) {
      console.error('Failed to add communication:', error)
      alert('Failed to add communication. Please try again.')
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
      case 'Closed': return 'bg-gray-100 text-gray-800'
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

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'New': return <ClockIcon className="h-4 w-4" />
      case 'Contacted': return <PhoneIcon className="h-4 w-4" />
      case 'Interested': return <CheckCircleIcon className="h-4 w-4" />
      case 'Converted': return <CheckCircleIcon className="h-4 w-4 text-green-600" />
      case 'Lost': return <XCircleIcon className="h-4 w-4 text-red-600" />
      default: return <ClockIcon className="h-4 w-4" />
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const isOverdue = (followUpDate: string) => {
    return new Date(followUpDate) < new Date()
  }

  if (loading) {
    return (
      <Card className={className}>
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-2 text-secondary-600">Loading your leads...</p>
        </div>
      </Card>
    )
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <Card className="p-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{stats.total}</div>
            <div className="text-sm text-secondary-600">Total Leads</div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-yellow-600">{stats.new}</div>
            <div className="text-sm text-secondary-600">New</div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-600">{stats.contacted}</div>
            <div className="text-sm text-secondary-600">Contacted</div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">{stats.interested}</div>
            <div className="text-sm text-secondary-600">Interested</div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">{stats.converted}</div>
            <div className="text-sm text-secondary-600">Converted</div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-red-600">{stats.overdue}</div>
            <div className="text-sm text-secondary-600">Overdue</div>
          </div>
        </Card>
      </div>

      {/* Main Leads Table */}
      <Card>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-semibold text-secondary-900">My Assigned Leads</h3>
            <p className="text-sm text-secondary-600">Manage and track your assigned leads</p>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <Input
            placeholder="Search leads..."
            value={filters.search}
            onChange={(e) => setFilters({ ...filters, search: e.target.value })}
            className="flex-1"
          />
          <select
            value={filters.status}
            onChange={(e) => setFilters({ ...filters, status: e.target.value })}
            className="border border-secondary-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="">All Status</option>
            <option value="New">New</option>
            <option value="Contacted">Contacted</option>
            <option value="Interested">Interested</option>
            <option value="Follow Up">Follow Up</option>
            <option value="Converted">Converted</option>
            <option value="Lost">Lost</option>
          </select>
          <select
            value={filters.priority}
            onChange={(e) => setFilters({ ...filters, priority: e.target.value })}
            className="border border-secondary-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="">All Priority</option>
            <option value="Urgent">Urgent</option>
            <option value="High">High</option>
            <option value="Medium">Medium</option>
            <option value="Low">Low</option>
          </select>
        </div>

        {/* Leads Table */}
        <Table>
          <TableHeader>
            <TableRow>
              <TableCell header>Customer</TableCell>
              <TableCell header>Contact</TableCell>
              <TableCell header>Status</TableCell>
              <TableCell header>Priority</TableCell>
              <TableCell header>Next Follow-up</TableCell>
              <TableCell header>Assigned</TableCell>
              <TableCell header>Actions</TableCell>
            </TableRow>
          </TableHeader>
          <TableBody>
            {leads.map((lead) => (
              <TableRow key={lead._id}>
                <TableCell>
                  <div>
                    <div className="font-medium text-secondary-900">{lead.customerName}</div>
                    <div className="text-sm text-secondary-500">{lead.inquiryId}</div>
                    {lead.courseInterest && (
                      <div className="text-xs text-secondary-400">{lead.courseInterest}</div>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <div>
                    <div className="text-sm text-secondary-900">{lead.email}</div>
                    <div className="text-sm text-secondary-500">{lead.phone}</div>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center space-x-2">
                    {getStatusIcon(lead.status)}
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadgeColor(lead.status)}`}>
                      {lead.status}
                    </span>
                  </div>
                </TableCell>
                <TableCell>
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getPriorityBadgeColor(lead.priority)}`}>
                    {lead.priority}
                  </span>
                </TableCell>
                <TableCell>
                  {lead.nextFollowUp ? (
                    <div className={`text-sm ${isOverdue(lead.nextFollowUp) ? 'text-red-600 font-medium' : 'text-secondary-900'}`}>
                      {isOverdue(lead.nextFollowUp) && <ExclamationTriangleIcon className="h-4 w-4 inline mr-1" />}
                      {formatDate(lead.nextFollowUp)}
                    </div>
                  ) : (
                    <span className="text-secondary-400">Not set</span>
                  )}
                </TableCell>
                <TableCell>
                  <div className="text-sm text-secondary-600">
                    {formatDate(lead.assignedAt || lead.createdAt)}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex space-x-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleViewDetails(lead)}
                      title="View Details"
                    >
                      <EyeIcon className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleUpdateStatus(lead)}
                      title="Update Status"
                    >
                      <PencilIcon className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleAddCommunication(lead)}
                      title="Add Communication"
                    >
                      <ChatBubbleLeftRightIcon className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        {leads.length === 0 && (
          <div className="text-center py-8">
            <ClockIcon className="h-12 w-12 text-secondary-400 mx-auto mb-4" />
            <p className="text-secondary-500">No leads assigned to you yet.</p>
          </div>
        )}
      </Card>

      {/* Lead Details Modal */}
      <Modal
        isOpen={showDetailsModal}
        onClose={() => setShowDetailsModal(false)}
        title="Lead Details"
        size="lg"
      >
        {selectedLead && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-secondary-700">Customer Name</label>
                <p className="mt-1 text-sm text-secondary-900">{selectedLead.customerName}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-secondary-700">Email</label>
                <p className="mt-1 text-sm text-secondary-900">{selectedLead.email}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-secondary-700">Phone</label>
                <p className="mt-1 text-sm text-secondary-900">{selectedLead.phone}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-secondary-700">Type</label>
                <p className="mt-1 text-sm text-secondary-900">{selectedLead.type}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-secondary-700">Source</label>
                <p className="mt-1 text-sm text-secondary-900">{selectedLead.source}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-secondary-700">Course Interest</label>
                <p className="mt-1 text-sm text-secondary-900">{selectedLead.courseInterest || 'Not specified'}</p>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-secondary-700">Message</label>
              <p className="mt-1 text-sm text-secondary-900 bg-secondary-50 p-3 rounded-md">{selectedLead.message}</p>
            </div>

            {selectedLead.notes && selectedLead.notes.length > 0 && (
              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-2">Notes</label>
                <div className="space-y-2">
                  {selectedLead.notes.map((note, index) => (
                    <div key={index} className="bg-secondary-50 p-3 rounded-md">
                      <p className="text-sm text-secondary-900">{note.note}</p>
                      <p className="text-xs text-secondary-500 mt-1">
                        By {note.addedBy.name} on {formatDateTime(note.addedAt)}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {selectedLead.communications && selectedLead.communications.length > 0 && (
              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-2">Communication History</label>
                <div className="space-y-2">
                  {selectedLead.communications.map((comm, index) => (
                    <div key={index} className="bg-secondary-50 p-3 rounded-md">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium text-secondary-900">{comm.type}</span>
                        <span className="text-xs text-secondary-500">{formatDateTime(comm.communicatedAt)}</span>
                      </div>
                      <p className="text-sm text-secondary-700">{comm.details}</p>
                      {comm.outcome && (
                        <p className="text-sm text-secondary-600 mt-1">Outcome: {comm.outcome}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </Modal>

      {/* Update Status Modal */}
      <Modal
        isOpen={showUpdateModal}
        onClose={() => setShowUpdateModal(false)}
        title="Update Lead Status"
        size="md"
      >
        {selectedLead && (
          <form onSubmit={handleStatusUpdate} className="space-y-4">
            <div className="bg-secondary-50 rounded-lg p-4 mb-4">
              <h4 className="font-medium text-secondary-900">{selectedLead.customerName}</h4>
              <p className="text-sm text-secondary-600">{selectedLead.inquiryId}</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-2">Status</label>
              <select
                value={updateData.status}
                onChange={(e) => setUpdateData({ ...updateData, status: e.target.value })}
                className="w-full border border-secondary-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
                required
              >
                <option value="New">New</option>
                <option value="Contacted">Contacted</option>
                <option value="Interested">Interested</option>
                <option value="Follow Up">Follow Up</option>
                <option value="Converted">Converted</option>
                <option value="Lost">Lost</option>
                <option value="Closed">Closed</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-2">Next Follow-up Date</label>
              <Input
                type="date"
                value={updateData.nextFollowUp}
                onChange={(e) => setUpdateData({ ...updateData, nextFollowUp: e.target.value })}
                min={new Date().toISOString().split('T')[0]}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-2">Notes</label>
              <textarea
                value={updateData.notes}
                onChange={(e) => setUpdateData({ ...updateData, notes: e.target.value })}
                className="w-full border border-secondary-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
                rows={3}
                placeholder="Add any notes about this status update..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-2">Remarks for Manager</label>
              <textarea
                value={updateData.remarks}
                onChange={(e) => setUpdateData({ ...updateData, remarks: e.target.value })}
                className="w-full border border-secondary-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
                rows={2}
                placeholder="Any specific remarks or updates for your manager..."
              />
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="notifyManager"
                checked={updateData.notifyManager}
                onChange={(e) => setUpdateData({ ...updateData, notifyManager: e.target.checked })}
                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-secondary-300 rounded"
              />
              <label htmlFor="notifyManager" className="ml-2 block text-sm text-secondary-900">
                Notify manager about this status update
              </label>
            </div>

            <div className="flex justify-end space-x-3 pt-4">
              <Button
                type="button"
                variant="secondary"
                onClick={() => setShowUpdateModal(false)}
              >
                Cancel
              </Button>
              <Button type="submit">
                Update Status
              </Button>
            </div>
          </form>
        )}
      </Modal>

      {/* Add Communication Modal */}
      <Modal
        isOpen={showCommunicationModal}
        onClose={() => setShowCommunicationModal(false)}
        title="Add Communication"
        size="md"
      >
        {selectedLead && (
          <form onSubmit={handleCommunicationSubmit} className="space-y-4">
            <div className="bg-secondary-50 rounded-lg p-4 mb-4">
              <h4 className="font-medium text-secondary-900">{selectedLead.customerName}</h4>
              <p className="text-sm text-secondary-600">{selectedLead.inquiryId}</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-2">Communication Type</label>
              <select
                value={communicationData.type}
                onChange={(e) => setCommunicationData({ ...communicationData, type: e.target.value as any })}
                className="w-full border border-secondary-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
                required
              >
                <option value="Call">Phone Call</option>
                <option value="Email">Email</option>
                <option value="WhatsApp">WhatsApp</option>
                <option value="SMS">SMS</option>
                <option value="Meeting">Meeting</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-2">Details</label>
              <textarea
                value={communicationData.details}
                onChange={(e) => setCommunicationData({ ...communicationData, details: e.target.value })}
                className="w-full border border-secondary-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
                rows={3}
                placeholder="Describe what was discussed..."
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-2">Outcome</label>
              <textarea
                value={communicationData.outcome}
                onChange={(e) => setCommunicationData({ ...communicationData, outcome: e.target.value })}
                className="w-full border border-secondary-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
                rows={2}
                placeholder="What was the result of this communication?"
                required
              />
            </div>

            <div className="flex justify-end space-x-3 pt-4">
              <Button
                type="button"
                variant="secondary"
                onClick={() => setShowCommunicationModal(false)}
              >
                Cancel
              </Button>
              <Button type="submit">
                Add Communication
              </Button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  )
}
