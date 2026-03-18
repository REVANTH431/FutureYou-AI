import { motion, useReducedMotion, useScroll, useTransform } from 'framer-motion'
import { useEffect, useMemo, useRef, useState } from 'react'
import { useCountUp } from '../shared/hooks/useCountUp'
import { useInView } from '../shared/hooks/useInView'
import { useRafScroll } from '../shared/hooks/useRafScroll'
import { cn } from '../shared/utils/cn'
import { SimulatorWizard } from '../simulator/SimulatorWizard'
import { FutureDashboard } from '../dashboard/FutureDashboard'
import { FutureChat } from '../ai/FutureChat'
import { LifeStory } from '../ai/LifeStory'
import { ScenarioComparison } from '../comparison/ScenarioComparison'

type Stat = { label: string; value: number; suffix?: string }
type TimelineItem = {
  k: string
  t: string
  d: string
  meta?: string
}

function scrollToId(id: string) {
  const el = document.getElementById(id)
  el?.scrollIntoView({ behavior: 'smooth', block: 'start' })
}

function Navbar() {
  const [scrolled, setScrolled] = useState(false)

  useRafScroll((y) => {
    setScrolled(y > 8)
  })

  return (
    <header
      className={cn(
        'nav',
        scrolled ? 'nav--scrolled' : 'nav--top',
      )}
    >
      <div className="container nav__inner">
        <a className="brand" href="#" aria-label="FutureYou home">
          <span className="brand__mark" aria-hidden="true" />
          <span className="brand__text">FutureYou</span>
        </a>

        <nav className="nav__links" aria-label="Primary">
          <button className="link" onClick={() => scrollToId('preview')}>Preview</button>
          <button className="link" onClick={() => scrollToId('timeline')}>Timeline</button>
          <button className="link" onClick={() => scrollToId('features')}>Features</button>
          <button className="link" onClick={() => scrollToId('dashboard')}>Dashboard</button>
          <button className="link" onClick={() => scrollToId('ai')}>AI</button>
          <button className="link" onClick={() => scrollToId('compare')}>Compare</button>
        </nav>

        <div className="nav__cta">
          <button className="btn btn--ghost" onClick={() => scrollToId('features')}>
            See how it works
          </button>
          <button className="btn btn--primary" onClick={() => scrollToId('cta')}>
            Simulate my future
          </button>
        </div>
      </div>
    </header>
  )
}

function Hero() {
  const heroRef = useRef<HTMLElement | null>(null)
  const reduceMotion = useReducedMotion()
  const { scrollYProgress } = useScroll()
  const orbAY = useTransform(scrollYProgress, [0, 0.35], [0, reduceMotion ? 0 : -24])
  const orbBY = useTransform(scrollYProgress, [0, 0.35], [0, reduceMotion ? 0 : 18])
  const orbCY = useTransform(scrollYProgress, [0, 0.35], [0, reduceMotion ? 0 : 32])

  const chips = useMemo(
    () => [
      'Salary curve • 10-year view',
      'Stress ↔ Success tradeoff',
      'Habits → health impact',
      'Career milestones',
      'Future-self chat',
    ],
    [],
  )

  return (
    <section ref={heroRef} className="hero" aria-label="Hero">
      <div className="hero__bg" aria-hidden="true">
        <div className="bg-grid" />
        <div className="bg-particles" />
        <motion.div className="bg-orb bg-orb--a" style={{ y: orbAY }} />
        <motion.div className="bg-orb bg-orb--b" style={{ y: orbBY }} />
        <motion.div className="bg-orb bg-orb--c" style={{ y: orbCY }} />
      </div>

      <div className="container hero__inner">
        <div className="hero__left">
          <motion.div
            className="kicker"
            initial={{ opacity: 0, y: 10, filter: 'blur(6px)' }}
            animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
            transition={{ duration: 0.7, ease: [0.2, 0.8, 0.2, 1] }}
          >
            <span className="kicker__dot" aria-hidden="true" />
            AI Life Decision Simulator
          </motion.div>
          <motion.h1
            className="h1"
            initial={{ opacity: 0, y: 14, filter: 'blur(10px)' }}
            animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
            transition={{ duration: 0.8, delay: 0.06, ease: [0.2, 0.8, 0.2, 1] }}
          >
            See your future before you live it.
          </motion.h1>
          <motion.p
            className="lead"
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.75, delay: 0.12, ease: [0.2, 0.8, 0.2, 1] }}
          >
            A data-driven simulation engine that turns your habits, career choices, and consistency into
            a realistic salary curve, health trajectory, stress map, and a cinematic story—then lets
            your future self talk back.
          </motion.p>

          <motion.div
            className="hero__actions"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.18, ease: [0.2, 0.8, 0.2, 1] }}
          >
            <button className="btn btn--primary btn--xl" onClick={() => scrollToId('cta')}>
              Simulate my future
            </button>
            <button className="btn btn--ghost btn--xl" onClick={() => scrollToId('preview')}>
              Watch the preview
            </button>
          </motion.div>

          <motion.div
            className="hero__chips"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.24, ease: [0.2, 0.8, 0.2, 1] }}
          >
            {chips.map((c) => (
              <span key={c} className="chip">
                {c}
              </span>
            ))}
          </motion.div>
        </div>

        <HeroDevice />
      </div>

      <button
        type="button"
        className="scrollHint"
        onClick={() => scrollToId('simulate')}
        aria-label="Scroll to simulator"
      >
        <span className="scrollHint__circle" />
        <span className="scrollHint__line" />
        <span className="scrollHint__label">Scroll to simulate your future</span>
      </button>
    </section>
  )
}

