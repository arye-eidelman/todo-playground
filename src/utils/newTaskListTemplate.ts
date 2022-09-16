import { TaskList } from '../types'
import { v4 as uuidv4 } from 'uuid';
import { randomNewColor } from './randomNewColor'

export function newTaskListTemplate(taskList: Partial<TaskList> = {}): TaskList {
  return {
    id: uuidv4(),
    title: "New List",
    themeColor: randomNewColor(),
    tasksSortIndex: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    newTaskTitle: "",
    ...taskList
  }
}
