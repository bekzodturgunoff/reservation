import { Link } from 'react-router-dom'
import Button from '../components/ui/Button'

const NotFound = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] px-4">
      <h1 className="text-6xl font-bold text-gray-300">404</h1>
      <p className="text-gray-500 mt-2 mb-6">Page not found</p>
      <Link to="/"><Button>Back to Home</Button></Link>
    </div>
  )
}

export default NotFound
