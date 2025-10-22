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

    const { db } = await connectToDatabase();
    
    // Fetch all completed interviews with performance data
    const performances = await db.collection('performances').find({
      userId: new ObjectId(session.user.id)
    }).sort({ completedAt: -1 }).toArray()

    // Calculate performance statistics
    const stats = calculatePerformanceStats(performances);

    return NextResponse.json({
      success: true,
      performances: performances.map(p => ({
        ...p,
        _id: p._id.toString()
      })),
      stats
    })

  } catch (error) {
    console.error('Error fetching performance stats:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

function calculatePerformanceStats(performances: any[]) {
  if (performances.length === 0) {
    return {
      totalInterviews: 0,
      averageScore: 0,
      totalTimeSpent: 0,
      improvementTrend: 0,
      strongestArea: 'N/A',
      weakestArea: 'N/A',
      recentPerformance: []
    }
  }

  const totalInterviews = performances.length;
  const totalScore = performances.reduce((sum, p) => sum + p.score, 0);
  const averageScore = Math.round(totalScore / totalInterviews);
  const totalTimeSpent = performances.reduce((sum, p) => sum + p.timeSpent, 0);

  // Calculate improvement trend (last 3 vs previous 3)
  let improvementTrend = 0;
  if (performances.length >= 6) {
    const recent3 = performances.slice(0, 3);
    const previous3 = performances.slice(3, 6);
    const recentAvg = recent3.reduce((sum, p) => sum + p.score, 0) / 3;
    const previousAvg = previous3.reduce((sum, p) => sum + p.score, 0) / 3;
    improvementTrend = Math.round(recentAvg - previousAvg);
  }

  // Find strongest and weakest areas
  const areaScores: { [key: string]: number[] } = {}
  performances.forEach(p => {
    p.roundResults?.forEach((round: any) => {
      if (!areaScores[round.roundType]) {
        areaScores[round.roundType] = []
      }
      areaScores[round.roundType].push(round.score)
    })
  })

  let strongestArea = 'N/A';
  let weakestArea = 'N/A';
  let highestAvg = 0;
  let lowestAvg = 100;

  Object.entries(areaScores).forEach(([area, scores]) => {
    const avg = scores.reduce((sum, score) => sum + score, 0) / scores.length;
    if (avg > highestAvg) {
      highestAvg = avg;
      strongestArea = area;
    }
    if (avg < lowestAvg) {
      lowestAvg = avg;
      weakestArea = area;
    }
  })

  // Recent performance trend (last 10 interviews)
  const recentPerformance = performances;
    .slice(0, 10)
    .reverse()
    .map(p => p.score)

  return {
    totalInterviews,
    averageScore,
    totalTimeSpent,
    improvementTrend,
    strongestArea,
    weakestArea,
    recentPerformance
  }
}