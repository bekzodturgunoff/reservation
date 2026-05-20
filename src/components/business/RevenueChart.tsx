import { useMemo, useState } from 'react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'
import { useTranslation } from 'react-i18next'
import AnalyticsCard from './AnalyticsCard'
import type { DailyRevenue } from '../../types'
import { formatPrice } from '../../lib/utils'

interface Props {
  data: DailyRevenue[]
  totalRevenue: number
  change: number
}

const RevenueChart = ({ data, totalRevenue, change }: Props) => {
  const { t } = useTranslation()
  const [period, setPeriod] = useState<'daily' | 'weekly' | 'monthly'>('daily')

  const chartData = useMemo(() => {
    if (period === 'daily') return data
    if (period === 'weekly') {
      const weeks: DailyRevenue[] = []
      for (let i = 0; i < data.length; i += 7) {
        const chunk = data.slice(i, i + 7)
        weeks.push({
          date: `W${Math.floor(i / 7) + 1}`,
          revenue: chunk.reduce((s, d) => s + d.revenue, 0),
          bookings: chunk.reduce((s, d) => s + d.bookings, 0),
        })
      }
      return weeks
    }
    return data
  }, [data, period])

  const isUp = change >= 0

  return (
    <AnalyticsCard title={t('business.analytics.revenueChart')}>
      <div className="flex flex-col gap-3 mb-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-xl sm:text-2xl font-bold text-gray-900 break-words">{formatPrice(totalRevenue)}</p>
          <p className={`text-xs ${isUp ? 'text-emerald-600' : 'text-red-500'}`}>
            {isUp ? '↑' : '↓'} {Math.abs(change).toFixed(1)}% {t('business.analytics.revenueChange')}
          </p>
        </div>
        <div className="flex flex-wrap gap-1">
          {(['daily', 'weekly', 'monthly'] as const).map(p => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`px-3 py-1 text-xs rounded-lg font-medium transition-colors ${
                period === p ? 'bg-emerald-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {t(`business.analytics.${p}`)}
            </button>
          ))}
        </div>
      </div>
      {data.length === 0 ? (
        <p className="text-sm text-gray-400 text-center py-8">{t('business.analytics.noData')}</p>
      ) : (
        <div className="h-56 sm:h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 4, right: 4, bottom: 0, left: -8 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={{ borderRadius: 12, border: '1px solid #e2e8f0', fontSize: 13 }}
                formatter={(value: any) => formatPrice(value)}
              />
              <Bar dataKey="revenue" fill="#059669" radius={[4, 4, 0, 0]} maxBarSize={32} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </AnalyticsCard>
  )
}

export default RevenueChart
