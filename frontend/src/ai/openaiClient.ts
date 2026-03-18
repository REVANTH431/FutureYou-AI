import type { SimulationInput } from '../simulator/types'
import { scoreAll } from '../simulator/scoring'

type ChatMessage = { role: 'system' | 'user' | 'assistant'; content: string }

const API_URL = 'https://api.openai.com/v1/chat/completions'
const MODEL = 'gpt-4o-mini'

function getApiKey() {
  // Expect a Vite env var when running with a real key.
  // Never hard-code secrets.
  return (import.meta as any).env?.VITE_OPENAI_API_KEY as string | undefined
}

export async function callFutureChat(messages: ChatMessage[], inputSnapshot?: SimulationInput) {
  const key = getApiKey()
  if (!key) {
    return mockChatResponse(messages, inputSnapshot)
  }

  const system: ChatMessage = {
    role: 'system',
    content:
      'You are FutureYou – an honest, empathetic future self. Be specific, realistic, and emotionally grounded. ' +
      'Use the context about career, country, skills, habits, and scores if provided.',
  }

  const body = {
    model: MODEL,
    messages: [system, ...messages],
    temperature: 0.7,
  }

  const res = await fetch(API_URL, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${key}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  })

  if (!res.ok) {
    return mockChatResponse(messages, inputSnapshot)
  }

  const json = await res.json()
  return (json.choices?.[0]?.message?.content as string) || mockChatResponse(messages, inputSnapshot)
}

export async function generateLifeStory(input: SimulationInput) {
  const key = getApiKey()
  const scores = scoreAll(input)
  const prompt = buildStoryPrompt(input, scores)

  if (!key) {
    return mockStoryResponse(prompt)
  }

  const body = {
    model: MODEL,
    messages: [
      {
        role: 'system',
        content:
          'You are a cinematic narrator for a realistic life simulation. Write in vivid, concise scenes, avoiding clichés.',
      },
      { role: 'user', content: prompt },
    ],
    temperature: 0.8,
  }

  const res = await fetch(API_URL, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${key}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  })

  if (!res.ok) {
    return mockStoryResponse(prompt)
  }

  const json = await res.json()
  return (json.choices?.[0]?.message?.content as string) || mockStoryResponse(prompt)
}

function mockChatResponse(messages: ChatMessage[], input?: SimulationInput): string {
  const userMessages = messages.filter((m) => m.role === 'user')
  const last = userMessages.length ? userMessages[userMessages.length - 1]!.content : ''
  const name = input?.career ?? 'future you'
  return (
    `Imagine you’re looking back from ten years ahead.\n\n` +
    `From where I’m standing, the version of you who chose ${name} ` +
    `stopped trying to win days and started trying to win weeks. ` +
    `The big shifts weren’t dramatic — they were boringly consistent: a slightly earlier night, a protected focus block, ` +
    `and saying no to work that didn’t bend the curve.\n\n` +
    (last
      ? `About your question: “${last.trim()}”. The honest answer is that there isn’t a single dramatic moment where everything changes. ` +
        `It’s the quiet, repeated decisions that make this decade feel completely different.`
      : `If you want to change the trajectory, start by protecting one high‑quality hour every day and one full recovery day every week.`)
  )
}

function mockStoryResponse(_: string): string {
  return [
    'Year 1–2: You stop optimising for pleasing everyone at work and start optimising for proof. You ship small, sharp projects that are impossible to ignore, even if they’re not glamorous.',
    '',
    'Year 3–4: The market starts to treat you differently. Recruiters don’t just ask what tools you know — they ask how you think. Your income bends upward, but more importantly, your options do.',
    '',
    'Year 5–7: You’ve collected enough signal about yourself to design around your energy instead of fighting it. Sleep gets 10% better, and somehow everything else gets 40% easier.',
    '',
    'Year 8–10: You have a life that looks ambitious from the outside but feels calmer from the inside. Money is no longer the main scoreboard; time, health, and who you get to build with are.',
  ].join('\n')
}

function buildStoryPrompt(input: SimulationInput, scores: ReturnType<typeof scoreAll>) {
  const topSkills = input.skills.slice(0, 4).join(', ') || 'no explicit skills selected'
  const country = input.country ?? 'an undefined location'
  const career = input.career ?? 'an undefined career track'
  const study = input.studyHoursPerWeek ?? 0
  const gym = input.gymDaysPerWeek ?? 0
  const smoking = input.smoking ?? 'unknown'

  return [
    `Write a cinematic but grounded 10-year life story in 4–6 short scenes.`,
    `User profile:`,
    `- Country: ${country}`,
    `- Career: ${career}`,
    `- Skills: ${topSkills}`,
    `- Study hours / week: ${study}`,
    `- Gym days / week: ${gym}`,
    `- Smoking: ${smoking}`,
    ``,
    `Scoring snapshot (0–100):`,
    `- Salary score: ${scores.salary.score}`,
    `- Health score: ${scores.health.score}`,
    `- Stress score: ${scores.stress.score}`,
    `- Growth score: ${scores.growth.score}`,
    ``,
    `Constraints:`,
    `- Make it feel realistic, not like a fantasy.`,
    `- Show tradeoffs: where stress spikes, where health dips, where relationships or energy change.`,
    `- Anchor scenes around 2–3 key inflection points (role changes, city moves, health moments).`,
    `- Close with a one-sentence reflection from “future you” to present-day you.`,
  ].join('\n')
}

