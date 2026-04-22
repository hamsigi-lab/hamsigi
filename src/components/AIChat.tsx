'use client'
import { useState, useRef, useEffect, useCallback } from 'react'
import { SYSTEM_PROMPT } from '@/lib/data'

interface Msg { role: 'user' | 'assistant'; content: string }

interface AIChatProps {
  chatId: string
  initialMsg?: string
  topic?: string
}

export default function AIChat({ chatId, initialMsg = '궁금한 것을 질문하세요!', topic }: AIChatProps) {
  const [msgs, setMsgs] = useState<Msg[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const msgsRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = useCallback(() => {
    if (msgsRef.current) {
      msgsRef.current.scrollTop = msgsRef.current.scrollHeight
    }
  }, [])

  useEffect(() => {
    scrollToBottom()
  }, [msgs, loading, scrollToBottom])

  const send = async () => {
    const txt = input.trim()
    if (!txt || loading) return
    setInput('')
    const newMsgs: Msg[] = [...msgs, { role: 'user', content: txt }]
    setMsgs(newMsgs)
    setLoading(true)
    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: newMsgs, system: SYSTEM_PROMPT }),
      })
      const data = await res.json()
      const reply = data.error || data.content || '응답을 가져오지 못했습니다.'
      setMsgs([...newMsgs, { role: 'assistant', content: reply }])
    } catch {
      setMsgs([...newMsgs, { role: 'assistant', content: '연결 오류. 다시 시도해주세요.' }])
    }
    setLoading(false)
  }

  return (
    <div style={{ background: 'var(--s2)', border: '1px solid var(--bd1)', borderRadius: 10, overflow: 'hidden' }}>
      <div style={{ padding: '8px 14px', borderBottom: '1px solid var(--bd1)', display: 'flex', alignItems: 'center', gap: 7, fontSize: 11, color: 'var(--t2)' }}>
        <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--emerald)', display: 'inline-block' }} />
        AI 질문하기 {topic ? `— ${topic}` : ''}
      </div>
      <div ref={msgsRef} style={{ padding: '10px 14px', minHeight: 70, maxHeight: 180, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 8 }}>
        <div style={{ alignSelf: 'flex-start', background: 'var(--s3)', border: '1px solid var(--bd1)', borderRadius: 8, padding: '7px 11px', fontSize: 13, maxWidth: '88%' }}>
          {initialMsg}
        </div>
        {msgs.map((m, i) => (
          <div key={i} style={{
            alignSelf: m.role === 'user' ? 'flex-end' : 'flex-start',
            background: m.role === 'user' ? 'var(--indigo-d)' : 'var(--s3)',
            border: `1px solid ${m.role === 'user' ? 'rgba(99,102,241,0.3)' : 'var(--bd1)'}`,
            color: m.role === 'user' ? 'var(--indigo-l)' : 'var(--t1)',
            borderRadius: 8, padding: '7px 11px', fontSize: 13, maxWidth: '88%', lineHeight: 1.6,
          }}>
            {m.content}
          </div>
        ))}
        {loading && (
          <div style={{ alignSelf: 'flex-start', background: 'var(--s3)', border: '1px solid var(--bd1)', borderRadius: 8, padding: '7px 11px', fontSize: 13 }}>
            <span className="spin-anim" style={{ width: 14, height: 14, border: '2px solid rgba(255,255,255,0.1)', borderTopColor: 'var(--indigo)', borderRadius: '50%', display: 'inline-block' }} />
          </div>
        )}
      </div>
      <div style={{ display: 'flex', gap: 8, padding: '8px 14px', borderTop: '1px solid var(--bd1)' }}>
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && send()}
          placeholder="질문 입력..."
          aria-label="AI에게 질문하기"
          style={{ flex: 1, background: 'transparent', border: '1px solid var(--bd2)', borderRadius: 7, padding: '6px 11px', color: 'var(--t1)', fontSize: 13, outline: 'none' }}
        />
        <button
          onClick={send}
          disabled={loading || !input.trim()}
          style={{ padding: '6px 14px', background: input.trim() && !loading ? 'var(--indigo)' : 'var(--s4)', border: 'none', borderRadius: 7, color: '#fff', fontSize: 12, cursor: input.trim() && !loading ? 'pointer' : 'not-allowed', opacity: input.trim() && !loading ? 1 : 0.5, transition: 'all 0.2s' }}
        >
          전송
        </button>
      </div>
    </div>
  )
}
