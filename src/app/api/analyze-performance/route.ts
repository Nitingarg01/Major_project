import { NextRequest, NextResponse } from 'next/server';
import { hybridAIService } from '@/lib/hybridAIService';
import client from '@/lib/db';
import { ObjectId } from 'mongodb';

export async function POST(request: NextRequest) {
  try {
    console.log('📊 Enhanced Performance Analysis API called');
    
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

    // Get questions for this interview
    const questionsDoc = await db.collection('questions').findOne({
      interviewId: interviewId
    });

    if (!questionsDoc || !questionsDoc.questions) {
      return NextResponse.json(
        { error: 'Interview questions not found' },
        { status: 404 }
      );
    }

    const questions = questionsDoc.questions;
    const responses = interview.responses || [];

    console.log(`🚀 Analyzing overall performance for ${interview.companyName} - ${interview.jobTitle}`);
    console.log(`📝 Questions: ${questions.length}, Responses: ${responses.length}`);

    // Extract answers in the same order as questions
    const answers = questions.map((question: any) => {
      const response = responses.find((r: any) => r.questionId === question.id);
      return response?.userAnswer || 'No answer provided';
    });

    // Analyze overall performance using hybrid AI service
    const performanceAnalysis = await hybridAIService.analyzeOverallPerformance(
      questions,
      answers,
      interview.jobTitle,
      interview.companyName,
      interview.skills || []
    );

    console.log(`✅ Performance analyzed - Overall Score: ${performanceAnalysis.overallScore}/10`);

    // Calculate additional metrics
    const responseScores = responses
      .map((r: any) => r.analysis?.score || 0)
      .filter((score: number) => score > 0);

    const categoryScores = calculateCategoryScores(questions, responses);
    const timingAnalysis = analyzeResponseTiming(responses);
    const progressTracking = await getProgressTracking(db, interview.userId, interview.companyName);

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
        analyzedAt: new Date()
      },
      detailedScores: {
        categoryBreakdown: categoryScores,
        responseMetrics: {
          averageScore: responseScores.length > 0 
            ? Math.round(responseScores.reduce((sum, score) => sum + score, 0) / responseScores.length * 10) / 10 
            : 0,
          highestScore: responseScores.length > 0 ? Math.max(...responseScores) : 0,
          lowestScore: responseScores.length > 0 ? Math.min(...responseScores) : 0,
          totalResponses: responseScores.length
        },
        timingAnalysis,
        progressTracking
      },
      aiProvider: 'hybrid',
      companySpecific: true
    };

    // Store performance analysis in database
    const performanceDoc = {
      interviewId,
      userId: interview.userId,
      companyName: interview.companyName,
      jobTitle: interview.jobTitle,
      performance: enhancedPerformance,
      createdAt: new Date(),
      aiProvider: 'hybrid'
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
          performanceAnalyzed: true
        } 
      }
    );

    // Get service health for response
    const serviceHealth = await hybridAIService.getServiceHealth();

    return NextResponse.json({
      success: true,
      performance: enhancedPerformance,
      serviceInfo: {
        primary: serviceHealth.primary,
        fallback: serviceHealth.fallback,
        companySpecific: true,
        enhancedAnalysis: true
      },
      message: 'Performance analyzed successfully with comprehensive company-specific insights'
    });

  } catch (error: any) {
    console.error('❌ Error analyzing performance:', error);
    
    return NextResponse.json(
      {
        error: 'Failed to analyze performance',
        details: error.message,
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}

// GET endpoint for retrieving performance analysis
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const interviewId = searchParams.get('interviewId');

    if (!interviewId) {
      return NextResponse.json(
        { error: 'Interview ID is required' },
        { status: 400 }
      );
    }

    const db = client.db();
    
    // Get performance analysis
    const performanceDoc = await db.collection('performance_analysis').findOne({
      interviewId
    });
    
    if (!performanceDoc) {
      return NextResponse.json(
        { error: 'Performance analysis not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      performance: performanceDoc.performance,
      metadata: {
        analyzedAt: performanceDoc.createdAt,
        company: performanceDoc.companyName,
        jobTitle: performanceDoc.jobTitle
      }
    });

  } catch (error: any) {
    console.error('❌ Error getting performance analysis:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch performance analysis',
        details: error.message
      },
      { status: 500 }
    );
  }
}

// Helper methods (these would be class methods if this were a class)
const calculateCategoryScores = (questions: any[], responses: any[]) => {
  const categoryScores: {[key: string]: {total: number, count: number, average: number}} = {};
  
  questions.forEach((question: any) => {
    const response = responses.find((r: any) => r.questionId === question.id);
    const score = response?.analysis?.score || 0;
    const category = question.category || 'general';
    
    if (!categoryScores[category]) {
      categoryScores[category] = { total: 0, count: 0, average: 0 };
    }
    
    if (score > 0) {
      categoryScores[category].total += score;
      categoryScores[category].count += 1;
      categoryScores[category].average = Math.round(
        (categoryScores[category].total / categoryScores[category].count) * 10
      ) / 10;
    }
  });
  
  return categoryScores;
};

const analyzeResponseTiming = (responses: any[]) => {
  const timings = responses
    .map((r: any) => r.responseTime || 300) // Default 5 minutes if not tracked
    .filter((time: number) => time > 0);
  
  if (timings.length === 0) {
    return {
      averageTime: 0,
      totalTime: 0,
      fastestResponse: 0,
      slowestResponse: 0
    };
  }
  
  return {
    averageTime: Math.round(timings.reduce((sum, time) => sum + time, 0) / timings.length),
    totalTime: timings.reduce((sum, time) => sum + time, 0),
    fastestResponse: Math.min(...timings),
    slowestResponse: Math.max(...timings)
  };
};

const getProgressTracking = async (db: any, userId: string, companyName: string) => {
  try {
    // Get user's previous interviews for progress tracking
    const previousInterviews = await db.collection('performance_analysis')
      .find({ 
        userId,
        companyName: { $regex: companyName, $options: 'i' }
      })
      .sort({ createdAt: -1 })
      .limit(5)
      .toArray();
    
    const scores = previousInterviews.map((interview: any) => 
      interview.performance?.overallScore || 0
    );
    
    return {
      previousAttempts: previousInterviews.length,
      scoreHistory: scores,
      improvementTrend: scores.length > 1 ? 
        ((scores[0] - scores[scores.length - 1]) > 0 ? 'improving' : 'stable') 
        : 'first_attempt',
      bestScore: scores.length > 0 ? Math.max(...scores) : 0
    };
  } catch (error) {
    console.error('Error getting progress tracking:', error);
    return {
      previousAttempts: 0,
      scoreHistory: [],
      improvementTrend: 'first_attempt',
      bestScore: 0
    };
  }
};