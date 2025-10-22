import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/app/auth';
import { connectToDatabase } from '@/lib/db';
import { ObjectId } from 'mongodb';

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url);
    const interviewId = searchParams.get('interviewId');
    
    if (!interviewId) {
      return NextResponse.json(
        { success: false, error: 'Missing interviewId' },
        { status: 400 }
      )
    }

    const { db } = await connectToDatabase();
    const userObjectId = new ObjectId(session.user.id);
    const interviewObjectId = new ObjectId(interviewId);

    // Get interview details
    const interview = await db.collection('interviews')
      .findOne({ _id: interviewObjectId })

    // Get performance data
    const performance = await db.collection('performances')
      .findOne({ interviewId: interviewObjectId })

    // Get all user interviews for debugging
    const allUserInterviews = await db.collection('interviews')
      .find({ userId: userObjectId })
      .toArray()

    // Check for string userId interviews
    const stringUserIdInterviews = await db.collection('interviews')
      .find({ userId: session.user.id }) // String version
      .toArray()

    const debugInfo = {
      userId: session.user.id;
      userObjectId: userObjectId.toString(),
      interviewId,
      interviewObjectId: interviewObjectId.toString(),
      
      interview: interview ? {
        _id: interview._id.toString(),
        userId: interview.userId?.toString(),
        userIdType: typeof interview.userId;
        status: interview.status;
        createdAt: interview.createdAt;
        completedAt: interview.completedAt;
        performanceId: interview.performanceId?.toString()
      } : null,
      
      performance: performance ? {
        _id: performance._id.toString(),
        interviewId: performance.interviewId.toString(),
        userId: performance.userId.toString(),
        completedAt: performance.completedAt;
        score: performance.score
      } : null,
      
      allUserInterviewsCount: allUserInterviews.length;
      completedInterviewsCount: allUserInterviews.filter(i => i.status === 'completed').length,
      stringUserIdInterviewsCount: stringUserIdInterviews.length;
      
      issues: []
    }

    // Identify issues
    if (!interview) {
      debugInfo.issues.push('Interview not found')
    } else {
      if (interview.userId && typeof interview.userId === 'string') {
        debugInfo.issues.push('Interview has string userId instead of ObjectId')
      }
      if (performance && interview.status !== 'completed') {
        debugInfo.issues.push('Interview has performance data but status is not completed')
      }
      if (!performance && interview.status === 'completed') {
        debugInfo.issues.push('Interview is completed but no performance data found')
      }
    }

    if (stringUserIdInterviews.length > 0) {
      debugInfo.issues.push(`${stringUserIdInterviews.length} interviews have string userId`)
    }

    return NextResponse.json({
      success: true;
      debug: debugInfo
    })

  } catch (error) {
    console.error('Debug API error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Debug failed';
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    )
  }
}