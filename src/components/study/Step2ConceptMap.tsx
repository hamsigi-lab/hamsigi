'use client'
import { useState } from 'react'
import type { Topic } from '@/lib/types'

interface Props {
  onNext: (step: number) => void
  onFocusCid: (cid: string) => void
  topics?: Topic[]
  subjectName?: string
}

export default function Step2ConceptMap({ onNext, onFocusCid, topics, subjectName }: Props) {
  const [selected, setSelected] = useState<Topic | null>(null)

  if (!topics?.length) {
    return (
      <div className="fade-in" style={{ textAlign: 'center', padding: '80px 24px' }}>
        <div style={{ fontSize: 40, marginBottom: 16 }}>📊</div>
        <div style={{ fontSize: 16, color: 'var(--t2)' }}>먼저 출제분석을 완료해 주세요.</div>
        <button onClick={() => onNext(1)} className="btn-brand" style={{ marginTop: 20, padding: '10px 24px', fontSize: 14 }}>① 출제분석으로</button>
      </div>
    )
  }

  return (
    <div className="fade-in">
      <div style={{ marginBottom: 22 }}>
        <h1 style={{ fontSize: 20, fontWeight: 700, color: 'var(--t1)', marginBottom: 5 }}>개념 지도</h1>
        <p style={{ fontSize: 13, color: 'var(--t2)' }}>주제를 클릭하면 핵심 내용을 볼 수 있습니다.</p>
      </div>

      {/* Central subject node */}
      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 16 }}>
        <div style={{
          background: '#6366f1', color: '#fff', borderRadius: 16, padding: '10px 28px',
          fontSize: 15, fontWeight: 700, boxShadow: '0 4px 12px rgba(99,102,241,0.3)',
        }}>
          {subjectName || '과목'}
        </div>
      </div>

      {/* Connector line */}
      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 8 }}>
        <div style={{ width: 2, height: 20, background: '#cbd5e1' }} />
      </div>

      {/* Topic grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 10, marginBottom: 20 }}>
        {topics.map((t, i) => {
          const isSelected = selected?.cid === t.cid
          return (
            <button
              key={t.cid}
              onClick={() => setSelected(isSelected ? null : t)}
              style={{
                border: `2px solid ${isSelected ? t.color : '#e2e8f0'}`,
                borderRadius: 14,
                padding: '14px',
                background: isSelected ? `${t.color}12` : '#fff',
                cursor: 'pointer',
                textAlign: 'left',
                transition: 'all 0.2s',
                fontFamily: 'inherit',
                boxShadow: isSelected ? `0 4px 12px ${t.color}30` : '0 1px 3px rgba(0,0,0,0.06)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                <div style={{
                  width: 28, height: 28, borderRadius: 8, background: t.color,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: '#fff', fontSize: 11, fontWeight: 800, fontFamily: 'var(--mono)',
                }}>
                  {i + 1}
                </div>
                <div style={{ fontFamily: 'var(--mono)', fontSize: 12, fontWeight: 700, color: t.color }}>{t.pct}%</div>
              </div>
              <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--t1)', marginBottom: 8, lineHeight: 1.4 }}>{t.title}</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                {t.keys.slice(0, 3).map(k => (
                  <span key={k} style={{
                    fontSize: 10, padding: '2px 7px', borderRadius: 10,
                    background: `${t.color}18`, color: t.color, fontWeight: 600,
                  }}>{k}</span>
                ))}
              </div>
            </button>
          )
        })}
      </div>

      {/* Selected topic detail */}
      {selected && (
        <div className="card fade-in" style={{ padding: '20px', marginBottom: 20, borderColor: selected.color, borderWidth: 2 }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap', marginBottom: 14 }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--t1)', marginBottom: 5 }}>{selected.title}</div>
              <div style={{ fontSize: 13, color: 'var(--t2)', lineHeight: 1.7 }}>{selected.desc}</div>
            </div>
            <span style={{ fontSize: 11, padding: '3px 9px', borderRadius: 20, background: `${selected.color}18`, color: selected.color, border: `1px solid ${selected.color}40`, fontWeight: 600, flexShrink: 0 }}>
              {selected.src || '교과서'}
            </span>
          </div>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 16 }}>
            {selected.keys.map(k => (
              <span key={k} style={{
                fontSize: 12, padding: '4px 12px', borderRadius: 20,
                background: `${selected.color}18`, color: selected.color,
                border: `1px solid ${selected.color}40`, fontWeight: 600,
              }}>{k}</span>
            ))}
          </div>

          <button
            onClick={() => { onFocusCid(selected.cid); onNext(3) }}
            className="btn-brand"
            style={{ padding: '9px 18px', fontSize: 13 }}
          >
            이 개념 확인문제 풀기 →
          </button>
        </div>
      )}

      <div style={{ display: 'flex', gap: 9, flexWrap: 'wrap' }}>
        <button onClick={() => onNext(3)} className="btn-brand" style={{ padding: '10px 20px', fontSize: 13 }}>③ 확인학습 →</button>
        <button onClick={() => onNext(1)} className="btn-outline" style={{ padding: '10px 16px', fontSize: 13 }}>← 출제분석</button>
      </div>
    </div>
  )
}
