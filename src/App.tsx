import { useState } from 'react'
import './App.css'
import { useLocalStore } from './hooks'
import { TodoItemView } from './TodoItemView'
import { Todo } from './types'
import { TodoDropPlaceholder } from './TodoDropPlaceholder'

function uniqueId() {
  return Date.now().toString()
}

function newTodoTemplate(title = "", id = uniqueId()): Todo {
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
    todos: { [id: string]: Todo },
    sortedTodoIds: string[],
    newTodo: Todo
  }>({
    todos: {},
    sortedTodoIds: [],
    newTodo: newTodoTemplate(),
  })
  const { todos, sortedTodoIds, newTodo } = store
  const [dragTodoId, setDragTodoId] = useState<string>()
  const [dragOverTodoIndex, setDragOverTodoIndex] = useState<number>()
  const inDragMode = typeof dragTodoId === "string"

  const setIsUnderDrag = (index?: number) => setDragOverTodoIndex(index)
  const putDown = (downIndex: number) => {
    if (inDragMode) {
      let nextSortKey
      if (downIndex === 0) {
        nextSortKey = todos[sortedTodoIds[downIndex]].sortKey - 1
      } else if (downIndex === sortedTodoIds.length) {
        nextSortKey = todos[sortedTodoIds[downIndex - 1]].sortKey + 1
      } else {
        nextSortKey = (todos[sortedTodoIds[downIndex]].sortKey + todos[sortedTodoIds[downIndex - 1]].sortKey) / 2
      }

      const nextSortedTodo = [...sortedTodoIds]

      const upIndex = sortedTodoIds.indexOf(dragTodoId)
      if (downIndex < upIndex) {
        nextSortedTodo.splice(upIndex, 1)
        nextSortedTodo.splice(downIndex, 0, dragTodoId)
      } else {
        nextSortedTodo.splice(downIndex, 0, dragTodoId)
        nextSortedTodo.splice(upIndex, 1)
      }
      updateStore({
        ...store,
        todos: {
          ...todos,
          [dragTodoId]: {
            ...todos[dragTodoId],
            sortKey: nextSortKey
          }
        },
        sortedTodoIds: nextSortedTodo
      })
      setDragTodoId(undefined)
      setDragOverTodoIndex(undefined)
    }
  }
  const updateTodo = (id: string, nextTodo: Partial<Todo>) => {
    updateStore({ ...store, todos: { ...todos, [id]: { ...todos[id], ...nextTodo } } })
  }
  const deleteTodo = (id: string) => {
    const nextTodos = { ...todos }
    delete nextTodos[id]
    updateStore({ ...store, todos: nextTodos, sortedTodoIds: sortedTodoIds.filter(sId => sId !== id) })
  }
  return (
    <div className="mx-auto max-w-xl">
      <header>
        <h1>Todo Playground</h1>
      </header>
      <hr />

      <main className='mx-auto max-w-md'>
        <h3>Todos</h3>
        <ul className="list-none px-0 py-4">
          {sortedTodoIds.map((id, index) => {
            return <>
              <TodoDropPlaceholder
                key={`${'DropPlaceholder'}-${index}`}
                index={index}
                hidden={!inDragMode || id === dragTodoId || (index > 0 && sortedTodoIds[index - 1] === dragTodoId)}
                isUnderDrag={inDragMode && dragOverTodoIndex === index}
                setIsUnderDrag={setIsUnderDrag}
                putDown={putDown}
              />
              <TodoItemView
                key={id}
                id={id}
                todo={todos[id]}
                updateTodo={updateTodo}
                deleteTodo={deleteTodo}
                dragId={dragTodoId}
                inDragMode={inDragMode}
                pickUp={(id) => setDragTodoId(id)}
                cancelDrag={() => { setDragTodoId(undefined); setDragOverTodoIndex(undefined) }}
              />
            </>
          })}

          <TodoDropPlaceholder
            key={`${'DropPlaceholder'}-${sortedTodoIds.length}`}
            index={sortedTodoIds.length}
            hidden={!inDragMode || sortedTodoIds.at(- 1) === dragTodoId}
            isUnderDrag={inDragMode && dragOverTodoIndex === sortedTodoIds.length}
            setIsUnderDrag={setIsUnderDrag}
            putDown={putDown}
          />

          <li className='my-3 space-x-2 flex items-baseline text-lg'>
            <input
              type="text"
              className='w-full text-lg py-1 px-2'
              title="New todo-item title"
              placeholder='Enter task here and hit enter'
              value={newTodo.title}
              onChange={e => {
                updateStore({ ...store, newTodo: { ...newTodo, title: e.target.value } })
              }}
              onKeyDown={e => {
                if (e.key === "Enter") {
                  updateStore({
                    ...store,
                    newTodo: newTodoTemplate(),
                    sortedTodoIds: [...sortedTodoIds, newTodo.id],
                    todos: { ...todos, [newTodo.id]: newTodo },
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
