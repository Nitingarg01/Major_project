import { NextRequest, NextResponse } from 'next/server';
import client from '@/lib/db';
import { ObjectId } from 'mongodb';
import { OptimizedFeedbackService } from '@/lib/optimizedFeedbackService';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { interviewId, mode = 'fast' } = body;

    if (!interviewId) {
      return NextResponse.json(
        { error: 'Interview ID is required' },
        { status: 400 }
      );
    }

    console.log(`⚡ Generating optimized feedback for interview ${interviewId}...`);

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

    const feedbackService = OptimizedFeedbackService.getInstance();
    const questions = questionData.questions || [];
    const answers = questionData.answers || [];

    // Generate fast feedback
    const startTime = Date.now();
    
    let analysis;
    if (mode === 'individual') {
      // Generate individual question feedback
      const individualFeedback = [];
      for (let i = 0; i < Math.min(questions.length, answers.length, 5); i++) {
        const questionFeedback = await feedbackService.generateQuickFeedback(
          questions[i].question,
          answers[i]?.answer || '',
          questions[i].category,
          interview.companyName
        );
        individualFeedback.push({
          questionIndex: i,
          ...questionFeedback
        });
      }
      
      analysis = {
        type: 'individual',
        feedback: individualFeedback,
        processingTime: Date.now() - startTime
      };
    } else {
      // Generate overall analysis
      const answerTexts = answers.map((answerObj: any) => answerObj?.answer || '');
      analysis = await feedbackService.generateFastOverallAnalysis(
        questions,
        answerTexts,
        interview.companyName,
        interview.jobTitle
      );
      
      analysis.processingTime = Date.now() - startTime;
    }

    // Calculate simple performance metrics
    const metrics = feedbackService.calculatePerformanceMetrics(
      questions,
      answers.map((a: any) => a?.answer || ''),
      0 // timeSpent not available here
    );

    // Create comprehensive but fast report
    const performanceReport = {
      interviewId: interviewId,
      companyName: interview.companyName,
      jobTitle: interview.jobTitle,
      mode: mode,
      processingTime: analysis.processingTime,
      analysisMetrics: {
        totalQuestions: questions.length,
        averageScore: analysis.overallScore || metrics.overallScore,
        percentageScore: ((analysis.overallScore || metrics.overallScore) / 10) * 100,
        completionRate: metrics.completionRate
      },
      categoryPerformance: analysis.parameterScores || metrics.categoryScores,
      quickAnalysis: {
        overallVerdict: analysis.overallVerdict || `Interview completed with ${metrics.completionRate}% completion rate`,
        strengths: analysis.strengths || ['Completed all questions'],
        improvements: analysis.improvements || ['Continue practicing'],
        recommendations: analysis.recommendations || ['Keep improving']
      },
      metadata: {
        analyzedAt: new Date(),
        aiService: 'optimized-feedback-service',
        analysisProvider: 'groq-llama-3.1-70b',
        fastMode: true,
        model: 'llama-3.1-70b-versatile',
        processingTimeMs: analysis.processingTime
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
          performanceScore: analysis.overallScore || metrics.overallScore,
          analyzedAt: new Date(),
          fastAnalysis: true
        } 
      }
    );

    console.log(`✅ Fast feedback completed in ${analysis.processingTime}ms`);

    return NextResponse.json({
      message: 'Fast feedback analysis completed successfully',
      analysis: performanceReport,
      summary: {
        score: `${(analysis.overallScore || metrics.overallScore).toFixed(1)}/10`,
        percentage: `${(((analysis.overallScore || metrics.overallScore) / 10) * 100).toFixed(1)}%`,
        questionsAnalyzed: questions.length,
        provider: 'optimized-groq',
        processingTime: `${analysis.processingTime}ms`,
        mode: mode
      }
    });

  } catch (error) {
    console.error('Error generating optimized feedback:', error);
    return NextResponse.json(
      { error: 'Failed to generate feedback: ' + error },
      { status: 500 }
    );
  }
}