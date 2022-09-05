import React, { useEffect, useRef } from 'react'

interface dialogProps extends React.DetailedHTMLProps<React.DialogHTMLAttributes<HTMLDialogElement>, HTMLDialogElement> {
  showModel?: boolean
}
export const ModalDialog = ({ open, ...dialogProps }: dialogProps) => {
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