'use client';

import { useState, useEffect } from 'react';
import { PhoneIcon, EnvelopeIcon, ClockIcon, CheckCircleIcon, XCircleIcon, ArrowRightOnRectangleIcon } from '@heroicons/react/24/outline';
import { inquiryApi, Inquiry } from '@/lib/inquiryApi';
import { useAuth } from '@/contexts/AuthContext';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import DataTable from '@/components/ui/DataTable';
import Modal from '@/components/ui/Modal';
import Input from '@/components/ui/Input';
import MyLeads from '@/components/employee/MyLeads';

// Utility functions for styling
const getStatusColor = (status: string) => {
  switch (status) {
    case 'New': return 'bg-blue-100 text-blue-800';
    case 'Contacted': return 'bg-yellow-100 text-yellow-800';
    case 'Interested': return 'bg-green-100 text-green-800';
    case 'Follow Up': return 'bg-purple-100 text-purple-800';
    case 'Converted': return 'bg-green-100 text-green-800';
    case 'Lost': return 'bg-red-100 text-red-800';
    default: return 'bg-gray-100 text-gray-800';
  }
};

const getPriorityColor = (priority: string) => {
  switch (priority) {
    case 'Urgent': return 'bg-red-100 text-red-800';
    case 'High': return 'bg-orange-100 text-orange-800';
    case 'Medium': return 'bg-yellow-100 text-yellow-800';
    case 'Low': return 'bg-gray-100 text-gray-800';
    default: return 'bg-gray-100 text-gray-800';
  }
};

