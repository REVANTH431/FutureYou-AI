export type CountryCode = 'IN' | 'JP' | 'AE-DXB'

export type CareerTrack =
  | 'Software Engineer'
  | 'Data Scientist'
  | 'Product Manager'
  | 'UI/UX Designer'
  | 'Digital Marketer'
  | 'Sales / BizDev'

export type SkillTag =
  | 'AI/ML'
  | 'React'
  | 'Node.js'
  | 'Data Analysis'
  | 'Product Strategy'
  | 'UI Design'
  | 'Leadership'
  | 'Public Speaking'
  | 'System Design'
  | 'Growth'

export type SimulationInput = {
  career: CareerTrack | null
  country: CountryCode | null
  skills: SkillTag[]

  studyHoursPerWeek: number | null
  gymDaysPerWeek: number | null
  smoking: 'no' | 'sometimes' | 'yes' | null

  workHoursPerWeek?: number | null
  consistency?: number | null // 0..100
  learningConsistency?: number | null // 0..100
}

export const defaultSimulationInput: SimulationInput = {
  career: null,
  country: null,
  skills: [],
  studyHoursPerWeek: null,
  gymDaysPerWeek: null,
  smoking: null,
  workHoursPerWeek: null,
  consistency: null,
  learningConsistency: null,
}

