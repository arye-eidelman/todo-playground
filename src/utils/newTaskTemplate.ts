import { Task, TaskList } from '../types'
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