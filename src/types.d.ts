export type Task = {
  id: string,
  taskListId: string,
  title: string,
  completed: boolean,
  createdAt: string,
  updatedAt: string,
  deletedAt?: string,
  dueAt?: string,
  sortKey: number
}

export type TaskList = {
  id: string,
  title: string,
  createdAt?: string,
  updatedAt?: string,
  deletedAt?: string,
  tasksSortIndex: Task['id'][],
  newTaskTitle: string
}

export type Store = {
  tasks: Record<Task['id'], Task>,
  taskLists: Record<TaskList['id'], TaskList>,
  taskListsSortIndex: TaskList['id'][]
}