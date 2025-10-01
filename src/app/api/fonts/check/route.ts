import { NextResponse } from 'next/server'
import { getAvailableFonts } from '@/lib/fonts'

export async function GET() {
  try {
    const availableFonts = getAvailableFonts()
    
    return NextResponse.json(availableFonts)
  } catch (error) {
    console.error('Error checking fonts:', error)
    return NextResponse.json(
      { error: 'Failed to check fonts' },
      { status: 500 }
    )
  }
}