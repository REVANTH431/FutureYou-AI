import { AnimatePresence, motion } from 'framer-motion'
import { useMemo, useState } from 'react'
import { cn } from '../shared/utils/cn'
import { defaultSimulationInput, type CareerTrack, type CountryCode, type SimulationInput, type SkillTag } from './types'

type StepId = 'career' | 'country' | 'skills' | 'habits'
type Dir = 1 | -1

const stepOrder: StepId[] = ['career', 'country', 'skills', 'habits']

function clamp(n: number, min: number, max: number) {
  return Math.min(max, Math.max(min, n))
}

function parseIntOrNull(v: string) {
  const n = Number.parseInt(v, 10)
  return Number.isFinite(n) ? n : null
}

function titleFor(step: StepId) {
  switch (step) {
    case 'career':
      return 'Career'
    case 'country':
      return 'Country'
    case 'skills':
      return 'Skills'
    case 'habits':
      return 'Habits'
  }
}

function subtitleFor(step: StepId) {
  switch (step) {
    case 'career':
      return 'Pick the track you want to simulate.'
    case 'country':
      return 'Country changes salary bands and opportunity density.'
    case 'skills':
      return 'Choose what you’re building (and what the market will reward).'
    case 'habits':
      return 'Habits bend the decade more than motivation.'
  }
}

function stepValid(step: StepId, v: SimulationInput) {
  switch (step) {
    case 'career':
      return v.career != null
    case 'country':
      return v.country != null
    case 'skills':
      return v.skills.length >= 1
    case 'habits':
      return (
        v.studyHoursPerWeek != null &&
        v.studyHoursPerWeek >= 0 &&
        v.studyHoursPerWeek <= 70 &&
        v.gymDaysPerWeek != null &&
        v.gymDaysPerWeek >= 0 &&
        v.gymDaysPerWeek <= 7 &&
        v.smoking != null
      )
  }
}

function variantFor(dir: Dir) {
  return {
    initial: { opacity: 0, y: 12, x: dir * 14, filter: 'blur(10px)' },
    animate: { opacity: 1, y: 0, x: 0, filter: 'blur(0px)' },
    exit: { opacity: 0, y: -10, x: -dir * 10, filter: 'blur(10px)' },
  }
}

