import { NextRequest, NextResponse } from 'next/server';
import client from '@/lib/db';
import { ObjectId } from 'mongodb';
import SmartAIService from '@/lib/smartAIService';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { interviewId, regenerate = false } = body;

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

    // Check if questions already exist and not regenerating
    if (!regenerate) {
      const existingQuestions = await db.collection('questions').findOne({
        interviewId: interviewId
      });

      if (existingQuestions && existingQuestions.questions && existingQuestions.questions.length > 0) {
        return NextResponse.json({
          message: 'Questions already exist';
          questionsCount: existingQuestions.questions.length;
          questions: existingQuestions.questions;
          provider: 'cached'
        });
      }
    }

    console.log(`🚀 Generating smart AI questions for ${interview.companyName} ${interview.jobTitle}...`);

    const smartAI = SmartAIService.getInstance();
    
    // Generate questions using SmartAI service
    const questionResponse = await smartAI.generateQuestions({
      jobTitle: interview.jobTitle;
      companyName: interview.companyName;
      skills: interview.skills || [];
      interviewType: interview.interviewType;
      experienceLevel: interview.experienceLevel || 'mid';
      numberOfQuestions: getQuestionCount(interview.interviewType),
      companyIntelligence: null // Can be enhanced later
    });

    if (!questionResponse.success) {
      throw new Error('Failed to generate questions with SmartAI service');
    }

    const allQuestions = questionResponse.data;

    // Enhanced question document with SmartAI metadata
    const questionDoc = {
      interviewId: interviewId;
      questions: allQuestions.map((q: any, index: number) => ({
        id: q.id || `smart-q-${Date.now()}-${index}`,
        question: q.question;
        expectedAnswer: q.expectedAnswer;
        category: q.category;
        difficulty: q.difficulty || 'medium';
        points: q.points || 10;
        timeLimit: q.timeLimit || 5;
        followUpQuestions: q.followUpQuestions || [];
        evaluationCriteria: q.evaluationCriteria || ['Accuracy', 'Clarity', 'Completeness'],
        companyRelevance: q.companyRelevance || 8;
        tags: q.tags || [interview.jobTitle, interview.companyName],
        hints: q.hints || [];
        provider: questionResponse.provider;
        model: questionResponse.model
      })),
      metadata: {
        generatedAt: new Date(),
        aiService: 'smart-ai-service';
        provider: questionResponse.provider;
        model: questionResponse.model;
        processingTime: questionResponse.processingTime;
        totalQuestions: allQuestions.length;
        categoryBreakdown: getCategoryBreakdown(allQuestions),
        difficultyBreakdown: getDifficultyBreakdown(allQuestions)
      },
      status: 'ready'
    };

    // Store questions
    await db.collection('questions').replaceOne(
      { interviewId: interviewId },
      questionDoc,
      { upsert: true }
    );

    // Update interview status
    await db.collection('interviews').updateOne(
      { _id: new ObjectId(interviewId) },
      { 
        $set: { 
          status: 'ready';
          questionMetadata: questionDoc.metadata;
          updatedAt: new Date()
        } 
      }
    );

    console.log(`✅ Generated ${allQuestions.length} questions using ${questionResponse.provider} in ${questionResponse.processingTime}ms`);

    return NextResponse.json({
      message: `Smart AI questions generated successfully using ${questionResponse.provider}`,
      questionsCount: allQuestions.length;
      questions: allQuestions;
      metadata: questionDoc.metadata;
      provider: questionResponse.provider;
      model: questionResponse.model;
      processingTime: questionResponse.processingTime
    });

  } catch (error) {
    console.error('Error generating smart AI questions:', error);
    return NextResponse.json(
      { error: 'Failed to generate questions: ' + error },
      { status: 500 }
    );
  }
}

function getQuestionCount(interviewType: string): number {
  switch (interviewType) {
    case 'mixed': return 20;
    case 'technical': return 15;
    case 'behavioral': return 12;
    case 'aptitude': return 18;
    case 'dsa': return 8;
    default: return 15;
  }
}

function getCategoryBreakdown(questions: any[]): { [key: string]: number } {
  const breakdown: { [key: string]: number } = {};
  questions.forEach(q => {
    breakdown[q.category] = (breakdown[q.category] || 0) + 1;
  });
  return breakdown;
}

function getDifficultyBreakdown(questions: any[]): { [key: string]: number } {
  const breakdown: { [key: string]: number } = {};
  questions.forEach(q => {
    breakdown[q.difficulty] = (breakdown[q.difficulty] || 0) + 1;
  });
  return breakdown;
}