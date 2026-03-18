import mongoose from 'mongoose';

const SimulationInputSchema = new mongoose.Schema(
  {
    career: String,
    country: String,
    skills: [String],
    studyHoursPerWeek: Number,
    gymDaysPerWeek: Number,
    smoking: String,
    workHoursPerWeek: Number,
    consistency: Number,
    learningConsistency: Number,
  },
  { _id: false },
);

const ScoreSchema = new mongoose.Schema(
  {
    score: Number,
    components: mongoose.Schema.Types.Mixed,
  },
  { _id: false },
);

const SessionSchema = new mongoose.Schema(
  {
    createdAt: { type: Date, default: Date.now },
    label: { type: String },
    input: SimulationInputSchema,
    scores: {
      salary: ScoreSchema,
      health: ScoreSchema,
      stress: ScoreSchema,
      growth: ScoreSchema,
    },
  },
  { collection: 'sessions' },
);

export const Session = mongoose.model('Session', SessionSchema);

