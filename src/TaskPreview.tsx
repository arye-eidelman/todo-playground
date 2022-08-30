import { Task } from './types'

export const TaskPreview = ({ task }: { task: Task }) => {
  return (
    <li className='pointer-events-none'>
      <div className='py-1 space-x-2 flex items-baseline text-lg rounded-lg '>
        <input type="checkbox" disabled checked={task.completed} />
        <input type="text" disabled className='border-none w-full text-sm py-1 px-2 bg-white text-black' value={task.title} />
        <button disabled className='invisible bg-transparent border-0 text-lg'>🗑</button>
        <span className='text-lg'>⋮⋮⋮</span>
      </div>
    </li>
  )
}