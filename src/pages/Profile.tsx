import { useTitle } from '../hooks/useTitle'

const Profile = () => {
  useTitle('My Profile')

  return (
    <div className="p-8">
      <h1 className="text-2xl font-semibold">My Profile</h1>
    </div>
  )
}

export default Profile
