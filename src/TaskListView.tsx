import { Fragment, useState } from 'react'
import { TaskView } from './TaskView'
import { Task, TaskList, Store } from './types'
import { ReorderTasksDropZone } from './ReorderTasksDropZone'
import { TaskPreview } from './TaskPreview'
import { ModalDialog } from './ModalDialog'

export const TaskListView = ({
  taskList,
  tasks,
  dragTaskId,
  dropTarget,
  setDropTarget,
  updateTaskList,
  deleteTaskList,
  createTask,
  updateTask,
  deleteTask,
  setDragTaskId,
  drop,
}: {
  taskList: TaskList,
  tasks: Store["tasks"],
  dragTaskId?: string,
  dropTarget?: number,
  setDropTarget: React.Dispatch<React.SetStateAction<number | undefined>>,
  updateTaskList: (id: TaskList['id'], taskList: Partial<TaskList> | React.SetStateAction<TaskList>) => void,
  deleteTaskList: (id: TaskList['id']) => void,
  createTask: (taskListId: TaskList['id'], title: string) => void,
  updateTask: (id: Task['id'], task: Partial<Task> | React.SetStateAction<Task>) => void,
  deleteTask: (id: Task['id']) => void,
  setDragTaskId: React.Dispatch<React.SetStateAction<string | undefined>>,
  drop: (endIndex: number) => void,
}) => {
  const { tasksSortIndex, newTaskTitle } = taskList
  const [editMode, setEditMode] = useState(false)
  const [tempTitle, setTempTitle] = useState(taskList.title)

  return (
    <div className='mx-auto max-w-md'>
      <div className='flex justify-between'>
        <h3>{taskList.title}</h3>
        <div>
          <button
            className='bg-transparent border-0 text-lg'
            title={`Edit task-list '${taskList.title}'`}
            onClick={() => setEditMode(!editMode)}>
            ✎
          </button>
          <button
            className='bg-transparent border-0 text-lg'
            title={`Edit task-list '${taskList.title}'`}
            onClick={() => deleteTaskList(taskList.id)}>
            🗑
          </button>
        </div>
      </div>
      <ModalDialog open={editMode}
        className='w-full max-w-md backdrop:bg-neutral-500/50'
        onClose={() => setEditMode(false)}
      >
        <form onSubmit={e => {
          e.preventDefault()
          updateTaskList(taskList.id, { title: tempTitle })
          setEditMode(false)
        }}>
          <h2>Edit Task List</h2>
          <input
            type="text"
            className='box-border w-full text-xl py-1 px-2'
            value={tempTitle}
            onChange={e => setTempTitle(e.target.value)}
            autoFocus
          />
          <div className='flex justify-end mt-4 gap-2'>
            <button
              type="button"
              className='bg-transparent border-0 text-2xl w-10 h-10 flex justify-center items-center'
              title="Cancel"
              onClick={e => {
                e.preventDefault()
                setTempTitle(taskList.title)
                setEditMode(false)
              }}>
              <span>✖</span>
            </button>
            <button type="submit" className='bg-transparent border-0 text-2xl w-10 h-10 flex justify-center items-center'>
              <span>✔</span>
            </button>
          </div>
        </form>
      </ModalDialog>
      <ul className="list-none px-0 py-4">
        {tasksSortIndex.map((id, index) => (
          <Fragment key={id}>
            {dragTaskId && typeof tasks[dragTaskId].deletedAt !== 'string' &&
              <ReorderTasksDropZone
                index={index}
                hidden={id === dragTaskId || (index > 0 && tasksSortIndex[index - 1] === dragTaskId)}
                isDropTarget={dropTarget === index}
                setDropTarget={setDropTarget}
                drop={drop}
              >
                <TaskPreview task={tasks[dragTaskId] as Task} />
              </ReorderTasksDropZone>
            }
            <TaskView
              id={id}
              task={tasks[id]}
              updateTask={updateTask}
              deleteTask={deleteTask}
              dragTaskId={dragTaskId}
              setDragTaskId={setDragTaskId}
            />
          </Fragment>
        ))}

        {dragTaskId &&
          <ReorderTasksDropZone
            index={tasksSortIndex.length}
            hidden={tasksSortIndex.at(-1) === dragTaskId}
            isDropTarget={dropTarget === tasksSortIndex.length}
            setDropTarget={setDropTarget}
            drop={drop}
          >
            <TaskPreview task={tasks[dragTaskId] as Task} />
          </ReorderTasksDropZone>
        }

        <li key="new-item" className='my-3 space-x-2 flex items-baseline text-lg sticky bottom-2'>
          <input
            type="text"
            className='w-full text-lg py-1 px-2'
            title="New task-item title"
            placeholder='Enter task here and hit enter'
            value={taskList.newTaskTitle}
            onChange={e => updateTaskList(taskList.id, { ...taskList, newTaskTitle: e.target.value })}
            onKeyDown={e => {
              if (e.key === "Enter" && newTaskTitle.length > 0) {
                createTask(taskList.id, newTaskTitle)
              }
            }}
          />
        </li>
      </ul>
    </div>
  )
}
