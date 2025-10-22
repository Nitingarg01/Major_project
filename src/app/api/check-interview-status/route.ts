import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/app/auth';
import { connectToDatabase } from '@/lib/db';
import { ObjectId } from 'mongodb';

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const interviewId = searchParams.get('id');
    
    if (!interviewId) {
      return NextResponse.json({ error: 'Interview ID required' }, { status: 400 });
    }

    const { db } = await connectToDatabase();
    
    // Get interview details
    const interview = await db.collection('interviews').findOne({
      _id: new ObjectId(interviewId),
      userId: session.user.id
    })
    
    if (!interview) {
      return NextResponse.json({ error: 'Interview not found' }, { status: 404 });
    }
    
    // Check if performance data exists
    const performance = await db.collection('performances').findOne({
      interviewId: new ObjectId(interviewId),
      userId: new ObjectId(session.user.id)
    })
    
    return NextResponse.json({
      success: true,
      interview: {
        id: interview._id,
        status: interview.status,
        jobTitle: interview.jobTitle,
        companyName: interview.companyName,
        createdAt: interview.createdAt,
        completedAt: interview.completedAt,
        performanceId: interview.performanceId
      },
      hasPerformanceData: !!performance,
      performanceId: performance?._id
    })
    
  } catch (error) {
    console.error('Error checking interview status:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : String(error)
    }, { status: 500 })
  }
}