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
      <main style={{ flex: 1, width: '100%', maxWidth: '1280px', margin: '0 auto', padding: '0 24px' }}>
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
