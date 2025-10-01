import { NextResponse } from 'next/server'
import { AVAILABLE_FONTS } from '@/lib/fonts'
import { getAvailableFonts } from '@/lib/fonts-server'

export async function GET() {
  try {
    const availableFonts = getAvailableFonts(AVAILABLE_FONTS)
    
    return NextResponse.json(availableFonts)
  } catch (error) {
    console.error('Error checking fonts:', error)
    return NextResponse.json(
      { error: 'Failed to check fonts' },
      { status: 500 }
    )
  }
}