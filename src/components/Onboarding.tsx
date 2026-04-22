'use client'
import { useState, useCallback, useRef, useEffect } from 'react'
import type { UserData } from '@/lib/types'
import { PUBLISHERS, GRADES } from '@/lib/data'

interface Props { onComplete: (data: UserData) => void }
interface School { name: string; region: string; type: string; address: string }
type Screen = 'landing' | 'signup' | 'school' | 'publisher'

export default function Onboarding({ onComplete }: Props) {
  const [screen, setScreen] = useState<Screen>('landing')
  const [savedUser, setSavedUser] = useState<UserData | null>(null)

  useEffect(() => {
    const saved = localStorage.getItem('exam100_user')
    if (saved) {
      try { setSavedUser(JSON.parse(saved)) } catch { /* ignore */ }
    }
  }, [])
  const [form, setForm] = useState({ name: '', email: '', pw: '', school: '', region: '', grade: '', publishers: [] as string[] })
  const [err, setErr] = useState('')
  const [schoolQuery, setSchoolQuery] = useState('')
  const [schoolResults, setSchoolResults] = useState<School[]>([])
  const [schoolLoading, setSchoolLoading] = useState(false)
  const [showDrop, setShowDrop] = useState(false)
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const update = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }))
  const togglePub = (p: string) => setForm(f => ({
    ...f,
    publishers: f.publishers.includes(p) ? f.publishers.filter(x => x !== p) : [...f.publishers, p]
  }))

  const searchSchool = useCallback((q: string) => {
    setSchoolQuery(q)
    if (timer.current) clearTimeout(timer.current)
    if (q.length < 2) { setSchoolResults([]); setShowDrop(false); return }
    timer.current = setTimeout(async () => {
      setSchoolLoading(true)
      try {
        const res = await fetch(`/api/schools?q=${encodeURIComponent(q)}`)
        const data = await res.json()
        setSchoolResults(data)
        setShowDrop(data.length > 0)
      } catch { setSchoolResults([]) }
      finally { setSchoolLoading(false) }
    }, 350)
  }, [])

  const selectSchool = (s: School) => {
    setForm(f => ({ ...f, school: s.name, region: s.region }))
    setSchoolQuery(s.name)
    setShowDrop(false)
  }

  const submitSignup = () => {
    if (!form.name.trim()) { setErr('이름을 입력해주세요.'); return }
    if (!form.email.includes('@')) { setErr('올바른 이메일을 입력해주세요.'); return }
    if (form.pw.length < 6) { setErr('비밀번호를 6자 이상 입력해주세요.'); return }
    setErr(''); setScreen('school')
  }

  const submitSocial = (provider: string) => {
    if (savedUser) {
      onComplete(savedUser)
      return
    }
    setForm(f => ({ ...f, name: provider === 'google' ? '구글 사용자' : 'Apple 사용자', email: `user@${provider}.com` }))
    setScreen('school')
  }

  const submitSchool = () => {
    if (!form.school) { setErr('학교를 선택해주세요.'); return }
    if (!form.grade) { setErr('학년을 선택해주세요.'); return }
    setErr(''); setScreen('publisher')
  }

  const finish = () => onComplete({
    name: form.name, email: form.email, region: form.region,
    school: form.school, grade: form.grade, publishers: form.publishers
  })

  const stepIndex = screen === 'landing' ? 0 : screen === 'signup' ? 1 : screen === 'school' ? 2 : 3

  return (
    <div style={{ minHeight: '100vh', display: 'flex', background: '#FAFAFA' }}>
      {/* Left panel — brand */}
      <div style={{
        width: 420, flexShrink: 0, background: 'linear-gradient(160deg, #6366F1 0%, #8B5CF6 50%, #EC4899 100%)',
        display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
        padding: '48px 40px', position: 'relative', overflow: 'hidden',
      }} className="fade-in">
        {/* Decorative circles */}
        <div style={{ position: 'absolute', width: 300, height: 300, borderRadius: '50%', background: 'rgba(255,255,255,0.06)', top: -80, right: -80 }} />
        <div style={{ position: 'absolute', width: 200, height: 200, borderRadius: '50%', background: 'rgba(255,255,255,0.06)', bottom: 100, left: -60 }} />

        <div style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 60 }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(255,255,255,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>🎯</div>
            <span style={{ fontFamily: 'var(--mono)', fontSize: 18, fontWeight: 700, color: '#fff', letterSpacing: '0.02em' }}>EXAM 100</span>
          </div>

          <div style={{ color: '#fff' }}>
            <div style={{ fontSize: 32, fontWeight: 800, lineHeight: 1.2, marginBottom: 16, letterSpacing: '-0.03em' }}>
              시험 100점을<br />목표로 하세요
            </div>
            <div style={{ fontSize: 15, color: 'rgba(255,255,255,0.75)', lineHeight: 1.7 }}>
              AI가 내 학교 자료를 분석해<br />출제 가능성 높은 문제만 알려드려요.
            </div>
          </div>
        </div>

        {/* Feature list */}
        <div style={{ position: 'relative', zIndex: 1 }}>
          {[
            { icon: '📊', text: '출제 확률 % 분석' },
            { icon: '🗺️', text: '개념 지도 시각화' },
            { icon: '🎯', text: '30문항 맞춤 예상 문제' },
            { icon: '🏫', text: '학교별 공유 데이터베이스' },
          ].map(f => (
            <div key={f.text} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
              <div style={{ width: 28, height: 28, borderRadius: 8, background: 'rgba(255,255,255,0.18)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, flexShrink: 0 }}>{f.icon}</div>
              <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.85)', fontWeight: 500 }}>{f.text}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Right panel — form */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '48px 32px', overflowY: 'auto' }}>
        <div style={{ width: '100%', maxWidth: 400 }}>

          {/* Step pills (when past landing) */}
          {screen !== 'landing' && (
            <div style={{ display: 'flex', gap: 6, marginBottom: 36 }} className="fade-in">
              {['계정', '학교', '출판사'].map((label, i) => {
                const idx = i + 1
                const done = idx < stepIndex
                const active = idx === stepIndex
                return (
                  <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <div style={{
                      padding: '4px 12px', borderRadius: 99, fontSize: 12, fontWeight: 600,
                      background: done ? 'var(--green-soft)' : active ? 'var(--brand-soft)' : 'var(--bg3)',
                      color: done ? 'var(--green-text)' : active ? 'var(--brand-text)' : 'var(--t3)',
                      border: `1.5px solid ${done ? '#A7F3D0' : active ? 'var(--brand-border)' : 'var(--bd)'}`,
                    }}>
                      {done ? '✓ ' : ''}{label}
                    </div>
                    {i < 2 && <div style={{ width: 20, height: 1, background: 'var(--bd2)' }} />}
                  </div>
                )
              })}
            </div>
          )}

          {/* ── LANDING ── */}
          {screen === 'landing' && (
            <div className="fade-in">
              <h1 style={{ fontSize: 30, fontWeight: 800, color: 'var(--t1)', letterSpacing: '-0.03em', marginBottom: 8 }}>
                시작하기
              </h1>
              <p style={{ fontSize: 15, color: 'var(--t2)', marginBottom: 32 }}>
                계정을 만들어 학습 기록을 저장하세요.
              </p>

              {savedUser && (
                <div style={{ marginBottom: 16, padding: '14px 16px', background: 'var(--brand-soft)', border: '1.5px solid var(--brand-border)', borderRadius: 'var(--r-lg)', cursor: 'pointer' }}
                  onClick={() => onComplete(savedUser)}>
                  <div style={{ fontSize: 12, color: 'var(--brand-text)', fontWeight: 600, marginBottom: 4 }}>이전에 로그인한 계정</div>
                  <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--t1)' }}>{savedUser.name}</div>
                  <div style={{ fontSize: 13, color: 'var(--t2)' }}>{savedUser.school} · {savedUser.grade}</div>
                </div>
              )}
              <SocialBtn icon="G" label={savedUser ? `${savedUser.name}으로 계속하기` : 'Google로 계속하기'} bg="#fff" border="#DADCE0" color="#3C4043" onClick={() => submitSocial('google')} />
              <SocialBtn icon="🍎" label="Apple로 계속하기" bg="#000" border="#000" color="#fff" onClick={() => submitSocial('apple')} style={{ marginTop: 10 }} />

              <Divider />

              <button onClick={() => setScreen('signup')} className="btn-outline" style={{ width: '100%', padding: '13px', fontSize: 15, fontWeight: 600, borderRadius: 'var(--r-lg)' }}>
                이메일로 가입하기
              </button>

              <p style={{ marginTop: 24, fontSize: 13, color: 'var(--t3)', textAlign: 'center' }}>
                이미 계정이 있으신가요?{' '}
                <span style={{ color: 'var(--brand)', fontWeight: 600, cursor: 'pointer' }} onClick={() => setScreen('signup')}>
                  로그인
                </span>
              </p>
            </div>
          )}

          {/* ── SIGNUP ── */}
          {screen === 'signup' && (
            <div className="slide-up">
              <button onClick={() => setScreen('landing')} className="btn-ghost" style={{ fontSize: 13, marginBottom: 24, display: 'flex', alignItems: 'center', gap: 4 }}>
                ← 뒤로
              </button>
              <h1 style={{ fontSize: 26, fontWeight: 800, color: 'var(--t1)', letterSpacing: '-0.03em', marginBottom: 6 }}>이메일로 가입</h1>
              <p style={{ fontSize: 14, color: 'var(--t2)', marginBottom: 28 }}>학습 기록이 안전하게 저장됩니다.</p>

              <FLabel>이름</FLabel>
              <input className="input-base" placeholder="홍길동" value={form.name} onChange={e => update('name', e.target.value)} />
              <FLabel>이메일</FLabel>
              <input className="input-base" type="email" placeholder="name@school.kr" value={form.email} onChange={e => update('email', e.target.value)} />
              <FLabel>비밀번호</FLabel>
              <input className="input-base" type="password" placeholder="6자 이상" value={form.pw} onChange={e => update('pw', e.target.value)} />

              {err && <ErrMsg>{err}</ErrMsg>}
              <button onClick={submitSignup} className="btn-brand" style={{ width: '100%', padding: '14px', fontSize: 15, borderRadius: 'var(--r-lg)', marginTop: 24 }}>
                다음 →
              </button>
            </div>
          )}

          {/* ── SCHOOL ── */}
          {screen === 'school' && (
            <div className="slide-up">
              <h1 style={{ fontSize: 26, fontWeight: 800, color: 'var(--t1)', letterSpacing: '-0.03em', marginBottom: 6 }}>내 학교</h1>
              <p style={{ fontSize: 14, color: 'var(--t2)', marginBottom: 28 }}>학교와 학년을 선택하면 맞춤 분석이 시작돼요.</p>

              <FLabel>학교 검색</FLabel>
              <div style={{ position: 'relative', marginBottom: 4 }}>
                <input
                  className="input-base"
                  placeholder="학교 이름 (2글자 이상)"
                  value={schoolQuery}
                  onChange={e => searchSchool(e.target.value)}
                  onFocus={() => schoolResults.length > 0 && setShowDrop(true)}
                  autoComplete="off"
                />
                {schoolLoading && (
                  <span className="spin-anim" style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', fontSize: 16, color: 'var(--brand)' }}>⟳</span>
                )}
                {showDrop && schoolResults.length > 0 && (
                  <div style={{
                    position: 'absolute', top: 'calc(100% + 6px)', left: 0, right: 0,
                    background: '#fff', borderRadius: 'var(--r-lg)', boxShadow: 'var(--sh-lg)',
                    zIndex: 200, maxHeight: 240, overflowY: 'auto', border: '1px solid var(--bd)',
                  }} className="slide-down">
                    {schoolResults.map((s, i) => (
                      <div key={i} onClick={() => selectSchool(s)} style={{
                        padding: '12px 16px', cursor: 'pointer', borderBottom: i < schoolResults.length - 1 ? '1px solid var(--bd)' : 'none',
                      }}
                        onMouseEnter={e => (e.currentTarget.style.background = 'var(--bg2)')}
                        onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
                        <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--t1)' }}>{s.name}</div>
                        <div style={{ fontSize: 12, color: 'var(--t3)', marginTop: 2 }}>{s.region} · {s.type}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {form.school && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 14px', background: 'var(--brand-soft)', borderRadius: 'var(--r)', marginBottom: 4, border: '1px solid var(--brand-border)' }}>
                  <span style={{ fontSize: 15 }}>🏫</span>
                  <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--brand-text)' }}>{form.school}</span>
                  <span style={{ fontSize: 12, color: 'var(--t2)', marginLeft: 'auto' }}>{form.region}</span>
                </div>
              )}

              <FLabel>학년</FLabel>
              <select className="input-base" value={form.grade} onChange={e => update('grade', e.target.value)} style={{ cursor: 'pointer' }}>
                <option value="">선택하세요</option>
                {GRADES.map(g => <option key={g}>{g}</option>)}
              </select>

              {err && <ErrMsg>{err}</ErrMsg>}
              <div style={{ display: 'flex', gap: 10, marginTop: 24 }}>
                <button onClick={() => setScreen('signup')} className="btn-outline" style={{ padding: '13px 20px', fontSize: 14, borderRadius: 'var(--r-lg)' }}>← 이전</button>
                <button onClick={submitSchool} className="btn-brand" style={{ flex: 1, padding: '14px', fontSize: 15, borderRadius: 'var(--r-lg)' }}>다음 →</button>
              </div>
            </div>
          )}

          {/* ── PUBLISHER ── */}
          {screen === 'publisher' && (
            <div className="slide-up">
              <h1 style={{ fontSize: 26, fontWeight: 800, color: 'var(--t1)', letterSpacing: '-0.03em', marginBottom: 6 }}>교과서 출판사</h1>
              <p style={{ fontSize: 14, color: 'var(--t2)', marginBottom: 28 }}>사용하는 교과서 출판사를 선택하세요. (복수 선택 가능)</p>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 20 }}>
                {PUBLISHERS.map(p => {
                  const on = form.publishers.includes(p)
                  return (
                    <button key={p} onClick={() => togglePub(p)} style={{
                      padding: '14px 12px', borderRadius: 'var(--r-lg)', fontSize: 14, cursor: 'pointer',
                      textAlign: 'center', transition: 'all 0.15s', fontFamily: 'inherit',
                      fontWeight: on ? 700 : 500,
                      background: on ? 'var(--brand-soft)' : '#fff',
                      border: `1.5px solid ${on ? 'var(--brand)' : 'var(--bd)'}`,
                      color: on ? 'var(--brand-text)' : 'var(--t2)',
                      boxShadow: on ? '0 0 0 3px rgba(99,102,241,0.1)' : 'none',
                    }}>
                      {on && <span style={{ marginRight: 4 }}>✓</span>}{p}
                    </button>
                  )
                })}
              </div>

              <div style={{ background: 'var(--brand-soft)', border: '1px solid var(--brand-border)', borderRadius: 'var(--r-lg)', padding: '14px 16px', fontSize: 13, color: 'var(--brand-text)', lineHeight: 1.7, marginBottom: 24 }}>
                💡 같은 학교 학생들의 업로드 자료로 학교 전용 데이터베이스가 구축됩니다.
              </div>

              <div style={{ display: 'flex', gap: 10 }}>
                <button onClick={() => setScreen('school')} className="btn-outline" style={{ padding: '13px 20px', fontSize: 14, borderRadius: 'var(--r-lg)' }}>← 이전</button>
                <button onClick={finish} className="btn-brand" style={{ flex: 1, padding: '14px', fontSize: 15, borderRadius: 'var(--r-lg)' }}>
                  시작하기 🚀
                </button>
              </div>
            </div>
          )}

          <p style={{ fontSize: 12, color: 'var(--t3)', textAlign: 'center', marginTop: 28 }}>
            계속 진행하면{' '}
            <span style={{ color: 'var(--brand)', cursor: 'pointer' }}>이용약관</span>
            {' '}및{' '}
            <span style={{ color: 'var(--brand)', cursor: 'pointer' }}>개인정보처리방침</span>에 동의합니다.
          </p>
        </div>
      </div>
    </div>
  )
}

function FLabel({ children }: { children: React.ReactNode }) {
  return <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--t2)', marginBottom: 7, marginTop: 16 }}>{children}</div>
}

function ErrMsg({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ marginTop: 12, padding: '10px 14px', background: 'var(--red-soft)', borderRadius: 'var(--r)', fontSize: 13, color: 'var(--red-text)', border: '1px solid #FECACA' }}>
      ⚠ {children}
    </div>
  )
}

function Divider() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '20px 0' }}>
      <div style={{ flex: 1, height: 1, background: 'var(--bd)' }} />
      <span style={{ fontSize: 12, color: 'var(--t3)' }}>또는</span>
      <div style={{ flex: 1, height: 1, background: 'var(--bd)' }} />
    </div>
  )
}

function SocialBtn({ icon, label, bg, border, color, onClick, style }: {
  icon: string; label: string; bg: string; border: string; color: string
  onClick: () => void; style?: React.CSSProperties
}) {
  return (
    <button onClick={onClick} style={{
      width: '100%', padding: '13px 16px', borderRadius: 'var(--r-lg)',
      border: `1.5px solid ${border}`, background: bg, color, fontSize: 15,
      fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit',
      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
      transition: 'all 0.15s', ...style,
    }}
      onMouseEnter={e => { e.currentTarget.style.boxShadow = 'var(--sh-sm)'; e.currentTarget.style.transform = 'translateY(-1px)' }}
      onMouseLeave={e => { e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.transform = 'none' }}>
      <span style={{ fontSize: 18, lineHeight: 1, fontWeight: 900 }}>{icon}</span>
      {label}
    </button>
  )
}
