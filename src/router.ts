import { useCallback, useEffect, useState } from 'react'

const NAVIGATE_EVENT = 'flow:navigate'

export function useRouter() {
  const [location, setLocation] = useState(() => ({ pathname: window.location.pathname, search: window.location.search }))
  useEffect(() => {
    const update = () => setLocation({ pathname: window.location.pathname, search: window.location.search })
    window.addEventListener('popstate', update)
    window.addEventListener(NAVIGATE_EVENT, update)
    return () => { window.removeEventListener('popstate', update); window.removeEventListener(NAVIGATE_EVENT, update) }
  }, [])
  const navigate = useCallback((to: string, replace = false) => {
    window.history[replace ? 'replaceState' : 'pushState']({}, '', to)
    window.dispatchEvent(new Event(NAVIGATE_EVENT))
  }, [])
  return { ...location, navigate }
}
