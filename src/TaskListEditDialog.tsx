import { useState } from 'react'
import { ModalDialog } from './ModalDialog'
import { ColorWheel } from './ColorWheel'
import { TaskList } from './types'
import { themedStyle } from './utils'

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
  const [themeColor, setThemeColor] = useState(initialState.themeColor)

  return (
    <ModalDialog
      className='w-full max-w-xl backdrop:bg-neutral-500/50 box-border'
      onClose={() => onCancel()}
    >
      <form onSubmit={e => {
        e.preventDefault()
        onSubmit({ title, themeColor })
      }}>
        <h2>{isNew ? "Create new" : "Edit"} task list</h2>
        <label>
          Title
          <input
            type="text"
            className='box-border w-full text-xl py-1 px-2'
            value={title}
            onChange={e => setTitle(e.target.value)}
            autoFocus
          />
        </label>
        <fieldset className={`
          m-0 border-4 outline-none border-solid
          ${themedStyle('bg', themeColor, '100')}
          ${themedStyle('border', themeColor, '800')}
        `}>
          <legend className={themedStyle('text', themeColor, '800')}>Theme Color</legend>
          <ColorWheel className="mx-auto my-2 w-48 sm:w-64 md:w-96 transition-all" value={themeColor} onChange={(newColor) => setThemeColor(newColor)} />
        </fieldset>
        <div className='flex justify-end mt-4 gap-2' >
          <button
            type="button"
            className='subtle-button text-2xl w-10 h-10'
            title="Cancel"
            onClick={e => {
              e.preventDefault()
              onCancel()
            }}>
            <span>✖</span>
          </button>
          <button
            type="submit"
            title={isNew ? "Create New Task List" : "Save Changes"}
            className='subtle-button text-2xl w-10 h-10'
            disabled={!title.length || !themeColor}
          >
            <span>✔</span>
          </button>
        </div>
      </form>
    </ModalDialog>
  )
}