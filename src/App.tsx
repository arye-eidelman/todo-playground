import { Fragment, useState } from 'react'
import './App.css'
import { useLocalStore } from './hooks'
import { TaskView } from './TaskView'
import { Task, DeletedTask } from './types'
import { ReorderTasksDropZone } from './ReorderTasksDropZone'
import { TaskPreview } from './TaskPreview'

function uniqueId() {
  return Date.now().toString()
}

function newTaskTemplate(title = "", id = uniqueId()): Task {
  return {
    id,
    title,
    completed: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    sortKey: Date.now(),
  }
}

function App() {
  const [store, updateStore] = useLocalStore<{
    tasks: { [id: string]: Task | DeletedTask },
    sortedTaskIds: string[],
    newTask: Task
  }>({
    tasks: {},
    sortedTaskIds: [],
    newTask: newTaskTemplate(),
  })
  const { tasks, sortedTaskIds, newTask } = store
  const [dragTaskId, setDragTaskId] = useState<string>()
  const [dropTarget, setDropTarget] = useState<number>()
  const inDragMode = typeof dragTaskId !== "undefined"

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
      const nextSortedTask = [...sortedTaskIds]
      if (endIndex < startIndex) {
        nextSortedTask.splice(startIndex, 1)
        nextSortedTask.splice(endIndex, 0, dragTaskId)
      } else {
        nextSortedTask.splice(endIndex, 0, dragTaskId)
        nextSortedTask.splice(startIndex, 1)
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
        sortedTaskIds: nextSortedTask
      })
      setDragTaskId(undefined)
      setDropTarget(undefined)
    }
  }
  const updateTask = (id: string, nextTask: Partial<Task>) => {
    updateStore({ ...store, tasks: { ...tasks, [id]: { ...tasks[id], ...nextTask } } })
  }
  const deleteTask = (id: string) => {
    // soft delete now and hard delete after the animation completes
    updateStore({ ...store, tasks: { ...tasks, [id]: { ...tasks[id], deletedAt: new Date().toISOString() } } })
    setTimeout(() => {
      updateStore((store) => {
        setDragTaskId(dragTaskId => dragTaskId && store.tasks[dragTaskId].deletedAt ? undefined : dragTaskId)
        const nextTasks = { ...store.tasks }
        delete nextTasks[id]
        return { ...store, tasks: nextTasks, sortedTaskIds: store.sortedTaskIds.filter(taskId => taskId !== id) }
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
        <h3>Tasks</h3>
        <ul className="list-none px-0 py-4">
          {sortedTaskIds.map((id, index) => {

            const task = tasks[id]
            if (!('title' in task) || !task.title) { return null }
            return <Fragment key={id}>
              {
                inDragMode && typeof tasks[dragTaskId].deletedAt !== 'string' &&
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
                task={task}
                updateTask={updateTask}
                deleteTask={deleteTask}
                dragTaskId={dragTaskId}
                setDragTaskId={setDragTaskId}
              />
            </Fragment>
          })}

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
              value={newTask.title}
              onChange={e => {
                updateStore({ ...store, newTask: { ...newTask, title: e.target.value } })
              }}
              onKeyDown={e => {
                if (e.key === "Enter" && newTask.title.length > 0) {
                  updateStore({
                    ...store,
                    newTask: newTaskTemplate(),
                    sortedTaskIds: [...sortedTaskIds, newTask.id],
                    tasks: { ...tasks, [newTask.id]: newTask },
                  })
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
