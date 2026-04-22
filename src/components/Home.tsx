'use client'
import { useState, useEffect } from 'react'
import type { UserData } from '@/lib/types'

interface Props {
  userData: UserData
  onStudy: (subject: string) => void
  onUpload: () => void
  onLogout: () => void
}

const SUBJECT_NAMES: Record<string, string> = {
  science: '과학', social: '사회', history: '역사', math: '수학',
  korean: '국어', english: '영어', moral: '도덕/윤리', tech: '기술·가정',
}

const SUBJECT_ICONS: Record<string, string> = {
  science: '🔬', social: '🌏', history: '📜', math: '📐',
  korean: '📖', english: '🅰️', moral: '💡', tech: '🔧',
}

const FEATURES = [
  { icon: '📊', title: '출제 확률 분석', desc: 'AI가 기출 패턴을 분석해 출제 가능성을 %로 보여줘요.' },
  { icon: '🗺️', title: '개념 지도', desc: '핵심 개념을 노드로 시각화해 한눈에 파악해요.' },
  { icon: '🎯', title: '맞춤 예상 문제', desc: '객관식·서답형·서술형 문항을 자동 생성해요.' },
  { icon: '📈', title: '성취도 분석', desc: '틀린 문제·취약 개념을 추적해 집중 학습을 도와요.' },
]

interface SavedSubject {
  subject: string
  name: string
  icon: string
  topicCount: number
  summary: string
  savedAt?: string
}

