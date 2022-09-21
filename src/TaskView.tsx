import { useEffect, useState } from 'react'
import { Task } from './types'

function shortTitle(title: string) {
  const length = 25
  if (title.length <= length) {
    return title
  }
  return title.slice(0, title.lastIndexOf(' ', length - 4)) + ' ...'
}

export const TaskView = ({
  task,
  updateTask,
  deleteTask,
  dragTaskId,
  setDragTaskId
}: {
  task: Task,
  updateTask: (id: Task['id'], task: Partial<Task>) => void,
  deleteTask: (id: Task['id']) => void,
  dragTaskId: Task['id'] | undefined,
  setDragTaskId: (id?: Task['id']) => void
}) => {
  const id = task.id
  const [collapsed, setCollapsed] = useState(true)

  useEffect(() => {
    setCollapsed(false)
  }, [])

  return (
    <li
      id={id}
      className={
        `overflow-hidden transition-[height,opacity] duration-[200ms] box-border rounded-lg
        border-0 border-b border-solid border-gray-200 shadow mb-2 bg-white
        ${dragTaskId === id ? 'opacity-50' : 'opacity-100'}
        ${collapsed || task.deletedAt ? 'h-0' : 'h-12'}`
      }
    >
      <div className='space-x-1 flex items-center text-lg m-2'>


        <input
          type="checkbox"
          // set the min width to the width so it doesn't shrink due to the flex
          // or be misaligned due to a div wrapper
          className='w-4 h-4 m-1 mr-2 min-w-[1rem]'
          title={`Mark ${task.completed ? 'un' : ''}completed task '${shortTitle(task.title)}'`}
          checked={task.completed}
          onChange={e => updateTask(id, { completed: e.target.checked })}
        />

        <div className='w-full'>
          <input
            type="text"
            className='w-full text-sm py-1 px-2 box-border'
            title="title"
            value={task.title}
            onChange={e => updateTask(id, { title: e.target.value })}
          />
        </div>

        <div>
          <button
            className='subtle-button'
            title={`Trash task '${shortTitle(task.title)}'`}
            onClick={() => deleteTask(id)}
          >
            🗑
          </button>
        </div>

        <div>
          <div
            className='cursor-move px-1'
            title='Drag here to reorder'
            draggable
            onDragStart={() => setDragTaskId(id)}
            onDragEnd={() => setDragTaskId()}
          >
            ⋮⋮
          </div>
        </div>
      </div>
    </li >
  )
}