export function SimulatorWizard() {
  const [value, setValueState] = useState<SimulationInput>(defaultSimulationInput)
  const [stepIdx, setStepIdx] = useState(0)
  const [dir, setDir] = useState<Dir>(1)
  const step = stepOrder[stepIdx]!
  const progress = useMemo(() => (stepIdx / (stepOrder.length - 1)) * 100, [stepIdx])
  const canNext = stepValid(step, value)

  const setValue = (next: SimulationInput) => {
    setValueState(next)
    window.dispatchEvent(new CustomEvent<SimulationInput>('futureyou:simulation-change', { detail: next }))
  }

  const go = (nextIdx: number) => {
    const clamped = clamp(nextIdx, 0, stepOrder.length - 1)
    setDir(clamped > stepIdx ? 1 : -1)
    setStepIdx(clamped)
  }

  return (
    <div className="wizard">
      <div className="wizard__shell glass">
        <div className="wizard__top">
          <div className="wizard__titleRow">
            <div>
              <div className="wizard__kicker">Future Simulation</div>
              <div className="wizard__title">{titleFor(step)}</div>
              <div className="wizard__sub">{subtitleFor(step)}</div>
            </div>

            <div className="wizard__steps" aria-label="Steps">
              {stepOrder.map((s, i) => {
                const active = i === stepIdx
                const done = i < stepIdx
                return (
                  <button
                    key={s}
                    className={cn('wizstep', active && 'wizstep--active', done && 'wizstep--done')}
                    onClick={() => go(i)}
                    aria-current={active ? 'step' : undefined}
                  >
                    <span className="wizstep__dot" aria-hidden="true" />
                    <span className="wizstep__label">{titleFor(s)}</span>
                  </button>
                )
              })}
            </div>
          </div>

          <div className="wizard__progress" aria-label="Progress">
            <div className="wizard__progressTrack" />
            <motion.div
              className="wizard__progressFill"
              initial={false}
              animate={{ width: `${progress}%` }}
              transition={{ type: 'spring', stiffness: 220, damping: 26 }}
            />
          </div>
        </div>

        <div className="wizard__body">
          <AnimatePresence mode="popLayout" initial={false}>
            <motion.div
              key={step}
              className="wizard__panel"
              {...variantFor(dir)}
              transition={{ duration: 0.35, ease: [0.2, 0.8, 0.2, 1] }}
            >
              {step === 'career' ? (
                <StepCareerSelection value={value} onChange={setValue} />
              ) : step === 'country' ? (
                <StepCountrySelection value={value} onChange={setValue} />
              ) : step === 'skills' ? (
                <StepSkillsSelection value={value} onChange={setValue} />
              ) : (
                <StepHabitsInput value={value} onChange={setValue} />
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        <div className="wizard__footer">
          <div className="wizard__hint">
            {canNext ? (
              <span className="hint hint--ok">Looks good. Continue.</span>
            ) : (
              <span className="hint">Complete this step to continue.</span>
            )}
          </div>

          <div className="wizard__actions">
            <button className="btn btn--ghost" disabled={stepIdx === 0} onClick={() => go(stepIdx - 1)}>
              Back
            </button>
            {stepIdx < stepOrder.length - 1 ? (
              <button className="btn btn--primary" disabled={!canNext} onClick={() => go(stepIdx + 1)}>
                Next
              </button>
            ) : (
              <button
                className="btn btn--primary"
                disabled={!canNext}
                onClick={() => {
                  import('../api/backend')
                    .then(({ sendPrediction }) => sendPrediction(value, 'Primary scenario'))
                    .catch(() => null)
                }}
              >
                Save & sync with backend
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

function Field({
  label,
  hint,
  children,
}: {
  label: string
  hint?: string
  children: React.ReactNode
}) {
  return (
    <div className="field">
      <div className="field__top">
        <div className="field__label">{label}</div>
        {hint ? <div className="field__hint">{hint}</div> : null}
      </div>
      {children}
    </div>
  )
}

function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className={cn('input', props.className)} />
}

function Select(props: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return <select {...props} className={cn('select', props.className)} />
}

function StepCareerSelection({
  value,
  onChange,
}: {
  value: SimulationInput
  onChange: (v: SimulationInput) => void
}) {
  const cards: Array<{
    v: CareerTrack
    blurb: string
    meta: string
  }> = [
    { v: 'Software Engineer', blurb: 'Build systems that scale', meta: 'High leverage • high competition' },
    { v: 'Data Scientist', blurb: 'Predict, optimize, automate', meta: 'Strong compounding with skills' },
    { v: 'Product Manager', blurb: 'Own outcomes and direction', meta: 'Influence + execution tradeoff' },
    { v: 'UI/UX Designer', blurb: 'Design what people feel', meta: 'Taste + craft = career moat' },
    { v: 'Digital Marketer', blurb: 'Grow attention into revenue', meta: 'Fast feedback loops' },
    { v: 'Sales / BizDev', blurb: 'Turn trust into deals', meta: 'High upside • high pressure' },
  ]

  return (
    <div className="pickgrid">
      {cards.map((c, i) => {
        const active = value.career === c.v
        return (
          <motion.button
            key={c.v}
            type="button"
            className={cn('pickcard', active && 'pickcard--active')}
            onClick={() => onChange({ ...value, career: c.v })}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: i * 0.03, ease: [0.2, 0.8, 0.2, 1] }}
            whileHover={{ y: -3 }}
          >
            <div className="pickcard__t">{c.v}</div>
            <div className="pickcard__d">{c.blurb}</div>
            <div className="pickcard__m">{c.meta}</div>
            <div className="pickcard__glow" aria-hidden="true" />
          </motion.button>
        )
      })}
    </div>
  )
}

function StepCountrySelection({
  value,
  onChange,
}: {
  value: SimulationInput
  onChange: (v: SimulationInput) => void
}) {
  const cards: Array<{ code: CountryCode; label: string; meta: string }> = [
    { code: 'IN', label: 'India', meta: 'High competition • strong growth' },
    { code: 'JP', label: 'Japan', meta: 'Stability • deep craftsmanship' },
    { code: 'AE-DXB', label: 'Dubai', meta: 'Opportunity density • global hub' },
  ]
  return (
    <div className="pickgrid pickgrid--country">
      {cards.map((c, i) => {
        const active = value.country === c.code
        return (
          <motion.button
            key={c.code}
            type="button"
            className={cn('pickcard', 'pickcard--country', active && 'pickcard--active')}
            onClick={() => onChange({ ...value, country: c.code })}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: i * 0.04, ease: [0.2, 0.8, 0.2, 1] }}
            whileHover={{ y: -3 }}
          >
            <div className="pickcard__flag" aria-hidden="true" />
            <div className="pickcard__t">{c.label}</div>
            <div className="pickcard__m">{c.meta}</div>
            <div className="pickcard__glow" aria-hidden="true" />
          </motion.button>
        )
      })}
    </div>
  )
}

function StepSkillsSelection({
  value,
  onChange,
}: {
  value: SimulationInput
  onChange: (v: SimulationInput) => void
}) {
  const all: SkillTag[] = [
    'AI/ML',
    'React',
    'Node.js',
    'Data Analysis',
    'System Design',
    'Product Strategy',
    'UI Design',
    'Leadership',
    'Public Speaking',
    'Growth',
  ]

  const toggle = (tag: SkillTag) => {
    const has = value.skills.includes(tag)
    onChange({ ...value, skills: has ? value.skills.filter((t) => t !== tag) : [...value.skills, tag] })
  }

  return (
    <div className="tagpick">
      <div className="tagpick__top">
        <div className="tagpick__title">Select skills</div>
        <div className="tagpick__meta">{value.skills.length} selected</div>
      </div>

      <div className="tags">
        {all.map((t, i) => {
          const active = value.skills.includes(t)
          return (
            <motion.button
              key={t}
              type="button"
              className={cn('tag', active && 'tag--active')}
              onClick={() => toggle(t)}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, delay: i * 0.01, ease: [0.2, 0.8, 0.2, 1] }}
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.98 }}
            >
              {t}
            </motion.button>
          )
        })}
      </div>
    </div>
  )
}

