'use client'
import { useState, useEffect } from 'react'
import type { QuizItem } from '@/lib/types'

interface Props {
  onNext: (step: number) => void
  onSubmit: (ans: Record<string, unknown>) => void
  quiz?: QuizItem[]
  generating?: boolean
}

type Diff = 'easy' | 'medium' | 'hard' | 'exam'

const DIFF_INFO: Record<Diff, { label: string; desc: string; color: string; soft: string }> = {
  easy:   { label: '기초', desc: '핵심 개념 확인 문제 위주.', color: 'var(--green)', soft: 'var(--green-soft)' },
  medium: { label: '표준', desc: '전국 평균 출제 수준.', color: 'var(--brand)', soft: 'var(--brand-soft)' },
  hard:   { label: '심화', desc: '복합 문제 강화. 상위권 목표 추천.', color: 'var(--amber)', soft: 'var(--amber-soft)' },
  exam:   { label: '실전', desc: '실제 시험 구성. 최종 점검.', color: 'var(--red)', soft: 'var(--red-soft)' },
}

const TYPE_INFO: Record<string, { label: string; color: string; soft: string }> = {
  obj:   { label: '객관식', color: 'var(--brand)', soft: 'var(--brand-soft)' },
  short: { label: '서답형', color: 'var(--amber)', soft: 'var(--amber-soft)' },
  essay: { label: '서술형', color: 'var(--red)', soft: 'var(--red-soft)' },
}

function filterQuestions(all: QuizItem[], diff: Diff): QuizItem[] {
  if (diff === 'easy') return all.filter(q => q.diff === 'easy')
  if (diff === 'hard') return all.filter(q => q.diff === 'medium' || q.diff === 'hard')
  if (diff === 'exam') return all
  return all
}

