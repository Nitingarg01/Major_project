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

    console.log('⚡ Fast feedback API called for interview:', interviewId);
    const startTime = Date.now();

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
    const questionsDoc = await db.collection("questions").findOne({
      interviewId: interviewId
    });

    if (!questionsDoc || !questionsDoc.answers || questionsDoc.answers.length === 0) {
      return NextResponse.json(
        { error: 'No answers found for analysis' },
        { status: 404 }
      );
    }

    const questions = questionsDoc.questions || [];
    const answers = questionsDoc.answers.map((ans: any) => ans.answer || 'No answer provided');

    console.log(`🧠 Analyzing ${questions.length} questions with Groq AI...`);

    // Use Groq AI for ultra-fast analysis
    const groqService = GroqAIService.getInstance();
    
    const insights = await groqService.analyzeOverallPerformance(
      questions,
      answers,
      interview.jobTitle || "Software Engineer",
      interview.skills || ["JavaScript", "React"]
    );

    // Enhance insights with metadata
    const enhancedInsights = {
      ...insights,
      overallScore: insights.overallScore || 6.5,
      parameterScores: insights.parameterScores || {
        "Technical Knowledge": 7,
        "Problem Solving": 6,
        "Communication Skills": 7,
        "Practical Application": 6,
        "Company Fit": 6
      },
      metadata: {
        analyzedAt: new Date(),
        aiProvider: 'groq',
        model: 'llama-3.3-70b-versatile',
        processingTime: Date.now() - startTime,
        interviewId: interviewId,
        companyName: interview.companyName,
        jobTitle: interview.jobTitle,
        questionsAnalyzed: questions.length,
        answersProcessed: answers.length
      }
    };

    // Store the analysis
    await db.collection("questions").findOneAndUpdate(
      { interviewId: interviewId },
      {
        $set: {
          extracted: enhancedInsights,
          analyzedAt: new Date(),
          aiProvider: 'groq-fast'
        }
      }
    );

    const processingTime = Date.now() - startTime;
    console.log(`✅ Fast feedback completed in ${processingTime}ms`);

    return NextResponse.json({
      success: true,
      message: 'Fast feedback generated successfully',
      insights: enhancedInsights,
      performance: {
        processingTime: processingTime,
        aiProvider: 'groq',
        model: 'llama-3.3-70b-versatile',
        questionsAnalyzed: questions.length
      }
    });

  } catch (error: any) {
    console.error('❌ Error in fast feedback generation:', error);
    
    return NextResponse.json(
      {
        error: 'Failed to generate feedback',
        details: error.message,
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}

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
    
    // Check if feedback already exists
    const questionsDoc = await db.collection("questions").findOne({
      interviewId: interviewId
    });

    if (questionsDoc?.extracted) {
      return NextResponse.json({
        success: true,
        feedbackReady: true,
        insights: questionsDoc.extracted,
        message: 'Feedback already available'
      });
    }

    return NextResponse.json({
      success: true,
      feedbackReady: false,
      message: 'Feedback not ready yet'
    });

  } catch (error: any) {
    console.error('❌ Error checking feedback status:', error);
    
    return NextResponse.json(
      { error: 'Failed to check feedback status', details: error.message },
      { status: 500 }
    );
  }
}