function HeroDevice() {
  const { ref, inView } = useInView<HTMLDivElement>({ threshold: 0.2, once: true })

  return (
    <motion.div
      ref={ref}
      className={cn('hero__right', inView ? 'is-inview' : '')}
      initial={{ opacity: 0, y: 18, rotateX: 6 }}
      animate={inView ? { opacity: 1, y: 0, rotateX: 0 } : undefined}
      transition={{ duration: 0.9, ease: [0.2, 0.8, 0.2, 1] }}
    >
      <div className="device">
        <div className="device__top">
          <div className="device__dots" aria-hidden="true">
            <span />
            <span />
            <span />
          </div>
          <div className="device__title">FutureYou Simulation</div>
          <div className="device__badge">LIVE</div>
        </div>

        <div className="device__body">
          <div className="device__row">
            <div className="pill pill--ok">Consistency: 78%</div>
            <div className="pill">Country: US</div>
            <div className="pill">Skill: Software</div>
          </div>

          <div className="glass card card--chart">
            <div className="card__head">
              <div className="card__headL">
                <div className="card__label">Projected salary</div>
                <div className="card__value">$112k → $248k</div>
              </div>
              <div className="card__meta">10-year curve</div>
            </div>
            <div className="spark" aria-hidden="true">
              <div className="spark__line" />
              <div className="spark__glow" />
            </div>
          </div>

          <div className="device__grid">
            <div className="glass card">
              <div className="card__label">Stress</div>
              <div className="meter">
                <div className="meter__track" />
                <div className="meter__fill meter__fill--stress" />
                <div className="meter__dot" />
              </div>
              <div className="card__meta">High but controllable</div>
            </div>

            <div className="glass card">
              <div className="card__label">Life satisfaction</div>
              <div className="meter">
                <div className="meter__track" />
                <div className="meter__fill meter__fill--happy" />
                <div className="meter__dot meter__dot--happy" />
              </div>
              <div className="card__meta">Rising with habits</div>
            </div>
          </div>

          <div className="glass card card--chat">
            <div className="card__label">Future self</div>
            <div className="chat">
              <div className="chat__msg chat__msg--ai">
                <div className="chat__bubble">
                  You don’t need a perfect plan. You need a repeatable week.
                </div>
              </div>
              <div className="chat__msg chat__msg--me">
                <div className="chat__bubble">What’s the fastest lever?</div>
              </div>
              <div className="chat__msg chat__msg--ai">
                <div className="chat__bubble">
                  Sleep and focus blocks. Fix those and your curve bends upward.
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="hero__shine" aria-hidden="true" />
    </motion.div>
  )
}

