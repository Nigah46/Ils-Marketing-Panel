'use client'

import { useState } from 'react'
import Header from '@/components/layout/Header'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import { useAuth } from '@/contexts/AuthContext'
import { 
  UserIcon,
  EnvelopeIcon,
  PhoneIcon,
  BuildingOfficeIcon,
  KeyIcon,
  CheckCircleIcon,
  ArrowRightOnRectangleIcon
} from '@heroicons/react/24/outline'

export default function ProfilePage() {
  const { user, logout } = useAuth()
  const [isEditing, setIsEditing] = useState(false)
  const [showChangePassword, setShowChangePassword] = useState(false)
  const [profileData, setProfileData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    department: user?.department || '',
    role: user?.role || ''
  })
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle')

  const handleProfileSave = async () => {
    setSaveStatus('saving')
    
    // Simulate API call
    setTimeout(() => {
      setSaveStatus('saved')
      setIsEditing(false)
      setTimeout(() => setSaveStatus('idle'), 2000)
    }, 1000)
  }

  const handlePasswordChange = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      alert('New passwords do not match')
      return
    }
    
    setSaveStatus('saving')
    
    // Simulate API call
    setTimeout(() => {
      setSaveStatus('saved')
      setShowChangePassword(false)
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' })
      setTimeout(() => setSaveStatus('idle'), 2000)
    }, 1000)
  }

  const handleLogout = () => {
    if (confirm('Are you sure you want to logout?')) {
      logout()
    }
  }

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'admin':
        return 'bg-red-100 text-red-800'
      case 'manager':
        return 'bg-purple-100 text-purple-800'
      case 'counsellor':
        return 'bg-blue-100 text-blue-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  if (!user) {
    return (
      <div className="p-6">
        <Header title="Profile" subtitle="Manage your account settings" />
        <div className="mt-6">
          <Card>
            <div className="text-center py-8">
              <p className="text-secondary-600">Please log in to view your profile.</p>
            </div>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6">
      <Header title="Profile" subtitle="Manage your account settings" />
      
      <div className="mt-6 space-y-6">
        {/* Profile Information */}
        <Card>
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-secondary-900">Profile Information</h3>
            <div className="flex items-center space-x-2">
              {saveStatus === 'saved' && (
                <span className="flex items-center text-green-600 text-sm">
                  <CheckCircleIcon className="h-4 w-4 mr-1" />
                  Saved
                </span>
              )}
              <Button
                variant={isEditing ? 'secondary' : 'primary'}
                onClick={() => {
                  if (isEditing) {
                    handleProfileSave()
                  } else {
                    setIsEditing(true)
                  }
                }}
                disabled={saveStatus === 'saving'}
              >
                {saveStatus === 'saving' ? 'Saving...' : isEditing ? 'Save Changes' : 'Edit Profile'}
              </Button>
              {isEditing && (
                <Button
                  variant="ghost"
                  onClick={() => {
                    setIsEditing(false)
                    setProfileData({
                      name: user?.name || '',
                      email: user?.email || '',
                      phone: user?.phone || '',
                      department: user?.department || '',
                      role: user?.role || ''
                    })
                  }}
                >
                  Cancel
                </Button>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-2">
                <UserIcon className="h-4 w-4 inline mr-1" />
                Full Name
              </label>
              {isEditing ? (
                <Input
                  value={profileData.name}
                  onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                  placeholder="Enter your full name"
                />
              ) : (
                <p className="text-secondary-900 py-2">{profileData.name}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-2">
                <EnvelopeIcon className="h-4 w-4 inline mr-1" />
                Email Address
              </label>
              {isEditing ? (
                <Input
                  type="email"
                  value={profileData.email}
                  onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                  placeholder="Enter your email"
                />
              ) : (
                <p className="text-secondary-900 py-2">{profileData.email}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-2">
                <PhoneIcon className="h-4 w-4 inline mr-1" />
                Phone Number
              </label>
              {isEditing ? (
                <Input
                  value={profileData.phone}
                  onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                  placeholder="Enter your phone number"
                />
              ) : (
                <p className="text-secondary-900 py-2">{profileData.phone || 'Not provided'}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-2">
                <BuildingOfficeIcon className="h-4 w-4 inline mr-1" />
                Department
              </label>
              <p className="text-secondary-900 py-2">{profileData.department}</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-2">
                Role
              </label>
              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getRoleBadgeColor(profileData.role)}`}>
                {profileData.role.charAt(0).toUpperCase() + profileData.role.slice(1)}
              </span>
            </div>

            {user.employeeId && (
              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-2">
                  Employee ID
                </label>
                <p className="text-secondary-900 py-2">{user.employeeId}</p>
              </div>
            )}
          </div>
        </Card>

        {/* Security Settings */}
        <Card>
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-secondary-900">Security Settings</h3>
            <div className="flex space-x-3">
              <Button
                variant="secondary"
                onClick={() => setShowChangePassword(!showChangePassword)}
              >
                <KeyIcon className="h-4 w-4 mr-2" />
                Change Password
              </Button>
              <Button
                variant="danger"
                onClick={handleLogout}
              >
                <ArrowRightOnRectangleIcon className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>

          {showChangePassword && (
            <div className="space-y-4 border-t pt-6">
              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-2">
                  Current Password
                </label>
                <Input
                  type="password"
                  value={passwordData.currentPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                  placeholder="Enter current password"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-2">
                  New Password
                </label>
                <Input
                  type="password"
                  value={passwordData.newPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                  placeholder="Enter new password"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-2">
                  Confirm New Password
                </label>
                <Input
                  type="password"
                  value={passwordData.confirmPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                  placeholder="Confirm new password"
                />
              </div>

              <div className="flex space-x-3 pt-4">
                <Button
                  onClick={handlePasswordChange}
                  disabled={!passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword || saveStatus === 'saving'}
                >
                  {saveStatus === 'saving' ? 'Updating...' : 'Update Password'}
                </Button>
                <Button
                  variant="ghost"
                  onClick={() => {
                    setShowChangePassword(false)
                    setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' })
                  }}
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </Card>

        {/* Account Statistics */}
        <Card>
          <h3 className="text-lg font-semibold text-secondary-900 mb-6">Account Statistics</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {user.role === 'Employee' ? '12' : '45'}
              </div>
              <div className="text-sm text-secondary-600">
                {user.role === 'Employee' ? 'Assigned Leads' : 'Total Leads'}
              </div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {user.role === 'Employee' ? '8' : '28'}
              </div>
              <div className="text-sm text-secondary-600">
                {user.role === 'Employee' ? 'Active Students' : 'Total Students'}
              </div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {user.role === 'Employee' ? '₹2.4L' : '₹12.8L'}
              </div>
              <div className="text-sm text-secondary-600">
                {user.role === 'Employee' ? 'Revenue Generated' : 'Total Revenue'}
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}
