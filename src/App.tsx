import { useState } from 'react'
import { useLocalStore } from './hooks'
import { TaskListView } from './TaskListView'
import { TaskListEditDialog } from './TaskListEditDialog'
import { Task, TaskList, Store } from './types'
import { v4 as uuidv4 } from 'uuid';

function newTaskTemplate(taskListId: TaskList['id'], task: Partial<Task>): Task {
  return {
    taskListId,
    id: uuidv4(),
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
    id: uuidv4(),
    title: "New List",
    tasksSortIndex: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    newTaskTitle: "",
    ...taskList
  }
}

function App() {
  const [store, updateStore] = useLocalStore<Store>(() => {
    const taskList = newTaskListTemplate({ title: "To Do Playground feature list" })
    const tasks = [
      newTaskTemplate(taskList.id, { completed: true, title: "Welcome 👋, Thanks for giving To Do Playground a try" }),
      newTaskTemplate(taskList.id, { completed: true, title: "Support multple task lists" }),
      newTaskTemplate(taskList.id, { completed: true, title: "Drag and drop to reorder tasks on desktop" }),
      newTaskTemplate(taskList.id, { completed: false, title: "Drag and drop to reorder tasks on mobile" }),
      newTaskTemplate(taskList.id, { completed: false, title: "Drag and drop to move tasks between lists" }),
      newTaskTemplate(taskList.id, { completed: true, title: "Create this intro" }),
      newTaskTemplate(taskList.id, { completed: true, title: "Animate the creation and deletion of tasks" }),
      newTaskTemplate(taskList.id, { completed: false, title: "Design three pane layout for tasks lists menu, tasks list, and advanced task options" }),
      newTaskTemplate(taskList.id, { completed: false, title: "Create right task context menu (right click/long-press/⋮)." }),
    ]
    taskList.tasksSortIndex = tasks.map(t => t.id)
    return {
      version: "0.1.0",
      tasks: tasks.reduce<Store['tasks']>((tasks, task) => { tasks[task.id] = task; return tasks }, {}),
      taskLists: { [taskList.id]: taskList },
      taskListsSortIndex: [taskList.id]
    }
  })

  // tasks
  const { tasks, taskLists, taskListsSortIndex } = store

  // drag 'n drop
  const [dragTaskId, setDragTaskId] = useState<Task['id']>()
  const [dropTarget, setDropTarget] = useState<number>()
  const inDragMode = typeof dragTaskId !== "undefined"

  // new task list
  const [showNewTaskDialog, setShowNewTaskDialog] = useState(false)

  // task list
  const nonDeletedtaskListsSortIndex = taskListsSortIndex.filter(id => !taskLists[id].deletedAt)
  const [selectedTaskListId, setSelectedTaskListIId] = useState(nonDeletedtaskListsSortIndex[0])
  if (!selectedTaskListId || !taskListsSortIndex.includes(selectedTaskListId)) {
    setSelectedTaskListIId(taskListsSortIndex.filter(id => !taskLists[id].deletedAt)[0])
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

        {showNewTaskDialog &&
          <TaskListEditDialog
            isNew
            onSubmit={(updatedState) => {
              createTaskList(updatedState)
              setShowNewTaskDialog(false)
            }}
            onCancel={() => setShowNewTaskDialog(false)}
          />
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
