'use client'
import { useEffect } from 'react'
import { CheckCircle, AlertCircle, Info, X } from 'lucide-react'

export type ToastItem = {
  id: string
  message: string
  type: 'success' | 'error' | 'info'
}

type ToastProps = {
  toasts: ToastItem[]
  onRemove: (id: string) => void
}

const ICONS = {
  success: <CheckCircle size={15} className="text-[#168B45] flex-shrink-0" />,
  error: <AlertCircle size={15} className="text-red-500 flex-shrink-0" />,
  info: <Info size={15} className="text-[#FC8019] flex-shrink-0" />,
}

function Toast({ toast, onRemove }: { toast: ToastItem; onRemove: (id: string) => void }) {
  useEffect(() => {
    const t = setTimeout(() => onRemove(toast.id), 3000)
    return () => clearTimeout(t)
  }, [toast.id, onRemove])

  return (
    <div className="flex items-center gap-2.5 bg-white border border-[#E9E9EB] rounded-xl px-3 py-2.5 shadow-lg min-w-[200px] max-w-[300px] animate-in slide-in-from-top-2 duration-300">
      {ICONS[toast.type]}
      <p className="text-sm text-[#282C3F] font-medium flex-1">{toast.message}</p>
      <button onClick={() => onRemove(toast.id)} className="ml-1">
        <X size={13} className="text-[#686B78]" />
      </button>
    </div>
  )
}

export default function ToastContainer({ toasts, onRemove }: ToastProps) {
  if (toasts.length === 0) return null
  return (
    <div className="fixed top-14 left-0 right-0 max-w-md mx-auto px-4 z-[100] flex flex-col gap-2 items-center pointer-events-none">
      {toasts.map(t => (
        <div key={t.id} className="pointer-events-auto">
          <Toast toast={t} onRemove={onRemove} />
        </div>
      ))}
    </div>
  )
}
