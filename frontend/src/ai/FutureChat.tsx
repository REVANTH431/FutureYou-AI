import { motion } from 'framer-motion'
import { useEffect, useRef, useState } from 'react'
import type { SimulationInput } from '../simulator/types'
import { callFutureChat } from './openaiClient'

type ChatMsg = { role: 'user' | 'assistant'; content: string }

export function FutureChat() {
  const [input, setInput] = useState('')
  const [messages, setMessages] = useState<ChatMsg[]>([
    {
      role: 'assistant',
      content:
        'I’m your future self. Ask me about your next decade — career, health, money, or the tradeoffs you’re quietly avoiding.',
    },
  ])
  const [loading, setLoading] = useState(false)
  const latestSimRef = useRef<SimulationInput | undefined>()
  const listRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    const handler = (e: Event) => {
      const ev = e as CustomEvent<SimulationInput>
      latestSimRef.current = ev.detail
    }
    window.addEventListener('futureyou:simulation-change', handler as EventListener)
    return () => window.removeEventListener('futureyou:simulation-change', handler as EventListener)
  }, [])

  useEffect(() => {
    if (!listRef.current) return
    listRef.current.scrollTop = listRef.current.scrollHeight
  }, [messages, loading])

  const send = async () => {
    const text = input.trim()
    if (!text || loading) return
    setInput('')
    setMessages((prev) => [...prev, { role: 'user', content: text }])
    setLoading(true)
    try {
      const history = messages.concat({ role: 'user', content: text })
      const apiMsgs = history.map((m) => ({ role: m.role, content: m.content }))
      const reply = await callFutureChat(apiMsgs, latestSimRef.current)
      setMessages((prev) => [...prev, { role: 'assistant', content: reply }])
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: 'Something glitched on my side. Pretend we just reconnected. Ask the question again in your own words.',
        },
      ])
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="glass aichat">
      <div className="aichat__head">
        <div>
          <div className="aichat__kicker">Future self chat</div>
          <div className="aichat__title">Talk to you, ten years out</div>
          <div className="aichat__sub">
            Ask about risk, career moves, burnout, or whether you’re over‑optimising the wrong thing.
          </div>
        </div>
      </div>

      <div ref={listRef} className="aichat__body">
        {messages.map((m, i) => (
          <motion.div
            key={i}
            className={m.role === 'assistant' ? 'chat__msg chat__msg--ai' : 'chat__msg chat__msg--me'}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25 }}
          >
            <div className="chat__bubble">{m.content}</div>
          </motion.div>
        ))}
        {loading ? (
          <div className="chat__msg chat__msg--ai">
            <div className="chat__bubble chat__bubble--typing">
              <span />
              <span />
              <span />
            </div>
          </div>
        ) : null}
      </div>

      <div className="aichat__inputRow">
        <textarea
          className="aichat__input"
          rows={2}
          placeholder="Ask your future self anything. Start with “What changes the curve the most?”"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault()
              send()
            }
          }}
        />
        <button className="btn btn--primary aichat__send" onClick={send} disabled={loading}>
          Send
        </button>
      </div>
    </div>
  )
}

