import { NextRequest, NextResponse } from 'next/server';
import GroqAIService from '@/lib/groqAIService';
import client from '@/lib/db';
import { ObjectId } from 'mongodb';

export async function POST(request: NextRequest) {
  try {
    console.log('🏁 Complete Interview API called');
    
    const body = await request.json();
    const { interviewId } = body;

    if (!interviewId) {
      return NextResponse.json(
        { error: 'Interview ID is required' },
        { status: 400 }
      );
    }

    const db = client.db();
    
    // Get interview with all data
    const interview = await db.collection('interviews').findOne({
      _id: new ObjectId(interviewId)
    });

    if (!interview) {
      return NextResponse.json(
        { error: 'Interview not found' },
        { status: 404 }
      );
    }

    console.log(`🚀 Completing interview for ${interview.companyName} - ${interview.jobTitle}`);

    // Get questions for this interview
    const questionsDoc = await db.collection('questions').findOne({
      interviewId: interviewId
    });

    if (!questionsDoc?.questions) {
      return NextResponse.json(
        { error: 'Interview questions not found' },
        { status: 404 }
      );
    }

    const questions = questionsDoc.questions;
    const responses = interview.responses || [];

    console.log(`📊 Processing ${questions.length} questions and ${responses.length} responses`);

    // Extract answers in the same order as questions
    const answers = questions.map((question: any) => {
      const response = responses.find((r: any) => r.questionId === question.id);
      return response?.userAnswer || 'No answer provided';
    });

    // Generate comprehensive performance analysis using Groq AI
    console.log('🧠 Starting Groq AI performance analysis...');
    const groqService = GroqAIService.getInstance();
    
    const performanceAnalysis = await groqService.analyzeOverallPerformance(
      questions,
      answers,
      interview.jobTitle,
      interview.skills || []
    );

    console.log(`✅ Performance analyzed with Groq AI - Overall Score: ${performanceAnalysis.overallScore}/10`);

    // Calculate detailed metrics
    const responseScores = responses
      .map((r: any) => r.analysis?.score || 0)
      .filter((score: number) => score > 0);

    const categoryScores = calculateCategoryScores(questions, responses);
    const completionStats = calculateCompletionStats(questions, responses);
    
    // Get user's historical performance for comparison
    const historicalPerformance = await getUserHistoricalPerformance(
      db, interview.userId, interview.companyName
    );

    // Create comprehensive performance report
    const enhancedPerformance = {
      ...performanceAnalysis,
      interviewId,
      metadata: {
        companyName: interview.companyName,
        jobTitle: interview.jobTitle,
        interviewType: interview.interviewType,
        experienceLevel: interview.experienceLevel,
        totalQuestions: questions.length,
        answeredQuestions: responses.length,
        completionRate: Math.round((responses.length / questions.length) * 100),
        duration: interview.duration || 'Not tracked',
        completedAt: new Date()
      },
      detailedScores: {
        categoryBreakdown: categoryScores,
        responseMetrics: {
          averageScore: responseScores.length > 0 
            ? Math.round(responseScores.reduce((sum: number, score: number) => sum + score, 0) / responseScores.length * 10) / 10 
            : 0,
          highestScore: responseScores.length > 0 ? Math.max(...responseScores) : 0,
          lowestScore: responseScores.length > 0 ? Math.min(...responseScores) : 0,
          totalResponses: responseScores.length,
          responseRate: Math.round((responseScores.length / questions.length) * 100)
        },
        completionStats,
        historicalComparison: historicalPerformance
      },
      aiProvider: 'groq',
      companySpecific: true,
      feedbackSummary: generateFeedbackSummary(performanceAnalysis, categoryScores)
    };

    // Store comprehensive performance analysis
    const performanceDoc = {
      interviewId,
      userId: interview.userId,
      companyName: interview.companyName,
      jobTitle: interview.jobTitle,
      performance: enhancedPerformance,
      questions: questions.map((q: any, index: number) => ({
        ...q,
        userAnswer: answers[index],
        response: responses.find((r: any) => r.questionId === q.id)
      })),
      createdAt: new Date(),
      aiProvider: 'groq'
    };

    // Update or insert performance analysis
    await db.collection('performance_analysis').updateOne(
      { interviewId },
      { $set: performanceDoc },
      { upsert: true }
    );

    // Update interview status to completed
    await db.collection('interviews').updateOne(
      { _id: new ObjectId(interviewId) },
      { 
        $set: { 
          status: 'completed',
          completedAt: new Date(),
          performanceAnalyzed: true,
          finalScore: performanceAnalysis.overallScore || 0
        } 
      }
    );

    // Update user statistics
    await updateUserStatistics(db, interview.userId, enhancedPerformance);

    console.log(`🎉 Interview completed successfully with score: ${performanceAnalysis.overallScore}/10`);

    return NextResponse.json({
      success: true,
      performance: enhancedPerformance,
      redirectUrl: `/performance/interview/${interviewId}`,
      summary: {
        overallScore: performanceAnalysis.overallScore || 0,
        completionRate: Math.round((responses.length / questions.length) * 100),
        strongAreas: performanceAnalysis.strengths?.slice(0, 3) || [],
        improvementAreas: performanceAnalysis.improvements?.slice(0, 3) || [],
        totalQuestions: questions.length,
        answeredQuestions: responses.length
      },
      message: 'Interview completed successfully with comprehensive analysis'
    });

  } catch (error: any) {
    console.error('❌ Error completing interview:', error);
    
    return NextResponse.json(
      {
        error: 'Failed to complete interview',
        details: error.message,
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}

// Helper functions
function calculateCategoryScores(questions: any[], responses: any[]) {
  const categoryScores: {[key: string]: {total: number, count: number, average: number}} = {};
  
  questions.forEach((question: any) => {
    const response = responses.find((r: any) => r.questionId === question.id);
    const score = response?.analysis?.score || 0;
    const category = question.category || 'general';
    
    if (!categoryScores[category]) {
      categoryScores[category] = { total: 0, count: 0, average: 0 };
    }
    
    categoryScores[category].count += 1;
    if (score > 0) {
      categoryScores[category].total += score;
    }
    
    categoryScores[category].average = categoryScores[category].total > 0;
      ? Math.round((categoryScores[category].total / categoryScores[category].count) * 10) / 10
      : 0;
  });
  
  return categoryScores;
}

function calculateCompletionStats(questions: any[], responses: any[]) {
  const totalQuestions = questions.length;
  const answeredQuestions = responses.length;
  const unansweredQuestions = totalQuestions - answeredQuestions;
  
  // Calculate category-wise completion
  const categoryCompletion: {[key: string]: {total: number, answered: number, rate: number}} = {};
  
  questions.forEach((question: any) => {
    const category = question.category || 'general';
    const hasResponse = responses.some((r: any) => r.questionId === question.id);
    
    if (!categoryCompletion[category]) {
      categoryCompletion[category] = { total: 0, answered: 0, rate: 0 };
    }
    
    categoryCompletion[category].total += 1;
    if (hasResponse) {
      categoryCompletion[category].answered += 1;
    }
    
    categoryCompletion[category].rate = Math.round(
      (categoryCompletion[category].answered / categoryCompletion[category].total) * 100
    );
  });
  
  return {
    totalQuestions,
    answeredQuestions,
    unansweredQuestions,
    completionRate: Math.round((answeredQuestions / totalQuestions) * 100),
    categoryCompletion
  };
}

async function getUserHistoricalPerformance(db: any, userId: string, companyName: string) {
  try {
    // Get user's previous performance analyses
    const previousAnalyses = await db.collection('performance_analysis')
      .find({ 
        userId,
        companyName: { $regex: new RegExp(companyName, 'i') }
      })
      .sort({ createdAt: -1 })
      .limit(5)
      .toArray();
    
    if (previousAnalyses.length === 0) {
      return {
        isFirstAttempt: true,
        previousAttempts: 0,
        scoreHistory: [],
        improvementTrend: 'first_attempt',
        bestScore: 0
      };
    }
    
    const scores = previousAnalyses.map((analysis: any) =>
      analysis.performance?.overallScore || 0
    );
    
    const improvementTrend = scores.length > 1 ?;
      (scores[0] > scores[1] ? 'improving' : 
       scores[0] < scores[1] ? 'declining' : 'stable') : 'insufficient_data';
    
    return {
      isFirstAttempt: false,
      previousAttempts: previousAnalyses.length,
      scoreHistory: scores,
      improvementTrend,
      bestScore: scores.length > 0 ? Math.max(...scores) : 0,
      averageScore: scores.length > 0 ? 
        Math.round(scores.reduce((sum: number, score: number) => sum + score, 0) / scores.length) : 0
    };
  } catch (error) {
    console.error('Error getting historical performance:', error);
    return {
      isFirstAttempt: true,
      previousAttempts: 0,
      scoreHistory: [],
      improvementTrend: 'error',
      bestScore: 0
    };
  }
}

function generateFeedbackSummary(performanceAnalysis: any, categoryScores: any) {
  const overallScore = performanceAnalysis.overallScore || 0;
  const strengths = performanceAnalysis.strengths || [];
  const improvements = performanceAnalysis.improvements || [];
  
  let performanceLevel = 'Needs Improvement';
  if (overallScore >= 8) performanceLevel = 'Excellent';
  else if (overallScore >= 6) performanceLevel = 'Good';
  else if (overallScore >= 4) performanceLevel = 'Fair';
  
  const topCategory = Object.entries(categoryScores)
    .sort(([,a], [,b]) => (b as any).average - (a as any).average)[0];
    
  const bottomCategory = Object.entries(categoryScores)
    .sort(([,a], [,b]) => (a as any).average - (b as any).average)[0];
  
  return {
    performanceLevel,
    overallScore,
    keyMessage: `${performanceLevel} performance with a score of ${overallScore}/10`,
    topStrength: topCategory ? `Strong in ${topCategory[0]} (${(topCategory[1] as any).average}/10)` : null,
    mainImprovement: bottomCategory ? `Focus on ${bottomCategory[0]} (${(bottomCategory[1] as any).average}/10)` : null,
    quickWins: improvements.slice(0, 2),
    nextSteps: [
      'Review detailed feedback for each question',
      'Practice weak areas identified in the analysis',
      'Research company-specific topics mentioned',
      'Schedule another practice session to track improvement'
    ]
  };
}

async function updateUserStatistics(db: any, userId: string, performanceData: any) {
  try {
    const stats = {
      lastInterviewDate: new Date(),
      lastScore: performanceData.overallScore || 0,
      totalInterviewsCompleted: 1 // This will be incremented
    };
    
    await db.collection('user_statistics').updateOne(
      { userId },
      { 
        $set: stats,
        $inc: { totalInterviewsCompleted: 1 }
      },
      { upsert: true }
    );
  } catch (error) {
    console.error('Error updating user statistics:', error);
  }
}