'use client'
import { useState, useEffect } from 'react'
import type { UserData, StudyStep, StudyContent, Topic } from '@/lib/types'
import Step1Analysis from './study/Step1Analysis'
import Step2ConceptMap from './study/Step2ConceptMap'
import Step3Practice from './study/Step3Practice'
import Step4Quiz from './study/Step4Quiz'
import Step5Results from './study/Step5Results'

interface Props { subject: string; userData: UserData; onHome: () => void; files?: File[] }

const SUBJECT_NAMES: Record<string, string> = {
  science: '과학', social: '사회', history: '역사', math: '수학',
  korean: '국어', english: '영어', moral: '도덕/윤리', tech: '기술·가정',
}

const STEPS = [
  { n: 1, label: '출제분석' },
  { n: 2, label: '개념지도' },
  { n: 3, label: '확인학습' },
  { n: 4, label: '문제풀기' },
  { n: 5, label: '결과' },
]

function storageKey(email: string, subject: string) {
  return `exam100_study_${email || 'guest'}_${subject}`
}

export default function Study({ subject, userData, onHome, files }: Props) {
  const [step, setStep] = useState<StudyStep>(1)
  const [webOn, setWebOn] = useState(false)
  const [focusCid, setFocusCid] = useState<string | undefined>()
  const [results, setResults] = useState<Record<string, unknown>>({})
  const [content, setContent] = useState<StudyContent | null>(null)
  const [generating, setGenerating] = useState(false)

  const key = storageKey(userData.email, subject)

  // Load saved content on mount
  useEffect(() => {
    const saved = localStorage.getItem(key)
    if (saved) {
      try {
        const parsed = JSON.parse(saved) as StudyContent
        if (parsed.topics?.length) setContent(parsed)
      } catch {
        localStorage.removeItem(key)
      }
    }
  }, [key])

  const generateContent = async (topics: Topic[], summary: string) => {
    const partial: StudyContent = { topics, summary }
    setContent(partial)
    setGenerating(true)
    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topics, subject: SUBJECT_NAMES[subject] || subject }),
      })
      if (res.ok) {
        const { practice, quiz } = await res.json()
        const full: StudyContent = { topics, summary, practice, quiz }
        setContent(full)
        localStorage.setItem(key, JSON.stringify(full))
      }
    } catch (err) {
      console.error('Generate error:', err)
    } finally {
      setGenerating(false)
    }
  }

  const onAnalysisComplete = (topics: Topic[], summary: string) => {
    if (!content?.practice) {
      generateContent(topics, summary)
    }
  }

  const goStep = (n: number) => setStep(n as StudyStep)

  const handleSubmit = (ans: Record<string, unknown>) => {
    setResults(ans)
    setStep(5)
  }

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc', color: '#1e293b' }}>
      {/* Nav */}
      <nav style={{
        background: 'rgba(255, 255, 255, 0.8)', backdropFilter: 'blur(12px)',
        borderBottom: '1px solid #e2e8f0', padding: '0 24px', height: 64,
        display: 'flex', alignItems: 'center',
        justifyContent: 'space-between', position: 'sticky', top: 0, zIndex: 300, gap: 10,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 32, height: 32, borderRadius: 10, background: '#6366f1', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16 }}>🎯</div>
          <span style={{ fontFamily: 'var(--mono)', fontSize: 16, fontWeight: 800, color: '#0f172a', letterSpacing: '-0.02em' }}>EXAM 100</span>
        </div>

        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', background: '#f1f5f9', padding: '4px', borderRadius: '12px' }}>
          {STEPS.map(s => (
            <button key={s.n} onClick={() => goStep(s.n)} style={{
              padding: '6px 14px', borderRadius: '8px', fontSize: 12, cursor: 'pointer', whiteSpace: 'nowrap',
              transition: 'all 0.15s', fontFamily: 'inherit', fontWeight: step === s.n ? 700 : 400,
              border: 'none',
              background: step === s.n ? '#fff' : 'transparent',
              color: step === s.n ? '#6366f1' : '#64748b',
              boxShadow: step === s.n ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
            }}>
              {s.label}
            </button>
          ))}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ width: 34, height: 34, borderRadius: '50%', background: '#eef2ff', border: '2px solid #e0e7ff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 800, color: '#6366f1' }}>
            {userData.name[0]}
          </div>
          <button onClick={onHome} className="btn-outline" style={{ padding: '6px 14px', fontSize: 12, borderRadius: '10px', fontWeight: 600 }}>종료</button>
        </div>
      </nav>

      {/* Content */}
      <div style={{ maxWidth: 900, margin: '0 auto', padding: '40px 24px' }}>
        {step === 1 && (
          <Step1Analysis
            onNext={goStep}
            webOn={webOn}
            setWebOn={setWebOn}
            subject={subject}
            files={files}
            savedContent={content}
            onAnalysisComplete={onAnalysisComplete}
          />
        )}
        {step === 2 && (
          <Step2ConceptMap
            onNext={goStep}
            onFocusCid={setFocusCid}
            topics={content?.topics}
            subjectName={SUBJECT_NAMES[subject] || subject}
          />
        )}
        {step === 3 && (
          <Step3Practice
            onNext={goStep}
            focusCid={focusCid}
            practice={content?.practice}
            generating={generating}
          />
        )}
        {step === 4 && (
          <Step4Quiz
            onNext={goStep}
            onSubmit={handleSubmit}
            quiz={content?.quiz}
            generating={generating}
          />
        )}
        {step === 5 && (
          <Step5Results
            answers={results}
            topics={content?.topics}
            onRetry={() => setStep(4)}
            onHome={onHome}
            onReviewMap={() => setStep(2)}
          />
        )}
      </div>
    </div>
  )
}
