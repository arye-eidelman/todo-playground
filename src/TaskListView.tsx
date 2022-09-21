import { Fragment, useState } from 'react'
import { TaskView } from './TaskView'
import { Task, TaskList, Store } from './types'
import { ReorderTasksDropZone } from './ReorderTasksDropZone'
import { TaskPreview } from './TaskPreview'
import { TaskListEditDialog } from './TaskListEditDialog'

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

  return (
    <div className='p-2 max-w-md'>
      <div className='flex justify-between'>
        <h1 className='mb-0 text-xl'>{taskList.title}</h1>
        <div>
          <button
            className='subtle-button'
            title={`Edit task-list '${taskList.title}'`}
            onClick={() => setEditMode(!editMode)}>
            ✎
          </button>
          <button
            className='subtle-button'
            title={`Delete task-list '${taskList.title}'`}
            onClick={() => deleteTaskList(taskList.id)}>
            🗑
          </button>
        </div>
      </div>
      {editMode &&
        <TaskListEditDialog
          isNew={false}
          initialState={taskList}
          onSubmit={(updatedState) => {
            updateTaskList(taskList.id, updatedState)
            setEditMode(false)
          }}
          onCancel={() => setEditMode(false)}
        />
      }
      <ul className="list-none px-0 pb-4">
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

        <li key="new-item" className='p-2 space-x-2 flex items-baseline text-lg sticky bottom-0 bg-white'>
          <input
            type="text"
            className='w-full text-lg py-1 px-2 box-border '
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
