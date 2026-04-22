'use client'
import type { QuizItem, Topic } from '@/lib/types'

interface Props {
  answers: Record<string, unknown>
  topics?: Topic[]
  onRetry: () => void
  onHome: () => void
  onReviewMap: () => void
}

export default function Step5Results({ answers, topics, onRetry, onHome, onReviewMap }: Props) {
  const { objAns, shortAns, essayAns, questions } = answers as {
    objAns: Record<number, number>
    shortAns: Record<number, string>
    essayAns: Record<number, string>
    questions: QuizItem[]
  }

  if (!questions?.length) {
    return (
      <div className="fade-in" style={{ textAlign: 'center', padding: '80px 24px' }}>
        <div style={{ fontSize: 40, marginBottom: 16 }}>📊</div>
        <div style={{ fontSize: 16, color: 'var(--t2)' }}>먼저 문제풀기를 완료해 주세요.</div>
        <button onClick={onRetry} className="btn-brand" style={{ marginTop: 20, padding: '10px 24px', fontSize: 14 }}>④ 문제풀기로</button>
      </div>
    )
  }

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
    (objQs.length > 0 ? objCorrect / objQs.length * 69 : 0) +
    (shortQs.length > 0 ? shortFilled / shortQs.length * 15 : 0) +
    (essayQs.length > 0 ? essayFilled / essayQs.length * 16 : 0)
  ))

  const wrongs = objQs.filter(q => {
    const qi = questions.indexOf(q)
    return objAns[qi] !== q.ans
  })

  // Group wrong answers by topic (cid)
  const topicMap: Record<string, string> = {}
  topics?.forEach(t => { topicMap[t.cid] = t.title })

  const weakMap: Record<string, number> = {}
  wrongs.forEach(q => {
    const t = topicMap[q.cid] || q.cid || '기타'
    weakMap[t] = (weakMap[t] || 0) + 1
  })
  const sorted = Object.entries(weakMap).sort((a, b) => b[1] - a[1]).slice(0, 3)

  // Topic score bars (dynamic)
  const topicScores = topics?.map(t => {
    const qs = objQs.filter(q => q.cid === t.cid)
    if (qs.length === 0) return null
    const correct = qs.filter(q => objAns[questions.indexOf(q)] === q.ans).length
    return { title: t.title, color: t.color, score: Math.round(correct / qs.length * 100), total: qs.length, correct }
  }).filter(Boolean) as Array<{ title: string; color: string; score: number; total: number; correct: number }> | undefined

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

      {/* Topic score breakdown */}
      {topicScores && topicScores.length > 0 && (
        <div className="card" style={{ padding: '20px 22px', marginBottom: 24 }}>
          <div style={{ fontSize: 16, fontWeight: 700, color: '#334155', marginBottom: 16 }}>주제별 정답률</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {topicScores.map(ts => (
              <div key={ts.title}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                  <span style={{ fontSize: 13, color: 'var(--t1)', fontWeight: 500 }}>{ts.title}</span>
                  <span style={{ fontFamily: 'var(--mono)', fontSize: 12, fontWeight: 700, color: ts.color }}>{ts.correct}/{ts.total}</span>
                </div>
                <div style={{ height: 6, background: 'var(--bg3)', borderRadius: 3 }}>
                  <div style={{ height: '100%', width: `${ts.score}%`, background: ts.color, borderRadius: 3, transition: 'width 0.5s' }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Weak points */}
      <div className="card" style={{ padding: '20px 22px', marginBottom: 14 }}>
        <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--t1)', marginBottom: 14 }}>취약 포인트</div>
        {sorted.length > 0 ? sorted.map(([topic, cnt], i) => (
          <div key={topic} style={{ display: 'flex', alignItems: 'flex-start', gap: 12, padding: '12px 0', borderBottom: i < sorted.length - 1 ? '1px solid var(--bd)' : 'none' }}>
            <div style={{ fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--t3)', width: 22, flexShrink: 0, paddingTop: 2, fontWeight: 700 }}>{i + 1}위</div>
            <div>
              <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--t1)', marginBottom: 3 }}>{topic} ({cnt}문제 오답)</div>
              <div style={{ fontSize: 12, color: 'var(--t2)' }}>해당 주제의 개념을 다시 학습하고 확인문제를 풀어보세요.</div>
            </div>
          </div>
        )) : <p style={{ fontSize: 13, color: 'var(--green-text)', fontWeight: 600 }}>오답이 없습니다. 훌륭합니다!</p>}
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
                  <span style={{ fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--t3)', fontWeight: 700 }}>{q.num || qi + 1}번</span>
                  <span style={{ fontSize: 11, padding: '2px 8px', border: '1px solid var(--bd)', borderRadius: 6, color: 'var(--t3)' }}>{q.src}</span>
                </div>
                <div style={{ fontSize: 13, color: 'var(--t1)', marginBottom: 8 }}>{(q.text || '').substring(0, 70)}{(q.text || '').length > 70 ? '...' : ''}</div>
                <div style={{ fontSize: 12, color: 'var(--red-text)', marginBottom: 4, fontWeight: 600 }}>
                  내 답: {ua !== undefined && q.choices ? `${'①②③④⑤'[ua]} ${q.choices[ua]}` : '미선택'}
                </div>
                <div style={{ fontSize: 12, color: 'var(--green-text)', marginBottom: 10, fontWeight: 600 }}>
                  정답: {q.ans !== undefined && q.choices ? `${'①②③④⑤'[q.ans as number]} ${q.choices[q.ans as number]}` : String(q.ans || '')}
                </div>
                {q.exp && (
                  <div style={{ background: 'var(--bg2)', border: '1px solid var(--bd)', borderRadius: 'var(--r-sm)', padding: '10px 13px', fontSize: 13, color: 'var(--t2)', lineHeight: 1.6 }}>{q.exp}</div>
                )}
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
