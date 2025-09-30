// Employee API integration
export interface Employee {
  _id: string;
  employeeId: string;
  name: string;
  email: string;
  phone: string;
  role: 'Admin' | 'Manager' | 'Employee';
  department: string;
  isActive: boolean;
  joiningDate: string;
  password?: string;
  reportingManager?: {
    _id: string;
    name: string;
    employeeId: string;
  };
  teamMembers?: Employee[];
  lastLogin?: string;
  performance?: {
    totalLeads: number;
    convertedLeads: number;
    conversionRate: number;
    avgResponseTime: number;
  };
  updatedAt: string;
}

export interface EmployeePerformance {
  employee: Employee;
  performance: {
    totalAssigned: number;
    converted: number;
    inProgress: number;
    closed: number;
    conversionRate: string;
    avgResponseTime?: number;
  };
  inquiryBreakdown: Array<{
    _id: string;
    count: number;
    converted: number;
  }>;
  recentAssignments: any[];
}

export interface CreateEmployeeData {
  employeeId?: string;
  name: string;
  email: string;
  phone: string;
  department: string;
  role?: string;
  specialization?: string[];
  address?: {
    street?: string;
    city?: string;
    state?: string;
    pincode?: string;
    country?: string;
  };
  workingHours?: {
    start: string;
    end: string;
  };
  password: string;
  reportingManager?: string;
}

export interface CreateInquiryData {
  inquiryId?: string;
  type: string;
  customerName: string;
  email: string;
  phone: string;
  alternatePhone?: string;
  address?: {
    street?: string;
    city?: string;
    state?: string;
    pincode?: string;
    country?: string;
  };
  subject: string;
  message: string;
  courseInterested?: string;
  preferredBatch?: string;
  budget?: number;
  status?: string;
  priority?: string;
  source?: string;
  assignedTo?: string;
  nextFollowUp?: string;
}

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

export const employeeApi = {
  // Get all employees with filtering
  getEmployees: async (params?: {
    department?: string;
    role?: string;
    isActive?: boolean;
    page?: number;
    limit?: number;
  }): Promise<{
    success: boolean;
    data: Employee[];
    pagination: {
      current: number;
      pages: number;
      total: number;
    };
  }> => {
    const queryParams = new URLSearchParams();
    if (params?.department) queryParams.append('department', params.department);
    if (params?.role) queryParams.append('role', params.role);
    if (params?.isActive !== undefined) queryParams.append('isActive', params.isActive.toString());
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());

    const token = localStorage.getItem('token');
    const response = await fetch(`${API_BASE}/api/employee?${queryParams}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch employees');
    }
    
    return response.json();
  },

  // Get employee by ID
  getEmployeeById: async (id: string): Promise<{
    success: boolean;
    data: Employee;
  }> => {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_BASE}/api/employee/${id}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch employee');
    }
    
    return response.json();
  },

  // Create new employee
  createEmployee: async (data: CreateEmployeeData): Promise<{
    success: boolean;
    message: string;
    data: Employee;
  }> => {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_BASE}/api/employee/add`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to create employee');
    }
    
    return response.json();
  },

  // Update employee
  updateEmployee: async (id: string, data: Partial<Employee>): Promise<{
    success: boolean;
    message: string;
    data: Employee;
  }> => {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_BASE}/api/employee/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to update employee');
    }
    
    return response.json();
  },

  // Get employee performance
  getEmployeePerformance: async (id: string, params?: {
    startDate?: string;
    endDate?: string;
  }): Promise<{
    success: boolean;
    data: EmployeePerformance;
  }> => {
    const queryParams = new URLSearchParams();
    if (params?.startDate) queryParams.append('startDate', params.startDate);
    if (params?.endDate) queryParams.append('endDate', params.endDate);

    const token = localStorage.getItem('token');
    const response = await fetch(`${API_BASE}/api/employee/${id}/performance?${queryParams}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch employee performance');
    }
    
    return response.json();
  },

  // Get team performance (for managers)
  getTeamPerformance: async (params?: {
    startDate?: string;
    endDate?: string;
  }): Promise<{
    success: boolean;
    data: {
      manager: {
        name: string;
        employeeId: string;
        department: string;
      };
      teamSize: number;
      teamTotals: {
        totalAssigned: number;
        totalConverted: number;
        totalInProgress: number;
        conversionRate: string;
      };
      teamMembers: Array<{
        employee: Employee;
        performance: {
          totalAssigned: number;
          converted: number;
          inProgress: number;
          conversionRate: string;
        };
      }>;
    };
  }> => {
    const queryParams = new URLSearchParams();
    if (params?.startDate) queryParams.append('startDate', params.startDate);
    if (params?.endDate) queryParams.append('endDate', params.endDate);

    const token = localStorage.getItem('token');
    const response = await fetch(`${API_BASE}/api/employee/team/performance?${queryParams}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch team performance');
    }
    
    return response.json();
  },

  // Get available employees for assignment
  getAvailableEmployees: async (params?: {
    department?: string;
    specialization?: string;
  }): Promise<{
    success: boolean;
    data: Employee[];
  }> => {
    const queryParams = new URLSearchParams();
    if (params?.department) queryParams.append('department', params.department);
    if (params?.specialization) queryParams.append('specialization', params.specialization);

    const token = localStorage.getItem('token');
    const response = await fetch(`${API_BASE}/api/employee/available?${queryParams}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch available employees');
    }
    
    return response.json();
  },

  // Update employee availability
  updateAvailability: async (employeeId: string, isAvailable: boolean): Promise<{
    success: boolean;
    message: string;
    data: Employee;
  }> => {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_BASE}/api/employee/${employeeId}/availability`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ isAvailable }),
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to update availability');
    }
    
    return response.json();
  },

  // Create new inquiry
  createInquiry: async (data: CreateInquiryData): Promise<{
    success: boolean;
    message: string;
    data: any;
  }> => {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_BASE}/api/inquiry/add`, {
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
};
