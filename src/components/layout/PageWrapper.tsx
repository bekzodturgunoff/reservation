import Navbar from './Navbar'
import Footer from './Footer'
import ToastContainer from '../ui/Toast'

interface PageWrapperProps {
  children: React.ReactNode
}

const PageWrapper = ({ children }: PageWrapperProps) => {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1">{children}</main>
      <Footer />
      <ToastContainer />
    </div>
  )
}

export default PageWrapper
