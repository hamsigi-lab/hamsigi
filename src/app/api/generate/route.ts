import { NextRequest, NextResponse } from 'next/server'
import type { Topic } from '@/lib/types'

export async function POST(req: NextRequest) {
  try {
    const { topics, subject } = await req.json() as { topics: Topic[]; subject: string }

    const topicList = topics.map((t, i) =>
      `[topic-${i}] ${t.title} (출제확률 ${t.pct}%)\n  키워드: ${t.keys.join(', ')}\n  설명: ${t.desc}`
    ).join('\n\n')

    const systemMessage = `당신은 한국 중고등학교 시험 문제를 20년간 출제해온 전문 교사입니다. 실제 시험에 나올 법한 정확하고 교육적으로 가치 있는 문제를 만듭니다. 반드시 JSON 형식으로만 응답합니다.`

    const userMessage = `${subject} 과목의 아래 출제 예상 주제를 바탕으로 확인학습 문제와 예상 시험 문제를 생성하세요.

=== 출제 예상 주제 ===
${topicList}

=== 생성 규칙 ===

[확인학습 (practice) 규칙]
- 각 주제당 O/X 1개 + 빈칸채우기 1개 생성
- O/X: 명확하게 참/거짓을 판별할 수 있는 핵심 개념 문장
- 빈칸: [①], [②] 형식 사용, 핵심 용어나 개념을 빈칸으로
- ok/ng는 구체적인 설명 포함 (단순 "맞습니다" 금지)

[예상 시험 (quiz) 규칙]
- 객관식: 4개 선택지, 오답도 그럴듯하게 (단순한 함정 금지)
- 서답형: 1~2단어 또는 짧은 문장으로 답할 수 있는 문제
- 서술형: 과정이나 이유를 설명하는 문제 (3~5줄 예상 답변)
- exp(해설): 왜 이 답이 정답인지 구체적으로 설명

JSON 형식으로만 답변 (마크다운 없이):
{
  "practice": [
    {
      "cid": "topic-0",
      "type": "ox",
      "pct": 85,
      "text": "핵심 개념을 담은 참/거짓 판별 문장.",
      "ans": "O",
      "src": "교과서 단원명",
      "ok": "맞습니다. (정답 이유를 구체적으로 1-2문장)",
      "ng": "틀렸습니다. (정확한 내용을 구체적으로 1-2문장)"
    },
    {
      "cid": "topic-0",
      "type": "blank",
      "pct": 80,
      "text": "[①]은(는) [②]에서 일어나며, 이 과정에서 [③]이 생성된다.",
      "blanks": ["정답1", "정답2", "정답3"],
      "src": "교과서 단원명",
      "ok": "정답입니다! 핵심 내용 한 문장 보충 설명.",
      "ng": "정답: 정답1, 정답2, 정답3. 관련 개념 설명."
    }
  ],
  "quiz": [
    {
      "num": 1,
      "type": "obj",
      "diff": "easy",
      "pct": 85,
      "src": "교과서 단원",
      "cid": "topic-0",
      "text": "다음 중 [개념]에 대한 설명으로 옳은 것은?",
      "choices": ["올바른 설명", "비슷하지만 틀린 설명", "관련 없는 오답", "부분적으로 맞는 오답"],
      "ans": 0,
      "exp": "①번이 정답인 이유: 구체적인 해설. 나머지 선택지가 틀린 이유도 간략히."
    },
    {
      "num": 5,
      "type": "short",
      "diff": "medium",
      "pct": 70,
      "src": "교과서 단원",
      "cid": "topic-1",
      "text": "서답형 문제: 구체적인 용어나 수치를 묻는 문제.",
      "ans": "정확한 정답"
    },
    {
      "num": 8,
      "type": "essay",
      "diff": "hard",
      "pct": 60,
      "src": "교과서 단원",
      "cid": "topic-2",
      "text": "서술형 문제: ~의 과정을 단계별로 설명하시오. 또는 ~의 이유를 서술하시오.",
      "rubric": "채점 기준: 핵심 개념 언급 (2점), 과정/이유 설명 (2점), 예시 제시 (1점) 등 구체적 기준."
    }
  ]
}

생성 수량:
- practice: ${topics.length * 2}개 (각 주제당 ox 1개 + blank 1개)
- quiz: 객관식 ${Math.min(topics.length, 6)}개 + 서답형 2개 + 서술형 1개
- quiz num은 1부터 순서대로, ans(객관식)는 0부터 시작하는 인덱스`

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
        temperature: 0.4,
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

    const result = JSON.parse(jsonMatch[0])
    return NextResponse.json(result)
  } catch (err) {
    console.error('Generate error:', err)
    return NextResponse.json({ error: '문제 생성에 실패했습니다.' }, { status: 500 })
  }
}
