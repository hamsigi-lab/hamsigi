export type AppView = 'onboard' | 'home' | 'upload' | 'study'
export type StudyStep = 1 | 2 | 3 | 4 | 5

export interface UserData {
  name: string
  email: string
  region: string
  school: string
  grade: string
  publishers: string[]
}

export interface Subject {
  id: string
  icon: string
  name: string
  cnt: number
  locked: boolean
}

export interface ProbItem {
  pct: number
  title: string
  type: '서술형' | '서답형' | '객관식'
  src: string
  color: string
  keys: string[]
  desc: string
  cid: string
  web?: boolean
}

export interface CQItem {
  cid: string
  pct: number
  src: string
  type: 'ox' | 'blank' | 'calc'
  text: string
  ans?: string
  blanks?: string[]
  ok?: string
  ng?: string
  sim?: string
  exp?: string
}

export interface QuizItem {
  type: 'obj' | 'short' | 'essay'
  num: number
  pct: number
  diff: 'easy' | 'medium' | 'hard' | 'exam'
  src: string
  cid: string
  text: string
  choices?: string[]
  ans?: number | string
  exp?: string
  sim?: string
  rubric?: string
  modelAns?: string
}
