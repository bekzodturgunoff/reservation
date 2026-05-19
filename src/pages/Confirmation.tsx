import { useParams } from 'react-router-dom'
import { useTitle } from '../hooks/useTitle'

const Confirmation = () => {
  const { bookingId } = useParams<{ bookingId: string }>()
  useTitle('Booking Confirmed')

  return (
    <div className="p-8">
      <h1 className="text-2xl font-semibold">Booking Confirmed</h1>
      <p className="text-gray-500 mt-2">Booking ID: {bookingId}</p>
    </div>
  )
}

export default Confirmation
