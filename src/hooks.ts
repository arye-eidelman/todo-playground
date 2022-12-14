
import { useEffect, useRef, useState } from 'react'

export const useIsMount = () => {
  const isMountRef = useRef(true)
  useEffect(() => {
    isMountRef.current = false
  }, [])
  return isMountRef.current
}

// a useState wrapper that syncs with local storage
export const useLocalStore = function <T>(initialState: T | (() => T), storeKey = "todo-playground", schemaVersion = 0) {
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
      const json = JSON.parse(storedData)
      if (json.schemaVersion === schemaVersion) {
        setData(JSON.parse(storedData))
      }
      // else check for older schema versions and migrate?
    }
  }

  // when mounting
  useEffect(loadFromLocalStorage, [storeKey, schemaVersion])

  // and in response to changes from other tabs
  useEffect(() => {
    window.addEventListener('storage', loadFromLocalStorage)
    return () => window.removeEventListener('storage', loadFromLocalStorage)
  })

  return [data, setData] as const
}