import { ReactNode } from 'react'
import clsx from 'clsx'

interface CardProps {
  children: ReactNode
  className?: string
  title?: string
  subtitle?: string
  onClick?: () => void
}

export default function Card({ children, className, title, subtitle, onClick }: CardProps) {
  return (
    <div 
      className={clsx('bg-white rounded-lg shadow-md border border-secondary-200 p-6', className)}
      onClick={onClick}
    >
      {(title || subtitle) && (
        <div className="mb-4">
          {title && <h3 className="text-lg font-semibold text-secondary-900">{title}</h3>}
          {subtitle && <p className="text-sm text-secondary-600 mt-1">{subtitle}</p>}
        </div>
      )}
      {children}
    </div>
  )
}
