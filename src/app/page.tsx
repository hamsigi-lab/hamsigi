'use client'
import { useState } from 'react'
import type { AppView, UserData } from '@/lib/types'
import Onboarding from '@/components/Onboarding'
import Home from '@/components/Home'
import Upload from '@/components/Upload'
import Study from '@/components/Study'

export default function App() {
  const [view, setView] = useState<AppView>('onboard')
  const [userData, setUserData] = useState<UserData | null>(null)
  const [subject, setSubject] = useState('science')

  const onboardComplete = (data: UserData) => {
    setUserData(data)
    setView('home')
  }

  const startStudy = (subj: string) => {
    setSubject(subj)
    setView('study')
  }

  const analyzeUpload = (subj: string) => {
    setSubject(subj)
    setView('study')
  }

  return (
    <main style={{ minHeight: '100vh', background: 'var(--bg)' }}>
      {view === 'onboard' && <Onboarding onComplete={onboardComplete} />}
      {view === 'home' && userData && (
        <Home userData={userData} onStudy={startStudy} onUpload={() => setView('upload')} />
      )}
      {view === 'upload' && (
        <Upload onAnalyze={analyzeUpload} onBack={() => setView('home')} />
      )}
      {view === 'study' && userData && (
        <Study subject={subject} userData={userData} onHome={() => setView('home')} />
      )}
    </main>
  )
}
