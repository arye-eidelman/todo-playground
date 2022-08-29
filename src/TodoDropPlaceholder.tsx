import React from 'react'

export const TodoDropPlaceholder = ({
  index,
  hidden,
  isUnderDrag,
  setIsUnderDrag,
  putDown,
}: {
  index: number,
  hidden: boolean,
  isUnderDrag: boolean,
  setIsUnderDrag: (index?: number) => void
  putDown: (index: number) => void,
}) => {
  return (
    <div
      hidden={hidden}
      className={'-my-5 z-100 relative h-10 rounded-lg' + (isUnderDrag ? ' bg-gray-200/90' : '')}
      onDrop={e => { e.preventDefault(); putDown(index) }}
      onDragEnter={e => { e.preventDefault(); setIsUnderDrag(index) }}
      onDragOver={e => { e.preventDefault(); setIsUnderDrag(index) }}
      onDragLeave={e => { e.preventDefault(); setIsUnderDrag(undefined) }}
    ></div>
  )
}