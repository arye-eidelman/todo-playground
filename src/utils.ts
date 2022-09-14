import { Task, TaskList, Store } from './types'
import { colors } from './styles'
import { v4 as uuidv4 } from 'uuid';

export function newTaskTemplate(taskListId: TaskList['id'], task: Partial<Task>): Task {
  return {
    taskListId,
    id: uuidv4(),
    title: "",
    completed: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    sortKey: Date.now(),
    ...task
  }
}
export function newTaskListTemplate(taskList: Partial<TaskList> = {}): TaskList {
  return {
    id: uuidv4(),
    title: "New List",
    themeColor: colors[Math.floor(Math.random() * colors.length)],
    tasksSortIndex: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    newTaskTitle: "",
    ...taskList
  }
}

export function initialStore(): Store {
  const taskList = newTaskListTemplate({ title: "To Do Playground feature list" })
  const tasks = [
    newTaskTemplate(taskList.id, { completed: true, title: "Welcome 👋, Thanks for giving To Do Playground a try" }),
    newTaskTemplate(taskList.id, { completed: true, title: "Support multple task lists" }),
    newTaskTemplate(taskList.id, { completed: true, title: "Drag and drop to reorder tasks on desktop" }),
    newTaskTemplate(taskList.id, { completed: false, title: "Drag and drop to reorder tasks on mobile" }),
    newTaskTemplate(taskList.id, { completed: false, title: "Drag and drop to move tasks between lists" }),
    newTaskTemplate(taskList.id, { completed: true, title: "Create this intro" }),
    newTaskTemplate(taskList.id, { completed: true, title: "Animate the creation and deletion of tasks" }),
    newTaskTemplate(taskList.id, { completed: false, title: "Design three pane layout for tasks lists menu, tasks list, and advanced task options" }),
    newTaskTemplate(taskList.id, { completed: false, title: "Create right task context menu (right click/long-press/⋮)." }),
  ]
  taskList.tasksSortIndex = tasks.map(t => t.id)
  return {
    schemaVersion: 0,
    tasks: tasks.reduce<Store['tasks']>((tasks, task) => { tasks[task.id] = task; return tasks }, {}),
    taskLists: { [taskList.id]: taskList },
    taskListsSortIndex: [taskList.id]
  }
}