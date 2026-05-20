import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts'
import { useTranslation } from 'react-i18next'
import AnalyticsCard from './AnalyticsCard'
import type { BookingStatusBreakdown } from '../../types'

interface Props {
  data: BookingStatusBreakdown[]
}

const StatusPieChart = ({ data }: Props) => {
  const { t } = useTranslation()
  const total = data.reduce((s, d) => s + d.value, 0)

  return (
    <AnalyticsCard title={t('business.analytics.statusChart')}>
      {total === 0 ? (
        <p className="text-sm text-gray-400 text-center py-8">{t('business.analytics.noData')}</p>
      ) : (
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
          <div className="h-40 w-full max-w-[240px] mx-auto flex-shrink-0 sm:h-48 sm:w-48 sm:max-w-none sm:mx-0">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data.filter(d => d.value > 0)}
                  cx="50%"
                  cy="50%"
                  innerRadius={40}
                  outerRadius={70}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {data.filter(d => d.value > 0).map(entry => (
                    <Cell key={entry.name} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ borderRadius: 12, border: '1px solid #e2e8f0', fontSize: 13 }}
                  formatter={(value: any) => [`${value}`, '']}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex-1 space-y-2">
            {data.map(entry => (
              <div key={entry.name} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: entry.color }} />
                  <span className="text-gray-600">{t(`business.analytics.${entry.name}`)}</span>
                </div>
                <span className="font-medium text-gray-900">
                  {entry.value}
                  <span className="text-gray-400 text-xs ml-1">
                    ({total > 0 ? Math.round((entry.value / total) * 100) : 0}%)
                  </span>
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </AnalyticsCard>
  )
}

export default StatusPieChart
