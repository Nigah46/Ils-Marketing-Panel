// Notification API integration
export interface Notification {
  _id: string;
  type: 'status_update' | 'lead_assignment' | 'general' | 'system';
  from: {
    _id: string;
    name: string;
    employeeId: string;
    department: string;
  };
  to: {
    _id: string;
    name: string;
    employeeId: string;
  };
  inquiry?: {
    _id: string;
    inquiryId: string;
    customerName: string;
    status: string;
  };
  title: string;
  message: string;
  data: {
    previousStatus?: string;
    newStatus?: string;
    employeeName?: string;
    customerName?: string;
    remarks?: string;
  };
  isRead: boolean;
  readAt?: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  createdAt: string;
  updatedAt: string;
}

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

export const notificationApi = {
  // Get notifications for current manager
  getMyNotifications: async (params?: {
    page?: number;
    limit?: number;
    isRead?: boolean;
    type?: string;
  }): Promise<{
    success: boolean;
    data: Notification[];
    pagination: {
      current: number;
      pages: number;
      total: number;
    };
    unreadCount: number;
  }> => {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.isRead !== undefined) queryParams.append('isRead', params.isRead.toString());
    if (params?.type) queryParams.append('type', params.type);

    const token = localStorage.getItem('token');
    const response = await fetch(`${API_BASE}/api/notifications?${queryParams}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch notifications');
    }
    
    return response.json();
  },

  // Mark notification as read
  markAsRead: async (id: string): Promise<{
    success: boolean;
    message: string;
    data: Notification;
  }> => {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_BASE}/api/notifications/${id}/read`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    
    if (!response.ok) {
      throw new Error('Failed to mark notification as read');
    }
    
    return response.json();
  },

  // Mark all notifications as read
  markAllAsRead: async (): Promise<{
    success: boolean;
    message: string;
  }> => {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_BASE}/api/notifications/read-all`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    
    if (!response.ok) {
      throw new Error('Failed to mark all notifications as read');
    }
    
    return response.json();
  },
};
