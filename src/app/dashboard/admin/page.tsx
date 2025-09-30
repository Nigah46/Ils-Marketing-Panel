'use client';

import { useState, useEffect } from 'react';
import { PlusIcon, UserPlusIcon, EyeIcon, CheckIcon } from '@heroicons/react/24/outline';
import { inquiryApi, Inquiry } from '@/lib/inquiryApi';
import { employeeApi, Employee } from '@/lib/employeeApi';
import { useAuth } from '@/contexts/AuthContext';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import DataTable from '@/components/ui/DataTable';
import Modal from '@/components/ui/Modal';
import Input from '@/components/ui/Input';

export default function AdminDashboard() {
  const { user } = useAuth();
  const [leads, setLeads] = useState<Inquiry[]>([]);
  const [counsellors, setCounsellors] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedLead, setSelectedLead] = useState<Inquiry | null>(null);
  
  const [filters, setFilters] = useState({
    status: '',
    priority: '',
    assignedTo: '',
    page: 1,
    limit: 20
  });

  const [stats, setStats] = useState({
    totalLeads: 0,
    unassigned: 0,
    inProgress: 0,
    converted: 0,
    conversionRate: 0
  });

  useEffect(() => {
    if (user?.role === 'admin') {
      fetchLeads();
      fetchCounsellors();
    }
  }, [user, filters]);

  const fetchLeads = async () => {
    try {
      setLoading(true);
      const response = await inquiryApi.getAllInquiries(filters);
      setLeads(response.data);
      
      // Calculate stats
      const totalLeads = response.data.length;
      const unassigned = response.data.filter(lead => !lead.assignedTo).length;
      const inProgress = response.data.filter(lead => 
        ['New', 'Contacted', 'Interested', 'Follow Up'].includes(lead.status)
      ).length;
      const converted = response.data.filter(lead => lead.status === 'Converted').length;
      const conversionRate = totalLeads > 0 ? (converted / totalLeads) * 100 : 0;
      
      setStats({ totalLeads, unassigned, inProgress, converted, conversionRate });
    } catch (err) {
      console.error('Failed to fetch leads:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchCounsellors = async () => {
    try {
      const response = await employeeApi.getEmployees({ role: 'Employee', isActive: true });
      setCounsellors(response.data);
    } catch (err) {
      console.error('Failed to fetch counsellors:', err);
    }
  };

  const handleAssignLead = (lead: Inquiry) => {
    setSelectedLead(lead);
    setShowAssignModal(true);
  };

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

  const columns = [
    {
      key: 'inquiryId',
      label: 'Lead ID',
      render: (value: string) => (
        <span className="font-mono text-sm font-medium">{value}</span>
      )
    },
    {
      key: 'customerName',
      label: 'Customer Details',
      render: (value: string, row: Inquiry) => (
        <div>
          <div className="font-medium text-gray-900">{value}</div>
          <div className="text-sm text-gray-500">{row.email}</div>
          <div className="text-sm text-gray-500">{row.phone}</div>
        </div>
      )
    },
    {
      key: 'courseInterest',
      label: 'Course Interest',
      render: (value: string) => (
        <span className="text-sm text-gray-700">{value || 'General Inquiry'}</span>
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
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(value)}`}>
          {value}
        </span>
      )
    },
    {
      key: 'assignedTo',
      label: 'Assigned Counsellor',
      render: (value: any) => (
        value ? (
          <div className="flex items-center">
            <div className="h-6 w-6 rounded-full bg-blue-100 flex items-center justify-center mr-2">
              <span className="text-xs font-medium text-blue-600">
                {value.name.charAt(0).toUpperCase()}
              </span>
            </div>
            <span className="text-sm font-medium">{value.name}</span>
          </div>
        ) : (
          <span className="text-sm text-red-600 font-medium">Unassigned</span>
        )
      )
    },
    {
      key: 'createdAt',
      label: 'Received',
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
            onClick={() => handleAssignLead(row)}
            disabled={!!row.assignedTo}
          >
            {row.assignedTo ? (
              <CheckIcon className="h-4 w-4 text-green-600" />
            ) : (
              <UserPlusIcon className="h-4 w-4" />
            )}
          </Button>
        </div>
      )
    }
  ];

  if (user?.role !== 'admin') {
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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-600">Manage leads and assign them to counsellors</p>
        </div>
        <Button onClick={() => setShowCreateModal(true)}>
          <PlusIcon className="h-5 w-5 mr-2" />
          Add New Lead
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
        <Card>
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center">
                <span className="text-blue-600 font-bold text-sm">{stats.totalLeads}</span>
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Total Leads</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalLeads}</p>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="h-8 w-8 bg-red-100 rounded-full flex items-center justify-center">
                <span className="text-red-600 font-bold text-sm">{stats.unassigned}</span>
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Unassigned</p>
              <p className="text-2xl font-bold text-gray-900">{stats.unassigned}</p>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="h-8 w-8 bg-yellow-100 rounded-full flex items-center justify-center">
                <span className="text-yellow-600 font-bold text-sm">{stats.inProgress}</span>
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
                <span className="text-green-600 font-bold text-sm">{stats.converted}</span>
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Converted</p>
              <p className="text-2xl font-bold text-gray-900">{stats.converted}</p>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="h-8 w-8 bg-purple-100 rounded-full flex items-center justify-center">
                <span className="text-purple-600 font-bold text-sm">{stats.conversionRate.toFixed(0)}%</span>
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Conversion Rate</p>
              <p className="text-2xl font-bold text-gray-900">{stats.conversionRate.toFixed(1)}%</p>
            </div>
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

          <select
            value={filters.assignedTo}
            onChange={(e) => setFilters({ ...filters, assignedTo: e.target.value, page: 1 })}
            className="rounded-md border-gray-300 text-sm"
          >
            <option value="">All Counsellors</option>
            <option value="unassigned">Unassigned</option>
            {counsellors.map((counsellor) => (
              <option key={counsellor._id} value={counsellor._id}>
                {counsellor.name}
              </option>
            ))}
          </select>
        </div>
      </Card>

      {/* Leads Table */}
      <Card>
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Lead Management</h3>
        </div>
        <DataTable
          data={leads}
          columns={columns}
          loading={loading}
          emptyMessage="No leads found"
        />
      </Card>

      {/* Modals */}
      {showCreateModal && (
        <CreateLeadModal
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          onSuccess={() => {
            setShowCreateModal(false);
            fetchLeads();
          }}
        />
      )}

      {showAssignModal && selectedLead && (
        <AssignLeadModal
          lead={selectedLead}
          counsellors={counsellors}
          isOpen={showAssignModal}
          onClose={() => {
            setShowAssignModal(false);
            setSelectedLead(null);
          }}
          onSuccess={() => {
            setShowAssignModal(false);
            setSelectedLead(null);
            fetchLeads();
          }}
        />
      )}
    </div>
  );
}

// Create Lead Modal
function CreateLeadModal({ isOpen, onClose, onSuccess }: {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [formData, setFormData] = useState<{
    customerName: string;
    email: string;
    phone: string;
    courseInterest: string;
    priority: 'Low' | 'Medium' | 'High' | 'Urgent';
    source: string;
    message: string;
  }>({
    customerName: '',
    email: '',
    phone: '',
    courseInterest: '',
    priority: 'Medium',
    source: 'Website',
    message: ''
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      // Ensure all required fields are provided with correct types
      const inquiryData: Omit<Inquiry, 'inquiryId' | 'createdAt' | '_id' | 'updatedAt'> = {
        ...formData,
        type: 'Course Inquiry',
        status: 'New',
        notes: [],
        communications: []
      };
      
      await inquiryApi.createInquiry(inquiryData);
      onSuccess();
    } catch (err) {
      console.error('Failed to create lead:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Add New Lead">
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
          <Input
            label="Course Interest"
            value={formData.courseInterest}
            onChange={(e) => setFormData({ ...formData, courseInterest: e.target.value })}
            placeholder="e.g., Web Development, Data Science"
          />
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
            placeholder="e.g., Website, Facebook, Referral"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Message/Requirements</label>
          <textarea
            value={formData.message}
            onChange={(e) => setFormData({ ...formData, message: e.target.value })}
            rows={4}
            className="w-full rounded-md border-gray-300"
            placeholder="Customer's specific requirements or message..."
            required
          />
        </div>

        <div className="flex justify-end space-x-3 pt-4">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" isLoading={loading}>
            Add Lead
          </Button>
        </div>
      </form>
    </Modal>
  );
}

// Assign Lead Modal
function AssignLeadModal({ lead, counsellors, isOpen, onClose, onSuccess }: {
  lead: Inquiry;
  counsellors: Employee[];
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [selectedCounsellor, setSelectedCounsellor] = useState('');
  const [priority, setPriority] = useState(lead.priority);
  const [assignmentNotes, setAssignmentNotes] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      await inquiryApi.assignInquiry({
        inquiryId: lead._id,
        employeeId: selectedCounsellor,
        priority,
        assignmentReason: assignmentNotes
      });
      onSuccess();
    } catch (err) {
      console.error('Failed to assign lead:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Assign Lead to Counsellor">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="bg-gray-50 p-4 rounded-lg">
          <h4 className="font-medium text-gray-900">{lead.customerName}</h4>
          <p className="text-sm text-gray-600">{lead.email} • {lead.phone}</p>
          <p className="text-sm text-gray-600">Interest: {lead.courseInterest || 'General Inquiry'}</p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Assign to Counsellor</label>
          <select
            value={selectedCounsellor}
            onChange={(e) => setSelectedCounsellor(e.target.value)}
            className="w-full rounded-md border-gray-300"
            required
          >
            <option value="">Select Counsellor</option>
            {counsellors.map((counsellor) => (
              <option key={counsellor._id} value={counsellor._id}>
                {counsellor.name} ({counsellor.department}) - {counsellor.performance?.totalLeads || 0} total leads
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Priority Level</label>
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
          <label className="block text-sm font-medium text-gray-700 mb-1">Assignment Notes</label>
          <textarea
            value={assignmentNotes}
            onChange={(e) => setAssignmentNotes(e.target.value)}
            rows={3}
            className="w-full rounded-md border-gray-300"
            placeholder="Any specific instructions or notes for the counsellor..."
          />
        </div>

        <div className="flex justify-end space-x-3 pt-4">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" isLoading={loading}>
            Assign Lead
          </Button>
        </div>
      </form>
    </Modal>
  );
}
