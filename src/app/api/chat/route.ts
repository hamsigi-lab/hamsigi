import { NextRequest, NextResponse } from 'next/server'
export const runtime = 'edge'


export async function POST(req: NextRequest) {
  try {
    const { messages, system } = await req.json()

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json({ error: '잘못된 요청입니다.' }, { status: 400 })
    }

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
          { role: 'system', content: system || '당신은 친절한 학습 도우미입니다. 한국어로 답변하세요.' },
          ...messages,
        ],
        max_tokens: 1024,
        temperature: 0.5,
      }),
    })

    if (!res.ok) throw new Error(`Groq: ${res.status}`)

    const data = await res.json()
    const text = data.choices?.[0]?.message?.content || ''
    return NextResponse.json({ content: text })
  } catch (err) {
    console.error('Chat error:', err)
    return NextResponse.json({ error: 'AI 응답 생성에 실패했습니다.' }, { status: 500 })
  }
}