function Stats() {
  const { ref, inView } = useInView<HTMLDivElement>({ threshold: 0.25, once: true })

  const stats: Stat[] = [
    { label: 'Inputs captured', value: 37, suffix: '+' },
    { label: 'Signals scored', value: 128, suffix: '+' },
    { label: 'Simulation horizon', value: 10, suffix: ' yrs' },
    { label: 'Scenario switches', value: 3, suffix: 'x' },
  ]

  return (
    <section className="stats" aria-label="Stats">
      <div className="container">
        <div ref={ref} className={cn('glass stats__card', inView ? 'is-inview' : '')}>
          {stats.map((s) => (
            <StatCard key={s.label} stat={s} active={inView} />
          ))}
        </div>
      </div>
    </section>
  )
}

function StatCard({ stat, active }: { stat: Stat; active: boolean }) {
  const value = useCountUp({ value: stat.value, start: 0, durationMs: 900, active })
  return (
    <div className="stat">
      <div className="stat__value">
        {Math.round(value)}
        {stat.suffix ?? ''}
      </div>
      <div className="stat__label">{stat.label}</div>
    </div>
  )
}

function Preview() {
  const { ref, inView } = useInView<HTMLDivElement>({ threshold: 0.2, once: true })

  return (
    <section id="preview" className="section" aria-label="Animated preview">
      <div className="container">
        <motion.div
          className="section__head"
          initial={{ opacity: 0, y: 14 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 0.75, ease: [0.2, 0.8, 0.2, 1] }}
        >
          <h2 className="h2">A preview that feels uncomfortably real</h2>
          <p className="subhead">
            Not random. Not “vibes.” A hybrid engine that turns behavior into outcomes—then tells the story.
          </p>
        </motion.div>

        <div ref={ref} className={cn('preview', inView ? 'is-inview' : '')}>
          <motion.div
            className="glass preview__main"
            initial={{ opacity: 0, y: 14 }}
            animate={inView ? { opacity: 1, y: 0 } : undefined}
            transition={{ duration: 0.8, ease: [0.2, 0.8, 0.2, 1] }}
          >
            <div className="preview__title">
              <span className="preview__pulse" aria-hidden="true" />
              Simulation Output
            </div>
            <div className="preview__grid">
              <PreviewMetric k="Salary curve" v="Rising, compounding" meta="Country × skill × consistency" />
              <PreviewMetric k="Stress tradeoff" v="High peaks, stable base" meta="Work hours × ambition" />
              <PreviewMetric k="Health impact" v="Recovering and strong" meta="Sleep × exercise × habits" />
              <PreviewMetric k="Satisfaction" v="Growing after year 3" meta="Autonomy × relationships" />
            </div>
          </motion.div>

          <div className="preview__side">
            <motion.div
              className="glass card card--mini"
              initial={{ opacity: 0, y: 14 }}
              animate={inView ? { opacity: 1, y: 0 } : undefined}
              transition={{ duration: 0.7, delay: 0.08, ease: [0.2, 0.8, 0.2, 1] }}
            >
              <div className="card__label">Milestone</div>
              <div className="card__value">Lead role</div>
              <div className="card__meta">Year 4–5</div>
            </motion.div>
            <motion.div
              className="glass card card--mini"
              initial={{ opacity: 0, y: 14 }}
              animate={inView ? { opacity: 1, y: 0 } : undefined}
              transition={{ duration: 0.7, delay: 0.16, ease: [0.2, 0.8, 0.2, 1] }}
            >
              <div className="card__label">Risk</div>
              <div className="card__value">Burnout</div>
              <div className="card__meta">Mitigate with sleep + focus blocks</div>
            </motion.div>
            <motion.div
              className="glass card card--mini"
              initial={{ opacity: 0, y: 14 }}
              animate={inView ? { opacity: 1, y: 0 } : undefined}
              transition={{ duration: 0.7, delay: 0.24, ease: [0.2, 0.8, 0.2, 1] }}
            >
              <div className="card__label">Leverage</div>
              <div className="card__value">Consistency</div>
              <div className="card__meta">Bends curve more than “motivation”</div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  )
}

