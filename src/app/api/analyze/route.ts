import Anthropic from '@anthropic-ai/sdk'
import { NextRequest, NextResponse } from 'next/server'

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

const SUBJECT_NAMES: Record<string, string> = {
  science: '과학', social: '사회', history: '역사', math: '수학',
  korean: '국어', english: '영어', moral: '도덕/윤리', tech: '기술·가정',
}

const COLORS = ['#ef4444', '#f59e0b', '#6366F1', '#8B5CF6', '#EC4899', '#10B981', '#3B82F6', '#14B8A6']

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()
    const subject = formData.get('subject') as string
    const files = formData.getAll('files') as File[]
    const subjectName = SUBJECT_NAMES[subject] || subject

    const content: Anthropic.MessageParam['content'] = []

    const prompt = `당신은 한국 중고등학교 ${subjectName} 시험 출제 패턴 분석 전문가입니다.
${files.length > 0 ? '업로드된 학습 자료를 분석하여' : `${subjectName} 과목의 일반적인 출제 경향을 바탕으로`} 시험 예상 문제를 예측해 주세요.

반드시 아래 JSON 형식으로만 답변하세요 (다른 텍스트 없이, 마크다운 코드블록 없이):
{
  "topics": [
    {
      "title": "출제 예상 주제 (간결하게 15자 이내)",
      "pct": 87,
      "type": "서술형",
      "keys": ["핵심키워드1", "핵심키워드2", "핵심키워드3"],
      "desc": "이 주제가 출제될 가능성이 높은 이유와 핵심 내용 (2-3문장)",
      "src": "출처 (예: 교과서 p.26~29 · 학습지)"
    }
  ],
  "summary": "전체 자료 분석 요약 (2-3문장)"
}

규칙:
- topics는 6~8개 생성
- pct는 60~97 사이 정수 (내림차순 정렬)
- type은 반드시 "서술형", "서답형", "객관식" 중 하나
- 자료 없으면 ${subjectName} 시험의 일반 출제 경향 기준으로 생성`

    content.push({ type: 'text', text: prompt })

    // 이미지/PDF 파일 첨부
    for (const file of files) {
      try {
        if (file.size > 4 * 1024 * 1024) continue // 4MB 초과 건너뜀

        if (file.type.startsWith('image/')) {
          const buffer = await file.arrayBuffer()
          const base64 = Buffer.from(buffer).toString('base64')
          const mediaType = (file.type === 'image/png' ? 'image/png' : 'image/jpeg') as 'image/jpeg' | 'image/png'
          content.push({ type: 'image', source: { type: 'base64', media_type: mediaType, data: base64 } })
        } else if (file.type === 'application/pdf') {
          const buffer = await file.arrayBuffer()
          const base64 = Buffer.from(buffer).toString('base64')
          content.push({
            type: 'document',
            source: { type: 'base64', media_type: 'application/pdf', data: base64 },
          } as Anthropic.DocumentBlockParam)
        }
        // HWP, DOCX 등은 텍스트만으로 분석
      } catch {
        // 개별 파일 오류 무시
      }
    }

    const response = await client.messages.create({
      model: 'claude-sonnet-4-5-20250514',
      max_tokens: 2048,
      messages: [{ role: 'user', content }],
    })

    const text = response.content[0].type === 'text' ? response.content[0].text : ''
    const jsonMatch = text.match(/\{[\s\S]*\}/)
    if (!jsonMatch) throw new Error('JSON 파싱 실패')

    const analysis = JSON.parse(jsonMatch[0])

    analysis.topics = (analysis.topics || []).map((t: Record<string, unknown>, i: number) => ({
      ...t,
      color: COLORS[i % COLORS.length],
      cid: `topic-${i}`,
    }))

    return NextResponse.json(analysis)
  } catch (err) {
    console.error('Analyze error:', err)
    return NextResponse.json({ error: '분석에 실패했습니다.' }, { status: 500 })
  }
}