export default function Step4Quiz({ onSubmit, quiz, generating }: Props) {
  const [diff, setDiff] = useState<Diff>('medium')
  const [webOn, setWebOn] = useState(false)
  const [questions, setQuestions] = useState<QuizItem[]>(quiz || [])
  const [objAns, setObjAns] = useState<Record<number, number>>({})
  const [shortAns, setShortAns] = useState<Record<number, string>>({})
  const [essayAns, setEssayAns] = useState<Record<number, string>>({})

  useEffect(() => {
    if (quiz?.length) {
      setQuestions(filterQuestions(quiz, diff))
    }
  }, [quiz, diff])

  if (generating && !quiz?.length) {
    return (
      <div className="fade-in" style={{ textAlign: 'center', padding: '80px 24px' }}>
        <div style={{ fontSize: 52, marginBottom: 20 }}>
          <span className="spin-anim" style={{ display: 'inline-block' }}>⟳</span>
        </div>
        <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--t1)', marginBottom: 8 }}>예상 문제를 생성 중이에요</div>
        <div style={{ fontSize: 14, color: 'var(--t2)' }}>분석 결과를 바탕으로 맞춤 문제를 만들고 있어요...</div>
      </div>
    )
  }

  if (!quiz?.length) {
    return (
      <div className="fade-in" style={{ textAlign: 'center', padding: '80px 24px' }}>
        <div style={{ fontSize: 40, marginBottom: 16 }}>📝</div>
        <div style={{ fontSize: 16, color: 'var(--t2)' }}>먼저 출제분석을 완료해 주세요.</div>
      </div>
    )
  }

  const done = questions.filter((q, qi) => {
    if (q.type === 'obj') return objAns[qi] !== undefined
    if (q.type === 'short') return !!shortAns[qi]?.trim()
    return !!essayAns[qi]?.trim()
  }).length

  const submit = () => onSubmit({ objAns, shortAns, essayAns, questions })

  return (
    <div className="fade-in">
      <div style={{ marginBottom: 22 }}>
        <h1 style={{ fontSize: 20, fontWeight: 700, color: 'var(--t1)', marginBottom: 5 }}>예상 문제 — {questions.length}문항</h1>
        <p style={{ fontSize: 13, color: 'var(--t2)' }}>난이도를 선택하면 문제 구성이 바뀝니다.</p>
      </div>

      {/* Difficulty selector */}
      <div className="card" style={{ padding: '18px', marginBottom: 14 }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--t1)', marginBottom: 10 }}>난이도 선택</div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 10 }}>
          {(['easy', 'medium', 'hard', 'exam'] as Diff[]).map(d => {
            const info = DIFF_INFO[d]
            const on = diff === d
            return (
              <button key={d} onClick={() => { setDiff(d); setObjAns({}); setShortAns({}); setEssayAns({}) }} style={{
                flex: 1, minWidth: 72, padding: '10px 8px', borderRadius: 'var(--r)', fontFamily: 'inherit',
                border: `1.5px solid ${on ? info.color : 'var(--bd)'}`,
                background: on ? info.soft : 'var(--bg2)',
                color: on ? info.color : 'var(--t2)',
                cursor: 'pointer', fontSize: 12, textAlign: 'center', transition: 'all 0.15s', fontWeight: on ? 700 : 400,
              }}>
                {info.label}
              </button>
            )
          })}
        </div>
        <div style={{ fontSize: 12, color: 'var(--t2)' }}>{DIFF_INFO[diff].desc}</div>
      </div>

      {/* Web toggle */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 16px', background: 'var(--brand-soft)', border: '1px solid var(--brand-border)', borderRadius: 'var(--r)', marginBottom: 16 }}>
        <label style={{ position: 'relative', width: 40, height: 22, flexShrink: 0, cursor: 'pointer' }}>
          <input type="checkbox" checked={webOn} onChange={e => setWebOn(e.target.checked)} style={{ opacity: 0, width: 0, height: 0 }} />
          <span style={{ position: 'absolute', inset: 0, borderRadius: 11, background: webOn ? 'var(--brand)' : 'var(--bd2)', transition: '0.3s' }} />
          <span style={{ position: 'absolute', width: 16, height: 16, left: webOn ? 20 : 3, top: 3, borderRadius: '50%', background: '#fff', transition: '0.3s', boxShadow: '0 1px 3px rgba(0,0,0,0.2)' }} />
        </label>
        <span style={{ fontSize: 12, color: 'var(--t2)' }}>전국 기출 문제 포함</span>
      </div>

      {/* Progress */}
      <div style={{ height: 4, background: 'var(--bg3)', borderRadius: 2, marginBottom: 4 }}>
        <div style={{ height: '100%', width: `${questions.length > 0 ? done / questions.length * 100 : 0}%`, background: 'var(--brand)', borderRadius: 2, transition: 'width 0.3s' }} />
      </div>
      <div style={{ fontSize: 12, color: 'var(--t2)', textAlign: 'right', marginBottom: 16 }}>
        {done} / {questions.length} 완료
      </div>

      {questions.map((q, qi) => {
        const tInfo = TYPE_INFO[q.type]
        const dInfo = DIFF_INFO[q.diff] || DIFF_INFO.medium
        return (
          <div key={`${diff}-${qi}`} className="card" style={{ padding: '16px 18px', marginBottom: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 10, flexWrap: 'wrap' }}>
              <span style={{ fontFamily: 'var(--mono)', fontSize: 12, color: 'var(--t3)', fontWeight: 600 }}>{q.num || qi + 1}번</span>
              <span style={{ fontFamily: 'var(--mono)', fontSize: 11, fontWeight: 700, color: (q.pct || 0) >= 80 ? 'var(--red)' : (q.pct || 0) >= 60 ? 'var(--amber)' : 'var(--brand)' }}>{q.pct}%</span>
              <span style={{ fontSize: 11, padding: '2px 8px', border: '1px solid var(--bd)', borderRadius: 6, color: 'var(--t3)' }}>{q.src}</span>
              <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 6, background: tInfo.soft, color: tInfo.color, fontWeight: 600 }}>{tInfo.label}</span>
              <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 6, background: dInfo.soft, color: dInfo.color, fontWeight: 600 }}>{dInfo.label}</span>
              {webOn && (q.pct || 0) >= 80 && <span style={{ fontSize: 10, padding: '2px 7px', borderRadius: 20, background: 'var(--blue-soft)', color: 'var(--blue-text)', fontFamily: 'var(--mono)', fontWeight: 600 }}>전국기출</span>}
            </div>
            <div style={{ fontSize: 14, color: 'var(--t1)', lineHeight: 1.8, marginBottom: 12 }}>{q.text}</div>

            {q.type === 'obj' && q.choices && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {q.choices.map((c, ci) => {
                  const selected = objAns[qi] === ci
                  return (
                    <button key={ci} onClick={() => setObjAns(a => ({ ...a, [qi]: ci }))} style={{
                      display: 'flex', alignItems: 'flex-start', gap: 10, padding: '10px 14px', borderRadius: 'var(--r)',
                      border: `1.5px solid ${selected ? 'var(--brand)' : 'var(--bd)'}`,
                      background: selected ? 'var(--brand-soft)' : 'var(--bg2)',
                      color: selected ? 'var(--brand-text)' : 'var(--t2)',
                      cursor: 'pointer', fontSize: 13, width: '100%', textAlign: 'left', lineHeight: 1.5, transition: 'all 0.15s', fontFamily: 'inherit',
                    }}>
                      <span style={{ fontWeight: 700, fontFamily: 'var(--mono)', fontSize: 12, flexShrink: 0, paddingTop: 1, color: selected ? 'var(--brand)' : 'var(--t3)' }}>{'①②③④⑤'[ci]}</span>
                      {c}
                    </button>
                  )
                })}
              </div>
            )}
            {q.type === 'short' && (
              <input className="input-base" value={shortAns[qi] || ''} onChange={e => setShortAns(a => ({ ...a, [qi]: e.target.value }))}
                placeholder="답을 입력하세요..." />
            )}
            {q.type === 'essay' && (
              <>
                <textarea className="input-base" value={essayAns[qi] || ''} onChange={e => setEssayAns(a => ({ ...a, [qi]: e.target.value }))}
                  placeholder="서술형 답안을 작성하세요..."
                  style={{ resize: 'vertical', minHeight: 90 }}
                />
                {q.rubric && (
                  <div style={{ background: 'var(--amber-soft)', border: '1px solid #FDE68A', borderRadius: 'var(--r-sm)', padding: '9px 13px', marginTop: 8, fontSize: 12, color: 'var(--amber-text)' }}>
                    <strong>채점 기준:</strong> {q.rubric}
                  </div>
                )}
              </>
            )}
          </div>
        )
      })}

      <div style={{ marginTop: 20 }}>
        <button onClick={submit} className="btn-brand" style={{ width: '100%', padding: '14px', fontSize: 15 }}>
          전체 채점하기 →
        </button>
      </div>
    </div>
  )
}
