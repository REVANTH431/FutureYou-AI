import { motion } from 'framer-motion'
import { useEffect, useRef, useState } from 'react'
import type { SimulationInput } from '../simulator/types'
import { generateLifeStory } from './openaiClient'

export function LifeStory() {
  const [story, setStory] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const latestSimRef = useRef<SimulationInput | undefined>()

  useEffect(() => {
    const handler = (e: Event) => {
      const ev = e as CustomEvent<SimulationInput>
      latestSimRef.current = ev.detail
    }
    window.addEventListener('futureyou:simulation-change', handler as EventListener)
    return () => window.removeEventListener('futureyou:simulation-change', handler as EventListener)
  }, [])

  const run = async () => {
    if (loading) return
    const snapshot = latestSimRef.current
    if (!snapshot) {
      setStory('Set up your career, country, skills, and habits first — then I can project the story.')
      return
    }
    setLoading(true)
    try {
      const result = await generateLifeStory(snapshot)
      setStory(result)
    } catch {
      setStory('The narrator glitched for a second. Try generating again in a moment.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="glass aistory">
      <div className="aistory__head">
        <div>
          <div className="aistory__kicker">AI life story</div>
          <div className="aistory__title">Read your next decade like a movie</div>
          <div className="aistory__sub">
            We stitch together your career, country, habits, and scores into a narrative that feels uncomfortably real.
          </div>
        </div>
        <button className="btn btn--primary" onClick={run} disabled={loading}>
          {loading ? 'Generating…' : 'Generate story'}
        </button>
      </div>

      <motion.div
        className="aistory__body"
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: story ? 1 : 0.7, y: 0 }}
        transition={{ duration: 0.35 }}
      >
        {story ? (
          story.split('\n').map((line, idx) =>
            line.trim() ? (
              <p key={idx} className="aistory__p">
                {line}
              </p>
            ) : (
              <div key={idx} className="aistory__gap" />
            ),
          )
        ) : (
          <p className="aistory__p aistory__placeholder">
            After you complete the simulation steps, hit “Generate story”. We’ll turn your inputs into 4–6 vivid scenes
            that track money, energy, and meaning — not just titles.
          </p>
        )}
      </motion.div>
    </div>
  )
}

