import React from 'react'

interface ConfirmModalProps {
  open: boolean
  title: string
  description?: string
  confirmText?: string
  cancelText?: string
  onConfirm: () => void
  onCancel: () => void
  children?: React.ReactNode
  confirmDisabled?: boolean
}

export function ConfirmModal({ open, title, description, confirmText = 'Confirm', cancelText = 'Cancel', onConfirm, onCancel, children, confirmDisabled }: ConfirmModalProps) {
  if (!open) return null
  return (
    <div className="fixed inset-0 z-50">
      <div className="fixed inset-0 bg-black/50" onClick={onCancel} />
      <div className="fixed left-1/2 top-1/2 z-50 w-full max-w-sm -translate-x-1/2 -translate-y-1/2 rounded-md border bg-white p-4 shadow-lg">
        <div className="mb-3">
          <h2 className="text-lg font-semibold">{title}</h2>
          {description && <p className="mt-1 text-sm text-gray-600 whitespace-pre-wrap">{description}</p>}
          {children && (
            <div className="mt-2 text-sm text-gray-800 max-h-60 overflow-auto">
              {children}
            </div>
          )}
        </div>
        <div className="flex justify-end gap-2">
          <button
            className="px-3 py-1.5 text-sm rounded-md border border-gray-300 bg-white hover:bg-gray-50"
            onClick={onCancel}
          >
            {cancelText}
          </button>
          <button
            className={`px-3 py-1.5 text-sm rounded-md bg-blue-600 text-white hover:bg-blue-700 ${confirmDisabled ? 'opacity-50 cursor-not-allowed' : ''}`}
            onClick={!confirmDisabled ? onConfirm : undefined}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  )
}
