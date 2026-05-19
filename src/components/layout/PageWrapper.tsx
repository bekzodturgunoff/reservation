import { Outlet } from 'react-router-dom'
import Navbar from './Navbar'
import Footer from './Footer'
import Toast from '../ui/Toast'
import ErrorBoundary from '../ui/ErrorBoundary'
import InstallPrompt from '../ui/InstallPrompt'

const PageWrapper = () => {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />
      <main className="flex-1 w-full max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-6">
        <ErrorBoundary>
          <div className="page-enter">
            <Outlet />
          </div>
        </ErrorBoundary>
      </main>
      <Footer />
      <Toast />
      <InstallPrompt />
    </div>
  )
}

export default PageWrapper
