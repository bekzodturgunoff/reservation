const STATUS_CONFIG: Record<string, { label: string; bg: string; text: string; border: string }> = {
  pending:   { label: 'Kutilmoqda',    bg: 'bg-amber-50',   text: 'text-amber-700',  border: 'border-amber-200'  },
  confirmed: { label: 'Tasdiqlangan',  bg: 'bg-brand-pale',   text: 'text-brand-dark',  border: 'border-brand-200'  },
  completed: { label: 'Yakunlangan',   bg: 'bg-gray-50',    text: 'text-gray-600',   border: 'border-gray-200'   },
  cancelled: { label: 'Bekor qilindi', bg: 'bg-red-50',     text: 'text-red-700',    border: 'border-red-200'    },
  no_show:   { label: 'Kelmadi',       bg: 'bg-gray-50',    text: 'text-gray-500',   border: 'border-gray-200'   },
}

export function BookingStatusBadge({ status }: { status: string }) {
  const config = STATUS_CONFIG[status] ?? STATUS_CONFIG.pending ?? { bg: 'bg-gray-50', text: 'text-gray-500', border: 'border-gray-200', label: 'Noma\'lum' }
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${config.bg} ${config.text} ${config.border}`}>
      {config.label}
    </span>
  )
}
