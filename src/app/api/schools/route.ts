import { NextRequest, NextResponse } from 'next/server'

export const runtime = 'edge'

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get('q') || ''
  const type = req.nextUrl.searchParams.get('type') || ''
  if (q.length < 2) return NextResponse.json([])

  const params = new URLSearchParams({
    Type: 'json', pIndex: '1', pSize: '20',
    SCHUL_NM: q,
    ...(type ? { SCHUL_KND_SC_NM: type } : {}),
  })

  try {
    const res = await fetch(`https://open.neis.go.kr/hub/schoolInfo?${params}`)
    const data = await res.json()
    const rows = data.schoolInfo?.[1]?.row || []
    return NextResponse.json(rows.map((s: Record<string, string>) => ({
      name: s.SCHUL_NM,
      region: s.LCTN_SC_NM,
      type: s.SCHUL_KND_SC_NM,
      address: s.ORG_RDNMA,
    })))
  } catch {
    return NextResponse.json([])
  }
}
