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
  inDragMode,
  dragId,
  pickUp,
  cancelDrag
}: {
  id: string,
  task: Task,
  updateTask: (id: string, task: Partial<Task>) => void,
  deleteTask: (id: string) => void,
  inDragMode?: boolean,
  dragId?: string,
  pickUp: (id: string) => void,
  cancelDrag: () => void
}) => {
  const thisIsBeingDragged = inDragMode && id === dragId
  return (
    <li
      id={'li_' + id ?? task.id}
    >
      <div
        id={'Task_' + id ?? task.id}
        className={'Task py-2 space-x-2 flex items-baseline text-lg rounded-lg' + (thisIsBeingDragged ? ' opacity-25' : '')}
      >
        <input
          type="checkbox"
          title={`Mark ${task.completed ? 'un' : ''}completed task-item '${shortTitle(task.title)}'`}
          checked={task.completed}
          onChange={e => updateTask(id, { completed: e.target.checked })}
        />
        <input
          type="text"
          className='w-full text-sm py-1 px-2'
          title="Task-item title"
          value={task.title}
          onChange={e => updateTask(id, { title: e.target.value })}
        />
        <button
          className='bg-transparent border-0 text-lg'
          title={`Trash task-item '${shortTitle(task.title)}'`}
          onClick={() => deleteTask(id)}>
          🗑
        </button>
        <span
          className='TaskDragHandle text-lg'
          draggable
          onDragStart={(e) => pickUp(id)}
          onDragEnd={() => cancelDrag()}
        >⋮⋮⋮</span>
      </div>
    </li>
  )
}
