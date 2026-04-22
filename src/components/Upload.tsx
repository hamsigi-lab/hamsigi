'use client'
import { useState, useRef } from 'react'

interface Props {
  onAnalyze: (subject: string) => void
  onBack: () => void
}

const SUBJECTS = [
  { value: 'science', label: '과학', icon: '🔬', color: '#EFF6FF', border: '#BFDBFE' },
  { value: 'social', label: '사회', icon: '🌍', color: '#F0FDF4', border: '#BBF7D0' },
  { value: 'history', label: '역사', icon: '📜', color: '#FFF7ED', border: '#FED7AA' },
  { value: 'math', label: '수학', icon: '📐', color: '#EEF2FF', border: '#C7D2FE' },
  { value: 'korean', label: '국어', icon: '📖', color: '#FDF4FF', border: '#E9D5FF' },
  { value: 'english', label: '영어', icon: '🔤', color: '#F0FDF4', border: '#BBF7D0' },
  { value: 'moral', label: '도덕/윤리', icon: '⚖️', color: '#FFFBEB', border: '#FDE68A' },
  { value: 'tech', label: '기술·가정', icon: '🔧', color: '#FFF1F2', border: '#FECDD3' },
]
const TYPES = [
  { value: 'textbook', label: '교과서', icon: '📚' },
  { value: 'worksheet', label: '학습지', icon: '📄' },
  { value: 'note', label: '필기 노트', icon: '✏️' },
  { value: 'problem', label: '문제지/기출', icon: '📝' },
  { value: 'summary', label: '요약 정리', icon: '🗒️' },
]

