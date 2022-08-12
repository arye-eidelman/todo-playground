import './App.css'
import { useLocalStore } from './hooks'

type Todo = {
  title: string,
  completed: boolean,
  createdAt?: string,
  updatedAt?: string,
  deletedAt?: string | null
}

function todoTemplate(title = ""): Todo {
  return {
    title,
    completed: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    deletedAt: null
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
    <div className="App">
      <header>
        <h1>Todo Playground</h1>
      </header>
      <hr />

      <main>
        <h3>Todos</h3>
        <ul style={{ listStyleType: "none", padding: 0 }}>
          {Object.keys(todos).map((key, index) => {
            const todo = todos[key]
            return (
              <li key={key} style={{ margin: "4px 0" }}>
                <input
                  type="checkbox"
                  name="comleted"
                  id=""
                  checked={todo.completed}
                  onChange={e => updateStore({ ...store, todos: { ...todos, [key]: { ...todo, completed: e.target.checked } } })}
                />
                <input
                  type="text"
                  name="todo title"
                  id={key + "-title"}
                  value={todo.title}
                  onChange={e => {
                    updateStore({ ...store, todos: { ...todos, [key]: { ...todo, title: e.target.value } } })
                  }}
                />
                <button onClick={() => {
                  const nextTodos = { ...todos }
                  delete nextTodos[key]
                  updateStore({ ...store, todos: nextTodos })
                }}>
                  🗑
                </button>
              </li>
            )
          })}

          <li>
            <input
              type="checkbox"
              disabled
            />
            <input
              type="text"
              name="todo title"
              id="newTodo-title"
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