function PreviewMetric({ k, v, meta }: { k: string; v: string; meta: string }) {
  return (
    <div className="metric">
      <div className="metric__k">{k}</div>
      <div className="metric__v">{v}</div>
      <div className="metric__meta">{meta}</div>
    </div>
  )
}

function Timeline() {
  const items: TimelineItem[] = [
    {
      k: 'Capture signals',
      t: 'Your inputs become measurable',
      d: 'We turn habits + career choices into stable signals: consistency, risk appetite, learning velocity, and work stress.',
      meta: 'Multistep form',
    },
    {
      k: 'Score outcomes',
      t: 'A hybrid engine simulates reality',
      d: 'Rule-based constraints + weighted scoring produce trajectories that feel like real life—not randomness.',
      meta: 'Rules + scoring',
    },
    {
      k: 'Render the future',
      t: 'A dashboard you can feel',
      d: 'Salary curves, stress maps, health impact, and milestones—animated with clarity and emotional weight.',
      meta: 'Dashboard',
    },
    {
      k: 'Talk to yourself',
      t: 'Future-you answers honestly',
      d: 'You can ask anything—then compare scenarios with a split-screen decision view.',
      meta: 'Chat + comparison',
    },
  ]

  return (
    <section id="timeline" className="section section--tight" aria-label="How it works timeline">
      <div className="container">
        <motion.div
          className="section__head"
          initial={{ opacity: 0, y: 14 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 0.75, ease: [0.2, 0.8, 0.2, 1] }}
        >
          <h2 className="h2">How it works</h2>
          <p className="subhead">A timeline that turns “what if” into “show me.”</p>
        </motion.div>

        <div className="timeline">
          {items.map((it, idx) => (
            <TimelineRow key={it.k} item={it} index={idx} />
          ))}
        </div>
      </div>
    </section>
  )
}

function TimelineRow({ item, index }: { item: TimelineItem; index: number }) {
  const { ref, inView } = useInView<HTMLDivElement>({ threshold: 0.35, once: true })
  return (
    <motion.div
      ref={ref}
      className={cn('trow', inView ? 'is-inview' : '')}
      initial={{ opacity: 0, y: 14 }}
      animate={inView ? { opacity: 1, y: 0 } : undefined}
      transition={{ duration: 0.8, delay: index * 0.06, ease: [0.2, 0.8, 0.2, 1] }}
    >
      <div className="trow__rail" aria-hidden="true">
        <div className="trow__dot" />
        <div className="trow__line" />
      </div>
      <div className="glass trow__card">
        <div className="trow__k">{item.k}</div>
        <div className="trow__t">{item.t}</div>
        <div className="trow__d">{item.d}</div>
        {item.meta ? <div className="trow__meta">{item.meta}</div> : null}
      </div>
    </motion.div>
  )
}

function Features() {
  const features = [
    {
      t: 'AI Future Simulation Form',
      d: 'A multi-step experience with smooth transitions and micro-feedback.',
      icon: 'spark',
    },
    {
      t: 'Future Dashboard',
      d: 'Salary curve + stress/happiness meters + milestones timeline.',
      icon: 'chart',
    },
    {
      t: 'Future Self Chat',
      d: 'A ChatGPT-grade UI with emotional, grounded answers.',
      icon: 'chat',
    },
    {
      t: 'Decision Comparison',
      d: 'Split-screen scenarios with satisfying transitions.',
      icon: 'compare',
    },
    {
      t: 'Cinematic Life Story',
      d: 'A narrative output that feels like your own movie.',
      icon: 'story',
    },
    {
      t: 'Exportable Report',
      d: 'A clean PDF export designed to be shared.',
      icon: 'pdf',
    },
  ]

  return (
    <section id="features" className="section" aria-label="Feature highlights">
      <div className="container">
        <motion.div
          className="section__head"
          initial={{ opacity: 0, y: 14 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 0.75, ease: [0.2, 0.8, 0.2, 1] }}
        >
          <h2 className="h2">Built to be addictive (and shareable)</h2>
          <p className="subhead">
            Every screen is designed to feel fast, polished, and emotionally accurate.
          </p>
        </motion.div>

        <div className="fgrid">
          {features.map((f, i) => (
            <FeatureCard key={f.t} title={f.t} desc={f.d} icon={f.icon as FeatureIconKind} index={i} />
          ))}
        </div>
      </div>
    </section>
  )
}

