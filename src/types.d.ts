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

export type ThemeColor = 'red' | 'orange' | 'amber' | 'yellow' | 'lime' | 'green' | 'emerald' | 'teal' | 'cyan' | 'sky' | 'blue' | 'indigo' | 'violet' | 'purple' | 'fuchsia' | 'pink' | 'rose'

export type TaskList = {
  id: string,
  title: string,
  themeColor: ThemeColor,
  createdAt?: string,
  updatedAt?: string,
  deletedAt?: string,
  tasksSortIndex: Task['id'][],
  newTaskTitle: string
}

export type Store = {
  schemaVersion: number
  tasks: Record<Task['id'], Task>,
  taskLists: Record<TaskList['id'], TaskList>,
  taskListsSortIndex: TaskList['id'][]
}