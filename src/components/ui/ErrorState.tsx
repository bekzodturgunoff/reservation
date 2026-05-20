import { ExclamationTriangleIcon, ArrowPathIcon } from '@heroicons/react/24/outline'

interface ErrorStateProps {
  message?: string
  onRetry?: () => void
}

const ErrorState = ({
  message = 'Something went wrong',
  onRetry,
}: ErrorStateProps) => (
  <div className="flex flex-col items-center justify-center py-20 text-center px-4">
    <div className="w-14 h-14 bg-red-50 rounded-2xl flex items-center justify-center mb-4">
      <ExclamationTriangleIcon className="w-7 h-7 text-red-400" />
    </div>
    <h3 className="font-semibold text-gray-900 mb-1">Xatolik yuz berdi</h3>
    <p className="text-sm text-gray-500 mb-6 max-w-xs">{message}</p>
    {onRetry && (
      <button
        onClick={onRetry}
        className="flex items-center gap-2 px-5 py-2.5 bg-emerald-600 text-white text-sm font-medium rounded-xl hover:bg-emerald-700 transition-colors"
      >
        <ArrowPathIcon className="w-4 h-4" />
        Qaytadan urinish
      </button>
    )}
  </div>
)

export default ErrorState
