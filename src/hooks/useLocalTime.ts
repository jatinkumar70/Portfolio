import { useEffect, useState } from 'react'

/** Clock for a configured time zone, computed in the visitor's browser each minute. */
export function useLocalTime(timeZone: string) {
  const [time, setTime] = useState<string>('')
  useEffect(() => {
    const fmt = new Intl.DateTimeFormat('en-GB', { hour: '2-digit', minute: '2-digit', hour12: false, timeZone })
    const update = () => setTime(fmt.format(new Date()))
    update()
    const id = window.setInterval(update, 15_000)
    return () => window.clearInterval(id)
  }, [timeZone])
  return time
}
