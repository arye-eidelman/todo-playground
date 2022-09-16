import { newTaskListTemplate } from './utils/newTaskListTemplate'
import { newTaskTemplate } from './utils/newTaskTemplate'
import { Store } from './types'

export function welcomeStore(): Store {
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