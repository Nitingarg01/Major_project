import { auth } from '@/app/auth'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 Test session endpoint called')
    
    // Try multiple ways to get session
    let session1, session2, session3;
    
    try {
      session1 = await auth();
      console.log('🔍 Session attempt 1:', !!session1?.user?.id);
    } catch (e) {
      console.log('❌ Session attempt 1 failed:', e);
    }
    
    await new Promise(resolve => setTimeout(resolve, 500));
    
    try {
      session2 = await auth();
      console.log('🔍 Session attempt 2:', !!session2?.user?.id);
    } catch (e) {
      console.log('❌ Session attempt 2 failed:', e);
    }
    
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    try {
      session3 = await auth();
      console.log('🔍 Session attempt 3:', !!session3?.user?.id);
    } catch (e) {
      console.log('❌ Session attempt 3 failed:', e);
    }
    
    const finalSession = session3 || session2 || session1;
    
    return NextResponse.json({
      success: true,
      authenticated: !!finalSession?.user?.id,
      userId: finalSession?.user?.id,
      userEmail: finalSession?.user?.email,
      userName: finalSession?.user?.name,
      sessionExists: !!finalSession,
      attempts: {
        attempt1: !!session1?.user?.id,
        attempt2: !!session2?.user?.id,
        attempt3: !!session3?.user?.id,
      },
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('❌ Test session error:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      authenticated: false,
      timestamp: new Date().toISOString()
    })
  }
}