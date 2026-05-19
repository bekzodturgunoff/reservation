import { Component } from 'react'
import type { ReactNode } from 'react'
import { AlertTriangle, RefreshCw } from 'lucide-react'
import Button from './Button'

interface Props {
  children: ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
}

class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, error: null }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null })
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-[50vh] flex items-center justify-center">
          <div className="text-center max-w-md mx-auto p-8">
            <div className="w-16 h-16 bg-red-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="w-8 h-8 text-red-500" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Xatolik yuz berdi</h2>
            <p className="text-sm text-gray-500 mb-6">
              {this.state.error?.message || 'Sahifa yuklanmadi. Iltimos, qayta urinib ko\'ring.'}
            </p>
            <div className="flex items-center justify-center gap-3">
              <Button onClick={this.handleReset}>
                <RefreshCw className="w-4 h-4" /> Qayta urinish
              </Button>
              <Button variant="secondary" onClick={() => window.location.href = '/'}>
                Bosh sahifa
              </Button>
            </div>
          </div>
        </div>
      )
    }
    return this.props.children
  }
}

export default ErrorBoundary
