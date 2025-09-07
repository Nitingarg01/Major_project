import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import OllamaService from '@/lib/ollamaService';

export async function POST(request: NextRequest) {
  try {
    console.log('🦙 Ollama Overall Performance Analysis API called');
    
    const body = await request.json();
    const { interviewId } = body;

    if (!interviewId) {
      return NextResponse.json(
        { error: 'Interview ID is required' },
        { status: 400 }
      );
    }

    // Connect to database
    const db = await connectDB();
    const interviewsCollection = db.collection('interviews');

    // Get complete interview data
    const interview = await interviewsCollection.findOne({ id: interviewId });
    
    if (!interview) {
      return NextResponse.json(
        { error: 'Interview not found' },
        { status: 404 }
      );
    }

    // Check if we have questions and responses
    if (!interview.questions || interview.questions.length === 0) {
      return NextResponse.json(
        { error: 'No questions found for this interview' },
        { status: 400 }
      );
    }

    if (!interview.responses || interview.responses.length === 0) {
      return NextResponse.json(
        { error: 'No responses found for this interview' },
        { status: 400 }
      );
    }

    console.log('🚀 Analyzing overall performance with Ollama...');
    
    // Initialize Ollama service
    const ollamaService = OllamaService.getInstance();
    
    // Check if Ollama is available
    const healthCheck = await ollamaService.healthCheck();
    if (!healthCheck.ollamaAvailable) {
      throw new Error('Ollama service is not available');
    }

    // Prepare data for analysis
    const questions = interview.questions;
    const responses = interview.responses;
    
    // Map responses to questions
    const answers = questions.map((question: any) => {
      const response = responses.find((r: any) => r.questionId === question.id);
      return response ? response.userAnswer : '';
    });

    // Analyze overall performance
    const performanceAnalysis = await ollamaService.analyzeOverallPerformance(
      questions,
      answers,
      interview.jobTitle,
      interview.companyName,
      interview.skills || []
    );

    // Calculate additional metrics
    const totalQuestions = questions.length;
    const answeredQuestions = answers.filter((answer: any) => answer.trim().length > 0).length;
    const completionRate = (answeredQuestions / totalQuestions) * 100;
    
    // Calculate average response analysis scores
    const analysisScores = responses
      .filter((r: any) => r.analysis && r.analysis.score)
      .map((r: any) => r.analysis.score);
    
    const averageScore = analysisScores.length > 0 
      ? analysisScores.reduce((sum: number, score: number) => sum + score, 0) / analysisScores.length
      : performanceAnalysis.overallScore;

    // Enhanced performance data
    const enhancedAnalysis = {
      ...performanceAnalysis,
      interviewMetrics: {
        totalQuestions,
        answeredQuestions,
        completionRate: Math.round(completionRate),
        averageResponseScore: Math.round(averageScore * 10) / 10,
        companyName: interview.companyName,
        jobTitle: interview.jobTitle,
        interviewType: interview.interviewType,
        experienceLevel: interview.experienceLevel
      },
      generatedAt: new Date(),
      provider: 'ollama',
      model: 'llama3.1:8b',
      companySpecific: true
    };

    // Update interview with performance analysis
    await interviewsCollection.updateOne(
      { id: interviewId },
      {
        $set: {
          performanceAnalysis: enhancedAnalysis,
          analyzed: true,
          lastUpdated: new Date()
        }
      }
    );

    console.log(`✅ Overall performance analyzed using Ollama - Score: ${performanceAnalysis.overallScore}/10`);

    return NextResponse.json({
      success: true,
      analysis: enhancedAnalysis,
      provider: 'ollama',
      model: 'llama3.1:8b',
      companySpecific: true,
      message: 'Overall performance analyzed with company-specific insights'
    });

  } catch (error: any) {
    console.error('❌ Error in Ollama overall performance analysis:', error);
    
    return NextResponse.json(
      {
        error: 'Failed to analyze overall performance with Ollama',
        details: error.message,
        fallback: 'Consider using the fallback analysis endpoint'
      },
      { status: 500 }
    );
  }
}

// GET endpoint for performance history
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

    // Connect to database
    const db = await connectDB();
    const interviewsCollection = db.collection('interviews');

    // Get interview performance analysis
    const interview = await interviewsCollection.findOne(
      { id: interviewId },
      { 
        projection: { 
          performanceAnalysis: 1, 
          companyName: 1, 
          jobTitle: 1,
          interviewType: 1,
          analyzed: 1
        } 
      }
    );
    
    if (!interview) {
      return NextResponse.json(
        { error: 'Interview not found' },
        { status: 404 }
      );
    }

    if (!interview.analyzed || !interview.performanceAnalysis) {
      return NextResponse.json(
        { error: 'Performance analysis not yet completed for this interview' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      analysis: interview.performanceAnalysis,
      companyName: interview.companyName,
      jobTitle: interview.jobTitle,
      interviewType: interview.interviewType
    });

  } catch (error: any) {
    console.error('❌ Error getting performance analysis:', error);
    return NextResponse.json(
      { error: 'Failed to fetch performance analysis' },
      { status: 500 }
    );
  }
}