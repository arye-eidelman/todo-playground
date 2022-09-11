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
  id,
  task,
  updateTask,
  deleteTask,
  dragTaskId,
  setDragTaskId
}: {
  id: Task['id'],
  task: Task,
  updateTask: (id: Task['id'], task: Partial<Task>) => void,
  deleteTask: (id: Task['id']) => void,
  dragTaskId: Task['id'] | undefined,
  setDragTaskId: (id?: Task['id']) => void
}) => {
  const [collapsed, setCollapsed] = useState(true)

  useEffect(() => {
    setCollapsed(false)
  }, [])

  return (
    <li
      id={id}
      className={`overflow-hidden transition-[height,opacity] duration-[200ms] box-border rounded-lg
      ${dragTaskId === id ? 'opacity-50' : 'opacity-100'}
      ${collapsed || task.deletedAt ? 'h-0' : 'h-12'}`
      }
    >
      <div className='py-2 space-x-2 flex items-center text-lg'>
        <input
          type="checkbox"
          className='w-6 h-6'
          title={`Mark ${task.completed ? 'un' : ''}completed task '${shortTitle(task.title)}'`}
          checked={task.completed}
          onChange={e => updateTask(id, { completed: e.target.checked })}
        />
        <input
          type="text"
          className='w-full text-sm py-1 px-2'
          title="title"
          value={task.title}
          onChange={e => updateTask(id, { title: e.target.value })}
        />
        <button
          className='bg-transparent border-0 text-lg'
          title={`Trash task '${shortTitle(task.title)}'`}
          onClick={() => deleteTask(id)}>
          🗑
        </button>
        <span
          className='text-lg'
          draggable
          onDragStart={(e) => setDragTaskId(id)}
          onDragEnd={() => setDragTaskId()}
        >⋮⋮⋮</span>
      </div>
    </li>
  )
}
