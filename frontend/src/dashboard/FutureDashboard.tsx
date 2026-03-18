import { motion } from 'framer-motion'
import { useMemo, useState } from 'react'
import { useCountUp } from '../shared/hooks/useCountUp'
import { useInView } from '../shared/hooks/useInView'
import { cn } from '../shared/utils/cn'
import { useSalaryChart } from './useSalaryChart'
import { ExportPdfButton } from './ExportPdfButton'

type TimelineItem = { year: string; title: string; desc: string; tag: string }

function Icon({
  kind,
}: {
  kind: 'spark' | 'heart' | 'brain' | 'shield' | 'timeline' | 'chart'
}) {
  switch (kind) {
    case 'chart':
      return (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path
            d="M4 19V5m0 14h16"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
          />
          <path
            d="M7 15l3-3 3 2 6-7"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      )
    case 'timeline':
      return (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path
            d="M6 5v14M18 5v14"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
          />
          <path
            d="M6 9h12M6 15h12"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
          />
        </svg>
      )
    case 'heart':
      return (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path
            d="M12 21s-7-4.4-9.2-8.7C1.1 8.6 3.2 5.7 6.4 5.2c1.7-.2 3.3.4 4.4 1.6 1.1-1.2 2.7-1.8 4.4-1.6 3.2.5 5.3 3.4 3.6 7.1C19 16.6 12 21 12 21Z"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinejoin="round"
          />
        </svg>
      )
    case 'brain':
      return (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path
            d="M9 22c-2 0-4-1.7-4-4V9.5C5 6.5 7.5 4 10.5 4c.5-1.7 2-3 3.8-3 2.3 0 4.2 2 4.2 4.3V18c0 2.3-2 4-4.2 4"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
          />
          <path
            d="M9 10c-1.2 0-2.2-1-2.2-2.2S7.8 5.6 9 5.6"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
          />
        </svg>
      )
    case 'shield':
      return (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path
            d="M12 22s8-3 8-10V6l-8-3-8 3v6c0 7 8 10 8 10Z"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinejoin="round"
          />
        </svg>
      )
    case 'spark':
    default:
      return (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path
            d="M12 2l1.7 6.1L20 10l-6.3 1.9L12 18l-1.7-6.1L4 10l6.3-1.9L12 2Z"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinejoin="round"
          />
        </svg>
      )
  }
}

function Meter({
  label,
  left,
  right,
  value,
  tone,
}: {
  label: string
  left: string
  right: string
  value: number // 0..100
  tone: 'stress' | 'happy'
}) {
  const pct = Math.max(0, Math.min(100, value))
  return (
    <div className="glass dcard dcard--meter">
      <div className="dcard__top">
        <div className="dcard__k">{label}</div>
        <div className="dcard__badge">{pct}%</div>
      </div>
      <div className="dmeter" aria-label={label}>
        <div className="dmeter__labels">
          <span>{left}</span>
          <span>{right}</span>
        </div>
        <div className="dmeter__track">
          <motion.div
            className={cn('dmeter__fill', tone === 'stress' ? 'dmeter__fill--stress' : 'dmeter__fill--happy')}
            initial={{ width: '0%' }}
            whileInView={{ width: `${pct}%` }}
            viewport={{ once: true, amount: 0.6 }}
            transition={{ duration: 0.9, ease: [0.2, 0.8, 0.2, 1] }}
          />
          <motion.div
            className={cn('dmeter__dot', tone === 'happy' && 'dmeter__dot--happy')}
            initial={{ left: '0%', opacity: 0 }}
            whileInView={{ left: `${pct}%`, opacity: 1 }}
            viewport={{ once: true, amount: 0.6 }}
            transition={{ duration: 0.9, ease: [0.2, 0.8, 0.2, 1] }}
          />
        </div>
      </div>
    </div>
  )
}

function SummaryCard({
  title,
  value,
  meta,
  icon,
}: {
  title: string
  value: string
  meta: string
  icon: React.ComponentProps<typeof Icon>['kind']
}) {
  return (
    <div className="glass dcard dcard--summary">
      <div className="dcard__top">
        <div className="dicon" aria-hidden="true">
          <Icon kind={icon} />
        </div>
        <div className="dcard__k">{title}</div>
      </div>
      <div className="dcard__v">{value}</div>
      <div className="dcard__meta">{meta}</div>
      <div className="dcard__shine" aria-hidden="true" />
    </div>
  )
}

