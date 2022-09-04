import { Task } from './types'

export const TaskPreview = ({ task }: { task: Task }) => {
  return (
    <input
      type="text"
      readOnly
      className='
        text-sm
        relative p-1
        pointer-events-none
        my-2 ml-[10%] mr-[15%] w-[75%] h-6
        shadow-lg shadow-gray-300 bg-white
        border-2 border-gray-200 border-solid rounded-sm
        rotate-3 translate-x-0 translate-y-0 skew-x-0 skew-y-0 scale-100
      '
      value=
      {task.title}
    />
  )
}