'use client'
import { useState } from 'react'
import { CQ_DATA } from '@/lib/data'

interface Props { onNext: (step: number) => void; focusCid?: string }

type Ans = { correct: boolean; cid: string }

export default function Step3Practice({ onNext, focusCid }: Props) {
  const [answers, setAnswers] = useState<Record<number, Ans>>({})
  const [blankInputs, setBlankInputs] = useState<Record<string, string>>({})
  const [calcInputs, setCalcInputs] = useState<Record<number, string>>({})
  const [feedbacks, setFeedbacks] = useState<Record<number, { ok: boolean; shown: boolean }>>({})

  const data = focusCid
    ? [...CQ_DATA.filter(q => q.cid === focusCid), ...CQ_DATA.filter(q => q.cid !== focusCid)]
    : CQ_DATA

  const done = Object.keys(answers).length
  const correct = Object.values(answers).filter(a => a.correct).length
  const pct = done > 0 ? Math.round(correct / done * 100) : 0
  const estScore = done > 0 ? Math.round(40 + pct * 0.6) : 0

  const showFeedback = (qi: number, ok: boolean) => {
    setAnswers(a => ({ ...a, [qi]: { correct: ok, cid: data[qi].cid } }))
    setFeedbacks(f => ({ ...f, [qi]: { ok, shown: true } }))
  }

  const checkOX = (qi: number, val: string) => {
    const q = data[qi]; if (!q.ans) return
    showFeedback(qi, val === q.ans)
  }
  const checkBlank = (qi: number) => {
    const q = data[qi]; if (!q.blanks) return
    const ok = q.blanks.every((a, i) => (blankInputs[`${qi}-${i}`] || '').trim() === a)
    showFeedback(qi, ok)
  }
  const checkCalc = (qi: number) => {
    const q = data[qi]; if (!q.ans) return
    const val = (calcInputs[qi] || '').trim().replace(/\s/g, '').toLowerCase()
    const ans = (q.ans as string).replace(/\s/g, '').toLowerCase()
    showFeedback(qi, val === ans)
  }

  return (
    <div className="fade-in">
      <div style={{ marginBottom: 22 }}>
        <h1 style={{ fontSize: 20, fontWeight: 700, color: 'var(--t1)', marginBottom: 5 }}>확인학습</h1>
        <p style={{ fontSize: 13, color: 'var(--t2)' }}>
          {focusCid ? `'${data[0]?.cid}' 관련 문제부터 시작합니다.` : '교과서·학습지 전 범위의 빈칸 넣기, O/X 문제를 풀어보세요.'}
        </p>
      </div>

      {done > 0 && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, background: 'var(--brand-soft)', border: '1px solid var(--brand-border)', borderRadius: 'var(--r)', padding: '14px 20px', marginBottom: 18, flexWrap: 'wrap' }}>
          <div style={{ fontFamily: 'var(--mono)', fontSize: 38, fontWeight: 700, color: 'var(--brand)', lineHeight: 1, minWidth: 60 }}>{estScore}</div>
          <div>
            <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--t1)', marginBottom: 3 }}>확인학습 {done}/{data.length}문제 완료</div>
            <div style={{ fontSize: 12, color: 'var(--t2)' }}>정답률 {pct}% · 예상 점수 {estScore}점</div>
          </div>
        </div>
      )}

      {/* Progress */}
      <div style={{ height: 4, background: 'var(--bg3)', borderRadius: 2, marginBottom: 20 }}>
        <div style={{ height: '100%', width: `${done / data.length * 100}%`, background: 'var(--brand)', borderRadius: 2, transition: 'width 0.5s' }} />
      </div>

      {data.map((q, qi) => {
        const fb = feedbacks[qi]
        return (
          <div key={qi} className="card" style={{ padding: '16px 18px', marginBottom: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10, flexWrap: 'wrap' }}>
              <span style={{ fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--t3)' }}>문제 {qi+1}</span>
              <span style={{ fontFamily: 'var(--mono)', fontSize: 11, fontWeight: 700,
                color: q.pct >= 90 ? 'var(--red)' : q.pct >= 75 ? 'var(--amber)' : 'var(--brand)' }}>{q.pct}%</span>
              <span style={{ fontSize: 11, padding: '2px 8px', border: '1px solid var(--bd)', borderRadius: 6, color: 'var(--t3)' }}>{q.src}</span>
            </div>
            <div style={{ fontSize: 14, color: 'var(--t1)', lineHeight: 1.8, marginBottom: 10 }}
              dangerouslySetInnerHTML={{ __html: q.text
                .replace(/\[①\]/g,'<span style="border-bottom:2px solid var(--brand);padding:0 4px;color:var(--brand);font-weight:600">①</span>')
                .replace(/\[②\]/g,'<span style="border-bottom:2px solid var(--brand);padding:0 4px;color:var(--brand);font-weight:600">②</span>')
                .replace(/\[③\]/g,'<span style="border-bottom:2px solid var(--brand);padding:0 4px;color:var(--brand);font-weight:600">③</span>')
              }}
            />

            {!fb?.shown && (
              <>
                {q.type === 'ox' && (
                  <div style={{ display: 'flex', gap: 10 }}>
                    {['O','X'].map(v => (
                      <button key={v} onClick={() => checkOX(qi, v)} style={{
                        flex: 1, padding: '11px', borderRadius: 'var(--r)', border: '1.5px solid var(--bd)', background: 'var(--bg2)',
                        color: 'var(--t1)', fontSize: 20, fontWeight: 700, cursor: 'pointer', transition: 'all 0.15s', fontFamily: 'inherit',
                      }}
                        onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--brand)'; (e.currentTarget as HTMLButtonElement).style.background = 'var(--brand-soft)' }}
                        onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--bd)'; (e.currentTarget as HTMLButtonElement).style.background = 'var(--bg2)' }}>
                        {v}
                      </button>
                    ))}
                  </div>
                )}
                {q.type === 'blank' && (
                  <div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7, marginBottom: 10 }}>
                      {(q.blanks || []).map((_, bi) => (
                        <input key={bi} className="input-base" style={{ width: 100 }}
                          value={blankInputs[`${qi}-${bi}`] || ''}
                          onChange={e => setBlankInputs(p => ({ ...p, [`${qi}-${bi}`]: e.target.value }))}
                          placeholder={`${bi+1}번`}
                        />
                      ))}
                    </div>
                    <button onClick={() => checkBlank(qi)} className="btn-outline" style={{ padding: '7px 16px', fontSize: 12 }}>확인</button>
                  </div>
                )}
                {q.type === 'calc' && (
                  <div style={{ display: 'flex', gap: 8 }}>
                    <input className="input-base"
                      value={calcInputs[qi] || ''}
                      onChange={e => setCalcInputs(p => ({ ...p, [qi]: e.target.value }))}
                      onKeyDown={e => e.key === 'Enter' && checkCalc(qi)}
                      placeholder="답을 입력하세요..."
                    />
                    <button onClick={() => checkCalc(qi)} className="btn-brand" style={{ padding: '10px 16px', fontSize: 13, whiteSpace: 'nowrap' }}>확인</button>
                  </div>
                )}
              </>
            )}

            {fb?.shown && (
              <div className="fade-in">
                <div style={{ borderRadius: 'var(--r-sm)', padding: '11px 14px', fontSize: 13, lineHeight: 1.7,
                  background: fb.ok ? 'var(--green-soft)' : 'var(--red-soft)',
                  border: `1px solid ${fb.ok ? '#6EE7B7' : '#FCA5A5'}`,
                  color: fb.ok ? 'var(--green-text)' : 'var(--red-text)' }}>
                  {fb.ok ? '✓ ' : '✗ '}{fb.ok ? q.ok : q.ng}
                </div>
                {q.sim && (
                  <div style={{ borderRadius: 'var(--r-sm)', padding: '10px 14px', fontSize: 12, lineHeight: 1.7,
                    background: 'var(--brand-soft)', border: '1px solid var(--brand-border)',
                    color: 'var(--brand-text)', marginTop: 7 }}>
                    <strong>유사:</strong> {q.sim}
                  </div>
                )}
              </div>
            )}
          </div>
        )
      })}

      <div style={{ display: 'flex', gap: 9, marginTop: 20, flexWrap: 'wrap' }}>
        <button onClick={() => onNext(4)} className="btn-brand" style={{ padding: '10px 20px', fontSize: 13 }}>④ 문제풀기 →</button>
        <button onClick={() => onNext(2)} className="btn-outline" style={{ padding: '10px 16px', fontSize: 13 }}>← 개념지도</button>
      </div>
    </div>
  )
}
