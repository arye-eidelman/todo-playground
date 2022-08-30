export const ReorderTasksDropZone = ({
  index,
  hidden,
  isDropTarget,
  setDropTarget,
  drop,
  children
}: {
  index: number,
  hidden: boolean,
  isDropTarget: boolean,
  setDropTarget: (index?: number) => void
  drop: (index: number) => void,
  children?: React.ReactNode
}) => {
  return (
    <div
      hidden={hidden}
      className={'my-[-1.375rem] h-11 z-100 relative transition-opacity duration-100 ' + (isDropTarget ? 'opacity-100' : 'opacity-0')}
      onDrop={e => { e.preventDefault(); drop(index) }}
      onDragEnter={e => { e.preventDefault(); setDropTarget(index) }}
      onDragOver={e => { e.preventDefault(); setDropTarget(index) }}
      onDragLeave={e => { e.preventDefault(); setDropTarget(undefined) }}
    >
      {children}
    </div>
  )
}