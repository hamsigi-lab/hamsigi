'use client'
import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import type { AppView, UserData } from '@/lib/types'
import Onboarding from '@/components/Onboarding'
import Home from '@/components/Home'
import Upload from '@/components/Upload'
import Study from '@/components/Study'

function schoolKey(email: string) {
  return `exam100_school_${email}`
}

export default function App() {
  const { data: session, status } = useSession()
  const [view, setView] = useState<AppView>('onboard')
  const [userData, setUserData] = useState<UserData | null>(null)
  const [subject, setSubject] = useState('science')
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([])

  useEffect(() => {
    if (status === 'loading') return

    if (session?.user?.email) {
      // Google로 로그인됨 — 학교 정보 로드
      const saved = localStorage.getItem(schoolKey(session.user.email))
      if (saved) {
        try {
          const schoolData = JSON.parse(saved)
          setUserData({
            name: session.user.name || '',
            email: session.user.email,
            ...schoolData,
          })
          setView('home')
          return
        } catch { /* ignore */ }
      }
      // Google 로그인은 됐지만 학교 정보 없음 → 온보딩 school 단계
      setView('onboard')
    } else {
      // 이메일 로그인 체크 (Google 아닌 경우)
      const saved = localStorage.getItem('exam100_user')
      if (saved) {
        try {
          setUserData(JSON.parse(saved))
          setView('home')
          return
        } catch { /* ignore */ }
      }
      setView('onboard')
    }
  }, [session, status])

  const onboardComplete = (data: UserData) => {
    if (session?.user?.email) {
      // Google 로그인 사용자 → 학교 정보만 localStorage에 저장
      const { name: _n, email: _e, ...schoolData } = data
      localStorage.setItem(schoolKey(session.user.email), JSON.stringify(schoolData))
    } else {
      localStorage.setItem('exam100_user', JSON.stringify(data))
    }
    setUserData(data)
    setView('home')
  }

  const logout = () => {
    if (userData?.email) {
      localStorage.removeItem(schoolKey(userData.email))
    }
    localStorage.removeItem('exam100_user')
    setUserData(null)
    setView('onboard')
  }

  const analyzeUpload = (subj: string, files: File[]) => {
    setSubject(subj)
    setUploadedFiles(files)
    setView('study')
  }

  if (status === 'loading') {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg2)' }}>
        <span className="spin-anim" style={{ fontSize: 32, color: 'var(--brand)' }}>⟳</span>
      </div>
    )
  }

  return (
    <main style={{ minHeight: '100vh', background: 'var(--bg)' }}>
      {view === 'onboard' && (
        <Onboarding
          onComplete={onboardComplete}
          googleUser={session?.user ? { name: session.user.name || '', email: session.user.email || '', image: session.user.image || '' } : null}
        />
      )}
      {view === 'home' && userData && (
        <Home userData={userData} onStudy={s => { setSubject(s); setView('study') }} onUpload={() => setView('upload')} onLogout={logout} />
      )}
      {view === 'upload' && (
        <Upload onAnalyze={analyzeUpload} onBack={() => setView('home')} />
      )}
      {view === 'study' && userData && (
        <Study subject={subject} userData={userData} files={uploadedFiles} onHome={() => setView('home')} />
      )}
    </main>
  )
}