export default function CounsellorDashboard() {
  const { user, logout } = useAuth();
  const [myLeads, setMyLeads] = useState<Inquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedLead, setSelectedLead] = useState<Inquiry | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showUpdateModal, setShowUpdateModal] = useState(false);

  // Logout function
  const handleLogout = () => {
    logout()
    window.location.href = '/login'
  }
  
  const [filters, setFilters] = useState({
    status: '',
    priority: '',
    page: 1,
    limit: 20
  });

  const [stats, setStats] = useState({
    totalAssigned: 0,
    contacted: 0,
    interested: 0,
    converted: 0,
    lost: 0,
    conversionRate: 0
  });

  useEffect(() => {
    if (user?.role === 'Employee') {
      fetchMyLeads();
    }
  }, [user, filters]);

  const fetchMyLeads = async () => {
    try {
      setLoading(true);
      const response = await inquiryApi.getMyInquiries(filters);
      setMyLeads(response.data);
      
      // Calculate stats
      const totalAssigned = response.data.length;
      const contacted = response.data.filter(lead => lead.status === 'Contacted').length;
      const interested = response.data.filter(lead => lead.status === 'Interested').length;
      const converted = response.data.filter(lead => lead.status === 'Converted').length;
      const lost = response.data.filter(lead => lead.status === 'Lost').length;
      const conversionRate = totalAssigned > 0 ? (converted / totalAssigned) * 100 : 0;
      
      setStats({ totalAssigned, contacted, interested, converted, lost, conversionRate });
    } catch (err) {
      console.error('Failed to fetch my leads:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = (lead: Inquiry) => {
    setSelectedLead(lead);
    setShowDetailsModal(true);
  };

  const handleUpdateStatus = (lead: Inquiry) => {
    setSelectedLead(lead);
    setShowUpdateModal(true);
  };


  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Converted': return <CheckCircleIcon className="h-4 w-4 text-green-600" />;
      case 'Lost': return <XCircleIcon className="h-4 w-4 text-red-600" />;
      case 'Follow Up': return <ClockIcon className="h-4 w-4 text-purple-600" />;
      default: return null;
    }
  };

  const columns = [
    {
      key: 'customerName',
      label: 'Customer Details',
      render: (value: string, row: Inquiry) => (
        <div>
          <div className="font-medium text-gray-900">{value}</div>
          <div className="text-sm text-gray-500 flex items-center mt-1">
            <EnvelopeIcon className="h-3 w-3 mr-1" />
            {row.email}
          </div>
          <div className="text-sm text-gray-500 flex items-center">
            <PhoneIcon className="h-3 w-3 mr-1" />
            {row.phone}
          </div>
        </div>
      )
    },
    {
      key: 'courseInterest',
      label: 'Course Interest',
      render: (value: string) => (
        <span className="text-sm font-medium text-gray-700">{value || 'General Inquiry'}</span>
      )
    },
    {
      key: 'priority',
      label: 'Priority',
      render: (value: string) => (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPriorityColor(value)}`}>
          {value}
        </span>
      )
    },
    {
      key: 'status',
      label: 'Status',
      render: (value: string) => (
        <div className="flex items-center space-x-2">
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(value)}`}>
            {value}
          </span>
          {getStatusIcon(value)}
        </div>
      )
    },
    {
      key: 'assignedAt',
      label: 'Assigned',
      render: (value: string) => (
        <span className="text-sm text-gray-500">
          {value ? new Date(value).toLocaleDateString() : 'N/A'}
        </span>
      )
    },
    {
      key: 'lastContactedAt',
      label: 'Last Contact',
      render: (value: string) => (
        <span className="text-sm text-gray-500">
          {value ? new Date(value).toLocaleDateString() : 'Never'}
        </span>
      )
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (_: any, row: Inquiry) => (
        <div className="flex space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleViewDetails(row)}
          >
            View
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleUpdateStatus(row)}
          >
            Update
          </Button>
        </div>
      )
    }
  ];

  if (user?.role !== 'Employee') {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900">Access Denied</h2>
          <p className="text-gray-600">You don't have permission to access this page.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Employee Dashboard</h1>
          <p className="text-gray-600">Manage your assigned leads and track performance</p>
        </div>
        
        {/* Logout Button */}
        <button
          onClick={handleLogout}
          className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg hover:from-red-600 hover:to-red-700 transition-all duration-200 transform hover:scale-105 shadow-lg"
        >
          <ArrowRightOnRectangleIcon className="h-5 w-5" />
          <span className="text-sm font-medium">Logout</span>
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-6 gap-6">
        <Card>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{stats.totalAssigned}</div>
            <div className="text-sm text-gray-500">Total Assigned</div>
          </div>
        </Card>

        <Card>
          <div className="text-center">
            <div className="text-2xl font-bold text-yellow-600">{stats.contacted}</div>
            <div className="text-sm text-gray-500">Contacted</div>
          </div>
        </Card>

        <Card>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">{stats.interested}</div>
            <div className="text-sm text-gray-500">Interested</div>
          </div>
        </Card>

        <Card>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-700">{stats.converted}</div>
            <div className="text-sm text-gray-500">Converted</div>
          </div>
        </Card>

        <Card>
          <div className="text-center">
            <div className="text-2xl font-bold text-red-600">{stats.lost}</div>
            <div className="text-sm text-gray-500">Lost</div>
          </div>
        </Card>

        <Card>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">{stats.conversionRate.toFixed(1)}%</div>
            <div className="text-sm text-gray-500">Conversion Rate</div>
          </div>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <div className="flex flex-wrap gap-4 items-center">
          <span className="text-sm font-medium text-gray-700">Filters:</span>
          
          <select
            value={filters.status}
            onChange={(e) => setFilters({ ...filters, status: e.target.value, page: 1 })}
            className="rounded-md border-gray-300 text-sm"
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
            onChange={(e) => setFilters({ ...filters, priority: e.target.value, page: 1 })}
            className="rounded-md border-gray-300 text-sm"
          >
            <option value="">All Priorities</option>
            <option value="Urgent">Urgent</option>
            <option value="High">High</option>
            <option value="Medium">Medium</option>
            <option value="Low">Low</option>
          </select>
        </div>
      </Card>

      {/* Leads Table */}
      <Card>
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">My Assigned Leads</h3>
        </div>
        <DataTable
          data={myLeads}
          columns={columns}
          loading={loading}
          emptyMessage="No leads assigned to you yet"
        />
      </Card>

      {/* Modals */}
      {showDetailsModal && selectedLead && (
        <LeadDetailsModal
          lead={selectedLead}
          isOpen={showDetailsModal}
          onClose={() => {
            setShowDetailsModal(false);
            setSelectedLead(null);
          }}
        />
      )}

      {showUpdateModal && selectedLead && (
        <UpdateLeadModal
          lead={selectedLead}
          isOpen={showUpdateModal}
          onClose={() => {
            setShowUpdateModal(false);
            setSelectedLead(null);
          }}
          onSuccess={() => {
            setShowUpdateModal(false);
            setSelectedLead(null);
            fetchMyLeads();
          }}
        />
      )}
    </div>
  );
}

