import { NextRequest, NextResponse } from 'next/server';
import { hybridAIService } from '@/lib/hybridAIService';
import client from '@/lib/db';
import { ObjectId } from 'mongodb';

export async function POST(request: NextRequest) {
  try {
    console.log('🎯 Enhanced Question Generation API called');
    
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

    console.log(`🚀 Generating questions for ${interview.companyName} - ${interview.jobTitle}`);

    // Get resume content if available
    let resumeContent = '';
    if (interview.projectContext?.length > 0 || interview.workExDetails?.length > 0) {
      resumeContent = `Projects: ${interview.projectContext?.join(', ') || 'None'}\nWork Experience: ${interview.workExDetails?.join(', ') || 'None'}`;
    }

    // Generate questions using hybrid AI service (Ollama + Gemini fallback)
    const questions = await hybridAIService.generateInterviewQuestions({
      jobTitle: interview.jobTitle,
      companyName: interview.companyName,
      skills: interview.skills || [],
      jobDescription: interview.jobDesc || '',
      experienceLevel: interview.experienceLevel || 'mid',
      interviewType: interview.interviewType || 'mixed',
      resumeContent: resumeContent || undefined,
      numberOfQuestions: getQuestionCount(interview.interviewType)
    });

    console.log(`✅ Generated ${questions.length} company-specific questions`);

    // Store questions in database with enhanced metadata
    const questionDoc = {
      interviewId: interviewId,
      questions: questions.map((q, index) => ({
        id: q.id,
        question: q.question,
        expectedAnswer: q.expectedAnswer,
        difficulty: q.difficulty,
        category: q.category,
        points: q.points,
        timeLimit: q.timeLimit || 5,
        evaluationCriteria: q.evaluationCriteria,
        tags: q.tags,
        hints: q.hints,
        companyRelevance: q.companyRelevance,
        order: index + 1,
        generatedAt: new Date()
      })),
      createdAt: new Date(),
      status: 'ready',
      aiProvider: 'hybrid', // Indicates hybrid approach was used
      companySpecific: true,
      questionCount: questions.length
    };

    // Check if questions already exist
    const existingQuestions = await db.collection('questions').findOne({
      interviewId: interviewId
    });

    if (existingQuestions) {
      // Update existing questions
      await db.collection('questions').updateOne(
        { interviewId: interviewId },
        { $set: questionDoc }
      );
    } else {
      // Insert new questions
      await db.collection('questions').insertOne(questionDoc);
    }

    // Update interview status
    await db.collection('interviews').updateOne(
      { _id: new ObjectId(interviewId) },
      { 
        $set: { 
          status: 'ready',
          questionsGenerated: true,
          questionProvider: 'hybrid',
          lastUpdated: new Date()
        } 
      }
    );

    // Get service health for response
    const serviceHealth = await hybridAIService.getServiceHealth();

    return NextResponse.json({
      success: true,
      message: 'Questions generated successfully with enhanced AI',
      questionsCount: questions.length,
      questions: questions,
      serviceInfo: {
        primary: serviceHealth.primary,
        fallback: serviceHealth.fallback,
        companySpecific: true,
        enhancedIntelligence: true
      },
      metadata: {
        company: interview.companyName,
        jobTitle: interview.jobTitle,
        experienceLevel: interview.experienceLevel,
        interviewType: interview.interviewType,
        generatedAt: new Date().toISOString()
      }
    });

  } catch (error: any) {
    console.error('❌ Error generating questions:', error);
    return NextResponse.json(
      { 
        error: 'Failed to generate questions',
        details: error.message,
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}

function getQuestionCount(interviewType: string): number {
  switch (interviewType) {
    case 'mixed': return 20;      // Comprehensive coverage
    case 'technical': return 15;  // Deep technical focus
    case 'behavioral': return 12; // Behavioral assessment  
    case 'aptitude': return 18;   // Aptitude challenges
    case 'dsa': return 14;        // Algorithm practice
    case 'system_design': return 8; // Complex system questions
    default: return 15;
  }
}