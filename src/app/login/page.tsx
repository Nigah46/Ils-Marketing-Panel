'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import Card from '@/components/ui/Card'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const { login, isLoading } = useAuth()
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    
    const success = await login(email, password)
    if (success) {
      router.push('/dashboard')
    } else {
      setError('Invalid email or password')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-secondary-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-secondary-900">
            ilsimperia Marketing Portal
          </h2>
          <p className="mt-2 text-center text-sm text-secondary-600">
            Sign in to your account
          </p>
        </div>
        
        <Card>
          <form className="space-y-6" onSubmit={handleSubmit}>
            <Input
              label="Email address"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="admin@ilsimperia.com"
            />
            
            <Input
              label="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="admin123"
            />
            
            {error && (
              <div className="text-red-600 text-sm">{error}</div>
            )}
            
            <Button
              type="submit"
              className="w-full"
              isLoading={isLoading}
            >
              Sign in
            </Button>
          </form>
          
          <div className="mt-4 text-xs text-secondary-500 space-y-1">
            <div><strong>Demo Accounts:</strong></div>
            <div>Admin: admin@ilsimperia.com / admin123</div>
            <div>Counsellor (Tech): rahul@ilsimperia.com / admin123</div>
            <div>Counsellor (Design): priya@ilsimperia.com / admin123</div>
            <div>Manager: amit@ilsimperia.com / admin123</div>
          </div>
        </Card>
      </div>
    </div>
  )
}
