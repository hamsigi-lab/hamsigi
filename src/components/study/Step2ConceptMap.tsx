'use client'
import { useState } from 'react'
import { SCIENCE_MAP_NODES, SCIENCE_EDGES } from '@/lib/data'

interface Props { onNext: (step: number) => void; onFocusCid: (cid: string) => void }

type MapNode = typeof SCIENCE_MAP_NODES[0]

export default function Step2ConceptMap({ onNext, onFocusCid }: Props) {
  const [selected, setSelected] = useState<MapNode | null>(null)

  const select = (n: MapNode) => setSelected(selected?.id === n.id ? null : n)

  return (
    <div className="fade-in">
      <div style={{ marginBottom: 22 }}>
        <h1 style={{ fontSize: 20, fontWeight: 700, color: 'var(--t1)', marginBottom: 5 }}>개념 지도</h1>
        <p style={{ fontSize: 13, color: 'var(--t2)' }}>노드를 클릭하면 시험 필수 내용을 볼 수 있습니다. 개념 학습 후 확인학습으로 이동하세요.</p>
      </div>

      <div className="card" style={{ padding: 14, overflowX: 'auto' }}>
        <svg viewBox="0 0 820 440" style={{ width: '100%', minWidth: 600, height: 440, display: 'block' }}>
          <defs>
            <marker id="arr" markerWidth="6" markerHeight="5" refX="5" refY="2.5" orient="auto">
              <path d="M0,0 L6,2.5 L0,5 Z" fill="var(--bd2)" />
            </marker>
          </defs>
          {SCIENCE_EDGES.map(([a, b]) => {
            const na = SCIENCE_MAP_NODES.find(n => n.id === a)
            const nb = SCIENCE_MAP_NODES.find(n => n.id === b)
            if (!na || !nb) return null
            return (
              <line key={`${a}-${b}`} x1={na.x} y1={na.y} x2={nb.x} y2={nb.y}
                stroke="var(--bd2)" strokeWidth="1.5" markerEnd="url(#arr)" />
            )
          })}
          {SCIENCE_MAP_NODES.map(n => (
            <g key={n.id} style={{ cursor: 'pointer' }} onClick={() => select(n)}>
              <circle cx={n.x} cy={n.y} r={n.r + (selected?.id === n.id ? 3 : 0)}
                fill={selected?.id === n.id ? `${n.color}22` : `${n.color}14`}
                stroke={selected?.id === n.id ? n.color : `${n.color}88`}
                strokeWidth={selected?.id === n.id ? 2.5 : 1.5}
                style={{ transition: 'all 0.2s' }}
              />
              {n.label.map((line, i, arr) => (
                <text key={i} x={n.x} y={n.y + (i - (arr.length - 1) / 2) * 13 + 1}
                  textAnchor="middle" dominantBaseline="middle"
                  fill="#1F2937" fontSize={n.r > 35 ? 11 : 9}
                  fontFamily="Pretendard, sans-serif" fontWeight="600">
                  {line}
                </text>
              ))}
            </g>
          ))}
        </svg>
      </div>

      {selected && (
        <div className="card fade-in" style={{ padding: '20px', marginTop: 14, borderColor: 'var(--brand-border)' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap', marginBottom: 14 }}>
            <div>
              <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--t1)', marginBottom: 5 }}>{selected.topic}</div>
              <div style={{ fontSize: 13, color: 'var(--t2)', lineHeight: 1.7 }}>{selected.desc}</div>
            </div>
            <span style={{ fontSize: 11, padding: '3px 9px', borderRadius: 20, background: 'var(--brand-soft)', color: 'var(--brand-text)', border: '1px solid var(--brand-border)', fontWeight: 600, flexShrink: 0 }}>교과서</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 7, marginBottom: 16 }}>
            {selected.items.map((item, i) => (
              <div key={i} style={{ background: 'var(--bg2)', border: '1px solid var(--bd)', borderRadius: 'var(--r-sm)', padding: '10px 14px', fontSize: 13, display: 'flex', gap: 10 }}>
                <span style={{ color: 'var(--brand)', fontFamily: 'var(--mono)', fontSize: 10, flexShrink: 0, paddingTop: 3 }}>▸</span>
                <span style={{ color: item.imp ? 'var(--amber)' : 'var(--t2)', fontWeight: item.imp ? 600 : 400 }}>{item.t}</span>
              </div>
            ))}
          </div>

          <button
            onClick={() => { onFocusCid(selected.cid); onNext(3) }}
            className="btn-brand"
            style={{ padding: '9px 18px', fontSize: 13, display: 'inline-flex', alignItems: 'center', gap: 7 }}
          >
            이 개념 확인문제 풀기 →
          </button>
        </div>
      )}

      <div style={{ display: 'flex', gap: 9, marginTop: 20, flexWrap: 'wrap' }}>
        <button onClick={() => onNext(3)} className="btn-brand" style={{ padding: '10px 20px', fontSize: 13 }}>③ 확인학습 →</button>
        <button onClick={() => onNext(1)} className="btn-outline" style={{ padding: '10px 16px', fontSize: 13 }}>← 출제분석</button>
      </div>
    </div>
  )
}
