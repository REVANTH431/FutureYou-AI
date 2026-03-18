import { motion } from 'framer-motion'
import { useEffect, useMemo, useRef, useState } from 'react'
import { scoreAll, type ScoringResult } from '../simulator/scoring'
import type { SimulationInput } from '../simulator/types'
import { cn } from '../shared/utils/cn'

type ScenarioSlot = 'A' | 'B'

type ScenarioState = {
  label: string
  input: SimulationInput
  scores: ScoringResult
}

export function ScenarioComparison() {
  const [a, setA] = useState<ScenarioState | null>(null)
  const [b, setB] = useState<ScenarioState | null>(null)

  const latestRef = useRef<SimulationInput | null>(null)

  useEffect(() => {
    const handler = (e: Event) => {
      const ev = e as CustomEvent<SimulationInput>
      latestRef.current = ev.detail
    }
    window.addEventListener('futureyou:simulation-change', handler as EventListener)
    return () => window.removeEventListener('futureyou:simulation-change', handler as EventListener)
  }, [])

  const capture = (slot: ScenarioSlot) => {
    const snapshot = latestRef.current
    if (!snapshot) return
    const scores = scoreAll(snapshot)
    const label =
      slot === 'A'
        ? 'Scenario A'
        : 'Scenario B'

    const state: ScenarioState = { label, input: snapshot, scores }
    if (slot === 'A') setA(state)
    else setB(state)
  }

  const hasBoth = !!a && !!b

  const deltas = useMemo(() => {
    if (!a || !b) return null
    return {
      salary: b.scores.salary.score - a.scores.salary.score,
      stress: b.scores.stress.score - a.scores.stress.score,
      health: b.scores.health.score - a.scores.health.score,
    }
  }, [a, b])

  return (
    <div className="glass compare">
      <div className="compare__head">
        <div>
          <div className="compare__kicker">Decision comparison</div>
          <div className="compare__title">See how two paths diverge</div>
          <div className="compare__sub">
            Capture your current setup twice — for example “Stay where I am” vs “New country + new role” — and compare
            salary, stress, and health.
          </div>
        </div>
        <div className="compare__buttons">
          <button className="btn btn--ghost" onClick={() => capture('A')}>
            Save as A
          </button>
          <button className="btn btn--primary" onClick={() => capture('B')}>
            Save as B
          </button>
        </div>
      </div>

      <div className="compare__grid">
        <ScenarioColumn slot="A" state={a} highlight="left" />
        <ScenarioColumn slot="B" state={b} highlight="right" />
      </div>

      <motion.div
        className="compare__delta"
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: hasBoth ? 1 : 0.6, y: 0 }}
        transition={{ duration: 0.35 }}
      >
        {deltas && a && b ? (
          <>
            <DeltaBadge label="Salary" value={deltas.salary} />
            <DeltaBadge label="Stress" value={deltas.stress} invert />
            <DeltaBadge label="Health" value={deltas.health} />
          </>
        ) : (
          <span className="compare__hint">
            Use the multi‑step form to define a scenario, then click **Save as A** and **Save as B** to compare.
          </span>
        )}
      </motion.div>

      <div className="compare__foot">
        <span className="compare__hint">
          A higher salary with slightly higher stress might be worth it for a few years — but notice what happens to
          health when habits slip.
        </span>
      </div>
    </div>
  )
}

function ScenarioColumn({
  slot,
  state,
  highlight,
}: {
  slot: ScenarioSlot
  state: ScenarioState | null
  highlight: 'left' | 'right'
}) {
  const label = slot === 'A' ? 'Scenario A' : 'Scenario B'

  if (!state) {
    return (
      <div className="compare__col compare__col--empty">
        <div className="compare__slot">{label}</div>
        <div className="compare__placeholder">
          Capture this side by saving your current configuration as {slot}.
        </div>
      </div>
    )
  }

  const { scores, input } = state

  return (
    <motion.div
      className={cn('compare__col', highlight === 'left' ? 'compare__col--left' : 'compare__col--right')}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <div className="compare__slot">{label}</div>
      <div className="compare__labelRow">
        <div className="compare__pill">{input.career ?? 'No career set'}</div>
        <div className="compare__pill compare__pill--muted">{input.country ?? 'No country'}</div>
      </div>

      <div className="compare__scores">
        <ScoreRow label="Salary" value={scores.salary.score} />
        <ScoreRow label="Stress" value={scores.stress.score} invert />
        <ScoreRow label="Health" value={scores.health.score} />
      </div>

      <div className="compare__chips">
        {(input.skills || []).slice(0, 5).map((s) => (
          <span key={s} className="compare__chip">
            {s}
          </span>
        ))}
      </div>
    </motion.div>
  )
}

function ScoreRow({ label, value, invert }: { label: string; value: number; invert?: boolean }) {
  const pct = Math.max(0, Math.min(100, value))
  const display = `${pct}`

  return (
    <div className="compareScore">
      <div className="compareScore__top">
        <span>{label}</span>
        <span className="compareScore__value">{display}</span>
      </div>
      <div className="compareScore__bar">
        <motion.div
          className={cn('compareScore__fill', invert && 'compareScore__fill--invert')}
          initial={{ width: '0%' }}
          whileInView={{ width: `${pct}%` }}
          viewport={{ once: true, amount: 0.6 }}
          transition={{ duration: 0.9, ease: [0.2, 0.8, 0.2, 1] }}
        />
      </div>
    </div>
  )
}

function DeltaBadge({ label, value, invert }: { label: string; value: number; invert?: boolean }) {
  const sign = value > 0 ? '+' : value < 0 ? '−' : ''
  const mag = Math.abs(Math.round(value))
  const good = invert ? value < 0 : value > 0

  return (
    <div className={cn('compareDelta', good && 'compareDelta--good', !good && value !== 0 && 'compareDelta--bad')}>
      <span className="compareDelta__label">{label}</span>
      <span className="compareDelta__value">
        {value === 0 ? 'No change' : `${sign}${mag}`}
      </span>
    </div>
  )
}

