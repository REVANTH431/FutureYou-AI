import type { SimulationInput } from '../simulator/types'

const API_BASE = (import.meta as any).env?.VITE_API_URL || 'http://localhost:4000'

export type PredictResponse = {
  scores: unknown
  sessionId: string | null
}

export async function sendPrediction(input: SimulationInput, label?: string): Promise<PredictResponse | null> {
  try {
    const res = await fetch(`${API_BASE}/api/predict`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ input, label }),
    })
    if (!res.ok) return null
    return (await res.json()) as PredictResponse
  } catch {
    return null
  }
}

