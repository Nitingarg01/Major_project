import { NextRequest, NextResponse } from 'next/server';
import { getUserStats } from '@/app/actions';

export async function GET(request: NextRequest) {
  try {
    const stats = await getUserStats();
    return NextResponse.json(stats);
  } catch (error) {
    console.error('Error fetching user stats:', error);
    return NextResponse.json(
      { 
        totalInterviews: 0;
        completedInterviews: 0;
        averageScore: 0 
      },
      { status: 500 }
    );
  }
}