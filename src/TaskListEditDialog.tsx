import { useState } from 'react'
import { ModalDialog } from './ModalDialog'
import { TaskList } from './types'

export const TaskListEditDialog = ({
  isNew,
  initialState = {},
  onSubmit,
  onCancel
}: {
  isNew: boolean
  initialState?: Partial<TaskList>
  onSubmit: (updatedState: Partial<TaskList>) => void,
  onCancel: () => void
}) => {

  const [title, setTitle] = useState(initialState.title ?? "")

  return (
    <ModalDialog
      className='w-full max-w-md backdrop:bg-neutral-500/50'
      onClose={() => onCancel()}
    >
      <form onSubmit={e => {
        e.preventDefault()
        onSubmit({ title })
      }}>
        <h2>{isNew ? "Create" : "Edit"} Task List</h2>
        <input
          type="text"
          className='box-border w-full text-xl py-1 px-2'
          value={title}
          onChange={e => setTitle(e.target.value)}
          autoFocus
        />
        <div className='flex justify-end mt-4 gap-2' >
          <button
            type="button"
            className='bg-transparent border-0 text-2xl w-10 h-10 flex justify-center items-center'
            title="Cancel"
            onClick={e => {
              e.preventDefault()
              onCancel()
            }}>
            <span>✖</span>
          </button>
          <button
            type="submit"
            title={isNew ? "Create Task List" : "Save Changes"}
            className='bg-transparent border-0 text-2xl w-10 h-10 flex justify-center items-center'
            disabled={!title.length}
          >
            <span>✔</span>
          </button>
        </div>
      </form>
    </ModalDialog>
  )
}