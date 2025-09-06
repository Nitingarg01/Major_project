import { auth } from '@/app/auth'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    
    console.log('🔍 Test session endpoint called')
    console.log('🔍 Session data:', session)
    
    return NextResponse.json({
      success: true,
      authenticated: !!session?.user?.id,
      userId: session?.user?.id,
      userEmail: session?.user?.email,
      userName: session?.user?.name,
      sessionExists: !!session,
    })
  } catch (error) {
    console.error('❌ Test session error:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      authenticated: false
    })
  }
}