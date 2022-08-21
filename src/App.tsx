import { useState } from 'react'
import './App.css'
import { useLocalStore } from './hooks'

type Todo = {
  id: string,
  title: string,
  completed: boolean,
  createdAt: string,
  updatedAt: string,
  deletedAt?: string,
  dueAt?: string,
  sortKey: number
}

// fix react events target missing classname (at least as an optinal property)
declare global {
  interface EventTarget {
    className?: string;
  }
}

function shortTitle(title: string) {
  const length = 25
  if (title.length <= length) {
    return title
  }
  return title.slice(0, title.lastIndexOf(' ', length - 4)) + ' ...'
}

function newTodoTemplate(title = "", id = Date.now().toString()): Todo {
  return {
    id,
    title,
    completed: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    sortKey: Date.now(),
  }
}

const TodoItemDropPlacehlder = () => {
  return (
    <div className='my-1 h-10 rounded-lg bg-gray-200'></div>
  )
}

const ToDoItemRender = ({
  id,
  todo,
  updateTodo,
  deleteTodo,
  inDragMode,
  dragId,
  isUnderDrag,
  setIsUnderDrag,
  previewAfter,
  pickUp,
  putDown,
  cancelDrag
}: {
  id: string,
  todo: Todo,
  updateTodo: (id: string, todo: Partial<Todo>) => void,
  deleteTodo: (id: string) => void,
  inDragMode?: boolean,
  dragId?: string,
  isUnderDrag: boolean,
  setIsUnderDrag: (id?: string) => void
  previewAfter?: boolean,
  pickUp: (id: string) => void,
  putDown: (id: string) => void,
  cancelDrag: () => void
}) => {
  const pointerEventClasses = (inDragMode && id !== dragId ? ' pointer-events-none' : '')
  const thisIsBeingDragged = inDragMode && id === dragId
  return (
    <li
      id={'li_' + id ?? todo.id}
      onDrop={e => { e.preventDefault(); putDown(id) }}
      onDragEnter={e => { e.preventDefault(); setIsUnderDrag(id) }}
      onDragOver={e => { e.preventDefault(); dragId === id || setIsUnderDrag(id) }}
      onDragLeave={e => {
        if (e.target.className?.split(' ').includes('TodoItem')) {
          setIsUnderDrag(undefined)
        }
      }}
    >
      {!previewAfter && isUnderDrag &&
        <TodoItemDropPlacehlder />
      }

      <div
        id={'TodoItem_' + id ?? todo.id}
        className={'TodoItem py-2 space-x-2 flex items-baseline text-lg' + pointerEventClasses + (thisIsBeingDragged ? ' rounded-lg bg-gray-300 opacity-50' : '')}
      >
        <input
          type="checkbox"
          className={pointerEventClasses}
          title={`Mark ${todo.completed ? 'un' : ''}completed todo-item '${shortTitle(todo.title)}'`}
          checked={todo.completed}
          onChange={e => updateTodo(id, { completed: e.target.checked })}
        />
        <input
          type="text"
          className={'w-full text-sm py-1 px-2' + pointerEventClasses}
          title="Todo-item title"
          value={todo.title}
          onChange={e => updateTodo(id, { title: e.target.value })}
        />
        <button
          className={'bg-transparent border-0 text-lg' + pointerEventClasses}
          title={`Trash todo-item '${shortTitle(todo.title)}'`}
          onClick={() => deleteTodo(id)}>
          🗑
        </button>
        <span
          className={'TodoItemDragHandle text-lg' + pointerEventClasses}
          draggable
          onDragStart={(e) => e.target.className?.split(' ').includes('TodoItemDragHandle') && pickUp(id)}
          onDragEnd={() => cancelDrag()}
        >⋮⋮⋮</span>
      </div>

      {previewAfter && isUnderDrag &&
        <TodoItemDropPlacehlder />
      }

      {/* <TodoItemDropPlacehlder /> */}
    </li>
  )
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
  const [dragOverTodoId, setDragOverTodoId] = useState<string>()
  const inDragMode = typeof dragTodoId === "string"

  const indexOfDragTodo = inDragMode ? sortedTodoIds.indexOf(dragTodoId) : -1

  return (
    <div className="mx-auto max-w-xl">
      <header>
        <h1>Todo Playground</h1>
      </header>
      <hr />

      <main className='mx-auto max-w-md'>
        <h3>Todos</h3>
        <ul className="list-none px-0 py-4">
          {sortedTodoIds
            .map((id, index) => {
              const todo = todos[id]

              return (
                <ToDoItemRender
                  key={id}
                  id={id}
                  todo={todo}
                  updateTodo={(id, nextTodo) => {
                    updateStore({ ...store, todos: { ...todos, [id]: { ...todo, ...nextTodo } } })
                  }}
                  deleteTodo={(id) => {
                    const nextTodos = { ...todos }
                    delete nextTodos[id]
                    updateStore({ ...store, todos: nextTodos, sortedTodoIds: sortedTodoIds.filter(sId => sId !== id) })
                  }}
                  dragId={dragTodoId}
                  inDragMode={inDragMode}
                  isUnderDrag={!!(dragTodoId && dragTodoId !== id && dragOverTodoId === id)}
                  setIsUnderDrag={(id) => setDragOverTodoId(id)}
                  previewAfter={indexOfDragTodo < index}
                  pickUp={(id) => setDragTodoId(id)}
                  putDown={(id) => {
                    if (inDragMode) {
                      const placeBeforeDropTodo = todos[dragTodoId].sortKey > todo.sortKey
                      const nextSortKey = placeBeforeDropTodo
                        ? index <= 0
                          ? todos[id].sortKey - 1
                          : todos[id].sortKey + todos[sortedTodoIds[index - 1]].sortKey / 2
                        : index >= sortedTodoIds.length - 1
                          ? todos[id].sortKey + 1
                          : todos[id].sortKey + todos[sortedTodoIds[index + 1]].sortKey / 2

                      const nextSortedTodo = [...sortedTodoIds]
                      nextSortedTodo.splice(sortedTodoIds.indexOf(dragTodoId), 1)
                      nextSortedTodo.splice(index, 0, dragTodoId)
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
                      setDragOverTodoId(undefined)
                    }
                  }}
                  cancelDrag={() => { setDragTodoId(undefined); setDragOverTodoId(undefined) }}
                />
              )
            })}

          <li className='my-3 space-x-2 flex items-baseline text-lg'>
            <input type="checkbox" disabled />
            <input
              type="text"
              className='w-full text-lg py-1 px-2'
              title="New todo-item title"
              placeholder='I need to _________'
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
