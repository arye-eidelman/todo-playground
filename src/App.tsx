import { Fragment, useState } from 'react'
import { useLocalStore } from './hooks'
import { TaskView } from './TaskView'
import { Task, TaskList, Store } from './types'
import { ReorderTasksDropZone } from './ReorderTasksDropZone'
import { TaskPreview } from './TaskPreview'

function uniqueId() {
  return Date.now().toString()
}

function newTaskTemplate(taskListId: TaskList['id'], task: Partial<Task>): Task {
  return {
    taskListId,
    id: uniqueId(),
    title: "",
    completed: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    sortKey: Date.now(),
    ...task
  }
}

function App() {
  const [store, updateStore] = useLocalStore<Store>({
    tasks: {},
    taskLists: {
      "1": {
        id: "1",
        title: "Tasks",
        sortedTaskIds: [],
        newTaskTitle: "",
      }
    },
    sortedTaskListIds: ["1"],
    newTaskListTitle: ""
  })

  // tasks
  const { tasks, taskLists } = store

  // task lists
  const defaultTaskListId = store.sortedTaskListIds[0]
  const defaultTaskList = store.taskLists[defaultTaskListId]
  const { sortedTaskIds, newTaskTitle } = defaultTaskList

  // drag 'n drop
  const [dragTaskId, setDragTaskId] = useState<Task['id']>()
  const [dropTarget, setDropTarget] = useState<number>()
  const inDragMode = typeof dragTaskId !== "undefined"


  function updateTaskList(id: TaskList['id'], taskList: Partial<TaskList> | React.SetStateAction<TaskList>) {

    updateStore(store => ({
      ...store, taskLists: {
        ...store.taskLists, [id]: {
          ...store.taskLists[id], ...(
            typeof taskList === "function" ? taskList(store.taskLists[id]) : taskList
          )
        }
      }
    }))
  }

  const drop = (endIndex: number) => {
    if (typeof dragTaskId !== "undefined") {
      let nextSortKey
      if (endIndex === 0) {
        nextSortKey = tasks[sortedTaskIds[endIndex]].sortKey - 1
      } else if (endIndex === sortedTaskIds.length) {
        nextSortKey = tasks[sortedTaskIds[endIndex - 1]].sortKey + 1
      } else {
        nextSortKey = (tasks[sortedTaskIds[endIndex]].sortKey + tasks[sortedTaskIds[endIndex - 1]].sortKey) / 2
      }

      const startIndex = sortedTaskIds.indexOf(dragTaskId)
      const nextSortedTaskIds = [...sortedTaskIds]
      if (endIndex < startIndex) {
        nextSortedTaskIds.splice(startIndex, 1)
        nextSortedTaskIds.splice(endIndex, 0, dragTaskId)
      } else {
        nextSortedTaskIds.splice(endIndex, 0, dragTaskId)
        nextSortedTaskIds.splice(startIndex, 1)
      }

      updateStore({
        ...store,
        tasks: {
          ...tasks,
          [dragTaskId]: {
            ...tasks[dragTaskId],
            sortKey: nextSortKey
          }
        },
        taskLists: {
          ...taskLists,
          [defaultTaskList.id]: {
            ...defaultTaskList,
            sortedTaskIds: nextSortedTaskIds
          }
        }
      })
      setDragTaskId(undefined)
      setDropTarget(undefined)
    }
  }
  const updateTask = (id: Task['id'], task: Partial<Task> | React.SetStateAction<Task>) => {
    updateStore(store => ({
      ...store, tasks: {
        ...store.tasks, [id]: {
          ...store.tasks[id], ...(
            typeof task === "function" ? task(store.tasks[id]) : task
          )
        }
      }
    }))
  }

  const createTask = (taskListId: TaskList['id'], title: string) => {
    const newTask = newTaskTemplate(taskListId, { title })
    updateStore({
      ...store,
      tasks: { ...tasks, [newTask.id]: { ...newTask } },
      taskLists: {
        ...taskLists,
        [taskListId]: {
          ...taskLists[taskListId],
          sortedTaskIds: [...taskLists[taskListId].sortedTaskIds, newTask.id],
          newTaskTitle: ""
        }
      }
    })
  }

  const deleteTask = (id: Task['id']) => {
    // soft delete now and hard delete after the animation completes
    updateStore({ ...store, tasks: { ...tasks, [id]: { ...tasks[id], deletedAt: new Date().toISOString() } } })
    setTimeout(() => {
      updateStore((store) => {
        setDragTaskId(dragTaskId => dragTaskId && store.tasks[dragTaskId].deletedAt ? undefined : dragTaskId)
        const nextTasks = { ...store.tasks }
        delete nextTasks[id]
        const taskListId = store.tasks[id].taskListId
        const taskList = store.taskLists[taskListId]
        return {
          ...store,
          tasks: nextTasks,
          taskLists: {
            ...store.taskLists,
            [taskListId]: {
              ...taskList,
              sortedTaskIds: taskList.sortedTaskIds.filter(taskId => taskId !== id)
            }
          }
        }
      })
    }, 1500);
  }
  return (
    <div className="mx-auto max-w-xl">
      <header>
        <h1>ToDo Playground</h1>
      </header>
      <hr />

      <main className='mx-auto max-w-md'>
        <h3>{defaultTaskList.title}</h3>
        <ul className="list-none px-0 py-4">
          {sortedTaskIds.map((id, index) => (
            <Fragment key={id}>
              {inDragMode && typeof tasks[dragTaskId].deletedAt !== 'string' &&
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

          {inDragMode &&
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
              value={defaultTaskList.newTaskTitle}
              onChange={e => updateTaskList(defaultTaskListId, { ...defaultTaskList, newTaskTitle: e.target.value })}
              onKeyDown={e => {
                if (e.key === "Enter" && newTaskTitle.length > 0) {
                  createTask(defaultTaskListId, newTaskTitle)
                }
              }}
            />
          </li>
        </ul>
      </main>

      <footer>
        <p>A basic to-do app to act as a testbed to learn and showcase my software development skills. Some feature ideas include reminders, analytics, login, oAuth login, drag and drop reorder, Trash (soft delete), views (overdue, due today, due this week, completed, trashed).</p>
      </footer>
    </div>
  )
}

export default App
