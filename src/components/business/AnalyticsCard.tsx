import type { ReactNode } from 'react'

interface Props {
  title: string
  children: ReactNode
  className?: string
}

const AnalyticsCard = ({ title, children, className = '' }: Props) => (
  <div className={`bg-white rounded-2xl border border-gray-100 p-4 sm:p-6 shadow-sm ${className}`}>
    <h3 className="text-sm font-semibold text-gray-900 mb-4 leading-tight">{title}</h3>
    {children}
  </div>
)

export default AnalyticsCard
