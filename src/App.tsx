import { useState } from 'react'
import { useLocalStore } from './hooks'
import { ModalDialog } from './ModalDialog'
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
    tasksSortIndex: [],
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
        tasksSortIndex: [],
        newTaskTitle: "",
      }
    },
    taskListsSortIndex: ["1"],
    newTaskListTitle: ""
  })

  // tasks
  const { tasks, taskLists, taskListsSortIndex } = store


  // drag 'n drop
  const [dragTaskId, setDragTaskId] = useState<Task['id']>()
  const [dropTarget, setDropTarget] = useState<number>()
  const inDragMode = typeof dragTaskId !== "undefined"

  // new task list
  const [showNewTaskDialog, setShowNewTaskDialog] = useState(false)
  const [tempTitle, setTempTitle] = useState("")

  // task lists
  const nonDeletedtaskListsSortIndex = taskListsSortIndex.filter(id => !taskLists[id].deletedAt)
  const [selectedTaskListId, setSelectedTaskListIId] = useState(nonDeletedtaskListsSortIndex[0])
  if (!selectedTaskListId) {
    return null
  }
  const selectedTaskList = taskLists[selectedTaskListId]
  const { tasksSortIndex } = selectedTaskList



  function createTaskList(partialTaskList?: Partial<TaskList>) {
    const taskList = newTaskListTemplate(partialTaskList)
    updateStore({
      ...store,
      taskLists: { ...taskLists, [taskList.id]: taskList },
      taskListsSortIndex: [...taskListsSortIndex, taskList.id]
    })
    setSelectedTaskListIId(taskList.id)
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
    const addTask = nonDeletedtaskListsSortIndex.length === 1
    if (selectedTaskListId === id) {
      setSelectedTaskListIId(addTask ? newTaskList.id : nonDeletedtaskListsSortIndex.filter(prevId => prevId !== id)[0])
    }
    updateStore({
      ...store,
      taskLists: {
        ...taskLists,
        [id]: { ...taskLists[id], deletedAt: new Date().toISOString() },
        ...(addTask ? { [newTaskList.id]: newTaskList } : {})
      },
      taskListsSortIndex: [...taskListsSortIndex, ...(addTask ? [newTaskList.id] : [])]
    })
    setTimeout(() => {
      updateStore((store) => {
        const nextTaskLists = { ...store.taskLists }
        delete nextTaskLists[id]
        const nexttaskListsSortIndex = store.taskListsSortIndex.filter(taskListId => taskListId !== id)

        return { ...store, taskLists: nextTaskLists, taskListsSortIndex: nexttaskListsSortIndex }
      })
    }, 1500);
  }

  const drop = (endIndex: number) => {
    if (typeof dragTaskId !== "undefined") {
      let nextSortKey
      if (endIndex === 0) {
        nextSortKey = tasks[tasksSortIndex[endIndex]].sortKey - 1
      } else if (endIndex === tasksSortIndex.length) {
        nextSortKey = tasks[tasksSortIndex[endIndex - 1]].sortKey + 1
      } else {
        nextSortKey = (tasks[tasksSortIndex[endIndex]].sortKey + tasks[tasksSortIndex[endIndex - 1]].sortKey) / 2
      }

      const startIndex = tasksSortIndex.indexOf(dragTaskId)
      const nexttasksSortIndex = [...tasksSortIndex]
      if (endIndex < startIndex) {
        nexttasksSortIndex.splice(startIndex, 1)
        nexttasksSortIndex.splice(endIndex, 0, dragTaskId)
      } else {
        nexttasksSortIndex.splice(endIndex, 0, dragTaskId)
        nexttasksSortIndex.splice(startIndex, 1)
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
            tasksSortIndex: nexttasksSortIndex
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
          tasksSortIndex: [...taskLists[taskListId].tasksSortIndex, newTask.id],
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
              tasksSortIndex: taskList.tasksSortIndex.filter(taskId => taskId !== id)
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
        {nonDeletedtaskListsSortIndex.map(taskListId =>
          <button
            key={taskListId}
            onClick={() => setSelectedTaskListIId(taskListId)}
            className={taskListId === selectedTaskListId ? "font-bold" : ""}
          >
            {taskLists[taskListId].title}
          </button>
        )}

        <button onClick={() => setShowNewTaskDialog(true)}>
          +
        </button>

        {<ModalDialog open={showNewTaskDialog}
          className='w-full max-w-md backdrop:bg-neutral-500/50'
          onClose={() => setShowNewTaskDialog(false)}
        >
          <form onSubmit={e => {
            e.preventDefault()
            createTaskList({title: tempTitle})
            setTempTitle("")
            setShowNewTaskDialog(false)
          }}>
            <h2>Create Task List</h2>
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
                  setTempTitle("")
                  setShowNewTaskDialog(false)
                }}>
                <span>✖</span>
              </button>
              <button type="submit" className='bg-transparent border-0 text-2xl w-10 h-10 flex justify-center items-center'>
                <span>✔</span>
              </button>
            </div>
          </form>
        </ModalDialog>
        }

        <TaskListView key={selectedTaskList.id} {...{
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
