import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/app/auth';
import client from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    console.log('📊 User Performance Dashboard API called');
    
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized - Please login' },
        { status: 401 }
      );
    }

    const userId = session.user.id;
    const db = client.db();
    
    console.log(`🔍 Fetching performance data for user: ${userId}`);

    // Get all interviews for the user
    const interviews = await db.collection('interviews')
      .find({ userId })
      .sort({ createdAt: -1 })
      .toArray();

    // Get all performance analyses for the user
    const performanceAnalyses = await db.collection('performance_analysis')
      .find({ userId })
      .sort({ createdAt: -1 })
      .toArray();

    console.log(`📈 Found ${interviews.length} interviews and ${performanceAnalyses.length} performance analyses`);

    // Calculate comprehensive statistics
    const stats = calculateUserStats(interviews, performanceAnalyses);
    
    // Get recent feedback from performance analyses
    const recentFeedback = getRecentFeedback(performanceAnalyses);
    
    // Analyze strengths and improvement areas
    const skillAnalysis = analyzeSkillsAcrossInterviews(performanceAnalyses);
    
    // Get performance trends over time
    const performanceTrend = calculatePerformanceTrend(performanceAnalyses);
    
    // Company-wise performance breakdown
    const companyPerformance = getCompanyPerformanceBreakdown(performanceAnalyses);

    const dashboardData = {
      totalInterviews: interviews.length,
      completedInterviews: interviews.filter(i => i.status === 'completed').length,
      inProgressInterviews: interviews.filter(i => i.status === 'in-progress').length,
      averageScore: stats.averageScore,
      bestScore: stats.bestScore,
      recentScore: stats.recentScore,
      strongAreas: skillAnalysis.strengths,
      improvementAreas: skillAnalysis.improvements,
      recentFeedback,
      performanceTrend,
      companyPerformance,
      statistics: {
        ...stats,
        totalQuestionsAnswered: stats.totalResponses,
        averageInterviewDuration: stats.averageDuration,
        improvementRate: stats.improvementRate
      },
      lastUpdated: new Date()
    };

    console.log(`✅ Performance dashboard data compiled successfully`);

    return NextResponse.json({
      success: true,
      performance: dashboardData,
      message: 'Performance data retrieved successfully'
    });

  } catch (error: any) {
    console.error('❌ Error fetching user performance:', error);
    
    return NextResponse.json(
      {
        error: 'Failed to fetch performance data',
        details: error.message,
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}

// Helper functions for data processing
const calculateUserStats = (interviews: any[], performanceAnalyses: any[]) => {
  const completedAnalyses = performanceAnalyses.filter(p => p.performance?.overallScore > 0);
  const scores = completedAnalyses.map(p => p.performance.overallScore);
  
  // Calculate total responses across all interviews
  const totalResponses = interviews.reduce((sum, interview) => {
    return sum + (interview.responses?.length || 0);
  }, 0);
  
  // Calculate average duration (mock data for now, can be enhanced with actual timing)
  const averageDuration = interviews.length > 0 ? 45 : 0; // Average 45 minutes
  
  // Calculate improvement rate
  let improvementRate = 0;
  if (scores.length >= 2) {
    const recentScores = scores.slice(0, 3);
    const earlierScores = scores.slice(-3);
    const recentAvg = recentScores.reduce((sum, score) => sum + score, 0) / recentScores.length;
    const earlierAvg = earlierScores.reduce((sum, score) => sum + score, 0) / earlierScores.length;
    improvementRate = Math.round(((recentAvg - earlierAvg) / earlierAvg) * 100);
  }
  
  return {
    averageScore: scores.length > 0 ? Math.round(scores.reduce((sum, score) => sum + score, 0) / scores.length) : 0,
    bestScore: scores.length > 0 ? Math.max(...scores) : 0,
    recentScore: scores.length > 0 ? scores[0] : 0,
    totalResponses,
    averageDuration,
    improvementRate,
    completionRate: interviews.length > 0 ? Math.round((completedAnalyses.length / interviews.length) * 100) : 0
  };
};

const getRecentFeedback = (performanceAnalyses: any[]) => {
  return performanceAnalyses
    .slice(0, 5) // Get last 5 performance analyses
    .map(analysis => ({
      _id: analysis._id,
      interviewId: analysis.interviewId,
      companyName: analysis.companyName,
      jobTitle: analysis.jobTitle,
      score: Math.round(analysis.performance?.overallScore || 0),
      feedback: analysis.performance?.overallVerdict || 'Performance analysis completed',
      strengths: analysis.performance?.strengths || ['Professional approach'],
      improvements: analysis.performance?.improvements || ['Continue practicing'],
      createdAt: analysis.createdAt
    }));
};

const analyzeSkillsAcrossInterviews = (performanceAnalyses: any[]) => {
  const allStrengths: string[] = [];
  const allImprovements: string[] = [];
  
  performanceAnalyses.forEach(analysis => {
    if (analysis.performance?.strengths) {
      allStrengths.push(...analysis.performance.strengths);
    }
    if (analysis.performance?.improvements) {
      allImprovements.push(...analysis.performance.improvements);
    }
  });
  
  // Count frequency and get top items
  const strengthCounts = this.countFrequency(allStrengths);
  const improvementCounts = this.countFrequency(allImprovements);
  
  return {
    strengths: Object.keys(strengthCounts)
      .sort((a, b) => strengthCounts[b] - strengthCounts[a])
      .slice(0, 5),
    improvements: Object.keys(improvementCounts)
      .sort((a, b) => improvementCounts[b] - improvementCounts[a])
      .slice(0, 5)
  };
};

const countFrequency = (items: string[]) => {
  const counts: {[key: string]: number} = {};
  items.forEach(item => {
    counts[item] = (counts[item] || 0) + 1;
  });
  return counts;
};

const calculatePerformanceTrend = (performanceAnalyses: any[]) => {
  // Get last 7 performance scores for trend analysis
  const recentScores = performanceAnalyses
    .slice(0, 7)
    .map(analysis => analysis.performance?.overallScore || 0)
    .reverse(); // Show chronological order
    
  // If not enough data, fill with zeros
  while (recentScores.length < 7) {
    recentScores.unshift(0);
  }
  
  return recentScores;
};

const getCompanyPerformanceBreakdown = (performanceAnalyses: any[]) => {
  const companyStats: {[key: string]: {count: number, totalScore: number, average: number}} = {};
  
  performanceAnalyses.forEach(analysis => {
    const company = analysis.companyName || 'Unknown';
    const score = analysis.performance?.overallScore || 0;
    
    if (!companyStats[company]) {
      companyStats[company] = { count: 0, totalScore: 0, average: 0 };
    }
    
    companyStats[company].count += 1;
    companyStats[company].totalScore += score;
    companyStats[company].average = Math.round(
      (companyStats[company].totalScore / companyStats[company].count)
    );
  });
  
  return Object.entries(companyStats)
    .map(([company, stats]) => ({
      company,
      attempts: stats.count,
      averageScore: stats.average,
      totalScore: stats.totalScore
    }))
    .sort((a, b) => b.averageScore - a.averageScore)
    .slice(0, 10); // Top 10 companies by performance
};