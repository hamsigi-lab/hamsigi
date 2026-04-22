'use client'
import { useState, useEffect } from 'react'
import { useSession, signOut } from 'next-auth/react'
import type { AppView, UserData } from '@/lib/types'
import Onboarding from '@/components/Onboarding'
import Home from '@/components/Home'
import Upload from '@/components/Upload'
import Study from '@/components/Study'

export default function App() {
  const { data: session, status } = useSession()
  const [view, setView] = useState<AppView>('onboard')
  const [userData, setUserData] = useState<UserData | null>(null)
  const [subject, setSubject] = useState('science')
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([])
  const [loggingOut, setLoggingOut] = useState(false)

  useEffect(() => {
    if (status === 'loading') return

    if (status === 'authenticated' && session?.user?.email) {
      const key = `exam100_school_${session.user.email}`
      const saved = localStorage.getItem(key)
      if (saved) {
        try {
          const schoolData = JSON.parse(saved)
          setUserData({ name: session.user.name || '', email: session.user.email, ...schoolData })
          setView('home')
        } catch {
          localStorage.removeItem(key)
        }
      }
      // 학교 정보 없으면 view='onboard' 유지 (학교 입력 단계)
    } else if (status === 'unauthenticated') {
      // 이메일 가입 사용자 체크
      const saved = localStorage.getItem('exam100_user')
      if (saved) {
        try {
          setUserData(JSON.parse(saved))
          setView('home')
        } catch {
          localStorage.removeItem('exam100_user')
        }
      }
      // 아무것도 없으면 view='onboard' 유지 (로그인 화면)
    }
  }, [status, session])

  const onboardComplete = (data: UserData) => {
    if (session?.user?.email) {
      const { name: _n, email: _e, ...schoolData } = data
      localStorage.setItem(`exam100_school_${session.user.email}`, JSON.stringify(schoolData))
    } else {
      localStorage.setItem('exam100_user', JSON.stringify(data))
    }
    setUserData(data)
    setView('home')
  }

  const logout = async () => {
    setLoggingOut(true)
    localStorage.removeItem('exam100_user')
    setUserData(null)
    setView('onboard')
    if (session?.user?.email) {
      await signOut({ redirect: false })
    }
    setLoggingOut(false)
  }

  const googleUser = (!loggingOut && session?.user) ? {
    name: session.user.name || '',
    email: session.user.email || '',
    image: session.user.image || '',
  } : null

  return (
    <main style={{ minHeight: '100vh', background: 'var(--bg)' }}>
      {view === 'onboard' && (
        <Onboarding onComplete={onboardComplete} googleUser={status === 'loading' ? null : googleUser} />
      )}
      {view === 'home' && userData && (
        <Home userData={userData} onStudy={s => { setSubject(s); setView('study') }} onUpload={() => setView('upload')} onLogout={logout} />
      )}
      {view === 'upload' && (
        <Upload onAnalyze={(subj, files) => { setSubject(subj); setUploadedFiles(files); setView('study') }} onBack={() => setView('home')} />
      )}
      {view === 'study' && userData && (
        <Study subject={subject} userData={userData} files={uploadedFiles} onHome={() => setView('home')} />
      )}
    </main>
  )
}
