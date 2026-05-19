import { useTitle } from '../../hooks/useTitle'

const BusinessDashboard = () => {
  useTitle('Business Dashboard')

  return (
    <div className="p-8">
      <h1 className="text-2xl font-semibold">Business Dashboard</h1>
    </div>
  )
}

export default BusinessDashboard
