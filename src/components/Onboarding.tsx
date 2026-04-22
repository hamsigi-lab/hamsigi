'use client'
import { useState, useEffect, useCallback, useRef } from 'react'
import { signIn } from 'next-auth/react'
import type { UserData } from '@/lib/types'
import { PUBLISHERS, GRADES } from '@/lib/data'

interface Props {
  onComplete: (data: UserData) => void
  googleUser: { name: string; email: string; image: string } | null
}
interface School { name: string; region: string; type: string; address: string }
type Screen = 'landing' | 'login' | 'signup' | 'school' | 'publisher'

export default function Onboarding({ onComplete, googleUser }: Props) {
  // Google 로그인은 됐지만 학교 정보 없으면 바로 school 화면으로
  const [screen, setScreen] = useState<Screen>('landing')
  const [form, setForm] = useState({
    name: '', email: '', pw: '', school: '', region: '', grade: '', publishers: [] as string[]
  })

  useEffect(() => {
    if (googleUser?.email) {
      setForm(f => ({ ...f, name: googleUser.name, email: googleUser.email }))
      setScreen('school')
    }
  }, [googleUser?.email])
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

  const submitLogin = () => {
    if (!form.email.includes('@')) { setErr('올바른 이메일을 입력해주세요.'); return }
    if (!form.pw) { setErr('비밀번호를 입력해주세요.'); return }
    const saved = localStorage.getItem('exam100_user')
    if (saved) {
      try {
        const user = JSON.parse(saved) as UserData
        if (user.email === form.email) { onComplete(user); return }
      } catch { /* ignore */ }
    }
    setErr('계정을 찾을 수 없어요. 회원가입을 해주세요.')
  }

  const submitSignup = () => {
    if (!form.name.trim()) { setErr('이름을 입력해주세요.'); return }
    if (!form.email.includes('@')) { setErr('올바른 이메일을 입력해주세요.'); return }
    if (form.pw.length < 6) { setErr('비밀번호를 6자 이상 입력해주세요.'); return }
    setErr(''); setScreen('school')
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

  const stepIndex = screen === 'signup' ? 1 : screen === 'school' ? 2 : screen === 'publisher' ? 3 : 0
  const showSteps = ['signup', 'school', 'publisher'].includes(screen) && !googleUser

  return (
    <div style={{ minHeight: '100vh', display: 'flex', background: '#FAFAFA' }}>
      {/* Left panel */}
      <div style={{
        width: 420, flexShrink: 0,
        background: 'linear-gradient(160deg, #6366F1 0%, #8B5CF6 50%, #EC4899 100%)',
        display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
        padding: '48px 40px', position: 'relative', overflow: 'hidden',
      }} className="fade-in">
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

      {/* Right panel */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '48px 32px', overflowY: 'auto' }}>
        <div style={{ width: '100%', maxWidth: 400 }}>

          {/* Step pills (회원가입 중에만) */}
          {showSteps && (
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

          {/* Google 사용자 학교 설정 배너 */}
          {googleUser && ['school', 'publisher'].includes(screen) && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 16px', background: 'var(--green-soft)', border: '1px solid #A7F3D0', borderRadius: 'var(--r-lg)', marginBottom: 28 }}>
              {googleUser.image && <img src={googleUser.image} alt="" style={{ width: 32, height: 32, borderRadius: '50%' }} />}
              <div>
                <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--t1)' }}>{googleUser.name}</div>
                <div style={{ fontSize: 12, color: 'var(--t3)' }}>Google 계정으로 로그인됨</div>
              </div>
            </div>
          )}

          {/* ── LANDING ── */}
          {screen === 'landing' && (
            <div className="fade-in">
              <h1 style={{ fontSize: 30, fontWeight: 800, color: 'var(--t1)', letterSpacing: '-0.03em', marginBottom: 8 }}>시작하기</h1>
              <p style={{ fontSize: 15, color: 'var(--t2)', marginBottom: 32 }}>AI 시험 대비를 시작해 보세요.</p>

              <button
                onClick={() => signIn('google', { callbackUrl: '/' })}
                style={{
                  width: '100%', padding: '13px 16px', borderRadius: 'var(--r-lg)',
                  border: '1.5px solid #DADCE0', background: '#fff', color: '#3C4043',
                  fontSize: 15, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
                  transition: 'all 0.15s',
                }}
                onMouseEnter={e => { e.currentTarget.style.boxShadow = 'var(--sh-sm)'; e.currentTarget.style.transform = 'translateY(-1px)' }}
                onMouseLeave={e => { e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.transform = 'none' }}
              >
                <GoogleIcon />
                Google로 계속하기
              </button>

              <Divider />

              <button onClick={() => { setErr(''); setScreen('login') }} className="btn-brand" style={{ width: '100%', padding: '13px', fontSize: 15, fontWeight: 600, borderRadius: 'var(--r-lg)', marginBottom: 10 }}>
                이메일로 로그인
              </button>
              <button onClick={() => { setErr(''); setScreen('signup') }} className="btn-outline" style={{ width: '100%', padding: '13px', fontSize: 15, fontWeight: 600, borderRadius: 'var(--r-lg)' }}>
                회원가입 (처음 이용)
              </button>
            </div>
          )}

          {/* ── LOGIN ── */}
          {screen === 'login' && (
            <div className="slide-up">
              <button onClick={() => { setErr(''); setScreen('landing') }} className="btn-ghost" style={{ fontSize: 13, marginBottom: 24, display: 'flex', alignItems: 'center', gap: 4 }}>← 뒤로</button>
              <h1 style={{ fontSize: 26, fontWeight: 800, color: 'var(--t1)', letterSpacing: '-0.03em', marginBottom: 6 }}>로그인</h1>
              <p style={{ fontSize: 14, color: 'var(--t2)', marginBottom: 28 }}>이전에 가입한 계정으로 로그인하세요.</p>

              <button
                onClick={() => signIn('google', { callbackUrl: '/' })}
                style={{
                  width: '100%', padding: '13px 16px', borderRadius: 'var(--r-lg)',
                  border: '1.5px solid #DADCE0', background: '#fff', color: '#3C4043',
                  fontSize: 15, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
                  transition: 'all 0.15s', marginBottom: 4,
                }}
                onMouseEnter={e => { e.currentTarget.style.boxShadow = 'var(--sh-sm)'; e.currentTarget.style.transform = 'translateY(-1px)' }}
                onMouseLeave={e => { e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.transform = 'none' }}
              >
                <GoogleIcon />
                Google로 로그인
              </button>

              <Divider />

              <FLabel>이메일</FLabel>
              <input className="input-base" type="email" placeholder="가입한 이메일 주소" value={form.email} onChange={e => update('email', e.target.value)} />
              <FLabel>비밀번호</FLabel>
              <input className="input-base" type="password" placeholder="비밀번호" value={form.pw} onChange={e => update('pw', e.target.value)}
                onKeyDown={e => e.key === 'Enter' && submitLogin()} />

              {err && <ErrMsg>{err}</ErrMsg>}
              <button onClick={submitLogin} className="btn-brand" style={{ width: '100%', padding: '14px', fontSize: 15, borderRadius: 'var(--r-lg)', marginTop: 24 }}>
                로그인 →
              </button>
              <p style={{ marginTop: 16, fontSize: 13, color: 'var(--t3)', textAlign: 'center' }}>
                계정이 없으신가요?{' '}
                <span style={{ color: 'var(--brand)', fontWeight: 600, cursor: 'pointer' }} onClick={() => { setErr(''); setScreen('signup') }}>회원가입</span>
              </p>
            </div>
          )}

          {/* ── SIGNUP ── */}
          {screen === 'signup' && (
            <div className="slide-up">
              <button onClick={() => { setErr(''); setScreen('landing') }} className="btn-ghost" style={{ fontSize: 13, marginBottom: 24, display: 'flex', alignItems: 'center', gap: 4 }}>← 뒤로</button>
              <h1 style={{ fontSize: 26, fontWeight: 800, color: 'var(--t1)', letterSpacing: '-0.03em', marginBottom: 6 }}>회원가입</h1>
              <p style={{ fontSize: 14, color: 'var(--t2)', marginBottom: 24 }}>처음 이용하시면 학교 정보를 한 번만 입력하면 돼요.</p>

              <button
                onClick={() => signIn('google', { callbackUrl: '/' })}
                style={{
                  width: '100%', padding: '13px 16px', borderRadius: 'var(--r-lg)',
                  border: '1.5px solid #DADCE0', background: '#fff', color: '#3C4043',
                  fontSize: 15, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
                  transition: 'all 0.15s', marginBottom: 4,
                }}
                onMouseEnter={e => { e.currentTarget.style.boxShadow = 'var(--sh-sm)'; e.currentTarget.style.transform = 'translateY(-1px)' }}
                onMouseLeave={e => { e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.transform = 'none' }}
              >
                <GoogleIcon />
                Google로 회원가입
              </button>

              <Divider />

              <FLabel>이름</FLabel>
              <input className="input-base" placeholder="홍길동" value={form.name} onChange={e => update('name', e.target.value)} />
              <FLabel>이메일</FLabel>
              <input className="input-base" type="email" placeholder="name@school.kr" value={form.email} onChange={e => update('email', e.target.value)} />
              <FLabel>비밀번호</FLabel>
              <input className="input-base" type="password" placeholder="6자 이상" value={form.pw} onChange={e => update('pw', e.target.value)} />

              {err && <ErrMsg>{err}</ErrMsg>}
              <button onClick={submitSignup} className="btn-brand" style={{ width: '100%', padding: '14px', fontSize: 15, borderRadius: 'var(--r-lg)', marginTop: 24 }}>다음 →</button>
              <p style={{ marginTop: 16, fontSize: 13, color: 'var(--t3)', textAlign: 'center' }}>
                이미 계정이 있으신가요?{' '}
                <span style={{ color: 'var(--brand)', fontWeight: 600, cursor: 'pointer' }} onClick={() => { setErr(''); setScreen('login') }}>로그인</span>
              </p>
            </div>
          )}

          {/* ── SCHOOL ── */}
          {screen === 'school' && (
            <div className="slide-up">
              <h1 style={{ fontSize: 26, fontWeight: 800, color: 'var(--t1)', letterSpacing: '-0.03em', marginBottom: 6 }}>내 학교</h1>
              <p style={{ fontSize: 14, color: 'var(--t2)', marginBottom: 28 }}>학교와 학년을 선택하면 맞춤 분석이 시작돼요.</p>

              <FLabel>학교 검색</FLabel>
              <div style={{ position: 'relative', marginBottom: 4 }}>
                <input className="input-base" placeholder="학교 이름 (2글자 이상)" value={schoolQuery}
                  onChange={e => searchSchool(e.target.value)}
                  onFocus={() => schoolResults.length > 0 && setShowDrop(true)} autoComplete="off" />
                {schoolLoading && <span className="spin-anim" style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', fontSize: 16, color: 'var(--brand)' }}>⟳</span>}
                {showDrop && schoolResults.length > 0 && (
                  <div style={{ position: 'absolute', top: 'calc(100% + 6px)', left: 0, right: 0, background: '#fff', borderRadius: 'var(--r-lg)', boxShadow: 'var(--sh-lg)', zIndex: 200, maxHeight: 240, overflowY: 'auto', border: '1px solid var(--bd)' }} className="slide-down">
                    {schoolResults.map((s, i) => (
                      <div key={i} onClick={() => selectSchool(s)} style={{ padding: '12px 16px', cursor: 'pointer', borderBottom: i < schoolResults.length - 1 ? '1px solid var(--bd)' : 'none' }}
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
                {!googleUser && <button onClick={() => { setErr(''); setScreen('signup') }} className="btn-outline" style={{ padding: '13px 20px', fontSize: 14, borderRadius: 'var(--r-lg)' }}>← 이전</button>}
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
                      textAlign: 'center', transition: 'all 0.15s', fontFamily: 'inherit', fontWeight: on ? 700 : 500,
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
                <button onClick={finish} className="btn-brand" style={{ flex: 1, padding: '14px', fontSize: 15, borderRadius: 'var(--r-lg)' }}>시작하기 🚀</button>
              </div>
            </div>
          )}

          <p style={{ fontSize: 12, color: 'var(--t3)', textAlign: 'center', marginTop: 28 }}>
            계속 진행하면{' '}
            <span style={{ color: 'var(--brand)', cursor: 'pointer' }}>이용약관</span>{' '}및{' '}
            <span style={{ color: 'var(--brand)', cursor: 'pointer' }}>개인정보처리방침</span>에 동의합니다.
          </p>
        </div>
      </div>
    </div>
  )
}

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
      <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4"/>
      <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z" fill="#34A853"/>
      <path d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05"/>
      <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z" fill="#EA4335"/>
    </svg>
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
