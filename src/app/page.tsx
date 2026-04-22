'use client'
import { useState, useEffect } from 'react'
import type { AppView, UserData } from '@/lib/types'
import Onboarding from '@/components/Onboarding'
import Home from '@/components/Home'
import Upload from '@/components/Upload'
import Study from '@/components/Study'

export default function App() {
  const [view, setView] = useState<AppView>('onboard')
  const [userData, setUserData] = useState<UserData | null>(null)
  const [subject, setSubject] = useState('science')
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([])

  useEffect(() => {
    const saved = localStorage.getItem('exam100_user')
    if (saved) {
      try {
        const data = JSON.parse(saved) as UserData
        setUserData(data)
        setView('home')
      } catch {
        localStorage.removeItem('exam100_user')
      }
    }
  }, [])

  const onboardComplete = (data: UserData) => {
    localStorage.setItem('exam100_user', JSON.stringify(data))
    setUserData(data)
    setView('home')
  }

  const startStudy = (subj: string) => {
    setSubject(subj)
    setUploadedFiles([])
    setView('study')
  }

  const analyzeUpload = (subj: string, files: File[]) => {
    setSubject(subj)
    setUploadedFiles(files)
    setView('study')
  }

  const logout = () => {
    localStorage.removeItem('exam100_user')
    setUserData(null)
    setView('onboard')
  }

  return (
    <main style={{ minHeight: '100vh', background: 'var(--bg)' }}>
      {view === 'onboard' && <Onboarding onComplete={onboardComplete} />}
      {view === 'home' && userData && (
        <Home userData={userData} onStudy={startStudy} onUpload={() => setView('upload')} onLogout={logout} />
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
