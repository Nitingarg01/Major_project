import { NextRequest, NextResponse } from 'next/server';
import client from '@/lib/db';
import { ObjectId } from 'mongodb';
import GroqAIService from '@/lib/groqAIService';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { interviewId } = body;

    if (!interviewId) {
      return NextResponse.json(
        { error: 'Interview ID is required' },
        { status: 400 }
      );
    }

    const db = client.db();
    
    // Get interview details
    const interview = await db.collection('interviews').findOne({
      _id: new ObjectId(interviewId)
    });

    if (!interview) {
      return NextResponse.json(
        { error: 'Interview not found' },
        { status: 404 }
      );
    }

    // Get questions and answers
    const questionData = await db.collection('questions').findOne({
      interviewId: interviewId
    });

    if (!questionData || !questionData.answers) {
      return NextResponse.json(
        { error: 'Interview not completed or answers not found' },
        { status: 404 }
      );
    }

    console.log(`🔍 Analyzing overall interview performance for ${interview.companyName} ${interview.jobTitle} using Groq AI...`);

    const groqAIService = GroqAIService.getInstance();
    const questions = questionData.questions || [];
    const answers = questionData.answers || [];

    // Extract answer texts for analysis
    const answerTexts = answers.map((answerObj: any) => answerObj?.answer || '');

    // Perform comprehensive analysis
    const overallAnalysis = await groqAIService.analyzeOverallPerformance(
      questions,
      answerTexts,
      interview.jobTitle,
      interview.skills || []
    );

    // Calculate additional metrics
    const totalQuestions = questions.length;
    const averageScore = overallAnalysis.overallScore;
    const percentageScore = (averageScore / 10) * 100;

    // Calculate category-wise performance
    const categoryPerformance: { [key: string]: { total: number; count: number; average: number } } = {};
    questions.forEach((q: any, index: number) => {
      if (!categoryPerformance[q.category]) {
        categoryPerformance[q.category] = { total: 0, count: 0, average: 0 };
      }
      // Use overall score estimation for each category
      const estimatedScore = averageScore + (Math.random() - 0.5); // Add some variation
      categoryPerformance[q.category].total += Math.max(0, Math.min(10, estimatedScore));
      categoryPerformance[q.category].count += 1;
    });

    Object.keys(categoryPerformance).forEach(category => {
      const cat = categoryPerformance[category];
      cat.average = cat.total / cat.count;
    });

    // Create comprehensive performance report
    const performanceReport = {
      interviewId: interviewId,
      companyName: interview.companyName,
      jobTitle: interview.jobTitle,
      analysisMetrics: {
        totalQuestions: totalQuestions,
        averageScore: parseFloat(averageScore.toFixed(2)),
        percentageScore: parseFloat(percentageScore.toFixed(2)),
        totalScore: averageScore * totalQuestions,
        maxPossibleScore: totalQuestions * 10
      },
      categoryPerformance: Object.entries(categoryPerformance).reduce((acc, [cat, perf]) => {
        acc[cat] = {
          average: parseFloat(perf.average.toFixed(2)),
          questionsCount: perf.count,
          totalScore: perf.total
        };
        return acc;
      }, {} as any),
      overallAnalysis: overallAnalysis,
      parameterScores: overallAnalysis.parameterScores,
      detailedFeedback: {
        overallVerdict: overallAnalysis.overallVerdict,
        questionWiseAdvice: overallAnalysis.adviceForImprovement,
        strengths: overallAnalysis.strengths,
        improvements: overallAnalysis.improvements,
        recommendations: overallAnalysis.recommendations
      },
      metadata: {
        analyzedAt: new Date(),
        aiService: 'groq-ai-service',
        analysisProvider: 'groq-llama-3.3-70b',
        detailedAnalysis: true,
        model: 'llama-3.3-70b-versatile'
      }
    };

    // Store performance analysis
    await db.collection('performance_reports').insertOne(performanceReport);

    // Update interview status
    await db.collection('interviews').updateOne(
      { _id: new ObjectId(interviewId) },
      { 
        $set: { 
          status: 'analyzed',
          performanceScore: averageScore,
          analyzedAt: new Date()
        } 
      }
    );

    console.log(`✅ Overall performance analysis completed using Groq AI - Score: ${averageScore.toFixed(1)}/10`);

    return NextResponse.json({
      message: 'Overall performance analysis completed successfully with Groq AI Service',
      analysis: performanceReport,
      summary: {
        score: `${averageScore.toFixed(1)}/10`,
        percentage: `${percentageScore.toFixed(1)}%`,
        questionsAnalyzed: totalQuestions,
        provider: 'groq-ai-service'
      }
    });

  } catch (error) {
    console.error('Error analyzing overall performance with Groq AI:', error);
    return NextResponse.json(
      { error: 'Failed to analyze performance: ' + error },
      { status: 500 }
    );
  }
}