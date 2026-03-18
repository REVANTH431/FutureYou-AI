import { useEffect, useMemo, useState } from 'react'

type Params = {
  value: number
  start?: number
  durationMs?: number
  active?: boolean
}

function easeOutCubic(t: number) {
  return 1 - Math.pow(1 - t, 3)
}

export function useCountUp({ value, start = 0, durationMs = 800, active = true }: Params) {
  const [v, setV] = useState(start)
  const key = useMemo(() => `${start}-${value}-${durationMs}`, [start, value, durationMs])

  useEffect(() => {
    if (!active) return
    let raf = 0
    const t0 = performance.now()

    const tick = (t: number) => {
      const p = Math.min(1, (t - t0) / Math.max(1, durationMs))
      const e = easeOutCubic(p)
      setV(start + (value - start) * e)
      if (p < 1) raf = requestAnimationFrame(tick)
    }

    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [key, active, start, value, durationMs])

  return v
}

