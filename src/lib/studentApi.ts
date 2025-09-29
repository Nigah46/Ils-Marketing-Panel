// Student API integration
export interface Student {
  id: string;
  studentId: string;
  name: string;
  email: string;
  phone: string;
  enrolledCourse: string;
  enrollmentDate: string;
  paymentStatus: 'Paid' | 'Pending' | 'Overdue';
  progress: number;
  documents: string[];
  assignedCounsellor?: string;
  counsellorId?: string;
}

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

export const studentApi = {
  // Get all students (Manager scope)
  getAllStudents: async (params?: {
    page?: number;
    limit?: number;
    paymentStatus?: string;
    search?: string;
  }): Promise<{
    success: boolean;
    data: Student[];
    pagination?: { current: number; pages: number; total: number };
  }> => {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', String(params.page));
    if (params?.limit) queryParams.append('limit', String(params.limit));
    if (params?.paymentStatus) queryParams.append('paymentStatus', params.paymentStatus);
    if (params?.search) queryParams.append('search', params.search);

    const token = localStorage.getItem('token');
    const res = await fetch(`${API_BASE}/api/students?${queryParams}`, {
      headers: { 'Authorization': `Bearer ${token}` },
    });
    if (!res.ok) {
      throw new Error('Failed to fetch students');
    }
    return res.json();
  },

  // Get my students (Employee scope)
  getMyStudents: async (params?: {
    page?: number;
    limit?: number;
    paymentStatus?: string;
    search?: string;
  }): Promise<{
    success: boolean;
    data: Student[];
    pagination?: { current: number; pages: number; total: number };
  }> => {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', String(params.page));
    if (params?.limit) queryParams.append('limit', String(params.limit));
    if (params?.paymentStatus) queryParams.append('paymentStatus', params.paymentStatus);
    if (params?.search) queryParams.append('search', params.search);

    const token = localStorage.getItem('token');
    const res = await fetch(`${API_BASE}/api/students/my?${queryParams}`, {
      headers: { 'Authorization': `Bearer ${token}` },
    });
    if (!res.ok) {
      throw new Error('Failed to fetch your students');
    }
    return res.json();
  },

  // Update a student's payment status
  updatePaymentStatus: async (
    id: string,
    paymentStatus: Student['paymentStatus']
  ): Promise<{
    success: boolean;
    message: string;
    data: Student;
  }> => {
    const token = localStorage.getItem('token');
    const res = await fetch(`${API_BASE}/api/students/${id}/payment-status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ paymentStatus }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || 'Failed to update payment status');
    }
    return res.json();
  },
};
