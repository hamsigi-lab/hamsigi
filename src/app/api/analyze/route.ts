import { NextRequest, NextResponse } from 'next/server'
export const runtime = 'edge'


const SUBJECT_NAMES: Record<string, string> = {
  science: '과학', social: '사회', history: '역사', math: '수학',
  korean: '국어', english: '영어', moral: '도덕/윤리', tech: '기술·가정',
}

const COLORS = ['#ef4444', '#f59e0b', '#6366F1', '#8B5CF6', '#EC4899', '#10B981', '#3B82F6', '#14B8A6']

async function extractText(file: File): Promise<string> {
  if (file.type.startsWith('text/')) {
    return (await file.text()).slice(0, 6000)
  }
  return ''
}

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()
    const subject = formData.get('subject') as string
    const files = formData.getAll('files') as File[]
    const subjectName = SUBJECT_NAMES[subject] || subject

    const extractedTexts: string[] = []
    for (const file of files) {
      if (file.size > 8 * 1024 * 1024) continue
      const text = await extractText(file)
      if (text.trim()) extractedTexts.push(`[${file.name}]\n${text}`)
    }

    const hasContent = extractedTexts.length > 0
    const contentSection = hasContent
      ? `\n\n=== 업로드된 자료 내용 ===\n${extractedTexts.join('\n\n---\n\n')}\n=== 끝 ===\n`
      : ''
    const fileNames = files.map(f => f.name).join(', ')

    const systemMessage = `당신은 한국 중고등학교 시험 출제 패턴 분석 전문가입니다. 20년 경력의 교사로서 교육과정과 출제 경향을 정확히 파악합니다. 반드시 JSON 형식으로만 응답합니다.`

    const userMessage = `${subjectName} 시험 출제 예상 분석을 해주세요.
${hasContent ? `업로드된 자료를 꼼꼼히 읽고 실제 내용 기반으로 분석하세요.${contentSection}` : fileNames ? `파일명: ${fileNames}\n${subjectName} 교육과정의 핵심 출제 경향을 분석하세요.` : `${subjectName} 교육과정의 핵심 출제 경향을 분석하세요.`}

분석 기준:
1. 반복 출제 빈도가 높은 핵심 개념 (가장 중요)
2. 서술형/서답형으로 자주 나오는 고난이도 주제
3. 암기가 아닌 이해와 적용이 필요한 내용
4. 최근 교육과정 개정에서 강조하는 부분
5. 교과서 탐구활동, 실험, 사례 중심 내용

JSON 형식으로만 답변 (마크다운 없이):
{
  "topics": [
    {
      "title": "구체적 주제명 (15자 이내)",
      "pct": 92,
      "type": "서술형",
      "keys": ["핵심개념1", "핵심개념2", "핵심개념3", "핵심개념4"],
      "desc": "이 주제가 출제될 가능성이 높은 구체적 이유. 어떤 유형의 문제로 출제되는지, 무엇을 주의해야 하는지 2-3문장.",
      "src": "교과서 해당 단원 또는 출처"
    }
  ],
  "summary": "전체 분석 요약: 핵심 출제 포인트와 학습 전략을 2-3문장으로 구체적으로 설명."
}

요구사항:
- topics 7~8개, pct 60~97 내림차순 정렬
- type은 "서술형"/"서답형"/"객관식" 중 하나
- keys는 3~4개의 구체적 학습 키워드
- desc는 막연하지 않게, 실제 출제 패턴 기반으로 구체적으로 작성
- src는 단원명, 교과서 등 실제 출처`

    const apiKey = process.env.GROQ_API_KEY
    const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: [
          { role: 'system', content: systemMessage },
          { role: 'user', content: userMessage },
        ],
        temperature: 0.3,
        response_format: { type: 'json_object' },
      }),
    })

    if (!res.ok) {
      const err = await res.text()
      throw new Error(`Groq: ${res.status} ${err.slice(0, 200)}`)
    }

    const data = await res.json()
    const text = data.choices?.[0]?.message?.content || ''
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
