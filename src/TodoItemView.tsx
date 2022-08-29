import React from 'react'
import { Todo } from './types'

function shortTitle(title: string) {
  const length = 25
  if (title.length <= length) {
    return title
  }
  return title.slice(0, title.lastIndexOf(' ', length - 4)) + ' ...'
}

export const TodoItemView = ({
  id,
  todo,
  updateTodo,
  deleteTodo,
  inDragMode,
  dragId,
  pickUp,
  cancelDrag
}: {
  id: string,
  todo: Todo,
  updateTodo: (id: string, todo: Partial<Todo>) => void,
  deleteTodo: (id: string) => void,
  inDragMode?: boolean,
  dragId?: string,
  pickUp: (id: string) => void,
  cancelDrag: () => void
}) => {
  const pointerEventClasses = '' //(inDragMode && id !== dragId ? ' pointer-events-none' : '')
  const thisIsBeingDragged = inDragMode && id === dragId
  return (
    <li
      id={'li_' + id ?? todo.id}
    >
      <div
        id={'TodoItem_' + id ?? todo.id}
        className={'TodoItem py-2 space-x-2 flex items-baseline text-lg rounded-lg' + pointerEventClasses + (thisIsBeingDragged ? ' opacity-25' : '')}
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
          onDragStart={(e) => pickUp(id)}
          onDragEnd={() => cancelDrag()}
        >⋮⋮⋮</span>
      </div>
    </li>
  )
}