function StepHabitsInput({
  value,
  onChange,
}: {
  value: SimulationInput
  onChange: (v: SimulationInput) => void
}) {
  return (
    <div className="grid2">
      <Field label="Study hours / week" hint="0–70">
        <Input
          value={value.studyHoursPerWeek ?? ''}
          inputMode="numeric"
          placeholder="e.g. 8"
          onChange={(e) => onChange({ ...value, studyHoursPerWeek: parseIntOrNull(e.target.value) })}
        />
      </Field>

      <Field label="Gym (days/week)" hint="0–7">
        <Input
          value={value.gymDaysPerWeek ?? ''}
          inputMode="numeric"
          placeholder="e.g. 3"
          onChange={(e) => onChange({ ...value, gymDaysPerWeek: parseIntOrNull(e.target.value) })}
        />
      </Field>

      <Field label="Smoking">
        <Select
          value={value.smoking ?? ''}
          onChange={(e) => onChange({ ...value, smoking: (e.target.value || null) as any })}
        >
          <option value="" disabled>
            Select…
          </option>
          <option value="no">No</option>
          <option value="sometimes">Sometimes</option>
          <option value="yes">Yes</option>
        </Select>
      </Field>

      <Field label="Preview" hint="Stored in state">
        <div className="previewbox">
          <div className="previewbox__row">
            <span>Career</span>
            <span>{value.career ?? '—'}</span>
          </div>
          <div className="previewbox__row">
            <span>Country</span>
            <span>{value.country ?? '—'}</span>
          </div>
          <div className="previewbox__row">
            <span>Skills</span>
            <span>{value.skills.length ? value.skills.join(', ') : '—'}</span>
          </div>
        </div>
      </Field>
    </div>
  )
}