export default function Upload({ onAnalyze, onBack }: Props) {
  const [step, setStep] = useState(1)
  const [subject, setSubject] = useState('')
  const [type, setType] = useState('textbook')
  const [unit, setUnit] = useState('')
  const [files, setFiles] = useState<string[]>([])
  const [analyzing, setAnalyzing] = useState(false)
  const [drag, setDrag] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const addFiles = (fl: FileList | null) => {
    if (!fl) return
    setFiles(prev => [...prev, ...Array.from(fl).map(f => f.name)])
  }

  const selectSubject = (val: string) => { setSubject(val); setStep(2) }

  const analyze = () => {
    if (files.length === 0) { alert('파일을 업로드해주세요.'); return }
    setAnalyzing(true)
    setTimeout(() => { setAnalyzing(false); onAnalyze(subject) }, 2200)
  }

  const selectedSubject = SUBJECTS.find(s => s.value === subject)

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg2)' }}>
      {/* Nav */}
      <nav style={{
        position: 'sticky', top: 0, zIndex: 100,
        background: 'rgba(255,255,255,0.88)', backdropFilter: 'blur(16px)',
        borderBottom: '1px solid var(--bd)', padding: '0 24px',
        height: 60, display: 'flex', alignItems: 'center', gap: 12,
      }}>
        <button
          onClick={step === 2 ? () => setStep(1) : onBack}
          className="btn-ghost"
          style={{ fontSize: 14, display: 'flex', alignItems: 'center', gap: 4, fontWeight: 500 }}>
          ← {step === 2 ? '과목 선택으로' : '홈으로'}
        </button>
        <div style={{ width: 1, height: 16, background: 'var(--bd)' }} />

        {/* Mini step indicator */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <div style={{
            width: 22, height: 22, borderRadius: '50%', fontSize: 11, fontWeight: 700,
            background: 'var(--brand)', color: '#fff',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>1</div>
          <span style={{ fontSize: 13, fontWeight: step === 1 ? 700 : 400, color: step === 1 ? 'var(--t1)' : 'var(--t3)' }}>과목 선택</span>
          <div style={{ width: 24, height: 1, background: 'var(--bd2)' }} />
          <div style={{
            width: 22, height: 22, borderRadius: '50%', fontSize: 11, fontWeight: 700,
            background: step === 2 ? 'var(--brand)' : 'var(--bg3)', color: step === 2 ? '#fff' : 'var(--t3)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>2</div>
          <span style={{ fontSize: 13, fontWeight: step === 2 ? 700 : 400, color: step === 2 ? 'var(--t1)' : 'var(--t3)' }}>파일 업로드</span>
        </div>
      </nav>

      <div style={{ maxWidth: 660, margin: '0 auto', padding: '48px 24px' }}>

        {/* ── STEP 1: Subject ── */}
        {step === 1 && (
          <div className="slide-up">
            <div style={{ textAlign: 'center', marginBottom: 44 }}>
              <h1 style={{ fontSize: 30, fontWeight: 800, color: 'var(--t1)', letterSpacing: '-0.03em', marginBottom: 10 }}>
                어떤 과목을 공부할까요?
              </h1>
              <p style={{ fontSize: 16, color: 'var(--t2)' }}>
                과목을 선택하면 AI가 맞춰서 분석해 드려요.
              </p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 14 }}>
              {SUBJECTS.map(s => (
                <button key={s.value} onClick={() => selectSubject(s.value)}
                  className="hover-lift"
                  style={{
                    padding: '24px 20px', borderRadius: 18,
                    border: `1.5px solid ${s.border}`,
                    background: s.color,
                    cursor: 'pointer', textAlign: 'left',
                    display: 'flex', alignItems: 'center', gap: 14,
                    fontFamily: 'inherit',
                  }}>
                  <span style={{ fontSize: 34 }}>{s.icon}</span>
                  <span style={{ fontSize: 18, fontWeight: 700, color: 'var(--t1)', letterSpacing: '-0.01em' }}>{s.label}</span>
                  <span style={{ marginLeft: 'auto', color: 'var(--t3)', fontSize: 18 }}>→</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ── STEP 2: Upload ── */}
        {step === 2 && (
          <div className="slide-up">
            {/* Subject badge */}
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '8px 16px', borderRadius: 99, marginBottom: 20, background: selectedSubject?.color || 'var(--bg3)', border: `1.5px solid ${selectedSubject?.border || 'var(--bd)'}` }}>
              <span style={{ fontSize: 16 }}>{selectedSubject?.icon}</span>
              <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--t1)' }}>{selectedSubject?.label} 선택됨</span>
            </div>

            <h1 style={{ fontSize: 28, fontWeight: 800, color: 'var(--t1)', letterSpacing: '-0.03em', marginBottom: 8 }}>
              자료를 업로드해 주세요
            </h1>
            <p style={{ fontSize: 15, color: 'var(--t2)', marginBottom: 32, lineHeight: 1.6 }}>
              교과서, 학습지, 필기 노트를 올리면 AI가 출제 패턴을 분석해요.
            </p>

            {/* Unit & Type */}
            <div style={{ background: '#fff', borderRadius: 20, boxShadow: 'var(--sh-xs)', padding: '24px', marginBottom: 16 }}>
              <FLabel>단원명 <span style={{ fontWeight: 400, color: 'var(--t3)' }}>(선택)</span></FLabel>
              <input className="input-base" value={unit} onChange={e => setUnit(e.target.value)} placeholder="예: 1단원 화학 반응의 규칙" style={{ marginBottom: 20 }} />

              <FLabel>자료 종류</FLabel>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {TYPES.map(t => {
                  const on = type === t.value
                  return (
                    <button key={t.value} onClick={() => setType(t.value)} style={{
                      padding: '8px 16px', borderRadius: 99, fontFamily: 'inherit',
                      border: `1.5px solid ${on ? 'var(--brand)' : 'var(--bd)'}`,
                      background: on ? 'var(--brand-soft)' : '#fff',
                      color: on ? 'var(--brand-text)' : 'var(--t2)',
                      fontSize: 13, fontWeight: on ? 700 : 400, cursor: 'pointer', transition: 'all 0.15s',
                    }}>
                      {t.icon} {t.label}
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Drop zone */}
            <div
              onClick={() => inputRef.current?.click()}
              onDragOver={e => { e.preventDefault(); setDrag(true) }}
              onDragLeave={() => setDrag(false)}
              onDrop={e => { e.preventDefault(); setDrag(false); addFiles(e.dataTransfer.files) }}
              style={{
                border: `2px dashed ${drag ? 'var(--brand)' : 'var(--bd2)'}`,
                borderRadius: 20, padding: '52px 24px', textAlign: 'center', cursor: 'pointer',
                background: drag ? 'var(--brand-soft)' : '#fff',
                transition: 'all 0.2s', marginBottom: 16,
              }}>
              <input ref={inputRef} type="file" multiple accept=".pdf,.jpg,.jpeg,.png,.hwp,.docx" style={{ display: 'none' }} onChange={e => addFiles(e.target.files)} />
              <div style={{ fontSize: 52, marginBottom: 16 }}>☁️</div>
              <div style={{ fontSize: 17, fontWeight: 700, color: drag ? 'var(--brand)' : 'var(--t1)', marginBottom: 8, letterSpacing: '-0.01em' }}>
                {drag ? '여기에 놓으세요!' : '자료를 여기에 끌어다 놓거나 클릭'}
              </div>
              <div style={{ fontSize: 13, color: 'var(--t3)' }}>PDF · JPG · PNG · HWP · DOCX</div>
            </div>

            {/* File list */}
            {files.length > 0 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 16 }}>
                {files.map((f, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', background: '#fff', borderRadius: 'var(--r-lg)', boxShadow: 'var(--sh-xs)' }}>
                    <span style={{ fontSize: 20 }}>📄</span>
                    <span style={{ flex: 1, fontSize: 14, color: 'var(--t1)', fontWeight: 500 }}>{f}</span>
                    <span style={{ fontSize: 12, padding: '3px 10px', borderRadius: 99, background: 'var(--green-soft)', color: 'var(--green-text)', fontWeight: 700 }}>준비됨</span>
                    <button onClick={() => setFiles(prev => prev.filter((_, j) => j !== i))} className="btn-ghost" style={{ fontSize: 16, lineHeight: 1 }}>✕</button>
                  </div>
                ))}
              </div>
            )}

            {/* Notice */}
            <div style={{ background: 'var(--amber-soft)', border: '1px solid #FDE68A', borderRadius: 'var(--r-lg)', padding: '14px 18px', fontSize: 13, color: 'var(--amber-text)', marginBottom: 28, lineHeight: 1.65 }}>
              💡 업로드 자료는 학교 전용 DB 구축에 활용됩니다. 개인 정보가 포함되지 않도록 주의해 주세요.
            </div>

            <div style={{ display: 'flex', gap: 12 }}>
              <button onClick={() => setStep(1)} className="btn-outline" style={{ padding: '14px 24px', fontSize: 15, borderRadius: 'var(--r-xl)', fontWeight: 600 }}>← 이전</button>
              <button onClick={analyze} disabled={analyzing || files.length === 0} className="btn-brand" style={{
                flex: 1, padding: '14px', fontSize: 16, borderRadius: 'var(--r-xl)',
                opacity: files.length > 0 && !analyzing ? 1 : 0.45,
                cursor: files.length > 0 && !analyzing ? 'pointer' : 'not-allowed',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
                fontWeight: 700,
              }}>
                {analyzing
                  ? <><span className="spin-anim">⟳</span> AI가 분석 중...</>
                  : '🔍 AI 분석 시작하기'
                }
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function FLabel({ children }: { children: React.ReactNode }) {
  return <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--t2)', marginBottom: 8 }}>{children}</div>
}
