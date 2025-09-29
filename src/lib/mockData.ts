// Mock data for the marketing portal

export interface Lead {
  id: string
  name: string
  email: string
  phone: string
  courseInterest: string
  status: 'New' | 'Contacted' | 'Nurturing' | 'Qualified' | 'Lost'
  source: string
  createdAt: string
  lastContact?: string
  assignedCounsellor?: string
  counsellorId?: string
}

export interface Sale {
  id: string
  leadId: string
  studentName: string
  course: string
  amount: number
  status: 'Qualified Lead' | 'Contacted' | 'Proposal Sent' | 'Follow-up' | 'Closed-Won' | 'Closed-Lost'
  createdAt: string
  closedAt?: string
  assignedCounsellor?: string
  counsellorId?: string
}

export interface Student {
  id: string
  studentId: string
  name: string
  email: string
  phone: string
  enrolledCourse: string
  enrollmentDate: string
  paymentStatus: 'Paid' | 'Pending' | 'Overdue'
  progress: number
  documents: string[]
  assignedCounsellor?: string
  counsellorId?: string
}

export interface MetricData {
  label: string
  value: number
  change: number
  period: string
}

// Mock leads data
export const mockLeads: Lead[] = [
  {
    id: '1',
    name: 'Rahul Sharma',
    email: 'rahul.sharma@email.com',
    phone: '+91 9876543210',
    courseInterest: 'Full Stack Development',
    status: 'New',
    source: 'Website',
    createdAt: '2024-01-15T10:30:00Z',
    assignedCounsellor: 'Rahul Sharma',
    counsellorId: 'CNS001'
  },
  {
    id: '2',
    name: 'Priya Patel',
    email: 'priya.patel@email.com',
    phone: '+91 9876543211',
    courseInterest: 'Data Science',
    status: 'Contacted',
    source: 'Social Media',
    createdAt: '2024-01-14T14:20:00Z',
    lastContact: '2024-01-15T09:00:00Z',
    assignedCounsellor: 'Rahul Sharma',
    counsellorId: 'CNS001'
  },
  {
    id: '3',
    name: 'Amit Kumar',
    email: 'amit.kumar@email.com',
    phone: '+91 9876543212',
    courseInterest: 'UI/UX Design',
    status: 'Nurturing',
    source: 'Referral',
    createdAt: '2024-01-13T16:45:00Z',
    lastContact: '2024-01-14T11:30:00Z',
    assignedCounsellor: 'Priya Patel',
    counsellorId: 'CNS002'
  },
  {
    id: '4',
    name: 'Sneha Gupta',
    email: 'sneha.gupta@email.com',
    phone: '+91 9876543213',
    courseInterest: 'Digital Marketing',
    status: 'Qualified',
    source: 'Google Ads',
    createdAt: '2024-01-12T12:15:00Z',
    lastContact: '2024-01-15T15:45:00Z',
    assignedCounsellor: 'Priya Patel',
    counsellorId: 'CNS002'
  },
  {
    id: '5',
    name: 'Vikram Singh',
    email: 'vikram.singh@email.com',
    phone: '+91 9876543214',
    courseInterest: 'Mobile App Development',
    status: 'New',
    source: 'Website',
    createdAt: '2024-01-15T08:00:00Z',
    assignedCounsellor: 'Amit Kumar',
    counsellorId: 'MGR001'
  },
  {
    id: '6',
    name: 'Anita Joshi',
    email: 'anita.joshi@email.com',
    phone: '+91 9876543215',
    courseInterest: 'Full Stack Development',
    status: 'Contacted',
    source: 'Website',
    createdAt: '2024-01-16T09:15:00Z',
    assignedCounsellor: 'Rahul Sharma',
    counsellorId: 'CNS001'
  },
  {
    id: '7',
    name: 'Kiran Reddy',
    email: 'kiran.reddy@email.com',
    phone: '+91 9876543216',
    courseInterest: 'UI/UX Design',
    status: 'New',
    source: 'Social Media',
    createdAt: '2024-01-16T11:30:00Z',
    assignedCounsellor: 'Priya Patel',
    counsellorId: 'CNS002'
  }
]

