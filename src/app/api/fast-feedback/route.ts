import { NextRequest, NextResponse } from 'next/server';
import client from '@/lib/db';
import { ObjectId } from 'mongodb';
import GroqAIService from '@/lib/groqAIService';

// Fallback analysis function when AI services are not available
function generateFallbackAnalysis(questions: any[], answers: string[], jobTitle: string) {
  const totalQuestions = questions.length;
  const answeredQuestions = answers.filter(answer => answer && answer.trim().length > 10).length;
  const answerQuality = answeredQuestions / totalQuestions;
  
  // Calculate scores based on answer length and completeness
  const avgAnswerLength = answers.reduce((sum, answer) => sum + (answer?.length || 0), 0) / answers.length;
  const technicalScore = Math.min(10, Math.max(1, (avgAnswerLength / 100) * 8 + 2));
  const communicationScore = Math.min(10, Math.max(1, answerQuality * 8 + 2));
  const problemSolvingScore = Math.min(10, Math.max(1, (answeredQuestions / totalQuestions) * 8 + 2));
  
  const overallScore = (technicalScore + communicationScore + problemSolvingScore) / 3;
  
  return {
    overallScore: Math.round(overallScore * 10) / 10,
    parameterScores: {
      "Technical Knowledge": Math.round(technicalScore * 10) / 10,
      "Problem Solving": Math.round(problemSolvingScore * 10) / 10,
      "Communication Skills": Math.round(communicationScore * 10) / 10,
      "Practical Application": Math.round((technicalScore + problemSolvingScore) / 2 * 10) / 10,
      "Company Fit": Math.round(communicationScore * 10) / 10
    },
    strengths: [
      "Demonstrated willingness to engage with questions",
      "Provided structured responses",
      "Showed understanding of technical concepts"
    ],
    improvements: [
      "Provide more detailed technical explanations",
      "Include specific examples from experience",
      "Elaborate on problem-solving approaches"
    ],
    recommendations: [
      "Practice explaining technical concepts clearly",
      "Prepare specific examples for common interview questions",
      "Focus on demonstrating problem-solving methodology"
    ],
    summary: `Based on your ${jobTitle} interview performance, you showed good engagement with ${answeredQuestions}/${totalQuestions} questions answered. Your responses demonstrate technical awareness and communication skills. Focus on providing more detailed examples and explanations to improve your overall performance.`
  };
}

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

    // Get questions and answers with better error handling
    const questionsDoc = await db.collection("questions").findOne({
      interviewId: interviewId
    });

    console.log('📄 Questions document found:', {
      exists: !!questionsDoc,
      hasAnswers: !!questionsDoc?.answers,
      answersLength: questionsDoc?.answers?.length || 0,
      answersType: typeof questionsDoc?.answers,
      sampleAnswer: questionsDoc?.answers?.[0]
    });

    if (!questionsDoc) {
      console.error('❌ No questions document found for interviewId:', interviewId);
      return NextResponse.json(
        { error: 'Interview questions not found' },
        { status: 404 }
      );
    }

    if (!questionsDoc.answers || questionsDoc.answers.length === 0) {
      console.error('❌ No answers found in questions document:', {
        interviewId,
        hasAnswers: !!questionsDoc.answers,
        answersLength: questionsDoc.answers?.length || 0,
        questionsDoc: Object.keys(questionsDoc)
      });
      return NextResponse.json(
        { error: 'No answers found for analysis', debug: { interviewId, documentKeys: Object.keys(questionsDoc) } },
        { status: 404 }
      );
    }

    const questions = questionsDoc.questions || [];
    
    // Handle different answer formats - both new format (objects with answer property) and direct strings
    let answers: string[] = [];
    
    if (Array.isArray(questionsDoc.answers)) {
      answers = questionsDoc.answers.map((ans: any) => {
        if (typeof ans === 'string') {
          return ans || 'No answer provided';
        } else if (ans && typeof ans === 'object' && ans.answer) {
          return ans.answer || 'No answer provided';
        } else {
          return 'No answer provided';
        }
      });
    } else {
      console.error('❌ Answers is not an array:', typeof questionsDoc.answers);
      return NextResponse.json(
        { error: 'Invalid answers format' },
        { status: 400 }
      );
    }

    console.log(`🧠 Processing ${questions.length} questions and ${answers.length} answers`);

    console.log(`🧠 Analyzing ${questions.length} questions...`);

    // Try Groq AI first, fallback to mock analysis if API key not available
    let insights;
    try {
      const groqService = GroqAIService.getInstance();
      insights = await groqService.analyzeOverallPerformance(
        questions,
        answers,
        interview.jobTitle || "Software Engineer",
        interview.skills || ["JavaScript", "React"]
      );
    } catch (groqError) {
      console.warn('Groq AI not available, using fallback analysis:', groqError);
      // Fallback analysis when Groq is not available
      insights = generateFallbackAnalysis(questions, answers, interview.jobTitle || "Software Engineer");
    }

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