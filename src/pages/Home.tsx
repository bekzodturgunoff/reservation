import { useTranslation } from 'react-i18next'
import { useTitle } from '../hooks/useTitle'

const Home = () => {
  const { t } = useTranslation()
  useTitle('Home')

  return (
    <div className="p-8">
      <h1 className="text-2xl font-semibold">Home</h1>
      <p className="text-gray-500 mt-2">{t('common.search')}</p>
    </div>
  )
}

export default Home
