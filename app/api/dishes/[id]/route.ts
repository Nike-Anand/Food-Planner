import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  const [{ data: dish, error: dishError }, { data: ingredients, error: ingError }] =
    await Promise.all([
      supabase.from('dishes').select('*').eq('id', id).single(),
      supabase.from('ingredients').select('*').eq('dish_id', id),
    ])

  if (dishError) return NextResponse.json({ error: dishError.message }, { status: 404 })
  if (ingError) return NextResponse.json({ error: ingError.message }, { status: 500 })

  return NextResponse.json({ dish, ingredients })
}
