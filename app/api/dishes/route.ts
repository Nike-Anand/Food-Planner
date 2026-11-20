import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export async function GET(req: NextRequest) {
  const search = req.nextUrl.searchParams.get('q') || ''

  let query = supabase
    .from('dishes')
    .select('*')
    .order('name')

  if (search) {
    query = query.ilike('name', `%${search}%`)
  }

  const { data, error } = await query.limit(50)
  if (error) {
    console.error('Supabase error:', error.message)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
  return NextResponse.json(data)
}