// Mock sales data
export const mockSales: Sale[] = [
  {
    id: '1',
    leadId: '4',
    studentName: 'Sneha Gupta',
    course: 'Digital Marketing',
    amount: 45000,
    status: 'Proposal Sent',
    createdAt: '2024-01-12T12:15:00Z',
    assignedCounsellor: 'Priya Patel',
    counsellorId: 'CNS002'
  },
  {
    id: '2',
    leadId: '2',
    studentName: 'Priya Patel',
    course: 'Data Science',
    amount: 65000,
    status: 'Follow-up',
    createdAt: '2024-01-14T14:20:00Z',
    assignedCounsellor: 'Rahul Sharma',
    counsellorId: 'CNS001'
  },
  {
    id: '3',
    leadId: '3',
    studentName: 'Amit Kumar',
    course: 'UI/UX Design',
    amount: 35000,
    status: 'Contacted',
    createdAt: '2024-01-13T16:45:00Z',
    assignedCounsellor: 'Priya Patel',
    counsellorId: 'CNS002'
  },
  {
    id: '4',
    leadId: '6',
    studentName: 'Anita Joshi',
    course: 'Full Stack Development',
    amount: 55000,
    status: 'Qualified Lead',
    createdAt: '2024-01-16T09:15:00Z',
    assignedCounsellor: 'Rahul Sharma',
    counsellorId: 'CNS001'
  }
]

// Mock students data
export const mockStudents: Student[] = [
  {
    id: '1',
    studentId: 'ILS001',
    name: 'Arjun Reddy',
    email: 'arjun.reddy@email.com',
    phone: '+91 9876543220',
    enrolledCourse: 'Full Stack Development',
    enrollmentDate: '2024-01-01T00:00:00Z',
    paymentStatus: 'Paid',
    progress: 75,
    documents: ['ID Proof', 'Educational Certificate', 'Payment Receipt'],
    assignedCounsellor: 'Rahul Sharma',
    counsellorId: 'CNS001'
  },
  {
    id: '2',
    studentId: 'ILS002',
    name: 'Kavya Nair',
    email: 'kavya.nair@email.com',
    phone: '+91 9876543221',
    enrolledCourse: 'Data Science',
    enrollmentDate: '2024-01-05T00:00:00Z',
    paymentStatus: 'Pending',
    progress: 45,
    documents: ['ID Proof', 'Educational Certificate'],
    assignedCounsellor: 'Rahul Sharma',
    counsellorId: 'CNS001'
  },
  {
    id: '3',
    studentId: 'ILS003',
    name: 'Rohit Mehta',
    email: 'rohit.mehta@email.com',
    phone: '+91 9876543222',
    enrolledCourse: 'UI/UX Design',
    enrollmentDate: '2024-01-08T00:00:00Z',
    paymentStatus: 'Paid',
    progress: 60,
    documents: ['ID Proof', 'Educational Certificate', 'Payment Receipt', 'Portfolio'],
    assignedCounsellor: 'Priya Patel',
    counsellorId: 'CNS002'
  },
  {
    id: '4',
    studentId: 'ILS004',
    name: 'Anita Joshi',
    email: 'anita.joshi@email.com',
    phone: '+91 9876543223',
    enrolledCourse: 'Digital Marketing',
    enrollmentDate: '2024-01-10T00:00:00Z',
    paymentStatus: 'Overdue',
    progress: 30,
    documents: ['ID Proof'],
    assignedCounsellor: 'Priya Patel',
    counsellorId: 'CNS002'
  },
  {
    id: '5',
    studentId: 'ILS005',
    name: 'Deepak Verma',
    email: 'deepak.verma@email.com',
    phone: '+91 9876543224',
    enrolledCourse: 'Mobile App Development',
    enrollmentDate: '2024-01-12T00:00:00Z',
    paymentStatus: 'Paid',
    progress: 85,
    documents: ['ID Proof', 'Educational Certificate', 'Payment Receipt'],
    assignedCounsellor: 'Amit Kumar',
    counsellorId: 'MGR001'
  }
]

// Mock metrics data
export const mockMetrics: MetricData[] = [
  {
    label: 'New Leads Today',
    value: 12,
    change: 8.2,
    period: 'vs yesterday'
  },
  {
    label: 'Leads This Week',
    value: 87,
    change: 15.3,
    period: 'vs last week'
  },
  {
    label: 'Sales This Month',
    value: 23,
    change: -2.1,
    period: 'vs last month'
  },
  {
    label: 'Revenue This Month',
    value: 1250000,
    change: 12.5,
    period: 'vs last month'
  }
]

// Chart data for dashboard
export const chartData = [
  { name: 'Jan', leads: 65, conversions: 12 },
  { name: 'Feb', leads: 78, conversions: 15 },
  { name: 'Mar', leads: 82, conversions: 18 },
  { name: 'Apr', leads: 95, conversions: 22 },
  { name: 'May', leads: 103, conversions: 25 },
  { name: 'Jun', leads: 87, conversions: 19 },
]
