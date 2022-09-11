import React, { useEffect, useRef } from 'react'

export const ModalDialog = ({ open = true, ...dialogProps }: React.DetailedHTMLProps<React.DialogHTMLAttributes<HTMLDialogElement>, HTMLDialogElement>) => {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    if (ref.current && open !== ref.current.open) {
      open
        ? ref.current.showModal()
        : ref.current.close()
    }
  }, [open])

  return <dialog {...dialogProps} ref={ref} />
}