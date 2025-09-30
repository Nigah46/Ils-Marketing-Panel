import { ReactNode } from 'react'
import clsx from 'clsx'

interface TableProps {
  children: ReactNode
  className?: string
}

interface TableHeaderProps {
  children: ReactNode
  className?: string
}

interface TableBodyProps {
  children: ReactNode
  className?: string
}

interface TableRowProps {
  children: ReactNode
  className?: string
  onClick?: () => void
}

interface TableCellProps {
  children: ReactNode
  className?: string
  header?: boolean
}

export function Table({ children, className }: TableProps) {
  return (
    <div className="overflow-x-auto">
      <table className={clsx('min-w-full divide-y divide-secondary-200', className)}>
        {children}
      </table>
    </div>
  )
}

export function TableHeader({ children, className }: TableHeaderProps) {
  return (
    <thead className={clsx('bg-secondary-50', className)}>
      {children}
    </thead>
  )
}

export function TableBody({ children, className }: TableBodyProps) {
  return (
    <tbody className={clsx('bg-white divide-y divide-secondary-200', className)}>
      {children}
    </tbody>
  )
}

export function TableRow({ children, className, onClick }: TableRowProps) {
  return (
    <tr
      className={clsx(
        onClick && 'hover:bg-secondary-50 cursor-pointer',
        className
      )}
      onClick={onClick}
    >
      {children}
    </tr>
  )
}

export function TableCell({ children, className, header = false }: TableCellProps) {
  const Component = header ? 'th' : 'td'
  
  return (
    <Component
      className={clsx(
        'px-6 py-4 text-sm',
        header
          ? 'font-medium text-secondary-900 text-left'
          : 'text-secondary-700',
        className
      )}
    >
      {children}
    </Component>
  )
}
