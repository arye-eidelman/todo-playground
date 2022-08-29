// fix react events target missing classname (at least as an optinal property)
declare global {
  interface EventTarget {
    className?: string;
  }
}

export type Todo = {
  id: string,
  title: string,
  completed: boolean,
  createdAt: string,
  updatedAt: string,
  deletedAt?: string,
  dueAt?: string,
  sortKey: number
}