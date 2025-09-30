// Inquiry API integration
export interface Inquiry {
  _id: string;
  inquiryId: string;
  customerName: string;
  email: string;
  phone: string;
  type: 'Course Inquiry' | 'General Inquiry' | 'Technical Support' | 'Admission Inquiry';
  status: 'New' | 'Contacted' | 'Interested' | 'Follow Up' | 'Converted' | 'Closed' | 'Lost';
  priority: 'Low' | 'Medium' | 'High' | 'Urgent';
  source: string;
  courseInterest?: string;
  message: string;
  assignedTo?: {
    _id: string;
    name: string;
    employeeId: string;
    department: string;
  };
  assignedBy?: {
    _id: string;
    name: string;
    employeeId: string;
  };
  assignedAt?: string;
  lastContactedAt?: string;
  nextFollowUp?: string;
  responseTime?: number;
  notes: Array<{
    note: string;
    addedBy: {
      _id: string;
      name: string;
      employeeId: string;
    };
    addedAt: string;
  }>;
  communications: Array<{
    type: 'Call' | 'Email' | 'WhatsApp' | 'Meeting' | 'SMS';
    details: string;
    outcome: string;
    communicatedBy: {
      _id: string;
      name: string;
      employeeId: string;
    };
    communicatedAt: string;
  }>;
  createdAt: string;
  updatedAt: string;
}

export interface InquiryStats {
  overview: {
    total: number;
    new: number;
    contacted: number;
    interested: number;
    converted: number;
    closed: number;
  };
  byType: Array<{
    _id: string;
    count: number;
  }>;
}

export interface CreateInquiryData {
  customerName: string;
  email: string;
  phone: string;
  type: string;
  priority?: string;
  source: string;
  courseInterest?: string;
  message: string;
}

export interface AssignInquiryData {
  inquiryId: string;
  employeeId: string;
  priority?: string;
  deadline?: string;
  assignmentReason?: string;
}

export interface UpdateInquiryStatusData {
  status: string;
  notes?: string;
  nextFollowUp?: string;
  remarks?: string;
  notifyManager?: boolean;
}

export interface AddCommunicationData {
  type: 'Call' | 'Email' | 'WhatsApp' | 'Meeting' | 'SMS';
  details: string;
  outcome: string;
}

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

export const inquiryApi = {
  // Create new inquiry
  createInquiry: async (data: Omit<Inquiry, '_id' | 'inquiryId' | 'createdAt' | 'updatedAt'>): Promise<{
    success: boolean;
    message: string;
    data: Inquiry;
  }> => {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_BASE}/api/inquiry`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to create inquiry');
    }
    
    return response.json();
  },

  // Get all inquiries with filtering
  getAllInquiries: async (params?: {
    page?: number;
    limit?: number;
    status?: string;
    type?: string;
    assignedTo?: string;
    priority?: string;
    startDate?: string;
    endDate?: string;
  }): Promise<{
    success: boolean;
    data: Inquiry[];
    pagination: {
      current: number;
      pages: number;
      total: number;
    };
  }> => {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.status) queryParams.append('status', params.status);
    if (params?.type) queryParams.append('type', params.type);
    if (params?.assignedTo) queryParams.append('assignedTo', params.assignedTo);
    if (params?.priority) queryParams.append('priority', params.priority);
    if (params?.startDate) queryParams.append('startDate', params.startDate);
    if (params?.endDate) queryParams.append('endDate', params.endDate);

    const token = localStorage.getItem('token');
    const response = await fetch(`${API_BASE}/api/inquiry?${queryParams}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch inquiries');
    }
    
    return response.json();
  },

  // Get inquiries assigned to current user
  getMyInquiries: async (params?: {
    status?: string;
    priority?: string;
    page?: number;
    limit?: number;
  }): Promise<{
    success: boolean;
    data: Inquiry[];
    pagination: {
      current: number;
      pages: number;
      total: number;
    };
  }> => {
    const queryParams = new URLSearchParams();
    if (params?.status) queryParams.append('status', params.status);
    if (params?.priority) queryParams.append('priority', params.priority);
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());

    const token = localStorage.getItem('token');
    const response = await fetch(`${API_BASE}/api/inquiry/my?${queryParams}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch your inquiries');
    }
    
    return response.json();
  },

  // Get inquiry by ID
  getInquiryById: async (id: string): Promise<{
    success: boolean;
    data: Inquiry;
  }> => {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_BASE}/api/inquiry/${id}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch inquiry');
    }
    
    return response.json();
  },

  // Assign inquiry to employee
  assignInquiry: async (data: AssignInquiryData): Promise<{
    success: boolean;
    message: string;
    data: {
      inquiry: Inquiry;
      assignment: any;
    };
  }> => {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_BASE}/api/inquiry/${data.inquiryId}/assign`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to assign inquiry');
    }
    
    return response.json();
  },

  // Update inquiry status
  updateInquiryStatus: async (id: string, data: UpdateInquiryStatusData): Promise<{
    success: boolean;
    message: string;
    data: Inquiry;
  }> => {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_BASE}/api/inquiry/${id}/status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to update inquiry status');
    }
    
    return response.json();
  },

  // Add communication log
  addCommunication: async (id: string, data: AddCommunicationData): Promise<{
    success: boolean;
    message: string;
    data: Inquiry;
  }> => {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_BASE}/api/inquiry/${id}/communication`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to add communication');
    }
    
    return response.json();
  },

  // Get inquiry statistics
  getInquiryStats: async (params?: {
    employeeId?: string;
    startDate?: string;
    endDate?: string;
  }): Promise<{
    success: boolean;
    data: InquiryStats;
  }> => {
    const queryParams = new URLSearchParams();
    if (params?.employeeId) queryParams.append('employeeId', params.employeeId);
    if (params?.startDate) queryParams.append('startDate', params.startDate);
    if (params?.endDate) queryParams.append('endDate', params.endDate);

    const token = localStorage.getItem('token');
    const response = await fetch(`${API_BASE}/api/inquiry/stats?${queryParams}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch inquiry statistics');
    }
    
    return response.json();
  },
};
