
import { useEffect, useRef, useState } from 'react'

export const useIsMount = () => {
  const isMountRef = useRef(true)
  useEffect(() => {
    isMountRef.current = false
  }, [])
  return isMountRef.current
}

// a useState wrapper that syncs with local storage
export const useLocalStore = function <T>(initialState: T | (() => T), storeKey = "todo-playground") {
  const [data, setData] = useState<T>(initialState)
  const isMount = useIsMount()

  // save state to localStorage
  useEffect(() => {
    if (!isMount) {
      window.localStorage.setItem(storeKey, JSON.stringify(data))
    }
  }, [data, storeKey, isMount])

  // restore state from localStorage
  function loadFromLocalStorage() {
    const storedData = window.localStorage.getItem(storeKey)
    if (typeof storedData === 'string') {
      setData(JSON.parse(storedData))
    }
  }

  // when mounting
  useEffect(loadFromLocalStorage, [storeKey])

  // and in response to changes from other tabs
  useEffect(() => {
    window.addEventListener('storage', loadFromLocalStorage)
    return () => window.removeEventListener('storage', loadFromLocalStorage)
  })

  return [data, setData] as const
}