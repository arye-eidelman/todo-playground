import './App.css'
import { useLocalStore } from './hooks'

function shortTitle(title: string) {
  const length = 25
  if (title.length <= length) {
    return title
  }
  return title.slice(0, title.lastIndexOf(' ', length - 4)) + ' ...'
}

type Todo = {
  title: string,
  completed: boolean,
  createdAt: string,
  updatedAt: string,
  deletedAt?: string,
  dueAt?: string
}

function todoTemplate(title = ""): Todo {
  return {
    title,
    completed: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }
}

function App() {
  const [store, updateStore] = useLocalStore<{
    newTodo: Todo
    todos: { [id: string]: Todo }
  }>({
    newTodo: { title: "", completed: false },
    todos: {
      "626543": todoTemplate("Apples"),
      "708935": todoTemplate("Oranges"),
      "765473": todoTemplate("Peppers"),
      "778935": todoTemplate("Bread")
    }
  })
  const { newTodo, todos } = store

  return (
    <div className="mx-auto max-w-xl">
      <header>
        <h1>Todo Playground</h1>
      </header>
      <hr />

      <main className='mx-auto max-w-md'>
        <h3>Todos</h3>
        <ul className="list-none p-0">
          {Object.keys(todos).map((key, index) => {
            const todo = todos[key]
            return (
              <li key={key} className="my-3 space-x-2 flex">
                <input
                  type="checkbox"
                  title={`Mark ${todo.completed ? 'un' : ''}completed todo-item '${shortTitle(todo.title)}'`}
                  checked={todo.completed}
                  onChange={e => updateStore({ ...store, todos: { ...todos, [key]: { ...todo, completed: e.target.checked } } })}
                />
                <input
                  type="text"
                  className='w-full'
                  title="Todo-item title"
                  value={todo.title}
                  onChange={e => {
                    updateStore({ ...store, todos: { ...todos, [key]: { ...todo, title: e.target.value } } })
                  }}
                />
                <button
                  title={`Trash todo-item '${shortTitle(todo.title)}'`}
                  onClick={() => {
                    const nextTodos = { ...todos }
                    delete nextTodos[key]
                    updateStore({ ...store, todos: nextTodos })
                  }}>
                  🗑
                </button>
              </li>
            )
          })}

          <li className='my-3 space-x-2 flex'>
            <input type="checkbox" disabled />
            <input
              type="text"
              className='w-full'
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
                    newTodo: todoTemplate(),
                    todos: { ...todos, [Date.now()]: newTodo }
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
