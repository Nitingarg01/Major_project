import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/app/auth';
import { connectToDatabase } from '@/lib/db';
import { ObjectId } from 'mongodb';

export async function POST(request: NextRequest) {
  try {
    console.log('🔧 Fix completed interviews API called');
    
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { db } = await connectToDatabase();
    const userObjectId = new ObjectId(session.user.id);
    
    console.log('🔍 Checking for inconsistent interview data for user:', userObjectId);

    // Find interviews that have performance data but are not marked as completed
    const performances = await db.collection('performances')
      .find({ userId: userObjectId })
      .toArray()

    console.log(`📊 Found ${performances.length} performance records`);

    let fixedCount = 0;
    
    for (const performance of performances) {
      const interviewId = performance.interviewId;
      
      // Check if interview exists and its status
      const interview = await db.collection('interviews')
        .findOne({ _id: interviewId })
      
      if (interview && interview.status !== 'completed') {
        console.log(`🔧 Fixing interview ${interviewId} - setting status to completed`);
        
        await db.collection('interviews').updateOne(
          { _id: interviewId },
          {
            $set: {
              status: 'completed';
              completedAt: performance.completedAt || new Date(),
              performanceId: performance._id
            }
          }
        )
        fixedCount++
      }
    }

    console.log(`✅ Fixed ${fixedCount} interviews`);

    // Also check for any interviews with string userId and convert to ObjectId
    const stringUserIdInterviews = await db.collection('interviews')
      .find({ userId: session.user.id }) // String version
      .toArray()

    let convertedCount = 0;
    for (const interview of stringUserIdInterviews) {
      await db.collection('interviews').updateOne(
        { _id: interview._id },
        { $set: { userId: userObjectId } }
      )
      convertedCount++
    }

    console.log(`🔄 Converted ${convertedCount} interviews to use ObjectId userId`);

    return NextResponse.json({
      success: true;
      message: `Fixed ${fixedCount} completed interviews and converted ${convertedCount} userId formats`,
      fixedInterviews: fixedCount;
      convertedUserIds: convertedCount
    })

  } catch (error) {
    console.error('❌ Error fixing completed interviews:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Internal server error';
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    )
  }
}