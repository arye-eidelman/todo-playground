import { useState } from 'react'
import { ModalDialog } from './ModalDialog'
import { colors, styles } from './styles'
import { TaskList } from './types'

const capitalize = (string: string) => string.length ? string[0].toUpperCase() + string.slice(1) : ""

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
  const [themeColor, setThemeColor] = useState(initialState.themeColor ?? colors[Math.floor(Math.random() * colors.length)])

  const themeColorChangeHandeler = (e: any) => {
    setThemeColor(e.target.value)
  }

  return (
    <ModalDialog
      className='w-full max-w-md backdrop:bg-neutral-500/50'
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
        <fieldset className='text-justify'>
          <legend>Theme Color</legend>

          {colors.map(color => {
            const selected = themeColor === color
            return (
              <label
                tabIndex={0}
                key={color}
                title={capitalize(color)}
                className={`inline-block m-1 h-10 w-10 rounded-full border-4 border-solid
                  ${styles.bg[color]['200']}
                  ${styles.text[color]['900']}
                  ${selected ? ` ${styles.border[color]['500']}` : ' border-white border-opacity-0'}
                `}
              >
                <input type="radio" className='hidden' name="color" value={color} checked={selected} onChange={themeColorChangeHandeler} />
              </label>
            )
          })}
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
            disabled={!title.length}
          >
            <span>✔</span>
          </button>
        </div>
      </form>
    </ModalDialog>
  )
}