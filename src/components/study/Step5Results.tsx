'use client'
import { useEffect, useRef } from 'react'
import type { QuizItem } from '@/lib/types'

interface Props {
  answers: Record<string, unknown>
  onRetry: () => void
  onHome: () => void
  onReviewMap: () => void
}

const topicMap: Record<string, string> = {
  mass: '질량 보존 법칙', ratio: '일정 성분비 법칙', gas: '기체 반응 법칙',
  energy: '발열·흡열 반응', change: '물리·화학 변화', formula: '화학 반응식'
}
const tipMap: Record<string, string> = {
  '질량 보존 법칙': '열린/닫힌 용기 비교, 강철 솜·나무 연소, 원소의 종류·개수 불변이 핵심',
  '일정 성분비 법칙': 'Cu:O=4:1, Mg:O=3:2, H:O=1:8 수치 암기 필수. 혼합물 vs 화합물 구분',
  '기체 반응 법칙': 'H₂:O₂:H₂O=2:1:2, N₂:H₂:NH₃=1:3:2. 남는 기체 계산 패턴 연습',
  '발열·흡열 반응': '발열 예시: 연소·호흡·산화칼슘+물. 흡열 예시: 광합성·전기분해·질산암모늄+물',
  '물리·화학 변화': '성질 변화 여부로 구분. 마그네슘 실험, 원소 종류·개수는 항상 불변',
  '화학 반응식': '계수 맞추기 3단계. 주요 반응식 3개 외우기. 계수비=부피비≠질량비',
}

