import Anthropic from '@anthropic-ai/sdk'
import { NextRequest, NextResponse } from 'next/server'

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

export async function POST(req: NextRequest) {
  try {
    const { messages, system } = await req.json()

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json({ error: '잘못된 요청입니다.' }, { status: 400 })
    }

    const response = await client.messages.create({
      model: 'claude-sonnet-4-5-20250514',
      max_tokens: 1024,
      system: system || '당신은 친절한 학습 도우미입니다. 한국어로 답변하세요.',
      messages,
    })

    const text = response.content[0].type === 'text' ? response.content[0].text : ''
    return NextResponse.json({ content: text })
  } catch (err) {
    console.error('AI API error:', err)
    return NextResponse.json({ error: 'AI 응답 생성에 실패했습니다. 잠시 후 다시 시도해주세요.' }, { status: 500 })
  }
}
