'use client'

import { useState } from 'react'
import { BellIcon, UserCircleIcon, ChevronDownIcon } from '@heroicons/react/24/outline'
import Button from '../ui/Button'
import { useAuth } from '@/contexts/AuthContext'

interface HeaderProps {
  title: string
  subtitle?: string
}

export default function Header({ title, subtitle }: HeaderProps) {
  const [showUserMenu, setShowUserMenu] = useState(false)
  const { user } = useAuth()

  return (
    <header className="bg-white shadow-sm border-b border-secondary-200">
      <div className="flex items-center justify-between px-6 py-4">
        <div>
          <h1 className="text-2xl font-semibold text-secondary-900">{title}</h1>
          {subtitle && <p className="text-sm text-secondary-600 mt-1">{subtitle}</p>}
        </div>
        
        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="sm">
            <BellIcon className="h-5 w-5" />
          </Button>
          
          <div className="relative">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center space-x-2"
            >
              <UserCircleIcon className="h-6 w-6" />
              <span className="text-sm font-medium">{user?.name || 'User'}</span>
              <ChevronDownIcon className="h-4 w-4" />
            </Button>
            
            {showUserMenu && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg border border-secondary-200 z-50">
                <div className="py-1">
                  <a href="#" className="block px-4 py-2 text-sm text-secondary-700 hover:bg-secondary-100">
                    Profile
                  </a>
                  <a href="#" className="block px-4 py-2 text-sm text-secondary-700 hover:bg-secondary-100">
                    Settings
                  </a>
                  <hr className="my-1 border-secondary-200" />
                  <a href="/login" className="block px-4 py-2 text-sm text-secondary-700 hover:bg-secondary-100">
                    Sign out
                  </a>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}