type FeatureIconKind = 'spark' | 'chart' | 'chat' | 'compare' | 'story' | 'pdf'

function FeatureIcon({ kind }: { kind: FeatureIconKind }) {
  switch (kind) {
    case 'chart':
      return (
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path
            d="M4 19V5m0 14h16"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
          />
          <path
            d="M7 15l3-3 3 2 6-7"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      )
    case 'chat':
      return (
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path
            d="M5 5h14v9H9l-4 4z"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinejoin="round"
            fill="none"
          />
          <path d="M9 9h6M9 11.8h3.4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
        </svg>
      )
    case 'compare':
      return (
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M7 4v13M17 7v13" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
          <path d="M4 11h6M14 13h6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
        </svg>
      )
    case 'story':
      return (
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path
            d="M6 4h8l4 4v12H6z"
            stroke="currentColor"
            strokeWidth="1.6"
            fill="none"
            strokeLinejoin="round"
          />
          <path d="M9 9h4M9 12h6M9 15h3" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
        </svg>
      )
    case 'pdf':
      return (
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path
            d="M6 4h8l4 4v12H6z"
            stroke="currentColor"
            strokeWidth="1.6"
            fill="none"
            strokeLinejoin="round"
          />
          <path d="M9 14h1.5a1.5 1.5 0 0 0 0-3H9v3Zm4-3v3M13 12h1.2a1.3 1.3 0 0 1 0 2.6H13" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
        </svg>
      )
    case 'spark':
    default:
      return (
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path
            d="M12 3.5 13.3 8l4.5 1.3L13.3 11 12 15.5 10.7 11 6.2 9.3 10.7 8z"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinejoin="round"
            fill="none"
          />
        </svg>
      )
  }
}

function FeatureCard({ title, desc, icon, index }: { title: string; desc: string; icon: FeatureIconKind; index: number }) {
  return (
    <motion.div
      className="glass fcard"
      initial={{ opacity: 0, y: 14 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.35 }}
      transition={{ duration: 0.75, delay: index * 0.05, ease: [0.2, 0.8, 0.2, 1] }}
      whileHover={{ y: -4, boxShadow: '0 32px 110px rgba(0, 0, 0, 0.68)' }}
    >
      <div className="fcard__icon" aria-hidden="true">
        <FeatureIcon kind={icon} />
      </div>
      <div className="fcard__t">{title}</div>
      <div className="fcard__d">{desc}</div>
      <div className="fcard__shine" aria-hidden="true" />
    </motion.div>
  )
}

function CTA() {
  const { ref, inView } = useInView<HTMLDivElement>({ threshold: 0.25, once: true })

  return (
    <section id="cta" className="section section--cta" aria-label="Call to action">
      <div className="container">
        <motion.div
          ref={ref}
          className="glass cta"
          initial={{ opacity: 0, y: 14 }}
          animate={inView ? { opacity: 1, y: 0 } : undefined}
          transition={{ duration: 0.8, ease: [0.2, 0.8, 0.2, 1] }}
        >
          <div className="cta__left">
            <h2 className="h2">You’re one decision away from a different decade.</h2>
            <p className="subhead">
              Start with the landing experience now—then we’ll wire the full simulator next.
            </p>
            <div className="cta__actions">
              <button className="btn btn--primary btn--xl" onClick={() => scrollToId('simulate')}>
                Start simulation
              </button>
              <button className="btn btn--ghost btn--xl">Get early access</button>
            </div>
            <div className="cta__fine">
              No account needed for the demo flow. Your data stays local until you choose to save.
            </div>
          </div>

          <div className="cta__right" aria-hidden="true">
            <div className="cta__ring" />
            <div className="cta__ring cta__ring--b" />
            <div className="cta__ring cta__ring--c" />
          </div>
        </motion.div>
      </div>
    </section>
  )
}

