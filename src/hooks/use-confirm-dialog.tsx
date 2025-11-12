'use client'

import { useState } from 'react'

interface ConfirmOptions {
  title: string
  description: string
  confirmText?: string
  cancelText?: string
  variant?: 'default' | 'destructive'
}

export function useConfirmDialog() {
  const [isOpen, setIsOpen] = useState(false)
  const [options, setOptions] = useState<ConfirmOptions>({
    title: '',
    description: '',
  })
  const [onConfirmCallback, setOnConfirmCallback] = useState<(() => void) | null>(null)

  const confirm = (opts: ConfirmOptions): Promise<boolean> => {
    return new Promise((resolve) => {
      setOptions(opts)
      setIsOpen(true)

      setOnConfirmCallback(() => () => {
        setIsOpen(false)
        resolve(true)
      })
    })
  }

  const handleCancel = () => {
    setIsOpen(false)
  }

  const handleConfirm = () => {
    if (onConfirmCallback) {
      onConfirmCallback()
    }
  }

  return {
    isOpen,
    options,
    confirm,
    handleCancel,
    handleConfirm,
    setIsOpen,
  }
}
