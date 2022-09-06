import { useState } from 'react'
import { useLocalStore } from './hooks'
import { TaskListView } from './TaskListView'
import { Task, TaskList, Store } from './types'

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
function newTaskListTemplate(taskList: Partial<TaskList> = {}): TaskList {
  return {
    id: uniqueId(),
    title: "New List",
    sortedTaskIds: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    newTaskTitle: "",
    ...taskList
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
  const { tasks, taskLists, sortedTaskListIds } = store


  // drag 'n drop
  const [dragTaskId, setDragTaskId] = useState<Task['id']>()
  const [dropTarget, setDropTarget] = useState<number>()
  const inDragMode = typeof dragTaskId !== "undefined"


  // task lists
  const nonDeletedSortedTaskListIds = sortedTaskListIds.filter(id => !taskLists[id].deletedAt)
  const [selectedTaskListId, setSelectedTaskListIId] = useState(nonDeletedSortedTaskListIds[0])
  if (!selectedTaskListId) {
    return null
  }
  const selectedTaskList = taskLists[selectedTaskListId]
  const { sortedTaskIds } = selectedTaskList


  function createTaskList() {
    const taskList = newTaskListTemplate()
    updateStore({
      ...store,
      taskLists: { ...taskLists, [taskList.id]: taskList },
      sortedTaskListIds: [...sortedTaskListIds, taskList.id]
    })
  }

  function updateTaskList(id: TaskList['id'], taskList: Partial<TaskList> | React.SetStateAction<TaskList>) {
    updateStore(store => ({
      ...store, taskLists: {
        ...store.taskLists, [id]: {
          ...store.taskLists[id],
          ...(typeof taskList === "function" ? taskList(store.taskLists[id]) : taskList),
          updatedAt: new Date().toISOString()
        }
      }
    }))
  }

  function deleteTaskList(id: TaskList['id']) {
    const newTaskList = newTaskListTemplate({ title: "Tasks" })
    const addTask = sortedTaskListIds.length === 1
    updateStore({
      ...store,
      taskLists: {
        ...taskLists,
        [id]: { ...taskLists[id], deletedAt: new Date().toISOString() },
        ...(addTask ? { [newTaskList.id]: newTaskList } : {})
      },
      sortedTaskListIds: [...sortedTaskListIds, ...(addTask ? [newTaskList.id] : [])]
    })
    setTimeout(() => {
      updateStore((store) => {
        const nextTaskLists = { ...store.taskLists }
        delete nextTaskLists[id]
        const nextSortedTaskListids = store.sortedTaskListIds.filter(taskListId => taskListId !== id)

        return { ...store, taskLists: nextTaskLists, sortedTaskListIds: nextSortedTaskListids }
      })
    }, 1500);
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
          [selectedTaskList.id]: {
            ...selectedTaskList,
            sortedTaskIds: nextSortedTaskIds
          }
        }
      })
      setDragTaskId(undefined)
      setDropTarget(undefined)
    }
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

  const updateTask = (id: Task['id'], task: Partial<Task> | React.SetStateAction<Task>) => {
    updateStore(store => ({
      ...store, tasks: {
        ...store.tasks, [id]: {
          ...store.tasks[id],
          ...(typeof task === "function" ? task(store.tasks[id]) : task),
          updatedAt: new Date().toISOString()
        }
      }
    }))
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
          ...store, tasks: nextTasks,
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

      <main>
        {nonDeletedSortedTaskListIds.map(taskListId =>
          <button
            key={taskListId}
            onClick={() => setSelectedTaskListIId(taskListId)}
            className={taskListId === selectedTaskListId ? "font-bold" : ""}
          >
            {taskLists[taskListId].title}
          </button>
        )}

        <button onClick={createTaskList}>
          +
        </button>

        <TaskListView {...{
          taskList: selectedTaskList,
          inDragMode,
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
        }}
        />
      </main>

      <footer>
        <p>A basic to-do app to act as a testbed to learn and showcase my software development skills. Some feature ideas include reminders, analytics, login, oAuth login, drag and drop reorder, Trash (soft delete), views (overdue, due today, due this week, completed, trashed).</p>
      </footer>
    </div>
  )
}

export default App
