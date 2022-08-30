export const ReorderTasksDropZone = ({
  index,
  hidden,
  isUnderDrag,
  setIsUnderDrag,
  putDown,
  children
}: {
  index: number,
  hidden: boolean,
  isUnderDrag: boolean,
  setIsUnderDrag: (index?: number) => void
  putDown: (index: number) => void,
  children?: React.ReactNode
}) => {
  return (
    <div
      hidden={hidden}
      className={'-my-5 z-100 relative h-10 rounded-lg' + (isUnderDrag ? ' bg-gray-200' : '')}
      onDrop={e => { e.preventDefault(); putDown(index) }}
      onDragEnter={e => { e.preventDefault(); setIsUnderDrag(index) }}
      onDragOver={e => { e.preventDefault(); setIsUnderDrag(index) }}
      onDragLeave={e => { e.preventDefault(); setIsUnderDrag(undefined) }}
    >
      {isUnderDrag && children}
    </div>
  )
}