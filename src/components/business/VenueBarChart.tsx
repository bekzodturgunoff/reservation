import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'
import { useTranslation } from 'react-i18next'
import AnalyticsCard from './AnalyticsCard'
import type { VenueBookingStats } from '../../types'

interface Props {
  data: VenueBookingStats[]
}

const VenueBarChart = ({ data }: Props) => {
  const { t } = useTranslation()

  return (
    <AnalyticsCard title={t('business.analytics.venueChart')}>
      {data.length === 0 ? (
        <p className="text-sm text-gray-400 text-center py-8">{t('business.analytics.noData')}</p>
      ) : (
        <div className="h-56 sm:h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={data}
              layout="vertical"
              margin={{ top: 4, right: 4, bottom: 0, left: 4 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false} />
              <XAxis type="number" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} allowDecimals={false} />
              <YAxis
                type="category"
                dataKey="venueName"
                tick={{ fontSize: 11, fill: '#64748b' }}
                axisLine={false}
                tickLine={false}
                width={84}
                tickFormatter={(name: string) => name.length > 12 ? name.slice(0, 12) + '…' : name}
              />
              <Tooltip
                contentStyle={{ borderRadius: 12, border: '1px solid #e2e8f0', fontSize: 13 }}
                formatter={(value: any, _name: any) => [
                  value,
                  _name === 'bookings' ? t('business.analytics.bookings') : t('business.analytics.revenue'),
                ]}
              />
              <Bar dataKey="bookings" fill="#8b5cf6" radius={[0, 4, 4, 0]} maxBarSize={24} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </AnalyticsCard>
  )
}

export default VenueBarChart
