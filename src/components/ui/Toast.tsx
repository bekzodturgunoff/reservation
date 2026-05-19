import { useEffect } from 'react'
import { CheckCircleIcon, XCircleIcon, ExclamationCircleIcon, InformationCircleIcon, XMarkIcon } from '@heroicons/react/24/outline'
import { useToastStore } from '../../store/toastStore'
import type { ToastMessage } from '../../types'

const icons = {
  success: <CheckCircleIcon className="w-5 h-5 text-emerald-500" />,
  error: <XCircleIcon className="w-5 h-5 text-red-500" />,
  warning: <ExclamationCircleIcon className="w-5 h-5 text-yellow-500" />,
  info: <InformationCircleIcon className="w-5 h-5 text-blue-500" />,
}

const bgColors = {
  success: 'bg-emerald-50 border-emerald-200',
  error: 'bg-red-50 border-red-200',
  warning: 'bg-yellow-50 border-yellow-200',
  info: 'bg-blue-50 border-blue-200',
}

const Toast = () => {
  const { toasts, removeToast } = useToastStore()

  return (
    <div className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2 max-w-sm w-full">
      {toasts.map((toast) => (
        <ToastItem
          key={toast.id}
          toast={toast}
          onRemove={() => removeToast(toast.id)}
        />
      ))}
    </div>
  )
}

const ToastItem = ({ toast, onRemove }: { toast: ToastMessage; onRemove: () => void }) => {
  useEffect(() => {
    const timer = setTimeout(onRemove, 4000)
    return () => clearTimeout(timer)
  }, [onRemove])

  return (
    <div className={`flex items-start gap-3 px-4 py-3 rounded-xl border shadow-md ${bgColors[toast.type as keyof typeof bgColors]}`}>
      {icons[toast.type as keyof typeof icons]}
      <p className="text-sm text-gray-800 flex-1">{toast.message}</p>
      <button onClick={onRemove} className="text-gray-400 hover:text-gray-600 mt-0.5">
        <XMarkIcon className="w-4 h-4" />
      </button>
    </div>
  )
}

export default Toast
