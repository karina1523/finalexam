import { useEffect, useState } from 'react'

/** Counts down to an absolute `endsAt` timestamp, so refreshes and tab switches can't reset or pause it. */
export default function Timer({ endsAt, onExpire }) {
  const [left, setLeft] = useState(() => Math.max(0, endsAt - Date.now()))
  useEffect(() => {
    const tick = () => {
      const ms = Math.max(0, endsAt - Date.now())
      setLeft(ms)
      if (ms === 0) onExpire()
    }
    tick()
    const id = setInterval(tick, 500)
    return () => clearInterval(id)
  }, [endsAt]) // eslint-disable-line react-hooks/exhaustive-deps
  const s = Math.ceil(left / 1000)
  const low = s <= 60
  return (
    <div role="timer" aria-live="off"
      className={`rounded-lg px-3 py-1.5 font-semibold tabular-nums transition-colors ${low ? 'bg-red-600 text-white' : 'bg-ink text-white'}`}>
      {String(Math.floor(s / 60)).padStart(2, '0')}:{String(s % 60).padStart(2, '0')}
    </div>
  )
}
