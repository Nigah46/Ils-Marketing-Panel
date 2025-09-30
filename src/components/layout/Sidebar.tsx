'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import clsx from 'clsx'
import { useAuth } from '@/contexts/AuthContext'
import {
  HomeIcon,
  UserGroupIcon,
  ChartBarIcon,
  AcademicCapIcon,
  UserIcon,
  Cog6ToothIcon,
  UsersIcon,
  ChatBubbleLeftRightIcon,
  ClipboardDocumentListIcon,
  BriefcaseIcon
} from '@heroicons/react/24/outline'

const getNavigationForRole = (role: string) => {
  const baseNavigation = [
    { name: 'Dashboard', href: '/dashboard', icon: HomeIcon },
  ];

  if (role === 'admin') {
    return [
      ...baseNavigation,
      { name: 'Admin Panel', href: '/dashboard/admin', icon: Cog6ToothIcon },
      { name: 'Employees', href: '/dashboard/employees', icon: UsersIcon },
      { name: 'All Inquiries', href: '/dashboard/inquiries', icon: ChatBubbleLeftRightIcon },
      { name: 'Sales', href: '/dashboard/sales', icon: ChartBarIcon },
      { name: 'Admissions', href: '/dashboard/admissions', icon: AcademicCapIcon },
      { name: 'Profile', href: '/dashboard/profile', icon: UserIcon },
    ];
  }

  if (role === 'Employee') {
    return [
      ...baseNavigation,
      { name: 'My Dashboard', href: '/dashboard/counsellor', icon: ChartBarIcon },
      { name: 'My Leads', href: '/dashboard/leads', icon: BriefcaseIcon },
      { name: 'Profile', href: '/dashboard/profile', icon: UserIcon },
    ];
  }

  if (role === 'manager' || role === 'Manager') {
    return [
      ...baseNavigation,
      { name: 'Manager Panel', href: '/dashboard/manager', icon: Cog6ToothIcon },
      { name: 'Team Leads', href: '/dashboard/leads', icon: UserGroupIcon },
      { name: 'Sales Pipeline', href: '/dashboard/sales', icon: ChartBarIcon },
      { name: 'Team Performance', href: '/dashboard/employees', icon: UsersIcon },
      { name: 'Profile', href: '/dashboard/profile', icon: UserIcon },
    ];
  }

  // Default navigation
  return [
    ...baseNavigation,
    { name: 'Profile', href: '/dashboard/profile', icon: UserIcon },
  ];
}

export default function Sidebar() {
  const pathname = usePathname()
  const { user } = useAuth()
  
  const navigation = getNavigationForRole(user?.role || 'counsellor')

  return (
    <div className="flex flex-col w-64 bg-white shadow-lg border-r border-secondary-200">
      <div className="flex items-center justify-center h-16 px-4 border-b border-secondary-200">
        <h1 className="text-xl font-bold text-primary-600">ilsimperia</h1>
      </div>
      
      <nav className="flex-1 px-4 py-6 space-y-2">
        {navigation.map((item: any) => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.name}
              href={item.href}
              className={clsx(
                'flex items-center px-4 py-2 text-sm font-medium rounded-lg transition-colors duration-200',
                isActive
                  ? 'bg-primary-100 text-primary-700 border-r-2 border-primary-600'
                  : 'text-secondary-700 hover:bg-secondary-100 hover:text-secondary-900'
              )}
            >
              <item.icon className="mr-3 h-5 w-5" />
              {item.name}
            </Link>
          )
        })}
      </nav>
    </div>
  )
}
