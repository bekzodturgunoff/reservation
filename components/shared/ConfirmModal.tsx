'use client'

interface ConfirmModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void | Promise<void>
  title: string
  description: string
  confirmLabel?: string
  confirmVariant?: 'danger' | 'primary'
  isLoading?: boolean
}

export function ConfirmModal({
  isOpen, onClose, onConfirm, title, description,
  confirmLabel = 'Tasdiqlash', confirmVariant = 'primary', isLoading,
}: ConfirmModalProps) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-modal max-w-sm w-full p-6">
        <h3 className="text-lg font-display font-bold text-ink">{title}</h3>
        <p className="mt-2 text-sm text-ink-tertiary">{description}</p>
        <div className="mt-6 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 h-10 rounded-xl border border-line text-sm font-semibold text-ink-secondary hover:bg-surface-muted transition-colors"
          >
            Bekor
          </button>
          <button
            onClick={onConfirm}
            disabled={isLoading}
            className={`flex-1 h-10 rounded-xl text-sm font-semibold text-white transition-colors ${
              confirmVariant === 'danger'
                ? 'bg-red-500 hover:bg-red-600'
                : 'bg-brand-600 hover:bg-brand-700'
            } disabled:opacity-50`}
          >
            {isLoading ? '...' : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  )
}
