'use client';

import { useState, useEffect } from 'react';
import { PlusIcon, FunnelIcon, UserIcon, PhoneIcon, EnvelopeIcon } from '@heroicons/react/24/outline';
import { inquiryApi, Inquiry } from '@/lib/inquiryApi';
import { employeeApi, Employee } from '@/lib/employeeApi';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import DataTable from '@/components/ui/DataTable';
import Modal from '@/components/ui/Modal';
import Input from '@/components/ui/Input';

export default function InquiriesPage() {
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedInquiry, setSelectedInquiry] = useState<Inquiry | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  
  const [filters, setFilters] = useState({
    status: '',
    type: '',
    priority: '',
    page: 1,
    limit: 10
  });

  const [stats, setStats] = useState({
    total: 0,
    new: 0,
    inProgress: 0,
    converted: 0
  });

  useEffect(() => {
    fetchInquiries();
    fetchEmployees();
  }, [filters]);

  const fetchInquiries = async () => {
    try {
      setLoading(true);
      const response = await inquiryApi.getAllInquiries(filters);
      setInquiries(response.data);
      
      // Calculate stats
      const total = response.data.length;
      const newCount = response.data.filter(inq => inq.status === 'New').length;
      const inProgress = response.data.filter(inq => ['Contacted', 'Interested', 'Follow Up'].includes(inq.status)).length;
      const converted = response.data.filter(inq => inq.status === 'Converted').length;
      
      setStats({ total, new: newCount, inProgress, converted });
    } catch (err) {
      console.error('Failed to fetch inquiries:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchEmployees = async () => {
    try {
      const response = await employeeApi.getAvailableEmployees();
      setEmployees(response.data);
    } catch (err) {
      console.error('Failed to fetch employees:', err);
    }
  };

  const handleAssignInquiry = (inquiry: Inquiry) => {
    setSelectedInquiry(inquiry);
    setShowAssignModal(true);
  };

  const handleViewDetails = (inquiry: Inquiry) => {
    setSelectedInquiry(inquiry);
    setShowDetailsModal(true);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'New': return 'bg-blue-100 text-blue-800';
      case 'Contacted': return 'bg-yellow-100 text-yellow-800';
      case 'Interested': return 'bg-green-100 text-green-800';
      case 'Follow Up': return 'bg-purple-100 text-purple-800';
      case 'Converted': return 'bg-green-100 text-green-800';
      case 'Closed': return 'bg-gray-100 text-gray-800';
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

  const columns = [
    {
      key: 'inquiryId',
      label: 'ID',
      render: (value: string) => (
        <span className="font-mono text-sm">{value}</span>
      )
    },
    {
      key: 'customerName',
      label: 'Customer',
      render: (value: string, row: Inquiry) => (
        <div>
          <div className="font-medium text-gray-900">{value}</div>
          <div className="text-sm text-gray-500">{row.email}</div>
        </div>
      )
    },
    {
      key: 'type',
      label: 'Type',
      render: (value: string) => (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
          {value}
        </span>
      )
    },
    {
      key: 'status',
      label: 'Status',
      render: (value: string) => (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(value)}`}>
          {value}
        </span>
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
      key: 'assignedTo',
      label: 'Assigned To',
      render: (value: any) => (
        value ? (
          <div className="flex items-center">
            <UserIcon className="h-4 w-4 text-gray-400 mr-1" />
            <span className="text-sm">{value.name}</span>
          </div>
        ) : (
          <span className="text-sm text-gray-400">Unassigned</span>
        )
      )
    },
    {
      key: 'createdAt',
      label: 'Created',
      render: (value: string) => (
        <span className="text-sm text-gray-500">
          {new Date(value).toLocaleDateString()}
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
          {!row.assignedTo && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleAssignInquiry(row)}
            >
              Assign
            </Button>
          )}
        </div>
      )
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Inquiry Management</h1>
          <p className="text-gray-600">Track and manage customer inquiries</p>
        </div>
        <Button onClick={() => setShowCreateModal(true)}>
          <PlusIcon className="h-5 w-5 mr-2" />
          New Inquiry
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center">
                <span className="text-blue-600 font-bold">{stats.total}</span>
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Total Inquiries</p>
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center">
                <span className="text-blue-600 font-bold">{stats.new}</span>
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">New</p>
              <p className="text-2xl font-bold text-gray-900">{stats.new}</p>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="h-8 w-8 bg-yellow-100 rounded-full flex items-center justify-center">
                <span className="text-yellow-600 font-bold">{stats.inProgress}</span>
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">In Progress</p>
              <p className="text-2xl font-bold text-gray-900">{stats.inProgress}</p>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="h-8 w-8 bg-green-100 rounded-full flex items-center justify-center">
                <span className="text-green-600 font-bold">{stats.converted}</span>
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Converted</p>
              <p className="text-2xl font-bold text-gray-900">{stats.converted}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <div className="flex flex-wrap gap-4 items-center">
          <div className="flex items-center space-x-2">
            <FunnelIcon className="h-5 w-5 text-gray-400" />
            <span className="text-sm font-medium text-gray-700">Filters:</span>
          </div>
          
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
            <option value="Closed">Closed</option>
          </select>

          <select
            value={filters.type}
            onChange={(e) => setFilters({ ...filters, type: e.target.value, page: 1 })}
            className="rounded-md border-gray-300 text-sm"
          >
            <option value="">All Types</option>
            <option value="Course Inquiry">Course Inquiry</option>
            <option value="General Inquiry">General Inquiry</option>
            <option value="Technical Support">Technical Support</option>
            <option value="Admission Inquiry">Admission Inquiry</option>
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

      {/* Inquiries Table */}
      <Card>
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Inquiries</h3>
        </div>
        <DataTable
          data={inquiries}
          columns={columns}
          loading={loading}
          emptyMessage="No inquiries found"
        />
      </Card>

      {/* Modals */}
      {showCreateModal && (
        <CreateInquiryModal
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          onSuccess={() => {
            setShowCreateModal(false);
            fetchInquiries();
          }}
        />
      )}

      {showAssignModal && selectedInquiry && (
        <AssignInquiryModal
          inquiry={selectedInquiry}
          employees={employees}
          isOpen={showAssignModal}
          onClose={() => {
            setShowAssignModal(false);
            setSelectedInquiry(null);
          }}
          onSuccess={() => {
            setShowAssignModal(false);
            setSelectedInquiry(null);
            fetchInquiries();
          }}
        />
      )}

      {showDetailsModal && selectedInquiry && (
        <InquiryDetailsModal
          inquiry={selectedInquiry}
          isOpen={showDetailsModal}
          onClose={() => {
            setShowDetailsModal(false);
            setSelectedInquiry(null);
          }}
          onUpdate={fetchInquiries}
        />
      )}
    </div>
  );
}

// Create Inquiry Modal
function CreateInquiryModal({ isOpen, onClose, onSuccess }: {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [formData, setFormData] = useState<{
    customerName: string;
    email: string;
    phone: string;
    type: 'Course Inquiry' | 'General Inquiry' | 'Technical Support' | 'Admission Inquiry';
    priority: 'Low' | 'Medium' | 'High' | 'Urgent';
    source: string;
    courseInterest: string;
    message: string;
  }>({
    customerName: '',
    email: '',
    phone: '',
    type: 'Course Inquiry',
    priority: 'Medium',
    source: 'Website',
    courseInterest: '',
    message: ''
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      // Ensure all required fields are provided with correct types
      const inquiryData = {
        ...formData,
        status: 'New' as const,
        notes: [],
        communications: []
      };
      
      await inquiryApi.createInquiry(inquiryData);
      onSuccess();
    } catch (err) {
      console.error('Failed to create inquiry:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Create New Inquiry">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Customer Name"
            value={formData.customerName}
            onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
            required
          />
          <Input
            label="Email"
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Phone"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            required
          />
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
            <select
              value={formData.type}
              onChange={(e) => {
                const type = e.target.value as 'Course Inquiry' | 'General Inquiry' | 'Technical Support' | 'Admission Inquiry';
                setFormData({ ...formData, type });
              }}
              className="w-full rounded-md border-gray-300"
            >
              <option value="Course Inquiry">Course Inquiry</option>
              <option value="General Inquiry">General Inquiry</option>
              <option value="Technical Support">Technical Support</option>
              <option value="Admission Inquiry">Admission Inquiry</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
            <select
              value={formData.priority}
              onChange={(e) => {
                const priority = e.target.value as 'Low' | 'Medium' | 'High' | 'Urgent';
                setFormData({ ...formData, priority });
              }}
              className="w-full rounded-md border-gray-300"
            >
              <option value="Low">Low</option>
              <option value="Medium">Medium</option>
              <option value="High">High</option>
              <option value="Urgent">Urgent</option>
            </select>
          </div>
          <Input
            label="Source"
            value={formData.source}
            onChange={(e) => setFormData({ ...formData, source: e.target.value })}
            required
          />
        </div>

        <Input
          label="Course Interest (Optional)"
          value={formData.courseInterest}
          onChange={(e) => setFormData({ ...formData, courseInterest: e.target.value })}
        />

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Message</label>
          <textarea
            value={formData.message}
            onChange={(e) => setFormData({ ...formData, message: e.target.value })}
            rows={4}
            className="w-full rounded-md border-gray-300"
            required
          />
        </div>

        <div className="flex justify-end space-x-3 pt-4">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" isLoading={loading}>
            Create Inquiry
          </Button>
        </div>
      </form>
    </Modal>
  );
}

// Assign Inquiry Modal
function AssignInquiryModal({ inquiry, employees, isOpen, onClose, onSuccess }: {
  inquiry: Inquiry;
  employees: Employee[];
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [selectedEmployee, setSelectedEmployee] = useState('');
  const [priority, setPriority] = useState(inquiry.priority);
  const [assignmentReason, setAssignmentReason] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      await inquiryApi.assignInquiry({
        inquiryId: inquiry._id,
        employeeId: selectedEmployee,
        priority,
        assignmentReason
      });
      onSuccess();
    } catch (err) {
      console.error('Failed to assign inquiry:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Assign Inquiry">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="bg-gray-50 p-4 rounded-lg">
          <h4 className="font-medium text-gray-900">{inquiry.customerName}</h4>
          <p className="text-sm text-gray-600">{inquiry.type} - {inquiry.message.substring(0, 100)}...</p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Assign To</label>
          <select
            value={selectedEmployee}
            onChange={(e) => setSelectedEmployee(e.target.value)}
            className="w-full rounded-md border-gray-300"
            required
          >
            <option value="">Select Employee</option>
            {employees.map((emp) => (
              <option key={emp._id} value={emp._id}>
                {emp.name} ({emp.department}) - {emp.performance?.totalLeads || 0} leads
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
          <select
            value={priority}
            onChange={(e) => setPriority(e.target.value as any)}
            className="w-full rounded-md border-gray-300"
          >
            <option value="Low">Low</option>
            <option value="Medium">Medium</option>
            <option value="High">High</option>
            <option value="Urgent">Urgent</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Assignment Reason (Optional)</label>
          <textarea
            value={assignmentReason}
            onChange={(e) => setAssignmentReason(e.target.value)}
            rows={3}
            className="w-full rounded-md border-gray-300"
            placeholder="Why is this employee the best fit for this inquiry?"
          />
        </div>

        <div className="flex justify-end space-x-3 pt-4">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" isLoading={loading}>
            Assign Inquiry
          </Button>
        </div>
      </form>
    </Modal>
  );
}

// Inquiry Details Modal
function InquiryDetailsModal({ inquiry, isOpen, onClose, onUpdate }: {
  inquiry: Inquiry;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: () => void;
}) {
  const [activeTab, setActiveTab] = useState('details');
  const [newStatus, setNewStatus] = useState(inquiry.status);
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);

  const handleStatusUpdate = async () => {
    try {
      setLoading(true);
      await inquiryApi.updateInquiryStatus(inquiry._id, {
        status: newStatus,
        notes: notes || undefined
      });
      onUpdate();
      onClose();
    } catch (err) {
      console.error('Failed to update status:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Inquiry Details - ${inquiry.customerName}`} size="lg">
      <div className="space-y-6">
        {/* Tabs */}
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            {['details', 'communications', 'notes'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`py-2 px-1 border-b-2 font-medium text-sm capitalize ${
                  activeTab === tab
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab}
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        {activeTab === 'details' && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Customer Name</label>
                <p className="mt-1 text-sm text-gray-900">{inquiry.customerName}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Email</label>
                <p className="mt-1 text-sm text-gray-900">{inquiry.email}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Phone</label>
                <p className="mt-1 text-sm text-gray-900">{inquiry.phone}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Type</label>
                <p className="mt-1 text-sm text-gray-900">{inquiry.type}</p>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Message</label>
              <p className="mt-1 text-sm text-gray-900 bg-gray-50 p-3 rounded-lg">{inquiry.message}</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Current Status</label>
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value as any)}
                  className="mt-1 w-full rounded-md border-gray-300 text-sm"
                >
                  <option value="New">New</option>
                  <option value="Contacted">Contacted</option>
                  <option value="Interested">Interested</option>
                  <option value="Follow Up">Follow Up</option>
                  <option value="Converted">Converted</option>
                  <option value="Closed">Closed</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Priority</label>
                <p className="mt-1 text-sm text-gray-900">{inquiry.priority}</p>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Status Update Notes</label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
                className="mt-1 w-full rounded-md border-gray-300"
                placeholder="Add notes about this status change..."
              />
            </div>

            <div className="flex justify-end">
              <Button onClick={handleStatusUpdate} isLoading={loading}>
                Update Status
              </Button>
            </div>
          </div>
        )}

        {activeTab === 'communications' && (
          <div className="space-y-4">
            {inquiry.communications && inquiry.communications.length > 0 ? (
              inquiry.communications.map((comm, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex items-center space-x-2">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {comm.type}
                      </span>
                      <span className="text-sm text-gray-500">
                        by {comm.communicatedBy.name}
                      </span>
                    </div>
                    <span className="text-sm text-gray-500">
                      {new Date(comm.communicatedAt).toLocaleString()}
                    </span>
                  </div>
                  <p className="text-sm text-gray-900 mb-2">{comm.details}</p>
                  <p className="text-sm text-gray-600">Outcome: {comm.outcome}</p>
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-center py-8">No communications logged yet</p>
            )}
          </div>
        )}

        {activeTab === 'notes' && (
          <div className="space-y-4">
            {inquiry.notes && inquiry.notes.length > 0 ? (
              inquiry.notes.map((note, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-sm font-medium text-gray-900">
                      {note.addedBy.name}
                    </span>
                    <span className="text-sm text-gray-500">
                      {new Date(note.addedAt).toLocaleString()}
                    </span>
                  </div>
                  <p className="text-sm text-gray-900">{note.note}</p>
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-center py-8">No notes added yet</p>
            )}
          </div>
        )}
      </div>
    </Modal>
  );
}