export default function Step5Results({ answers, onRetry, onHome, onReviewMap }: Props) {
  const { objAns, shortAns, essayAns, questions } = answers as {
    objAns: Record<number, number>
    shortAns: Record<number, string>
    essayAns: Record<number, string>
    questions: QuizItem[]
  }
  const radarRef = useRef<SVGSVGElement>(null)

  const objQs = questions.filter(q => q.type === 'obj')
  const shortQs = questions.filter(q => q.type === 'short')
  const essayQs = questions.filter(q => q.type === 'essay')

  const objCorrect = objQs.filter(q => {
    const qi = questions.indexOf(q)
    return objAns[qi] === q.ans
  }).length
  const shortFilled = shortQs.filter(q => {
    const qi = questions.indexOf(q)
    return !!shortAns[qi]?.trim()
  }).length
  const essayFilled = essayQs.filter(q => {
    const qi = questions.indexOf(q)
    return !!essayAns[qi]?.trim()
  }).length

  const total = Math.min(100, Math.round(
    objCorrect / Math.max(1, objQs.length) * 69 +
    shortFilled / Math.max(1, shortQs.length) * 15 +
    essayFilled / Math.max(1, essayQs.length) * 16
  ))

  const wrongs = objQs.filter(q => {
    const qi = questions.indexOf(q)
    return objAns[qi] !== q.ans
  })
  const weakMap: Record<string, number> = {}
  wrongs.forEach(q => { const t = topicMap[q.cid] || '기타'; weakMap[t] = (weakMap[t] || 0) + 1 })
  const sorted = Object.entries(weakMap).sort((a, b) => b[1] - a[1]).slice(0, 3)

  const axes = ['물리·화학변화', '질량보존', '일정성분비', '기체반응', '에너지변화']
  const cidToAxis: Record<string, number> = { change: 0, formula: 0, mass: 1, ratio: 2, gas: 3, energy: 4 }
  const axErr = [0, 0, 0, 0, 0], axTot = [5, 6, 6, 6, 7]
  wrongs.forEach(q => { const i = cidToAxis[q.cid]; if (i !== undefined) axErr[i]++ })
  const axScore = axTot.map((t, i) => Math.round(Math.max(0, 1 - axErr[i] / t) * 100))

  useEffect(() => {
    const svg = radarRef.current
    if (!svg) return
    svg.innerHTML = ''
    const cx = 100, cy = 100, maxR = 75, n = 5
    const angles = Array.from({ length: n }, (_, i) => i * 2 * Math.PI / n - Math.PI / 2)
    const ns = 'http://www.w3.org/2000/svg'
      ;[0.25, 0.5, 0.75, 1].forEach(t => {
        const pts = angles.map(a => `${cx + maxR * t * Math.cos(a)},${cy + maxR * t * Math.sin(a)}`).join(' ')
        const p = document.createElementNS(ns, 'polygon')
        p.setAttribute('points', pts); p.setAttribute('fill', 'none')
        p.setAttribute('stroke', '#E5E7EB'); p.setAttribute('stroke-width', '1')
        svg.appendChild(p)
      })
    angles.forEach((a, i) => {
      const line = document.createElementNS(ns, 'line')
      line.setAttribute('x1', String(cx)); line.setAttribute('y1', String(cy))
      line.setAttribute('x2', String(cx + maxR * Math.cos(a))); line.setAttribute('y2', String(cy + maxR * Math.sin(a)))
      line.setAttribute('stroke', '#E5E7EB'); line.setAttribute('stroke-width', '1')
      svg.appendChild(line)
      const t = document.createElementNS(ns, 'text')
      t.setAttribute('x', String(cx + (maxR + 16) * Math.cos(a))); t.setAttribute('y', String(cy + (maxR + 14) * Math.sin(a)))
      t.setAttribute('text-anchor', 'middle'); t.setAttribute('dominant-baseline', 'middle')
      t.setAttribute('fill', '#6B7280'); t.setAttribute('font-size', '8.5')
      t.setAttribute('font-family', 'Pretendard, sans-serif'); t.textContent = axes[i]
      svg.appendChild(t)
    })
    const pts = angles.map((a, i) => { const r = maxR * axScore[i] / 100; return `${cx + r * Math.cos(a)},${cy + r * Math.sin(a)}` }).join(' ')
    const poly = document.createElementNS(ns, 'polygon')
    poly.setAttribute('points', pts); poly.setAttribute('fill', 'rgba(124,58,237,0.15)')
    poly.setAttribute('stroke', '#7C3AED'); poly.setAttribute('stroke-width', '2')
    svg.appendChild(poly)
  }, [axScore])

  const scoreColor = total >= 90 ? '#10b981' : total >= 70 ? '#6366f1' : '#f59e0b'

  return (
    <div className="fade-in slide-up">
      <div style={{ marginBottom: 22 }}>
        <h1 style={{ fontSize: 24, fontWeight: 800, color: '#0f172a', marginBottom: 6, letterSpacing: '-0.02em' }}>학습 결과 리포트</h1>
        <p style={{ fontSize: 15, color: '#64748b' }}>오늘의 학습 성취도와 보완 점을 확인하세요.</p>
      </div>

      {/* Score */}
      <div style={{ padding: '48px 32px', marginBottom: 24, textAlign: 'center', background: '#fff', borderRadius: '24px', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.05)', border: '1px solid #f1f5f9' }}>
        <div style={{ fontFamily: 'var(--mono)', fontSize: 88, fontWeight: 900, lineHeight: 1, color: scoreColor, marginBottom: 12 }}>{total}</div>
        <div style={{ fontSize: 16, color: '#64748b', fontWeight: 600 }}>종합 성취 점수</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, marginTop: 20 }}>
          {[
            { v: `${objCorrect}/${objQs.length}`, l: '객관식 정답', c: '#6366f1' },
            { v: `${shortFilled}/${shortQs.length}`, l: '서답형 응답', c: '#f59e0b' },
            { v: `${essayFilled}/${essayQs.length}`, l: '서술형 응답', c: '#ef4444' },
          ].map(m => (
            <div key={m.l} style={{ background: '#f8fafc', borderRadius: '16px', padding: '16px' }}>
              <div style={{ fontFamily: 'var(--mono)', fontSize: 24, fontWeight: 800, color: m.c }}>{m.v}</div>
              <div style={{ fontSize: 12, color: '#64748b', marginTop: 4, fontWeight: 500 }}>{m.l}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Radar */}
      <div style={{ padding: '24px', marginBottom: 24, background: '#fff', borderRadius: '24px', border: '1px solid #f1f5f9' }}>
        <div style={{ fontSize: 16, fontWeight: 700, color: '#334155', marginBottom: 20 }}>상세 영역 분석</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 24, flexWrap: 'wrap' }}>
          <svg ref={radarRef} width="200" height="200" viewBox="0 0 200 200" />
          <div style={{ flex: 1, minWidth: 150, display: 'flex', flexDirection: 'column', gap: 8 }}>
            {axes.map((ax, i) => (
              <div key={ax} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{
                  width: 8, height: 8, borderRadius: '50%', flexShrink: 0,
                  background: axScore[i] >= 80 ? '#10b981' : axScore[i] >= 60 ? '#6366f1' : '#f59e0b'
                }} />
                <span style={{ fontSize: 13, color: '#64748b', flex: 1, fontWeight: 500 }}>{ax}</span>
                <span style={{
                  fontFamily: 'var(--mono)', fontSize: 12, fontWeight: 700,
                  color: axScore[i] >= 80 ? '#10b981' : axScore[i] >= 60 ? '#6366f1' : '#f59e0b'
                }}>{axScore[i]}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Weak points */}
      <div className="card" style={{ padding: '20px 22px', marginBottom: 14 }}>
        <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--t1)', marginBottom: 14 }}>취약 포인트 Top 3</div>
        {sorted.length > 0 ? sorted.map(([topic, cnt], i) => (
          <div key={topic} style={{ display: 'flex', alignItems: 'flex-start', gap: 12, padding: '12px 0', borderBottom: i < sorted.length - 1 ? '1px solid var(--bd)' : 'none' }}>
            <div style={{ fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--t3)', width: 22, flexShrink: 0, paddingTop: 2, fontWeight: 700 }}>{i + 1}위</div>
            <div>
              <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--t1)', marginBottom: 3 }}>{topic} ({cnt}문제 오답)</div>
              <div style={{ fontSize: 12, color: 'var(--t2)' }}>{tipMap[topic] || '해당 단원을 다시 학습하세요.'}</div>
            </div>
          </div>
        )) : <p style={{ fontSize: 13, color: 'var(--green-text)', fontWeight: 600 }}>오답이 없습니다. 훌륭합니다! 🎉</p>}
      </div>

      {/* Wrong answers */}
      {wrongs.length > 0 && (
        <div className="card" style={{ padding: '20px 22px', marginBottom: 14 }}>
          <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--t1)', marginBottom: 14 }}>오답 분석</div>
          {wrongs.map(q => {
            const qi = questions.indexOf(q)
            const ua = objAns[qi]
            return (
              <div key={qi} style={{ padding: '14px 0', borderBottom: '1px solid var(--bd)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8, flexWrap: 'wrap' }}>
                  <span style={{ fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--t3)', fontWeight: 700 }}>{q.num}번</span>
                  <span style={{ fontSize: 11, padding: '2px 8px', border: '1px solid var(--bd)', borderRadius: 6, color: 'var(--t3)' }}>{q.src}</span>
                </div>
                <div style={{ fontSize: 13, color: 'var(--t1)', marginBottom: 8 }}>{q.text.substring(0, 70)}...</div>
                <div style={{ fontSize: 12, color: 'var(--red-text)', marginBottom: 4, fontWeight: 600 }}>
                  내 답: {ua !== undefined && q.choices ? `${'①②③④⑤'[ua]} ${q.choices[ua]}` : '미선택'}
                </div>
                <div style={{ fontSize: 12, color: 'var(--green-text)', marginBottom: 10, fontWeight: 600 }}>
                  정답: {q.ans !== undefined && q.choices ? `${'①②③④⑤'[q.ans as number]} ${q.choices[q.ans as number]}` : ''}
                </div>
                <div style={{ background: 'var(--bg2)', border: '1px solid var(--bd)', borderRadius: 'var(--r-sm)', padding: '10px 13px', fontSize: 13, color: 'var(--t2)', lineHeight: 1.6, marginBottom: 8 }}>{q.exp}</div>
                {q.sim && <div style={{ background: 'var(--brand-soft)', border: '1px solid var(--brand-border)', borderRadius: 'var(--r-sm)', padding: '10px 13px', fontSize: 12, color: 'var(--brand-text)', lineHeight: 1.6 }}><strong>유사 문제:</strong> {q.sim}</div>}
              </div>
            )
          })}
        </div>
      )}

      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
        <button onClick={onRetry} className="btn-brand" style={{ padding: '12px 22px', fontSize: 13 }}>문제 다시 풀기</button>
        <button onClick={onReviewMap} className="btn-outline" style={{ padding: '12px 20px', fontSize: 13 }}>개념지도 복습</button>
        <button onClick={onHome} className="btn-outline" style={{ padding: '12px 20px', fontSize: 13 }}>홈으로</button>
      </div>
    </div>
  )
}
