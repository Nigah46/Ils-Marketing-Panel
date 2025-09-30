'use client'

import { useState, useEffect } from 'react'
import { notificationApi, type Notification } from '@/lib/notificationApi'
import { useAuth } from '@/contexts/AuthContext'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import { 
  BellIcon, 
  CheckIcon, 
  ClockIcon,
  ExclamationTriangleIcon,
  UserIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline'

interface NotificationPanelProps {
  className?: string
}

export default function NotificationPanel({ className = '' }: NotificationPanelProps) {
  const { user } = useAuth()
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)
  const [unreadCount, setUnreadCount] = useState(0)
  const [filter, setFilter] = useState<'all' | 'unread' | 'status_update'>('all')

  useEffect(() => {
    if (user?.role === 'Manager') {
      fetchNotifications()
      // Set up polling to refresh notifications every 30 seconds
      const interval = setInterval(fetchNotifications, 30000)
      return () => clearInterval(interval)
    }
  }, [user, filter])

  const fetchNotifications = async () => {
    try {
      setLoading(true)
      const params: any = { limit: 50 }
      
      if (filter === 'unread') params.isRead = false
      if (filter === 'status_update') params.type = 'status_update'
      
      const response = await notificationApi.getMyNotifications(params)
      console.log('Fetched notifications:', response)
      setNotifications(response.data)
      setUnreadCount(response.unreadCount)
    } catch (error) {
      console.error('Failed to fetch notifications:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleMarkAsRead = async (id: string) => {
    try {
      await notificationApi.markAsRead(id)
      setNotifications(prev => 
        prev.map(notif => 
          notif._id === id ? { ...notif, isRead: true, readAt: new Date().toISOString() } : notif
        )
      )
      setUnreadCount(prev => Math.max(0, prev - 1))
    } catch (error) {
      console.error('Failed to mark notification as read:', error)
    }
  }

  const handleMarkAllAsRead = async () => {
    try {
      await notificationApi.markAllAsRead()
      setNotifications(prev => 
        prev.map(notif => ({ ...notif, isRead: true, readAt: new Date().toISOString() }))
      )
      setUnreadCount(0)
    } catch (error) {
      console.error('Failed to mark all notifications as read:', error)
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'border-l-red-500/70 bg-red-50/60'
      case 'high': return 'border-l-orange-500/70 bg-orange-50/60'
      case 'medium': return 'border-l-amber-500/70 bg-amber-50/60'
      case 'low': return 'border-l-slate-300/80 bg-slate-50/60'
      default: return 'border-l-slate-300/80 bg-slate-50/60'
    }
  }

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'urgent':
      case 'high':
        return <ExclamationTriangleIcon className="h-4 w-4 text-red-500" />
      case 'medium':
        return <ClockIcon className="h-4 w-4 text-yellow-500" />
      default:
        return <BellIcon className="h-4 w-4 text-gray-500" />
    }
  }

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60))
    
    if (diffInMinutes < 1) return 'Just now'
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`
    return `${Math.floor(diffInMinutes / 1440)}d ago`
  }

  if (loading) {
    return (
      <Card className={className}>
        <div className="p-6">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
        </div>
      </Card>
    )
  }

  return (
    <Card className={className}>
      <div className="p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-2">
            <BellIcon className="h-6 w-6 text-primary-600" />
            <h3 className="text-lg font-semibold bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-600">
              Notifications
              {unreadCount > 0 && (
                <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                  {unreadCount}
                </span>
              )}
            </h3>
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={fetchNotifications}
              title="Refresh"
            >
              <ArrowPathIcon className="h-4 w-4" />
            </Button>
            {unreadCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleMarkAllAsRead}
              >
                Mark all read
              </Button>
            )}
          </div>
        </div>

        {/* Filters */}
        <div className="flex space-x-2 mb-4">
          <Button
            variant={filter === 'all' ? 'primary' : 'ghost'}
            size="sm"
            onClick={() => setFilter('all')}
          >
            All
          </Button>
          <Button
            variant={filter === 'unread' ? 'primary' : 'ghost'}
            size="sm"
            onClick={() => setFilter('unread')}
          >
            Unread ({unreadCount})
          </Button>
          <Button
            variant={filter === 'status_update' ? 'primary' : 'ghost'}
            size="sm"
            onClick={() => setFilter('status_update')}
          >
            Status Updates
          </Button>
        </div>

        {/* Notifications List */}
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {notifications.length === 0 ? (
            <div className="text-center py-8">
              <BellIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No notifications found</p>
            </div>
          ) : (
            notifications.map((notification) => (
              <div
                key={notification._id}
                className={`border-l-4 p-4 rounded-lg transition-all duration-200 hover:shadow-sm hover:-translate-y-0.5 ${
                  notification.isRead ? 'bg-slate-50 border-l-slate-300' : getPriorityColor(notification.priority)
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      {getPriorityIcon(notification.priority)}
                      <h4 className={`text-sm font-medium ${
                        notification.isRead ? 'text-slate-700' : 'text-slate-900'
                      }`}>
                        {notification.title}
                      </h4>
                      {!notification.isRead && (
                        <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                      )}
                    </div>
                    
                    <p className={`text-sm ${
                      notification.isRead ? 'text-slate-600' : 'text-slate-800'
                    }`}>
                      {notification.message}
                    </p>
                    
                    <div className="flex items-center space-x-4 mt-2 text-xs text-slate-500">
                      <div className="flex items-center space-x-1">
                        <UserIcon className="h-3 w-3" />
                        <span>{notification.from.name}</span>
                      </div>
                      <span>{formatTimeAgo(notification.createdAt)}</span>
                      {notification.inquiry && (
                        <span className="text-blue-600">
                          Lead: {notification.inquiry.customerName}
                        </span>
                      )}
                    </div>
                  </div>
                  
                  {!notification.isRead && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleMarkAsRead(notification._id)}
                      title="Mark as read"
                    >
                      <CheckIcon className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </Card>
  )
}
