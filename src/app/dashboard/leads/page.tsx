'use client'

import { useAuth } from '@/contexts/AuthContext'
import MyLeads from '@/components/employee/MyLeads'
import LeadAssignment from '@/components/manager/LeadAssignment'
import Header from '@/components/layout/Header'

export default function LeadsPage() {
  const { user } = useAuth()

  if (!user) {
    return <div>Loading...</div>
  }

  return (
    <div className="space-y-6">
      <Header title="Lead Management" />
      
      {/* Role-based lead management */}
      {user.role === 'manager' || user.role === 'Manager' ? (
        <div>
          <h1 className="text-2xl font-bold text-gray-900 mb-6">Team Lead Management</h1>
          <LeadAssignment />
        </div>
      ) : (
        <div>
          <h1 className="text-2xl font-bold text-gray-900 mb-6">My Leads</h1>
          <MyLeads />
        </div>
      )}
    </div>
  )
}