// Lead Details Modal
function LeadDetailsModal({ lead, isOpen, onClose }: {
  lead: Inquiry;
  isOpen: boolean;
  onClose: () => void;
}) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Lead Details - ${lead.customerName}`} size="lg">
      <div className="space-y-6">
        {/* Customer Information */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Customer Name</label>
            <p className="mt-1 text-sm text-gray-900">{lead.customerName}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Email</label>
            <p className="mt-1 text-sm text-gray-900">{lead.email}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Phone</label>
            <p className="mt-1 text-sm text-gray-900">{lead.phone}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Course Interest</label>
            <p className="mt-1 text-sm text-gray-900">{lead.courseInterest || 'General Inquiry'}</p>
          </div>
        </div>

        {/* Lead Information */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Priority</label>
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPriorityColor(lead.priority)}`}>
              {lead.priority}
            </span>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Current Status</label>
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(lead.status)}`}>
              {lead.status}
            </span>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Source</label>
            <p className="mt-1 text-sm text-gray-900">{lead.source}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Assigned Date</label>
            <p className="mt-1 text-sm text-gray-900">
              {lead.assignedAt ? new Date(lead.assignedAt).toLocaleDateString() : 'N/A'}
            </p>
          </div>
        </div>

        {/* Message */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Customer Message</label>
          <p className="mt-1 text-sm text-gray-900 bg-gray-50 p-3 rounded-lg">{lead.message}</p>
        </div>

        {/* Communications History */}
        {lead.communications && lead.communications.length > 0 && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">Communication History</label>
            <div className="space-y-3">
              {lead.communications.map((comm, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-3">
                  <div className="flex justify-between items-start mb-2">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      {comm.type}
                    </span>
                    <span className="text-sm text-gray-500">
                      {new Date(comm.communicatedAt).toLocaleString()}
                    </span>
                  </div>
                  <p className="text-sm text-gray-900 mb-1">{comm.details}</p>
                  <p className="text-sm text-gray-600">Outcome: {comm.outcome}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Notes */}
        {lead.notes && lead.notes.length > 0 && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">Notes</label>
            <div className="space-y-2">
              {lead.notes.map((note, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-3">
                  <div className="flex justify-between items-start mb-1">
                    <span className="text-sm font-medium text-gray-900">{note.addedBy.name}</span>
                    <span className="text-sm text-gray-500">
                      {new Date(note.addedAt).toLocaleString()}
                    </span>
                  </div>
                  <p className="text-sm text-gray-900">{note.note}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
}

// Update Lead Modal
function UpdateLeadModal({ lead, isOpen, onClose, onSuccess }: {
  lead: Inquiry;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [status, setStatus] = useState(lead.status);
  const [notes, setNotes] = useState('');
  const [communicationType, setCommunicationType] = useState('Call');
  const [communicationDetails, setCommunicationDetails] = useState('');
  const [communicationOutcome, setCommunicationOutcome] = useState('');
  const [nextFollowUp, setNextFollowUp] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      
      // Update status
      await inquiryApi.updateInquiryStatus(lead._id, {
        status,
        notes: notes || undefined,
        nextFollowUp: nextFollowUp || undefined
      });

      // Add communication if provided
      if (communicationDetails && communicationOutcome) {
        await inquiryApi.addCommunication(lead._id, {
          type: communicationType as any,
          details: communicationDetails,
          outcome: communicationOutcome
        });
      }

      onSuccess();
    } catch (err) {
      console.error('Failed to update lead:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Update Lead - ${lead.customerName}`} size="lg">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Status Update */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Update Status</label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value as any)}
            className="w-full rounded-md border-gray-300"
            required
          >
            <option value="New">New</option>
            <option value="Contacted">Contacted</option>
            <option value="Interested">Interested</option>
            <option value="Follow Up">Follow Up</option>
            <option value="Converted">Converted (Admitted)</option>
            <option value="Lost">Lost</option>
          </select>
        </div>

        {/* Notes */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Add Notes</label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
            className="w-full rounded-md border-gray-300"
            placeholder="Add any notes about this status update..."
          />
        </div>

        {/* Communication Log */}
        <div className="border-t pt-4">
          <h4 className="text-lg font-medium text-gray-900 mb-4">Log Communication (Optional)</h4>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Communication Type</label>
              <select
                value={communicationType}
                onChange={(e) => setCommunicationType(e.target.value)}
                className="w-full rounded-md border-gray-300"
              >
                <option value="Call">Phone Call</option>
                <option value="Email">Email</option>
                <option value="WhatsApp">WhatsApp</option>
                <option value="Meeting">Meeting</option>
                <option value="SMS">SMS</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Next Follow-up Date</label>
              <input
                type="date"
                value={nextFollowUp}
                onChange={(e) => setNextFollowUp(e.target.value)}
                className="w-full rounded-md border-gray-300"
              />
            </div>
          </div>

          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Communication Details</label>
            <textarea
              value={communicationDetails}
              onChange={(e) => setCommunicationDetails(e.target.value)}
              rows={3}
              className="w-full rounded-md border-gray-300"
              placeholder="What was discussed during the communication?"
            />
          </div>

          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Outcome</label>
            <textarea
              value={communicationOutcome}
              onChange={(e) => setCommunicationOutcome(e.target.value)}
              rows={2}
              className="w-full rounded-md border-gray-300"
              placeholder="What was the result or next steps?"
            />
          </div>
        </div>

        <div className="flex justify-end space-x-3 pt-4">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" isLoading={loading}>
            Update Lead
          </Button>
        </div>
      </form>
    </Modal>
  );
}

