'use client'
import { useState, useEffect } from 'react'
import type { Topic, StudyContent } from '@/lib/types'

async function extractPDFText(file: File): Promise<string> {
  try {
    const pdfjsLib = await import('pdfjs-dist')
    pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.mjs`
    const arrayBuffer = await file.arrayBuffer()
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise
    let text = ''
    for (let i = 1; i <= Math.min(pdf.numPages, 15); i++) {
      const page = await pdf.getPage(i)
      const content = await page.getTextContent()
      text += content.items.map((item: Record<string, unknown>) => (typeof item.str === 'string' ? item.str : '')).join(' ') + '\n'
    }
    return text.slice(0, 8000)
  } catch {
    return ''
  }
}

interface Props {
  onNext: (step: number) => void
  webOn: boolean
  setWebOn: (v: boolean) => void
  subject: string
  files?: File[]
  savedContent?: StudyContent | null
  onAnalysisComplete?: (topics: Topic[], summary: string) => void
}

export default function Step1Analysis({ onNext, webOn, setWebOn, subject, files, savedContent, onAnalysisComplete }: Props) {
  const [openIdx, setOpenIdx] = useState<number | null>(null)
  const [filter, setFilter] = useState('all')
  const [topics, setTopics] = useState<Topic[]>(savedContent?.topics || [])
  const [loading, setLoading] = useState(!savedContent?.topics?.length)
  const [error, setError] = useState('')
  const [summary, setSummary] = useState(savedContent?.summary || '')

  useEffect(() => {
    if (savedContent?.topics?.length) {
      setTopics(savedContent.topics)
      setSummary(savedContent.summary || '')
      setLoading(false)
      return
    }
    const analyze = async () => {
      setLoading(true)
      setError('')
      try {
        const formData = new FormData()
        formData.append('subject', subject)
        if (files && files.length > 0) {
          for (const f of files) {
            if (f.type === 'application/pdf') {
              const text = await extractPDFText(f)
              if (text.trim()) formData.append('pdfTexts', `[${f.name}]\n${text}`)
            } else {
              formData.append('files', f)
            }
          }
        }
        const res = await fetch('/api/analyze', { method: 'POST', body: formData })
        if (!res.ok) throw new Error('분석 실패')
        const data = await res.json()
        const t = data.topics || []
        const s = data.summary || ''
        setTopics(t)
        setSummary(s)
        onAnalysisComplete?.(t, s)
      } catch {
        setError('AI 분석 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.')
      } finally {
        setLoading(false)
      }
    }
    analyze()
  }, [subject])

  const filtered = topics.filter(p => filter === 'all' || p.type === filter)

  if (loading) {
    return (
      <div className="fade-in" style={{ textAlign: 'center', padding: '80px 24px' }}>
        <div style={{ fontSize: 52, marginBottom: 20 }}>
          <span className="spin-anim" style={{ display: 'inline-block' }}>⟳</span>
        </div>
        <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--t1)', marginBottom: 8 }}>AI가 자료를 분석 중이에요</div>
        <div style={{ fontSize: 14, color: 'var(--t2)' }}>업로드 자료 + 출제 패턴을 종합하고 있어요...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="fade-in" style={{ textAlign: 'center', padding: '80px 24px' }}>
        <div style={{ fontSize: 40, marginBottom: 16 }}>⚠️</div>
        <div style={{ fontSize: 16, color: 'var(--red-text)', marginBottom: 20 }}>{error}</div>
        <button onClick={() => window.location.reload()} className="btn-brand" style={{ padding: '10px 24px', fontSize: 14 }}>다시 시도</button>
      </div>
    )
  }

  return (
    <div className="fade-in">
      <div style={{ marginBottom: 22 }}>
        <h1 style={{ fontSize: 20, fontWeight: 700, color: 'var(--t1)', marginBottom: 5 }}>출제 예상 분석</h1>
        <p style={{ fontSize: 13, color: 'var(--t2)' }}>
          {summary || '업로드 자료를 AI가 분석해 출제 가능성 높은 주제를 추출했습니다.'}
        </p>
      </div>

      {/* Web toggle */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '11px 16px', background: 'var(--brand-soft)', border: '1px solid var(--brand-border)', borderRadius: 'var(--r)', marginBottom: 16 }}>
        <label style={{ position: 'relative', width: 40, height: 22, flexShrink: 0, cursor: 'pointer' }}>
          <input type="checkbox" checked={webOn} onChange={e => setWebOn(e.target.checked)} style={{ opacity: 0, width: 0, height: 0 }} />
          <span style={{ position: 'absolute', inset: 0, borderRadius: 11, background: webOn ? 'var(--brand)' : 'var(--bd2)', transition: '0.3s' }} />
          <span style={{ position: 'absolute', width: 16, height: 16, left: webOn ? 20 : 3, top: 3, borderRadius: '50%', background: '#fff', transition: '0.3s', boxShadow: '0 1px 3px rgba(0,0,0,0.2)' }} />
        </label>
        <span style={{ fontSize: 12, color: 'var(--t2)' }}>전국 기출 포함</span>
        <span style={{ fontSize: 11, color: 'var(--t3)', marginLeft: 'auto' }}>{webOn ? '전국 기출 포함' : '업로드 자료만'}</span>
      </div>

      {/* Filter tabs */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 14, flexWrap: 'wrap' }}>
        {['all', '서술형', '서답형', '객관식'].map(f => (
          <button key={f} onClick={() => setFilter(f)} style={{
            padding: '5px 14px', borderRadius: 20,
            border: `1.5px solid ${filter === f ? 'var(--brand)' : 'var(--bd)'}`,
            background: filter === f ? 'var(--brand-soft)' : 'transparent',
            color: filter === f ? 'var(--brand-text)' : 'var(--t2)',
            fontSize: 12, cursor: 'pointer', transition: 'all 0.15s', fontFamily: 'inherit', fontWeight: filter === f ? 600 : 400,
          }}>
            {f === 'all' ? '전체' : f}
          </button>
        ))}
      </div>

      {/* Topic list */}
      <div className="card" style={{ padding: '4px 20px 12px' }}>
        {filtered.length === 0 && (
          <div style={{ padding: '24px 0', textAlign: 'center', color: 'var(--t3)', fontSize: 14 }}>해당 유형의 예상 문제가 없어요.</div>
        )}
        {filtered.map((p, i) => (
          <div key={i}>
            <div
              onClick={() => setOpenIdx(openIdx === i ? null : i)}
              style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '13px 0', borderBottom: openIdx === i ? 'none' : '1px solid var(--bd)', cursor: 'pointer' }}
            >
              <div style={{ fontFamily: 'var(--mono)', fontSize: 13, fontWeight: 700, minWidth: 42, flexShrink: 0, color: p.color }}>{p.pct}%</div>
              <div style={{ width: 60, height: 4, background: 'var(--bg3)', borderRadius: 2, flexShrink: 0 }}>
                <div style={{ height: '100%', width: `${p.pct}%`, background: p.color, borderRadius: 2 }} />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--t1)', marginBottom: 2 }}>{p.title}</div>
                <div style={{ fontSize: 11, color: 'var(--t3)' }}>{p.src}</div>
              </div>
              <span style={{
                fontSize: 11, padding: '2px 9px', borderRadius: 20, fontWeight: 600, flexShrink: 0,
                background: p.type === '서술형' ? 'var(--red-soft)' : p.type === '서답형' ? 'var(--amber-soft)' : 'var(--brand-soft)',
                color: p.type === '서술형' ? 'var(--red-text)' : p.type === '서답형' ? 'var(--amber-text)' : 'var(--brand-text)',
              }}>{p.type}</span>
              <span style={{ color: 'var(--t3)', fontSize: 14, marginLeft: 4, display: 'inline-block', transform: openIdx === i ? 'rotate(90deg)' : 'none', transition: '0.2s' }}>›</span>
            </div>

            {openIdx === i && (
              <div className="fade-in" style={{ background: 'var(--bg2)', border: '1px solid var(--brand-border)', borderRadius: 'var(--r)', padding: 16, margin: '0 -4px 12px' }}>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5, marginBottom: 10 }}>
                  {(p.keys || []).map(k => (
                    <span key={k} style={{ fontSize: 11, padding: '3px 10px', borderRadius: 20, background: 'var(--brand-soft)', color: 'var(--brand-text)', border: '1px solid var(--brand-border)', fontFamily: 'var(--mono)' }}>{k}</span>
                  ))}
                </div>
                <p style={{ fontSize: 13, color: 'var(--t2)', lineHeight: 1.7 }}>{p.desc}</p>
              </div>
            )}
          </div>
        ))}
      </div>

      <div style={{ display: 'flex', gap: 9, marginTop: 20, flexWrap: 'wrap' }}>
        <button onClick={() => onNext(2)} className="btn-brand" style={{ padding: '10px 20px', fontSize: 13 }}>② 개념지도 →</button>
        <button onClick={() => onNext(3)} className="btn-outline" style={{ padding: '10px 16px', fontSize: 13 }}>③ 확인학습</button>
        <button onClick={() => onNext(4)} className="btn-outline" style={{ padding: '10px 16px', fontSize: 13 }}>④ 문제풀기</button>
      </div>
    </div>
  )
}
