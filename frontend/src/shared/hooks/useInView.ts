import { useEffect, useRef, useState } from 'react'

type Options = {
  root?: Element | null
  rootMargin?: string
  threshold?: number | number[]
  once?: boolean
}

export function useInView<T extends Element>(opts: Options = {}) {
  const { root = null, rootMargin = '0px 0px -10% 0px', threshold = 0.2, once = false } = opts
  const ref = useRef<T | null>(null)
  const [inView, setInView] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const obs = new IntersectionObserver(
      (entries) => {
        const hit = entries.some((e) => e.isIntersecting)
        if (hit) {
          setInView(true)
          if (once) obs.disconnect()
        } else if (!once) {
          setInView(false)
        }
      },
      { root, rootMargin, threshold },
    )

    obs.observe(el)
    return () => obs.disconnect()
  }, [root, rootMargin, threshold, once])

  return { ref, inView }
}

