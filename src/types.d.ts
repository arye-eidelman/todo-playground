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

export { ThemeColor, Color, TextColor, DarkLevel, Selector } from './utils/themedStyle'

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