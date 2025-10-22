import { NextRequest, NextResponse } from 'next/server';
import client from '@/lib/db';
import { auth } from '@/app/auth';
import { ObjectId } from 'mongodb';

export async function GET(request: NextRequest) {
  try {
    console.log('GET /api/user-interviews called');
    
    const session = await auth();
    console.log('Session data:', { 
      hasSession: !!session, 
      hasUser: !!session?.user, 
      hasUserId: !!session?.user?.id,
      userId: session?.user?.id
    });
    
    if (!session?.user?.id) {
      console.log('No session or user ID found');
      return NextResponse.json(
        { error: 'Unauthorized - Please log in' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '10');
    console.log('Query limit:', limit);

    console.log('Connecting to MongoDB...');
    const db = client.db("Cluster0");
    const userId = session.user.id;
    
    // Convert userId to ObjectId for consistency with save-performance API
    let userObjectId;
    try {
      userObjectId = new ObjectId(userId);
      console.log('UserObjectId created successfully:', userObjectId)
    } catch (objectIdError) {
      console.error('Invalid userId ObjectId format:', objectIdError);
      return NextResponse.json(
        { error: 'Invalid user ID format' },
        { status: 400 }
      );
    }
    
    console.log('Running optimized database queries for user:', userObjectId);
    
    // Add timeout wrapper for database operations
    const timeout = new Promise((_, reject) =>;
      setTimeout(() => reject(new Error('Database query timeout')), 12000);
    )
    
    // Use aggregation pipeline for better performance
    const dbQueries = Promise.all([;
      // Get user's recent NON-COMPLETED interviews (exclude completed ones from dashboard)
      db.collection('interviews')
        .find({ 
          userId: userObjectId,
          status: { $ne: 'completed' } // Exclude completed interviews from dashboard
        })
    console.log('Running database queries for user:', userId);
    
    // Add timeout wrapper for database operations
    const timeout = new Promise((_, reject) =>;
      setTimeout(() => reject(new Error('Database query timeout')), 8000);
    )
    
    const dbQueries = Promise.all([;
      // Get user's recent interviews
      db.collection('interviews')
        .find({ userId })
        .sort({ createdAt: -1 })
        .limit(limit)
        .toArray(),
      
      // Get all stats in one aggregation query
      db.collection('interviews')
        .aggregate([
          { $match: { userId: userObjectId } },
          {
            $group: {
              _id: null,
              total: { $sum: 1 },
              completed: {
                $sum: {
                  $cond: [{ $eq: ['$status', 'completed'] }, 1, 0]
                }
              },
              inProgress: {
                $sum: {
                  $cond: [{ $in: ['$status', ['ready', 'in-progress']] }, 1, 0]
                }
              }
            }
          }
        ])
        .toArray()
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
    
    const result = await Promise.race([;
      dbQueries,
      timeout
    ]);

    // Handle timeout case
    if (result === 'timeout') {
      return NextResponse.json({
        error: 'Database query timeout',
        interviews: [],
        totalInterviews: 0,
        completedInterviews: 0,
        inProgressInterviews: 0
      }, { status: 408 });
    }

    // Type assertion since we know it's the dbQueries result at this point
    const [interviews, statsResult] = result as [any[], any[]];
    
    // Extract stats from aggregation result
    const stats = statsResult.length > 0 ? statsResult[0] : { total: 0, completed: 0, inProgress: 0 };
    const { total: totalInterviews, completed: completedInterviews, inProgress: inProgressInterviews } = stats;
    const [interviews, totalInterviews, completedInterviews, inProgressInterviews] = result as [any[], number, number, number];

    console.log('Database query results:', {
      interviewsCount: interviews.length,
      totalInterviews,
      completedInterviews,
      inProgressInterviews
    })

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
    
    // Provide more specific error messages
    let errorMessage = 'Internal server error';
    if (error instanceof Error) {
      if (error.message === 'Database query timeout') {
        errorMessage = 'Database connection timeout';
      } else if (error.message.includes('MongoNetworkError')) {
        errorMessage = 'Database connection failed';
      }
    }
    
    return NextResponse.json(
      { 
        error: errorMessage,
        details: process.env.NODE_ENV === 'development' ? (error instanceof Error ? error.message : String(error)) : undefined
      },
      { status: 500 }
    );
  }
}