function Footer() {
  return (
    <footer className="footer" aria-label="Footer">
      <div className="container footer__inner">
        <div className="footer__brand">
          <div className="brand brand--small">
            <span className="brand__mark" aria-hidden="true" />
            <span className="brand__text">FutureYou</span>
          </div>
          <div className="footer__copy">© {new Date().getFullYear()} FutureYou. All rights reserved.</div>
        </div>
        <div className="footer__links">
          <a className="link link--a" href="#" onClick={(e) => (e.preventDefault(), scrollToId('preview'))}>
            Preview
          </a>
          <a className="link link--a" href="#" onClick={(e) => (e.preventDefault(), scrollToId('timeline'))}>
            Timeline
          </a>
          <a className="link link--a" href="#" onClick={(e) => (e.preventDefault(), scrollToId('features'))}>
            Features
          </a>
        </div>
      </div>
    </footer>
  )
}

export function LandingPage() {
  useEffect(() => {
    document.documentElement.classList.add('fy')
    return () => document.documentElement.classList.remove('fy')
  }, [])

  return (
    <div className="app">
      <Navbar />
      <main>
        <Hero />
        <Stats />
        <Preview />
        <Timeline />
        <Features />
        <SimulatorSection />
        <DashboardSection />
        <AiSection />
        <CompareSection />
        <CTA />
      </main>
      <Footer />
    </div>
  )
}

function SimulatorSection() {
  return (
    <section id="simulate" className="section" aria-label="Future simulation form">
      <div className="container">
        <motion.div
          className="section__head"
          initial={{ opacity: 0, y: 14 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 0.75, ease: [0.2, 0.8, 0.2, 1] }}
        >
          <h2 className="h2">Run your simulation</h2>
          <p className="subhead">
            Answer a few questions. We’ll turn your choices into a trajectory you can explore.
          </p>
        </motion.div>

        <SimulatorWizard />
      </div>
    </section>
  )
}

function DashboardSection() {
  return (
    <section id="dashboard" className="section" aria-label="Future dashboard">
      <div className="container">
        <motion.div
          className="section__head"
          initial={{ opacity: 0, y: 14 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 0.75, ease: [0.2, 0.8, 0.2, 1] }}
        >
          <h2 className="h2">Your future, rendered</h2>
          <p className="subhead">
            Salary curve, stress vs happiness, health score, milestones, and a clean summary—built to feel real.
          </p>
        </motion.div>

        <FutureDashboard />
      </div>
    </section>
  )
}

function AiSection() {
  return (
    <section id="ai" className="section" aria-label="AI conversation and story">
      <div className="container">
        <motion.div
          className="section__head"
          initial={{ opacity: 0, y: 14 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 0.75, ease: [0.2, 0.8, 0.2, 1] }}
        >
          <h2 className="h2">Let your future self talk back</h2>
          <p className="subhead">
            Chat with a realistic future‑you and read a cinematic, data‑driven story of where this path leads.
          </p>
        </motion.div>

        <div className="aigrid">
          <FutureChat />
          <LifeStory />
        </div>
      </div>
    </section>
  )
}

function CompareSection() {
  return (
    <section id="compare" className="section" aria-label="Scenario comparison">
      <div className="container">
        <motion.div
          className="section__head"
          initial={{ opacity: 0, y: 14 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 0.75, ease: [0.2, 0.8, 0.2, 1] }}
        >
          <h2 className="h2">Compare two possible futures</h2>
          <p className="subhead">
            Capture two different configurations — like “stay” vs “move” — and see how salary, stress, and health shift
            side‑by‑side.
          </p>
        </motion.div>

        <ScenarioComparison />
      </div>
    </section>
  )
}

