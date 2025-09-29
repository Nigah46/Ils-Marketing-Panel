'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import Header from '@/components/layout/Header'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import { Table, TableHeader, TableBody, TableRow, TableCell } from '@/components/ui/Table'
import Modal from '@/components/ui/Modal'
import { studentApi, type Student } from '@/lib/studentApi'
import { useAuth } from '@/contexts/AuthContext'
import { 
  MagnifyingGlassIcon, 
  FunnelIcon,
  EyeIcon,
  DocumentTextIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  ClockIcon
} from '@heroicons/react/24/outline'

export default function AdmissionsPage() {
  const { user } = useAuth()
  const [students, setStudents] = useState<Student[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Debounce ref for search
  const searchDebounceRef = useRef<number | null>(null)

  // Fetch students, memoized to satisfy exhaustive-deps
  const fetchStudents = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const res = user?.role === 'Manager'
        ? await studentApi.getAllStudents({ limit: 1000 })
        : await studentApi.getMyStudents({ limit: 1000 })
      setStudents(res.data)
      setFilteredStudents(res.data)
    } catch (e: any) {
      // eslint-disable-next-line no-console
      console.error('Failed to fetch students:', e)
      setError(e?.message || 'Failed to fetch students')
    } finally {
      setLoading(false)
    }
  }, [user?.role])

  useEffect(() => {
    if (user) {
      fetchStudents()
    }
    return () => {
      if (searchDebounceRef.current) {
        clearTimeout(searchDebounceRef.current)
        searchDebounceRef.current = null
      }
    }
  }, [user, fetchStudents])
  const [filteredStudents, setFilteredStudents] = useState<Student[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [paymentFilter, setPaymentFilter] = useState('All')
  const [showStudentDetailModal, setShowStudentDetailModal] = useState(false)
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null)

  const paymentStatusOptions = ['All', 'Paid', 'Pending', 'Overdue']

  // Filter students based on search and payment status (memoized)
  const handleFilter = useCallback(() => {
    let filtered = students

    if (searchTerm) {
      const q = searchTerm.toLowerCase()
      filtered = filtered.filter((student: Student) => 
        student.name.toLowerCase().includes(q) ||
        student.email.toLowerCase().includes(q) ||
        student.studentId.toLowerCase().includes(q) ||
        student.enrolledCourse.toLowerCase().includes(q)
      )
    }

    if (paymentFilter !== 'All') {
      filtered = filtered.filter((student: Student) => student.paymentStatus === paymentFilter)
    }

    setFilteredStudents(filtered)
  }, [students, searchTerm, paymentFilter])

  // Recompute filters when inputs change
  useEffect(() => {
    handleFilter()
  }, [handleFilter])

  // Handle search input change
  const handleSearchChange = (e: any) => {
    setSearchTerm(e.target.value)
    if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current)
    searchDebounceRef.current = window.setTimeout(() => {
      handleFilter()
    }, 300)
  }

  // Handle payment filter change
  const handlePaymentFilterChange = (e: any) => {
    setPaymentFilter(e.target.value)
  }

  // Handle student detail view
  const handleViewStudent = (student: Student) => {
    setSelectedStudent(student)
    setShowStudentDetailModal(true)
  }

  // Handle payment status update
  const handlePaymentStatusUpdate = (studentId: string, newStatus: Student['paymentStatus']) => {
    // Optimistic update
    const prev = students
    const updated = students.map((s: Student) => s.id === studentId ? { ...s, paymentStatus: newStatus } : s)
    setStudents(updated)
    setFilteredStudents(updated)
    if (selectedStudent && selectedStudent.id === studentId) {
      setSelectedStudent({ ...selectedStudent, paymentStatus: newStatus })
    }
    studentApi.updatePaymentStatus(studentId, newStatus)
      .then(() => {
        // Success, optionally refetch to ensure consistency
        // fetchStudents()
      })
      .catch(err => {
        // eslint-disable-next-line no-console
        console.error('Failed to update payment status:', err)
        // Revert on failure
        setStudents(prev)
        setFilteredStudents(prev)
        if (selectedStudent && selectedStudent.id === studentId) {
          setSelectedStudent({ ...selectedStudent, paymentStatus: prev.find((s: Student) => s.id === studentId)?.paymentStatus || selectedStudent.paymentStatus })
        }
      })
  }

  const getPaymentStatusBadge = (status: string) => {
    switch (status) {
      case 'Paid': 
        return {
          color: 'bg-green-100 text-green-800',
          icon: CheckCircleIcon
        }
      case 'Pending': 
        return {
          color: 'bg-yellow-100 text-yellow-800',
          icon: ClockIcon
        }
      case 'Overdue': 
        return {
          color: 'bg-red-100 text-red-800',
          icon: ExclamationTriangleIcon
        }
      default: 
        return {
          color: 'bg-gray-100 text-gray-800',
          icon: ClockIcon
        }
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const getProgressColor = (progress: number) => {
    if (progress >= 80) return 'bg-green-500'
    if (progress >= 60) return 'bg-blue-500'
    if (progress >= 40) return 'bg-yellow-500'
    return 'bg-red-500'
  }

  // Calculate summary metrics
  const totalStudents = students.length
  const paidStudents = students.filter((s: Student) => s.paymentStatus === 'Paid').length
  const pendingPayments = students.filter((s: Student) => s.paymentStatus === 'Pending').length
  const overduePayments = students.filter((s: Student) => s.paymentStatus === 'Overdue').length

  return (
    <div className="p-6">
      <Header 
        title={user?.role === 'Employee' ? 'My Students' : 'Admissions Portal'} 
        subtitle={user?.role === 'Employee' ? 'Manage your assigned students and track their progress' : 'Manage student admissions and track progress'}
      />
      
      <div className="mt-6 space-y-6">
        {loading && (
          <Card>
            <div className="p-6 text-secondary-600">Loading students...</div>
          </Card>
        )}
        {error && (
          <Card>
            <div className="p-6 text-red-600">{error}</div>
          </Card>
        )}
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-blue-600 font-semibold text-sm">{totalStudents}</span>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-secondary-600">Total Students</p>
                <p className="text-2xl font-semibold text-secondary-900">{totalStudents}</p>
              </div>
            </div>
          </Card>
          
          <Card>
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <CheckCircleIcon className="h-8 w-8 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-secondary-600">Payments Completed</p>
                <p className="text-2xl font-semibold text-secondary-900">{paidStudents}</p>
              </div>
            </div>
          </Card>
          
          <Card>
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <ClockIcon className="h-8 w-8 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-secondary-600">Pending Payments</p>
                <p className="text-2xl font-semibold text-secondary-900">{pendingPayments}</p>
              </div>
            </div>
          </Card>
          
          <Card>
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <ExclamationTriangleIcon className="h-8 w-8 text-red-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-secondary-600">Overdue Payments</p>
                <p className="text-2xl font-semibold text-secondary-900">{overduePayments}</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Students Table */}
        <Card>
          {/* Filters and Search */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6 pb-4 border-b border-secondary-200/60">
            <div className="flex flex-col sm:flex-row gap-4 flex-1">
              <div className="relative flex-1">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-secondary-400" />
                <Input
                  placeholder="Search students..."
                  value={searchTerm}
                  onChange={handleSearchChange}
                  className="pl-10"
                />
              </div>
              <div className="flex items-center gap-2">
                <FunnelIcon className="h-4 w-4 text-secondary-400" />
                <select
                  value={paymentFilter}
                  onChange={handlePaymentFilterChange}
                  className="border border-secondary-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  {paymentStatusOptions.map(status => (
                    <option key={status} value={status}>{status}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Students Table */}
          <Table>
            <TableHeader>
              <TableRow>
                <TableCell header>Student ID</TableCell>
                <TableCell header>Name</TableCell>
                <TableCell header>Email</TableCell>
                <TableCell header>Course</TableCell>
                <TableCell header>Enrollment Date</TableCell>
                <TableCell header>Payment Status</TableCell>
                {user?.role === 'admin' && <TableCell header>Assigned Counsellor</TableCell>}
                <TableCell header>Progress</TableCell>
                <TableCell header>Actions</TableCell>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredStudents.map((student) => {
                const statusBadge = getPaymentStatusBadge(student.paymentStatus)
                const StatusIcon = statusBadge.icon
                
                return (
                  <TableRow key={student.id}>
                    <TableCell className="font-medium">{student.studentId}</TableCell>
                    <TableCell>{student.name}</TableCell>
                    <TableCell>{student.email}</TableCell>
                    <TableCell>{student.enrolledCourse}</TableCell>
                    <TableCell>{formatDate(student.enrollmentDate)}</TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <span className={`inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full ${statusBadge.color}`}>
                          <StatusIcon className="h-3 w-3 mr-1" />
                          {student.paymentStatus}
                        </span>
                      </div>
                    </TableCell>
                    {user?.role === 'admin' && (
                      <TableCell>
                        <span className="text-sm text-secondary-600">{student.assignedCounsellor || 'Unassigned'}</span>
                      </TableCell>
                    )}
                    <TableCell>
                      <div className="flex items-center">
                        <div className="w-16 bg-secondary-200 rounded-full h-2 mr-2">
                          <div 
                            className={`h-2 rounded-full ${getProgressColor(student.progress)}`}
                            style={{ width: `${student.progress}%` }}
                          ></div>
                        </div>
                        <span className="text-sm text-secondary-600">{student.progress}%</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleViewStudent(student)}
                      >
                        <EyeIcon className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>

          {filteredStudents.length === 0 && (
            <div className="text-center py-10 bg-white/50 rounded-md border border-secondary-200/60">
              <p className="text-secondary-500">No students found matching your criteria.</p>
            </div>
          )}
        </Card>
      </div>

      {/* Student Detail Modal */}
      <Modal
        isOpen={showStudentDetailModal}
        onClose={() => setShowStudentDetailModal(false)}
        title="Student Details"
        size="xl"
      >
        {selectedStudent && (
          <div className="space-y-6">
            {/* Basic Information */}
            <div>
              <h4 className="text-lg font-semibold bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-700 mb-4">Basic Information</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-secondary-700">Student ID</label>
                  <p className="mt-1 text-sm text-secondary-900">{selectedStudent.studentId}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-secondary-700">Name</label>
                  <p className="mt-1 text-sm text-secondary-900">{selectedStudent.name}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-secondary-700">Email</label>
                  <p className="mt-1 text-sm text-secondary-900">{selectedStudent.email}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-secondary-700">Phone</label>
                  <p className="mt-1 text-sm text-secondary-900">{selectedStudent.phone}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-secondary-700">Enrolled Course</label>
                  <p className="mt-1 text-sm text-secondary-900">{selectedStudent.enrolledCourse}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-secondary-700">Enrollment Date</label>
                  <p className="mt-1 text-sm text-secondary-900">{formatDate(selectedStudent.enrollmentDate)}</p>
                </div>
              </div>
            </div>

            {/* Payment Information */}
            <div>
              <h4 className="text-lg font-semibold bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-700 mb-4">Payment Information</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-secondary-700 mb-2">Payment Status</label>
                  <select
                    value={selectedStudent.paymentStatus}
                    onChange={(e: any) => handlePaymentStatusUpdate(selectedStudent.id, e.target.value as Student['paymentStatus'])}
                    className="border border-secondary-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
                  >
                    {paymentStatusOptions.slice(1).map(status => (
                      <option key={status} value={status}>{status}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-secondary-700">Course Progress</label>
                  <div className="mt-2 flex items-center">
                    <div className="w-full bg-secondary-200 rounded-full h-3 mr-3">
                      <div 
                        className={`h-3 rounded-full ${getProgressColor(selectedStudent.progress)}`}
                        style={{ width: `${selectedStudent.progress}%` }}
                      ></div>
                    </div>
                    <span className="text-sm font-medium text-secondary-900">{selectedStudent.progress}%</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Documents */}
            <div>
              <h4 className="text-lg font-semibold bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-700 mb-4">Documents</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {selectedStudent.documents.map((document: string) => (
                  <div key={document} className="flex items-center p-3 bg-secondary-50 rounded-lg">
                    <DocumentTextIcon className="h-5 w-5 text-secondary-400 mr-3" />
                    <span className="text-sm text-secondary-900">{document}</span>
                    <CheckCircleIcon className="h-4 w-4 text-green-500 ml-auto" />
                  </div>
                ))}
              </div>
              {selectedStudent.documents.length === 0 && (
                <p className="text-sm text-secondary-500">No documents uploaded yet.</p>
              )}
            </div>

            {/* Payment History */}
            <div>
              <h4 className="text-lg font-semibold bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-700 mb-4">Payment History</h4>
              <div className="bg-secondary-50 rounded-lg p-4">
                <div className="space-y-3">
                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-green-400 rounded-full mt-2"></div>
                    <div>
                      <p className="text-sm text-secondary-900">Enrollment fee paid</p>
                      <p className="text-xs text-secondary-500">{formatDate(selectedStudent.enrollmentDate)}</p>
                    </div>
                  </div>
                  {selectedStudent.paymentStatus === 'Paid' && (
                    <div className="flex items-start space-x-3">
                      <div className="w-2 h-2 bg-blue-400 rounded-full mt-2"></div>
                      <div>
                        <p className="text-sm text-secondary-900">Full course fee paid</p>
                        <p className="text-xs text-secondary-500">Payment completed</p>
                      </div>
                    </div>
                  )}
                  {selectedStudent.paymentStatus === 'Pending' && (
                    <div className="flex items-start space-x-3">
                      <div className="w-2 h-2 bg-yellow-400 rounded-full mt-2"></div>
                      <div>
                        <p className="text-sm text-secondary-900">Remaining payment pending</p>
                        <p className="text-xs text-secondary-500">Due date approaching</p>
                      </div>
                    </div>
                  )}
                  {selectedStudent.paymentStatus === 'Overdue' && (
                    <div className="flex items-start space-x-3">
                      <div className="w-2 h-2 bg-red-400 rounded-full mt-2"></div>
                      <div>
                        <p className="text-sm text-secondary-900">Payment overdue</p>
                        <p className="text-xs text-secondary-500">Requires immediate attention</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}
