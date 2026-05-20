import { useEffect } from 'react'
import { useToastStore } from '../../store/toastStore'
import type { ToastMessage } from '../../types'

const iconMap = { success: '✓', error: '✕', warning: '!', info: 'i' }
const colorMap = {
  success: { bg: 'var(--color-brand-light)',   border: 'var(--color-brand)',   text: '#006644' },
  error:   { bg: 'var(--color-danger-light)',  border: 'var(--color-danger)',  text: 'var(--color-danger)' },
  warning: { bg: 'var(--color-warning-light)', border: 'var(--color-warning)', text: '#92400E' },
  info:    { bg: 'var(--color-info-light)',    border: 'var(--color-info)',    text: 'var(--color-info)' },
}

const ToastItem = ({ toast, onRemove }: { toast: ToastMessage; onRemove: () => void }) => {
  useEffect(() => { const t = setTimeout(onRemove, 4000); return () => clearTimeout(t) }, [])
  const c = colorMap[toast.type]
  return (
    <div style={{
      background: c.bg, border: `1px solid ${c.border}`,
      borderRadius: '10px', padding: '12px 16px',
      display: 'flex', alignItems: 'center', gap: '10px',
      boxShadow: '0 4px 16px rgba(0,0,0,0.1)',
      animation: 'slideInRight 0.2s ease',
      maxWidth: '360px', width: '100%',
    }}>
      <span style={{ fontWeight: 600, fontSize: '12px', width: 20, height: 20,
        borderRadius: '50%', background: c.border, color: 'white',
        display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        {iconMap[toast.type]}
      </span>
      <p style={{ fontSize: '13px', color: 'var(--color-text-primary)', flex: 1, margin: 0 }}>
        {toast.message}
      </p>
      <button onClick={onRemove} style={{ color: 'var(--color-text-tertiary)', background: 'none', border: 'none', cursor: 'pointer', fontSize: '16px', lineHeight: 1, padding: 0 }}>
        ×
      </button>
    </div>
  )
}

const Toast = () => {
  const { toasts, removeToast } = useToastStore()
  return (
    <div style={{ position: 'fixed', bottom: '24px', right: '24px', zIndex: 100, display: 'flex', flexDirection: 'column', gap: '8px' }}>
      {toasts.map(t => <ToastItem key={t.id} toast={t} onRemove={() => removeToast(t.id)} />)}
    </div>
  )
}
export default Toast
