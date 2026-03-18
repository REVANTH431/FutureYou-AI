import type { SimulationInput } from './types'

function clamp(n: number, min: number, max: number) {
  return Math.min(max, Math.max(min, n))
}

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t
}

export type SalaryResult = {
  baseYear: number
  tenYearCurve: number[]
  score: number
  components: {
    country: number
    skills: number
    consistency: number
  }
}

export type HealthResult = {
  score: number
  components: {
    smoking: number
    sleep: number
    gym: number
  }
}

export type StressResult = {
  score: number
  components: {
    career: number
    workHours: number
  }
}

export type GrowthResult = {
  score: number
  components: {
    learningConsistency: number
    skillSurface: number
  }
}

export type ScoringResult = {
  salary: SalaryResult
  health: HealthResult
  stress: StressResult
  growth: GrowthResult
}

export function scoreAll(input: SimulationInput): ScoringResult {
  const salary = scoreSalary(input)
  const health = scoreHealth(input)
  const stress = scoreStress(input)
  const growth = scoreGrowth(input)
  return { salary, health, stress, growth }
}

export function scoreSalary(input: SimulationInput): SalaryResult {
  const countryFactor = (() => {
    switch (input.country) {
      case 'AE-DXB':
        return 1.2
      case 'JP':
        return 1.05
      case 'IN':
        return 0.65
      default:
        return 0.9
    }
  })()

  const highLeverage = new Set(['AI/ML', 'System Design', 'Product Strategy', 'Leadership'] as const)
  const depthRaw =
    input.skills.length +
    input.skills.filter((s) => highLeverage.has(s as any)).length
  const depth = clamp(depthRaw / 8, 0, 1)

  const inferredConsistency =
    input.studyHoursPerWeek == null ? 0.4 : clamp(input.studyHoursPerWeek / 20, 0, 1)
  const consistencyNorm = clamp((input.consistency ?? inferredConsistency * 100) / 100, 0, 1)

  const base =
    20 + // lower bound
    40 * countryFactor + // location band
    25 * depth + // skills depth
    25 * consistencyNorm // execution
  const baseYear = Math.round(base * 1000)

  const annualGrowthPct = clamp(0.03 + depth * 0.06 + consistencyNorm * 0.04, 0.03, 0.16)

  const tenYearCurve: number[] = []
  let current = baseYear
  for (let i = 0; i <= 10; i++) {
    tenYearCurve.push(Math.round(current))
    current *= 1 + annualGrowthPct * (i > 0 ? 1 : 0.7) // slightly slower in year 1
  }

  const end = tenYearCurve[tenYearCurve.length - 1] ?? baseYear
  const norm = clamp((end - 20000) / (400000 - 20000), 0, 1)
  const score = Math.round(norm * 100)

  const components = {
    country: clamp(countryFactor / 1.2, 0, 1),
    skills: depth,
    consistency: consistencyNorm,
  }

  return { baseYear, tenYearCurve, score, components }
}

export function scoreHealth(input: SimulationInput): HealthResult {
  let score = 70

  let smokingDelta = 0
  if (input.smoking === 'yes') score -= 25
  else if (input.smoking === 'sometimes') score -= 12
  else if (input.smoking === 'no') score += 5
  smokingDelta = clamp(score - 70, -30, 10)

  const sleep = input.studyHoursPerWeek == null ? 6.5 : clamp(input.studyHoursPerWeek / 3, 4, 9)
  let sleepDelta = 0
  if (sleep < 6) score -= lerp(5, 18, (6 - sleep) / 2) // brutal below 5–6
  else if (sleep > 8.5) score -= lerp(2, 8, (sleep - 8.5) / 1.5) // too much often = low energy
  else score += 8
  sleepDelta = clamp(score - 70 - smokingDelta, -20, 12)

  const gym = clamp(input.gymDaysPerWeek ?? 0, 0, 7)
  let gymDelta = 0
  if (gym === 0) score -= 8
  else if (gym <= 2) score += 4
  else if (gym <= 4) score += 9
  else score += 6
  gymDelta = clamp(score - 70 - smokingDelta - sleepDelta, -10, 12)

  const finalScore = clamp(Math.round(score), 0, 100)

  return {
    score: finalScore,
    components: {
      smoking: clamp(Math.round(50 + (smokingDelta / 30) * -50), 0, 100),
      sleep: clamp(Math.round(50 + (sleepDelta / 20) * 50), 0, 100),
      gym: clamp(Math.round(50 + (gymDelta / 12) * 50), 0, 100),
    },
  }
}

export function scoreStress(input: SimulationInput): StressResult {
  let base = 40
  switch (input.career) {
    case 'Sales / BizDev':
      base = 70
      break
    case 'Product Manager':
      base = 65
      break
    case 'Software Engineer':
    case 'Data Scientist':
      base = 55
      break
    case 'Digital Marketer':
      base = 55
      break
    case 'UI/UX Designer':
      base = 48
      break
    default:
      base = 50
  }

  const work = input.workHoursPerWeek ?? 45
  const overload = clamp((work - 40) / 25, 0, 1) // 40h→0, 65h→1+
  const underload = work < 30 ? (30 - work) / 15 : 0

  let score = base
  score += overload * 25
  score -= underload * 10 // underload reduces acute stress, but might hurt growth

  const finalScore = clamp(Math.round(score), 0, 100)

  return {
    score: finalScore,
    components: {
      career: clamp(Math.round((base / 100) * 100), 0, 100),
      workHours: clamp(Math.round(overload * 100), 0, 100),
    },
  }
}

export function scoreGrowth(input: SimulationInput): GrowthResult {
  const study = clamp(input.studyHoursPerWeek ?? 0, 0, 40)
  const inferred = study / 20 // 0–40h → 0–2 (clamped later)
  const learningConsistency = clamp((input.learningConsistency ?? inferred * 100) / 100, 0, 1)

  const depth = clamp(input.skills.length / 6, 0, 1)

  const score = clamp(learningConsistency * 0.7 + depth * 0.3, 0, 1)
  const finalScore = Math.round(score * 100)

  return {
    score: finalScore,
    components: {
      learningConsistency: Math.round(learningConsistency * 100),
      skillSurface: Math.round(depth * 100),
    },
  }
}

