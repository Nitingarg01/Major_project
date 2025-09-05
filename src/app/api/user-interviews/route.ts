import { NextRequest, NextResponse } from 'next/server';
import client from '@/lib/db';
import { auth } from '@/app/auth';

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '10');

    const db = client.db();
    
    // Get user's recent interviews
    const interviews = await db
      .collection('interviews')
      .find({ userId: session.user.id })
      .sort({ createdAt: -1 })
      .limit(limit)
      .toArray();

    // Get interview stats
    const totalInterviews = await db
      .collection('interviews')
      .countDocuments({ userId: session.user.id });

    const completedInterviews = await db
      .collection('interviews')
      .countDocuments({ 
        userId: session.user.id, 
        status: 'completed' 
      });

    const inProgressInterviews = await db
      .collection('interviews')
      .countDocuments({ 
        userId: session.user.id, 
        status: { $in: ['ready', 'in-progress'] }
      });

    return NextResponse.json({
      success: true,
      interviews: interviews,
      stats: {
        total: totalInterviews,
        completed: completedInterviews,
        inProgress: inProgressInterviews
      }
    });

  } catch (error) {
    console.error('Error fetching user interviews:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}