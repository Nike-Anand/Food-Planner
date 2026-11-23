import { NextResponse } from 'next/server'
import { isCookYourselfEnabled } from '@/lib/flagsmith'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const cookYourselfEnabled = await isCookYourselfEnabled()
    return NextResponse.json({
      flags: {
        cook_yourself_enabled: cookYourselfEnabled,
      },
    })
  } catch (error) {
    console.error('Error fetching flags:', error)
    return NextResponse.json({
      flags: {
        cook_yourself_enabled: true,
      },
    })
  }
}
