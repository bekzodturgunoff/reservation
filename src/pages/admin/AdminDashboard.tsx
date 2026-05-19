import { useTitle } from '../../hooks/useTitle'

const AdminDashboard = () => {
  useTitle('Admin Dashboard')

  return (
    <div className="p-8">
      <h1 className="text-2xl font-semibold">Admin Dashboard</h1>
    </div>
  )
}

export default AdminDashboard
