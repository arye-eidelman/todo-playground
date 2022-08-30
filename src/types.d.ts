// fix react events target missing classname (at least as an optinal property)
declare global {
  interface EventTarget {
    className?: string;
  }
}

export type Task = {
  id: string,
  title: string,
  completed: boolean,
  createdAt: string,
  updatedAt: string,
  deletedAt?: string,
  dueAt?: string,
  sortKey: number
}


export type DeletedTask = {
  id: string,
  deletedAt: string,
  sortKey: number
}