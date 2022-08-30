import { useState } from 'react'
import './App.css'
import { useLocalStore } from './hooks'
import { TaskView } from './TaskView'
import { Task } from './types'
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
    tasks: { [id: string]: Task },
    sortedTaskIds: string[],
    newTask: Task
  }>({
    tasks: {},
    sortedTaskIds: [],
    newTask: newTaskTemplate(),
  })
  const { tasks, sortedTaskIds, newTask } = store
  const [dragTaskId, setDragTaskId] = useState<string>()
  const [dragOverTaskIndex, setDragOverTaskIndex] = useState<number>()
  const inDragMode = typeof dragTaskId === "string"

  const setIsUnderDrag = (index?: number) => setDragOverTaskIndex(index)
  const putDown = (downIndex: number) => {
    if (inDragMode) {
      let nextSortKey
      if (downIndex === 0) {
        nextSortKey = tasks[sortedTaskIds[downIndex]].sortKey - 1
      } else if (downIndex === sortedTaskIds.length) {
        nextSortKey = tasks[sortedTaskIds[downIndex - 1]].sortKey + 1
      } else {
        nextSortKey = (tasks[sortedTaskIds[downIndex]].sortKey + tasks[sortedTaskIds[downIndex - 1]].sortKey) / 2
      }

      const nextSortedTask = [...sortedTaskIds]

      const upIndex = sortedTaskIds.indexOf(dragTaskId)
      if (downIndex < upIndex) {
        nextSortedTask.splice(upIndex, 1)
        nextSortedTask.splice(downIndex, 0, dragTaskId)
      } else {
        nextSortedTask.splice(downIndex, 0, dragTaskId)
        nextSortedTask.splice(upIndex, 1)
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
      setDragOverTaskIndex(undefined)
    }
  }
  const updateTask = (id: string, nextTask: Partial<Task>) => {
    updateStore({ ...store, tasks: { ...tasks, [id]: { ...tasks[id], ...nextTask } } })
  }
  const deleteTask = (id: string) => {
    const nexttasks = { ...tasks }
    delete nexttasks[id]
    updateStore({ ...store, tasks: nexttasks, sortedTaskIds: sortedTaskIds.filter(sId => sId !== id) })
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
            return <>
              {inDragMode &&
                <ReorderTasksDropZone
                  key={`before-${id}`}
                  index={index}
                  hidden={id === dragTaskId || (index > 0 && sortedTaskIds[index - 1] === dragTaskId)}
                  isUnderDrag={dragOverTaskIndex === index}
                  setIsUnderDrag={setIsUnderDrag}
                  putDown={putDown}
                >
                  <TaskPreview task={tasks[dragTaskId]} />
                </ReorderTasksDropZone>
              }
              <TaskView
                key={id}
                id={id}
                task={tasks[id]}
                updateTask={updateTask}
                deleteTask={deleteTask}
                dragId={dragTaskId}
                inDragMode={inDragMode}
                pickUp={(id) => setDragTaskId(id)}
                cancelDrag={() => { setDragTaskId(undefined); setDragOverTaskIndex(undefined) }}
              />
            </>
          })}

          {inDragMode &&
            <ReorderTasksDropZone
              key='end-of-list'
              index={sortedTaskIds.length}
              hidden={sortedTaskIds.at(-1) === dragTaskId}
              isUnderDrag={dragOverTaskIndex === sortedTaskIds.length}
              setIsUnderDrag={setIsUnderDrag}
              putDown={putDown}
            >
              <TaskPreview task={tasks[dragTaskId]} />
            </ReorderTasksDropZone>
          }

          <li key="new-item" className='my-3 space-x-2 flex items-baseline text-lg'>
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
                if (e.key === "Enter") {
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
