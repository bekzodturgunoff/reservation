import { Component } from 'react'
import type { ReactNode } from 'react'
import { withTranslation } from 'react-i18next'
import type { WithTranslation } from 'react-i18next'
import { ExclamationTriangleIcon, ArrowPathIcon } from '@heroicons/react/24/outline'
import Button from './Button'

interface Props extends WithTranslation {
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
    const { t } = this.props
    if (this.state.hasError) {
      return (
        <div className="min-h-[50vh] flex items-center justify-center">
          <div className="text-center max-w-md mx-auto p-8">
            <div className="w-16 h-16 bg-red-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <ExclamationTriangleIcon className="w-8 h-8 text-red-500" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">{t('errorBoundary.title')}</h2>
            <p className="text-sm text-gray-500 mb-6">
              {this.state.error?.message || t('errorBoundary.message')}
            </p>
            <div className="flex items-center justify-center gap-3">
              <Button onClick={this.handleReset}>
                <ArrowPathIcon className="w-4 h-4" /> {t('errorBoundary.retry')}
              </Button>
              <Button variant="secondary" onClick={() => window.location.href = '/'}>
                {t('errorBoundary.goHome')}
              </Button>
            </div>
          </div>
        </div>
      )
    }
    return this.props.children
  }
}

export default withTranslation()(ErrorBoundary)
