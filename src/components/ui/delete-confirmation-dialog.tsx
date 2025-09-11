import React, { useState } from "react"

interface DeleteConfirmationDialogProps {
  trigger: React.ReactNode
  title: string
  description: string
  onConfirm: () => void
  confirmText?: string
  cancelText?: string
}

export function DeleteConfirmationDialog({
  trigger,
  title,
  description,
  onConfirm,
  confirmText = "Delete",
  cancelText = "Cancel"
}: DeleteConfirmationDialogProps) {
  const [open, setOpen] = useState(false)

  const triggerEl = React.isValidElement(trigger)
    ? React.cloneElement(trigger as React.ReactElement, {
        onClick: (e: React.MouseEvent) => {
          e.stopPropagation()
          setOpen(true)
          if ((trigger as any).props?.onClick) (trigger as any).props.onClick(e)
        },
      })
    : trigger

  return (
    <>
      {triggerEl}
      {open && (
        <div className="fixed inset-0 z-50">
          <div className="fixed inset-0 bg-black/50" onClick={() => setOpen(false)} />
          <div className="fixed left-1/2 top-1/2 z-50 w-full max-w-sm -translate-x-1/2 -translate-y-1/2 rounded-md border bg-white p-4 shadow-lg">
            <div className="mb-3">
              <h2 className="text-lg font-semibold">{title}</h2>
              <p className="mt-1 text-sm text-gray-600">{description}</p>
            </div>
            <div className="flex justify-end gap-2">
              <button
                className="px-3 py-1.5 text-sm rounded-md border border-gray-300 bg-white hover:bg-gray-50"
                onClick={() => setOpen(false)}
              >
                {cancelText}
              </button>
              <button
                className="px-3 py-1.5 text-sm rounded-md bg-red-600 text-white hover:bg-red-700"
                onClick={() => {
                  onConfirm()
                  setOpen(false)
                }}
              >
                {confirmText}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
