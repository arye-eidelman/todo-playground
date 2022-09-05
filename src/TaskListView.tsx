import React, { Fragment } from 'react'
import { TaskView } from './TaskView'
import { Task, TaskList, Store } from './types'
import { ReorderTasksDropZone } from './ReorderTasksDropZone'
import { TaskPreview } from './TaskPreview'

export const TaskListView = ({
  taskList,
  tasks,
  dragTaskId,
  dropTarget,
  setDropTarget,
  updateTaskList,
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
  createTask: (taskListId: TaskList['id'], title: string) => void,
  updateTask: (id: Task['id'], task: Partial<Task> | React.SetStateAction<Task>) => void,
  deleteTask: (id: Task['id']) => void,
  setDragTaskId: React.Dispatch<React.SetStateAction<string | undefined>>,
  drop: (endIndex: number) => void,
}) => {
  const { sortedTaskIds, newTaskTitle } = taskList

  return (
    <div className='mx-auto max-w-md'>
      <h3>{taskList.title}</h3>
      <ul className="list-none px-0 py-4">
        {sortedTaskIds.map((id, index) => (
          <Fragment key={id}>
            {dragTaskId && typeof tasks[dragTaskId].deletedAt !== 'string' &&
              <ReorderTasksDropZone
                index={index}
                hidden={id === dragTaskId || (index > 0 && sortedTaskIds[index - 1] === dragTaskId)}
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
            index={sortedTaskIds.length}
            hidden={sortedTaskIds.at(-1) === dragTaskId}
            isDropTarget={dropTarget === sortedTaskIds.length}
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
