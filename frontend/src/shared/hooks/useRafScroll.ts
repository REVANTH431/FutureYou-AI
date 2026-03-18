import { useEffect, useRef } from 'react'

export function useRafScroll(onScroll: (y: number) => void) {
  const raf = useRef<number | null>(null)
  const lastY = useRef<number>(-1)
  const cbRef = useRef(onScroll)
  cbRef.current = onScroll

  useEffect(() => {
    const tick = () => {
      raf.current = null
      const y = window.scrollY || window.pageYOffset || 0
      if (y !== lastY.current) {
        lastY.current = y
        cbRef.current(y)
      }
    }

    const handler = () => {
      if (raf.current != null) return
      raf.current = window.requestAnimationFrame(tick)
    }

    window.addEventListener('scroll', handler, { passive: true })
    handler()
    return () => {
      window.removeEventListener('scroll', handler)
      if (raf.current != null) window.cancelAnimationFrame(raf.current)
    }
  }, [])
}

