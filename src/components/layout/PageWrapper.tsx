import { Outlet, useLocation } from 'react-router-dom'
import { useEffect } from 'react'
import Navbar from './Navbar'
import Footer from './Footer'
import Toast from '../ui/Toast'
import InstallPrompt from '../ui/InstallPrompt'
import ErrorBoundary from '../ui/ErrorBoundary'

const PageWrapper = () => {
  const { pathname } = useLocation()

  useEffect(() => { window.scrollTo({ top: 0, behavior: 'instant' }) }, [pathname])

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--color-bg)' }}>
      <Navbar />
      <main className="mx-auto w-full max-w-[1280px] flex-1 px-4 py-4 sm:px-6 sm:py-6 lg:px-8 lg:py-8">
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
