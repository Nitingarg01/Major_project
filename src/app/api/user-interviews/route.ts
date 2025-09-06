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

    const db = client.db("Cluster0");
    const userId = session.user.id;
    
    // Run all database queries in parallel for better performance
    const [interviews, totalInterviews, completedInterviews, inProgressInterviews] = await Promise.all([
      // Get user's recent interviews
      db.collection('interviews')
        .find({ userId })
        .sort({ createdAt: -1 })
        .limit(limit)
        .toArray(),
      
      // Get total interviews count
      db.collection('interviews')
        .countDocuments({ userId }),
      
      // Get completed interviews count
      db.collection('interviews')
        .countDocuments({ 
          userId, 
          status: 'completed' 
        }),
      
      // Get in-progress interviews count
      db.collection('interviews')
        .countDocuments({ 
          userId, 
          status: { $in: ['ready', 'in-progress'] }
        })
    ]);

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