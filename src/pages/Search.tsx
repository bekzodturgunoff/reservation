import { useTitle } from '../hooks/useTitle'

const Search = () => {
  useTitle('Search')

  return (
    <div className="p-8">
      <h1 className="text-2xl font-semibold">Search</h1>
    </div>
  )
}

export default Search