export default function Home({ userData, onStudy, onUpload, onLogout }: Props) {
  const [profileOpen, setProfileOpen] = useState(false)
  const [savedSubjects, setSavedSubjects] = useState<SavedSubject[]>([])
  const initial = userData.name ? userData.name[0] : '?'

  useEffect(() => {
    const found: SavedSubject[] = []
    Object.keys(SUBJECT_NAMES).forEach(subject => {
      const key = `exam100_study_${userData.email || 'guest'}_${subject}`
      const raw = localStorage.getItem(key)
      if (!raw) return
      try {
        const data = JSON.parse(raw)
        if (data.topics?.length) {
          found.push({
            subject,
            name: SUBJECT_NAMES[subject],
            icon: SUBJECT_ICONS[subject] || '📚',
            topicCount: data.topics.length,
            summary: data.summary || '',
          })
        }
      } catch {
        localStorage.removeItem(key)
      }
    })
    setSavedSubjects(found)
  }, [userData.email])

  const deleteSubject = (subject: string) => {
    const key = `exam100_study_${userData.email || 'guest'}_${subject}`
    localStorage.removeItem(key)
    setSavedSubjects(prev => prev.filter(s => s.subject !== subject))
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg2)' }}>
      {/* Nav */}
      <nav style={{
        position: 'sticky', top: 0, zIndex: 100,
        background: 'rgba(255,255,255,0.88)', backdropFilter: 'blur(16px)',
        borderBottom: '1px solid var(--bd)', padding: '0 24px',
        height: 60, display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ width: 30, height: 30, borderRadius: 8, background: 'var(--brand)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 15 }}>🎯</div>
          <span style={{ fontFamily: 'var(--mono)', fontSize: 15, fontWeight: 700, color: 'var(--t1)', letterSpacing: '0.02em' }}>EXAM 100</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <button onClick={onUpload} className="btn-brand" style={{ padding: '8px 18px', fontSize: 13, display: 'flex', alignItems: 'center', gap: 6 }}>
            + 업로드
          </button>

          <div style={{ position: 'relative' }}>
            <button
              onClick={() => setProfileOpen(o => !o)}
              style={{
                width: 36, height: 36, borderRadius: '50%',
                background: 'var(--brand-soft)', border: '2px solid var(--brand-border)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 14, fontWeight: 800, color: 'var(--brand)',
                cursor: 'pointer', fontFamily: 'inherit',
              }}>
              {initial}
            </button>

            {profileOpen && (
              <>
                <div style={{ position: 'fixed', inset: 0, zIndex: 150 }} onClick={() => setProfileOpen(false)} />
                <div className="slide-down" style={{
                  position: 'absolute', top: 'calc(100% + 10px)', right: 0,
                  width: 240, background: '#fff', borderRadius: 16,
                  boxShadow: 'var(--sh-lg)', border: '1px solid var(--bd)', zIndex: 200, overflow: 'hidden',
                }}>
                  <div style={{ padding: '16px 18px', borderBottom: '1px solid var(--bd)', background: 'var(--bg2)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <div style={{ width: 42, height: 42, borderRadius: '50%', background: 'var(--brand-soft)', border: '2px solid var(--brand-border)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, fontWeight: 800, color: 'var(--brand)', flexShrink: 0 }}>
                        {initial}
                      </div>
                      <div>
                        <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--t1)' }}>{userData.name}</div>
                        <div style={{ fontSize: 12, color: 'var(--t3)', marginTop: 1 }}>{userData.email}</div>
                      </div>
                    </div>
                  </div>
                  <div style={{ padding: '12px 18px', borderBottom: '1px solid var(--bd)' }}>
                    <InfoRow label="학교" value={userData.school} />
                    <InfoRow label="지역" value={userData.region} />
                    <InfoRow label="학년" value={userData.grade} />
                    {userData.publishers.length > 0 && (
                      <InfoRow label="출판사" value={userData.publishers.join(', ')} />
                    )}
                  </div>
                  <button
                    onClick={() => { setProfileOpen(false); onLogout() }}
                    style={{
                      width: '100%', padding: '13px 18px', textAlign: 'left',
                      background: 'transparent', border: 'none', cursor: 'pointer',
                      fontSize: 14, color: 'var(--red-text)', fontFamily: 'inherit', fontWeight: 600,
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = 'var(--red-soft)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                  >
                    로그아웃
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Layout: sidebar + main */}
      <div style={{ display: 'flex', maxWidth: 1100, margin: '0 auto', padding: '32px 24px', gap: 24, alignItems: 'flex-start' }}>

        {/* Sidebar */}
        <aside style={{
          width: 220, flexShrink: 0,
          background: '#fff', borderRadius: 20, boxShadow: 'var(--sh-xs)',
          padding: '20px 0', position: 'sticky', top: 76,
        }}>
          <div style={{ padding: '0 16px 12px', borderBottom: '1px solid var(--bd)' }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--t3)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>내 학습 기록</div>
          </div>

          {savedSubjects.length === 0 ? (
            <div style={{ padding: '20px 16px', textAlign: 'center' }}>
              <div style={{ fontSize: 28, marginBottom: 8 }}>📂</div>
              <div style={{ fontSize: 12, color: 'var(--t3)', lineHeight: 1.6 }}>아직 분석된<br />과목이 없어요</div>
            </div>
          ) : (
            <div style={{ padding: '8px 0' }}>
              {savedSubjects.map(s => (
                <div key={s.subject} style={{ position: 'relative', margin: '2px 8px' }}>
                  <button
                    onClick={() => onStudy(s.subject)}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 10,
                      width: '100%', padding: '10px 10px 10px 12px',
                      borderRadius: 12, border: 'none',
                      background: 'transparent', cursor: 'pointer',
                      textAlign: 'left', fontFamily: 'inherit',
                      transition: 'background 0.15s',
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = 'var(--bg2)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                  >
                    <span style={{ fontSize: 20, flexShrink: 0 }}>{s.icon}</span>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--t1)' }}>{s.name}</div>
                      <div style={{ fontSize: 11, color: 'var(--t3)' }}>주제 {s.topicCount}개</div>
                    </div>
                  </button>
                  <button
                    onClick={() => deleteSubject(s.subject)}
                    title="삭제"
                    style={{
                      position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)',
                      width: 20, height: 20, borderRadius: '50%', border: 'none',
                      background: 'transparent', cursor: 'pointer', color: 'var(--t3)',
                      fontSize: 13, display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontFamily: 'inherit',
                    }}
                    onMouseEnter={e => { e.currentTarget.style.background = 'var(--red-soft)'; e.currentTarget.style.color = 'var(--red-text)' }}
                    onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--t3)' }}
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}

          <div style={{ padding: '12px 16px 0', borderTop: '1px solid var(--bd)', marginTop: 4 }}>
            <button onClick={onUpload} className="btn-brand" style={{
              width: '100%', padding: '9px', fontSize: 12, borderRadius: 10, textAlign: 'center',
            }}>
              + 새 자료 업로드
            </button>
          </div>
        </aside>

        {/* Main content */}
        <main style={{ flex: 1, minWidth: 0 }} className="fade-in">
          <div style={{ marginBottom: 32 }}>
            <h1 style={{ fontSize: 28, fontWeight: 800, color: 'var(--t1)', letterSpacing: '-0.03em', marginBottom: 6 }}>
              안녕하세요, {userData.name}님
            </h1>
            <p style={{ fontSize: 15, color: 'var(--t2)' }}>
              {userData.school} · {userData.grade}
            </p>
          </div>

          {savedSubjects.length > 0 ? (
            <>
              {/* Saved subjects grid */}
              <div style={{ marginBottom: 32 }}>
                <h3 style={{ fontSize: 13, fontWeight: 700, color: 'var(--t3)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 14 }}>
                  저장된 학습 자료
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 12 }}>
                  {savedSubjects.map(s => (
                    <button
                      key={s.subject}
                      onClick={() => onStudy(s.subject)}
                      style={{
                        background: '#fff', borderRadius: 16, padding: '20px',
                        boxShadow: 'var(--sh-xs)', border: '1.5px solid var(--bd)',
                        cursor: 'pointer', textAlign: 'left', fontFamily: 'inherit',
                        transition: 'all 0.2s',
                      }}
                      onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--brand)'; e.currentTarget.style.boxShadow = '0 4px 16px rgba(99,102,241,0.12)' }}
                      onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--bd)'; e.currentTarget.style.boxShadow = 'var(--sh-xs)' }}
                    >
                      <div style={{ fontSize: 32, marginBottom: 10 }}>{s.icon}</div>
                      <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--t1)', marginBottom: 4 }}>{s.name}</div>
                      <div style={{ fontSize: 12, color: 'var(--t3)', marginBottom: 10 }}>출제 예상 주제 {s.topicCount}개</div>
                      {s.summary && (
                        <div style={{ fontSize: 12, color: 'var(--t2)', lineHeight: 1.6, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                          {s.summary}
                        </div>
                      )}
                      <div style={{ marginTop: 12, fontSize: 12, color: 'var(--brand)', fontWeight: 600 }}>
                        학습 시작 →
                      </div>
                    </button>
                  ))}

                  {/* Upload more card */}
                  <button
                    onClick={onUpload}
                    style={{
                      background: 'var(--bg2)', borderRadius: 16, padding: '20px',
                      border: '1.5px dashed var(--bd)', cursor: 'pointer',
                      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                      gap: 8, fontFamily: 'inherit', minHeight: 140, transition: 'all 0.15s',
                    }}
                    onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--brand)'}
                    onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--bd)'}
                  >
                    <span style={{ fontSize: 28, color: 'var(--t3)' }}>+</span>
                    <span style={{ fontSize: 13, color: 'var(--t3)', fontWeight: 600 }}>다른 과목 추가</span>
                  </button>
                </div>
              </div>

              {/* School DB card */}
              <div style={{
                background: '#fff', borderRadius: 16, boxShadow: 'var(--sh-xs)',
                padding: '18px 22px',
                display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap',
                borderLeft: '4px solid var(--brand)',
              }}>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--t1)', marginBottom: 4 }}>
                    🏫 {userData.school} 공유 데이터베이스
                  </div>
                  <div style={{ fontSize: 13, color: 'var(--t2)' }}>
                    같은 학교 학생들의 자료가 쌓이면 출제 예측 정확도가 올라가요.
                  </div>
                </div>
                <div style={{
                  padding: '6px 14px', borderRadius: 99, fontSize: 12, fontWeight: 700,
                  background: 'var(--brand-soft)', color: 'var(--brand-text)', border: '1px solid var(--brand-border)',
                  whiteSpace: 'nowrap',
                }}>
                  구축 중
                </div>
              </div>
            </>
          ) : (
            <>
              {/* Empty state */}
              <div style={{
                background: '#fff', borderRadius: 24, boxShadow: 'var(--sh-sm)',
                padding: '56px 40px', textAlign: 'center', marginBottom: 24,
                backgroundImage: 'radial-gradient(ellipse at 80% 0%, rgba(99,102,241,0.06) 0%, transparent 60%)',
              }}>
                <div style={{
                  width: 80, height: 80, borderRadius: 20,
                  background: 'var(--brand-soft)', border: '2px dashed var(--brand-border)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 36, margin: '0 auto 24px',
                }}>
                  📂
                </div>
                <h2 style={{ fontSize: 22, fontWeight: 800, color: 'var(--t1)', letterSpacing: '-0.02em', marginBottom: 10 }}>
                  아직 업로드된 자료가 없어요
                </h2>
                <p style={{ fontSize: 15, color: 'var(--t2)', lineHeight: 1.75, maxWidth: 400, margin: '0 auto 28px' }}>
                  필기·교과서·기출문제를 올리면<br />
                  AI가 출제 가능성 높은 문제를 분석해 드려요.
                </p>
                <button onClick={onUpload} className="btn-brand" style={{
                  padding: '14px 32px', fontSize: 16, borderRadius: 'var(--r-xl)',
                  display: 'inline-flex', alignItems: 'center', gap: 8,
                }}>
                  <span style={{ fontSize: 20, lineHeight: 1 }}>+</span>
                  첫 번째 자료 업로드하기
                </button>
                <p style={{ fontSize: 12, color: 'var(--t3)', marginTop: 14 }}>
                  PDF · 이미지 지원 · 무료
                </p>
              </div>

              {/* Feature cards */}
              <div>
                <h3 style={{ fontSize: 13, fontWeight: 700, color: 'var(--t3)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 14 }}>
                  업로드 후 이용 가능한 기능
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 14 }}>
                  {FEATURES.map(f => (
                    <div key={f.title} style={{
                      background: '#fff', borderRadius: 'var(--r-lg)', padding: '22px',
                      boxShadow: 'var(--sh-xs)', opacity: 0.65,
                    }}>
                      <div style={{ fontSize: 28, marginBottom: 12 }}>{f.icon}</div>
                      <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--t1)', marginBottom: 6 }}>{f.title}</div>
                      <div style={{ fontSize: 13, color: 'var(--t2)', lineHeight: 1.6 }}>{f.desc}</div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </main>
      </div>
    </div>
  )
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8, marginBottom: 8 }}>
      <span style={{ fontSize: 12, color: 'var(--t3)', fontWeight: 600, flexShrink: 0 }}>{label}</span>
      <span style={{ fontSize: 13, color: 'var(--t1)', fontWeight: 500, textAlign: 'right' }}>{value}</span>
    </div>
  )
}
