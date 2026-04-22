'use client'
import { useState } from 'react'
import { SCIENCE_PROBS } from '@/lib/data'

interface Props { onNext: (step: number) => void; webOn: boolean; setWebOn: (v: boolean) => void }

export default function Step1Analysis({ onNext, webOn, setWebOn }: Props) {
  const [openIdx, setOpenIdx] = useState<number | null>(null)
  const [filter, setFilter] = useState('all')

  const filtered = SCIENCE_PROBS.filter(p => filter === 'all' || p.type === filter)

  return (
    <div className="fade-in">
      <div style={{ marginBottom: 22 }}>
        <h1 style={{ fontSize: 20, fontWeight: 700, color: 'var(--t1)', marginBottom: 5 }}>출제 예상 분석</h1>
        <p style={{ fontSize: 13, color: 'var(--t2)' }}>업로드 자료 + 학교 데이터를 AI가 분석했습니다. 클릭하면 개념 요약이 열립니다.</p>
      </div>

      {/* Web toggle */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '11px 16px', background: 'var(--brand-soft)', border: '1px solid var(--brand-border)', borderRadius: 'var(--r)', marginBottom: 16 }}>
        <label style={{ position: 'relative', width: 40, height: 22, flexShrink: 0, cursor: 'pointer' }}>
          <input type="checkbox" checked={webOn} onChange={e => setWebOn(e.target.checked)} style={{ opacity: 0, width: 0, height: 0 }} />
          <span style={{ position: 'absolute', inset: 0, borderRadius: 11, background: webOn ? 'var(--brand)' : 'var(--bd2)', transition: '0.3s' }} />
          <span style={{ position: 'absolute', width: 16, height: 16, left: webOn ? 20 : 3, top: 3, borderRadius: '50%', background: '#fff', transition: '0.3s', boxShadow: '0 1px 3px rgba(0,0,0,0.2)' }} />
        </label>
        <span style={{ fontSize: 12, color: 'var(--t2)' }}>전국 기출 포함</span>
        <span style={{ fontSize: 10, padding: '2px 7px', borderRadius: 20, background: 'var(--blue-soft)', color: 'var(--blue-text)', fontFamily: 'var(--mono)', fontWeight: 600 }}>전국기출</span>
        <span style={{ fontSize: 11, color: 'var(--t3)', marginLeft: 'auto' }}>{webOn ? '전국 기출 포함' : '업로드 자료만'}</span>
      </div>

      {webOn && (
        <div className="fade-in" style={{ background: 'var(--blue-soft)', border: '1px solid #BFDBFE', borderRadius: 'var(--r)', padding: '16px 18px', marginBottom: 14 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
            <span style={{ fontSize: 10, padding: '2px 7px', borderRadius: 20, background: 'var(--blue)', color: '#fff', fontFamily: 'var(--mono)', fontWeight: 600 }}>전국 기출 분석</span>
            <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--t1)' }}>전국 학교 출제 경향 요약</span>
          </div>
          {[
            ['1위', '기체 반응 법칙 단위 기체 계산', '전국 기출 92% 등장. 수소+산소, 질소+수소 한쪽이 남는 계산 문제'],
            ['2위', '질량 보존 법칙 열린/닫힌 용기 비교', '89%. 뚜껑 열고 닫고 상태별 질량 비교 실험 문제 필출'],
            ['3위', '일정 성분비 그래프 해석 + 남은 물질 계산', '87%. 그래프에서 반응 질량비 읽어 계산'],
          ].map(([rank, title, desc]) => (
            <div key={rank} style={{ display: 'flex', gap: 10, alignItems: 'flex-start', marginBottom: 8 }}>
              <span style={{ color: 'var(--blue-text)', fontFamily: 'var(--mono)', fontSize: 11, flexShrink: 0, paddingTop: 2, fontWeight: 700 }}>{rank}</span>
              <span style={{ fontSize: 13 }}><strong style={{ color: 'var(--t1)' }}>{title}</strong> — <span style={{ color: 'var(--t2)' }}>{desc}</span></span>
            </div>
          ))}
          <div style={{ fontSize: 11, color: 'var(--t3)', marginTop: 8 }}>출처: 전국 중3 과학 기출 문제 분석 (2022~2025)</div>
        </div>
      )}

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

      {/* Prob list */}
      <div className="card" style={{ padding: '4px 20px 12px' }}>
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
                <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--t1)', marginBottom: 2 }}>
                  {p.title}
                  {webOn && p.web && <span style={{ marginLeft: 6, fontSize: 10, padding: '2px 7px', borderRadius: 20, background: 'var(--blue-soft)', color: 'var(--blue-text)', fontFamily: 'var(--mono)', fontWeight: 600 }}>전국기출</span>}
                </div>
                <div style={{ fontSize: 11, color: 'var(--t3)' }}>{p.src}</div>
              </div>
              <span style={{
                fontSize: 11, padding: '2px 9px', borderRadius: 20, fontWeight: 600,
                background: p.type === '서술형' ? 'var(--red-soft)' : p.type === '서답형' ? 'var(--amber-soft)' : 'var(--brand-soft)',
                color: p.type === '서술형' ? 'var(--red-text)' : p.type === '서답형' ? 'var(--amber-text)' : 'var(--brand-text)',
              }}>{p.type}</span>
              <span style={{ color: 'var(--t3)', fontSize: 14, marginLeft: 4, display: 'inline-block', transform: openIdx === i ? 'rotate(90deg)' : 'none', transition: '0.2s' }}>›</span>
            </div>

            {openIdx === i && (
              <div className="fade-in" style={{ background: 'var(--bg2)', border: '1px solid var(--brand-border)', borderRadius: 'var(--r)', padding: 16, margin: '0 -4px 12px' }}>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5, marginBottom: 10 }}>
                  {p.keys.map(k => (
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
