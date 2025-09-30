'use client'

import { useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import MyLeads from '@/components/employee/MyLeads'
import LeadAssignment from '@/components/manager/LeadAssignment'
import Header from '@/components/layout/Header'
import { 
  ClipboardDocumentListIcon, 
  UserPlusIcon,
  ArrowRightOnRectangleIcon
} from '@heroicons/react/24/outline'

export default function LeadsPage() {
  const { user, logout, isLoading } = useAuth()
  const [activeTab, setActiveTab] = useState('assigned')

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-4"></div>
          <div className="text-xl font-semibold text-gray-700">Loading...</div>
          <div className="text-sm text-gray-500 mt-2">Please wait while we load your data</div>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-xl font-semibold text-gray-700">Not Authenticated</div>
          <div className="text-sm text-gray-500 mt-2">Please log in to access this page</div>
          <button
            onClick={() => window.location.href = '/login'}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Go to Login
          </button>
        </div>
      </div>
    )
  }

  const handleLogout = () => {
    logout()
    window.location.href = '/login'
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <div className="bg-white/80 backdrop-blur-sm border-b border-gray-200/50 sticky top-0 z-40">
        <div className="px-6 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
                {user.role === 'Manager' ? 'Lead Management' : 'My Leads'}
              </h1>
              <p className="text-gray-600 mt-1">
                {user.role === 'Manager' 
                  ? 'Manage team leads and assignments' 
                  : 'Track and manage your assigned leads'
                }
              </p>
            </div>
            <div className="flex items-center space-x-4">
              {/* Logout Button */}
              {(user?.role === 'Employee' || user?.role === 'Manager') && (
                <button
                  onClick={handleLogout}
                  className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg hover:from-red-600 hover:to-red-700 transition-all duration-200 transform hover:scale-105 shadow-lg"
                >
                  <ArrowRightOnRectangleIcon className="h-5 w-5" />
                  <span className="text-sm font-medium">Logout</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="px-6 py-8">
        {/* Role-based lead management */}
        {user.role === 'Manager' ? (
          <div className="space-y-6">
            {/* Tab Navigation */}
            <div className="bg-white/70 backdrop-blur-sm rounded-2xl border border-gray-200/50 p-2">
              <div className="flex space-x-1">
                <button
                  onClick={() => setActiveTab('assigned')}
                  className={`flex-1 flex items-center justify-center px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                    activeTab === 'assigned'
                      ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  <ClipboardDocumentListIcon className="h-5 w-5 mr-2" />
                  Assigned Leads
                </button>
                <button
                  onClick={() => setActiveTab('unassigned')}
                  className={`flex-1 flex items-center justify-center px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                    activeTab === 'unassigned'
                      ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  <UserPlusIcon className="h-5 w-5 mr-2" />
                  Unassigned Leads
                </button>
              </div>
            </div>

            {/* Tab Content */}
            {activeTab === 'assigned' ? (
              <div>
                <div className="mb-6">
                  <h2 className="text-xl font-semibold text-gray-900 mb-2">Assigned Leads</h2>
                  <p className="text-gray-600">Leads that have been assigned to you for management</p>
                </div>
                <MyLeads />
              </div>
            ) : (
              <div>
                <div className="mb-6">
                  <h2 className="text-xl font-semibold text-gray-900 mb-2">Unassigned Leads</h2>
                  <p className="text-gray-600">Assign unassigned leads to team members</p>
                </div>
                <LeadAssignment />
              </div>
            )}
          </div>
        ) : (
          <div>
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-2">My Leads</h2>
              <p className="text-gray-600">Track and manage your assigned leads</p>
            </div>
            <MyLeads />
          </div>
        )}
      </div>
    </div>
  )
}