export function FutureDashboard() {
  const { ref, inView } = useInView<HTMLDivElement>({ threshold: 0.25, once: true })

  const labels = useMemo(() => ['Now', 'Y1', 'Y2', 'Y3', 'Y4', 'Y5', 'Y6', 'Y7', 'Y8', 'Y9', 'Y10'], [])
  const salary = useMemo(() => [112, 124, 138, 156, 173, 192, 208, 225, 236, 244, 248].map((k) => k * 1000), [])

  const [canvas, setCanvas] = useState<HTMLCanvasElement | null>(null)
  useSalaryChart({ canvas, labels, data: salary })

  const health = useCountUp({ value: 82, durationMs: 900, active: inView })

  const timeline: TimelineItem[] = [
    { year: 'Year 1', title: 'Signal lock‑in', desc: 'Consistency creates compounding. You stop “starting over.”', tag: 'Momentum' },
    { year: 'Year 3', title: 'Role expansion', desc: 'Your scope grows. You ship bigger things with less drama.', tag: 'Leverage' },
    { year: 'Year 5', title: 'Market upgrade', desc: 'You’re valued for a rare combination—skills + proof.', tag: 'Moat' },
    { year: 'Year 8', title: 'Freedom phase', desc: 'You control your time. Stress becomes optional, not default.', tag: 'Autonomy' },
  ]

  return (
    <div ref={ref} className={cn('dash', inView && 'is-inview')}>
      <div className="dash__grid">
        <motion.div
          className="glass dash__hero"
          initial={{ opacity: 0, y: 14 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.35 }}
          transition={{ duration: 0.75, ease: [0.2, 0.8, 0.2, 1] }}
        >
          <div className="dash__heroTop">
            <div>
              <div className="dash__kicker">Results Dashboard</div>
              <div className="dash__title">Your next decade, simulated</div>
              <div className="dash__sub">A realistic curve + tradeoffs + milestones you can feel.</div>
            </div>
              <div className="dash__heroBadges">
                <span className="pill pill--ok">Data-driven</span>
                <span className="pill">Hybrid AI</span>
                <ExportPdfButton />
              </div>
          </div>

          <div className="dash__chartWrap">
            <div className="dash__chartHead">
              <div className="dash__chartTitle">
                <span className="dicon dicon--sm" aria-hidden="true">
                  <Icon kind="chart" />
                </span>
                Salary prediction curve
              </div>
              <div className="dash__chartMeta">Hover points for values</div>
            </div>
            <div className="dash__chart">
              <canvas ref={setCanvas} />
            </div>
          </div>
        </motion.div>

        <div className="dash__side">
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.35 }}
            transition={{ duration: 0.75, delay: 0.06, ease: [0.2, 0.8, 0.2, 1] }}
          >
            <Meter label="Stress" left="Calm" right="Overdrive" value={74} tone="stress" />
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.35 }}
            transition={{ duration: 0.75, delay: 0.12, ease: [0.2, 0.8, 0.2, 1] }}
          >
            <Meter label="Happiness" left="Flat" right="Fulfilled" value={67} tone="happy" />
          </motion.div>

          <motion.div
            className="glass dcard dcard--health"
            initial={{ opacity: 0, y: 14 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.35 }}
            transition={{ duration: 0.75, delay: 0.18, ease: [0.2, 0.8, 0.2, 1] }}
          >
            <div className="dcard__top">
              <div className="dicon" aria-hidden="true">
                <Icon kind="heart" />
              </div>
              <div className="dcard__k">Health score</div>
              <div className="dcard__badge">{Math.round(health)}</div>
            </div>
            <div className="dhealth__bar">
              <motion.div
                className="dhealth__fill"
                initial={{ width: '0%' }}
                whileInView={{ width: `${Math.round(health)}%` }}
                viewport={{ once: true, amount: 0.6 }}
                transition={{ duration: 0.9, ease: [0.2, 0.8, 0.2, 1] }}
              />
            </div>
            <div className="dcard__meta">Driven by habits: sleep, gym, smoking</div>
          </motion.div>
        </div>
      </div>

      <motion.div
        className="dash__summary"
        initial={{ opacity: 0, y: 14 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.35 }}
        transition={{ duration: 0.75, ease: [0.2, 0.8, 0.2, 1] }}
      >
        <SummaryCard title="Trajectory" value="Up and accelerating" meta="Consistency × skill signals" icon="spark" />
        <SummaryCard title="Risk" value="Burnout pressure" meta="Workload peaks in years 2–4" icon="shield" />
        <SummaryCard title="Leverage" value="Deep work blocks" meta="Small weekly changes compound" icon="brain" />
        <SummaryCard title="Milestones" value="4 major jumps" meta="Role, income, autonomy, health" icon="timeline" />
      </motion.div>

      <div className="dash__bottom">
        <motion.div
          className="glass dash__timeline"
          initial={{ opacity: 0, y: 14 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.35 }}
          transition={{ duration: 0.75, ease: [0.2, 0.8, 0.2, 1] }}
        >
          <div className="dash__timelineHead">
            <div className="dash__chartTitle">
              <span className="dicon dicon--sm" aria-hidden="true">
                <Icon kind="timeline" />
              </span>
              Career timeline
            </div>
            <div className="dash__chartMeta">Animated milestones</div>
          </div>

          <div className="dtl">
            {timeline.map((t, i) => (
              <motion.div
                key={t.year}
                className="dtl__row"
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.5 }}
                transition={{ duration: 0.6, delay: i * 0.06, ease: [0.2, 0.8, 0.2, 1] }}
              >
                <div className="dtl__rail" aria-hidden="true">
                  <div className="dtl__dot" />
                  <div className="dtl__line" />
                </div>
                <div className="dtl__card">
                  <div className="dtl__top">
                    <div className="dtl__year">{t.year}</div>
                    <div className="dtl__tag">{t.tag}</div>
                  </div>
                  <div className="dtl__title">{t.title}</div>
                  <div className="dtl__desc">{t.desc}</div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  )
}

