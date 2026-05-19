import { useParams } from 'react-router-dom'
import { useTitle } from '../hooks/useTitle'

const VenueDetail = () => {
  const { id } = useParams<{ id: string }>()
  useTitle('Venue Details')

  return (
    <div className="p-8">
      <h1 className="text-2xl font-semibold">Venue Detail</h1>
      <p className="text-gray-500 mt-2">Venue ID: {id}</p>
    </div>
  )
}

export default VenueDetail
