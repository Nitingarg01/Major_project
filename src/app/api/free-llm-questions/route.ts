import { NextRequest, NextResponse } from 'next/server';
import client from '@/lib/db';
import { ObjectId } from 'mongodb';
import FreeLLMService from '@/lib/freeLLMService';
import EnhancedCompanyIntelligenceService from '@/lib/enhancedCompanyIntelligence';

// Helper function to validate ObjectId
function isValidObjectId(id: string): boolean {
  return /^[0-9a-fA-F]{24}$/.test(id);
}

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

    // Validate ObjectId format
    if (!isValidObjectId(interviewId)) {
      return NextResponse.json(
        { error: 'Invalid interview ID format. Must be a valid MongoDB ObjectId.' },
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
          message: 'Questions already exist',
          questionsCount: existingQuestions.questions.length,
          questions: existingQuestions.questions,
          provider: 'cached'
        });
      }
    }

    console.log(`🚀 Generating HARD questions for ${interview.companyName} ${interview.jobTitle} using FREE LLMs...`);

    const freeLLMService = FreeLLMService.getInstance();
    const companyIntelligence = EnhancedCompanyIntelligenceService.getInstance();
    
    // Get enhanced company intelligence with recent news and posts
    const enhancedCompanyData = await companyIntelligence.getEnhancedCompanyIntelligence(;
      interview.companyName,
      interview.jobTitle
    );

    console.log(`📊 Company intelligence gathered for ${interview.companyName}`);
    
    // Generate enhanced HARD questions based on interview type
    let allQuestions: any[] = [],
    
    if (interview.interviewType === 'mixed') {
      console.log('🔄 Generating comprehensive mixed interview questions with HIGH DIFFICULTY...');
      
      // Technical Questions (40%) - Enhanced with company context and HARD difficulty
      const technicalQuestions = await freeLLMService.generateHardInterviewQuestions({
        jobTitle: interview.jobTitle,
        companyName: interview.companyName,
        skills: interview.skills || [],
        interviewType: 'technical',
        experienceLevel: interview.experienceLevel || 'mid',
        numberOfQuestions: 10,
        companyIntelligence: enhancedCompanyData?.company_data,
        difficultyLevel: 'hard' // Force hard difficulty
      });

      // Behavioral Questions (30%) - Company culture focused with challenging scenarios
      const behavioralQuestions = await freeLLMService.generateHardInterviewQuestions({
        jobTitle: interview.jobTitle,
        companyName: interview.companyName,
        skills: interview.skills || [],
        interviewType: 'behavioral',
        experienceLevel: interview.experienceLevel || 'mid',
        numberOfQuestions: 8,
        companyIntelligence: enhancedCompanyData?.company_data,
        difficultyLevel: 'hard' // Force hard difficulty
      });

      // DSA Problems (30%) - Company-specific HARD difficulty
      const dsaProblems = await freeLLMService.generateHardDSAProblems(;
        interview.companyName,
        'hard', // Force hard difficulty regardless of experience
        8,
        enhancedCompanyData?.company_data
      );

      allQuestions = [
        ...technicalQuestions,
        ...behavioralQuestions,
        ...dsaProblems.map(p => ({
          id: p.id,
          question: p.title,
          expectedAnswer: p.description,
          category: 'dsa',
          difficulty: 'hard', // Force hard
          points: getDSAPoints('hard'),
          problemData: p,
          provider: p.provider,
          model: p.model
        }))
      ];
    } else if (interview.interviewType === 'dsa') {
      console.log('💻 Generating DSA-focused HARD interview questions...');
      const dsaProblems = await freeLLMService.generateHardDSAProblems(;
        interview.companyName,
        'hard', // Always hard for DSA
        10,
        enhancedCompanyData?.company_data
      );

      allQuestions = dsaProblems.map(p => ({
        id: p.id,
        question: p.title,
        expectedAnswer: p.description,
        category: 'dsa',
        difficulty: 'hard',
        points: getDSAPoints('hard'),
        problemData: p,
        provider: p.provider,
        model: p.model
      }));
    } else {
      console.log(`🎯 Generating HARD ${interview.interviewType} interview questions...`);
      allQuestions = await freeLLMService.generateHardInterviewQuestions({
        jobTitle: interview.jobTitle,
        companyName: interview.companyName,
        skills: interview.skills || [],
        interviewType: interview.interviewType,
        experienceLevel: interview.experienceLevel || 'mid',
        numberOfQuestions: getQuestionCount(interview.interviewType),
        companyIntelligence: enhancedCompanyData?.company_data,
        difficultyLevel: 'hard' // Force hard difficulty
      });
    }

    // Enhanced question document with company intelligence
    const questionDoc = {
      interviewId: interviewId,
      questions: allQuestions.map(q => ({
        id: q.id,
        question: q.question,
        expectedAnswer: q.expectedAnswer,
        category: q.category,
        difficulty: q.difficulty || 'hard', // Default to hard
        points: q.points,
        timeLimit: q.timeLimit,
        followUpQuestions: q.followUpQuestions || [],
        evaluationCriteria: q.evaluationCriteria || [],
        companyRelevance: q.companyRelevance || 9, // Higher relevance for hard questions
        tags: q.tags || [],
        hints: q.hints || [],
        problemData: q.problemData || null,
        provider: q.provider || 'fallback',
        model: q.model || 'mock'
      })),
      companyIntelligence: enhancedCompanyData ? {
        industry: enhancedCompanyData.company_data.industry,
        tech_stack: enhancedCompanyData.company_data.tech_stack,
        culture: enhancedCompanyData.company_data.culture,
        recent_news: enhancedCompanyData.company_data.recent_news,
        recent_posts: enhancedCompanyData.company_data.recent_posts.slice(0, 3),
        difficulty: 'hard', // Always mark as hard
        focus_areas: enhancedCompanyData.company_data.focus_areas
      } : null,
      metadata: {
        generatedAt: new Date(),
        aiService: 'free-llm-service',
        totalQuestions: allQuestions.length,
        categoryBreakdown: getCategoryBreakdown(allQuestions),
        difficultyBreakdown: getDifficultyBreakdown(allQuestions),
        providerBreakdown: getProviderBreakdown(allQuestions),
        companyIntelligenceUsed: !!enhancedCompanyData,
        difficultyLevel: 'hard' // Mark all questions as hard
      },
      status: 'ready'
    };

    // Store or update questions
    await db.collection('questions').replaceOne(
      { interviewId: interviewId },
      questionDoc,
      { upsert: true }
    );

    // Update interview status with enhanced metadata
    await db.collection('interviews').updateOne(
      { _id: new ObjectId(interviewId) },
      { 
        $set: { 
          status: 'ready',
          questionMetadata: questionDoc.metadata,
          companyIntelligence: questionDoc.companyIntelligence,
          updatedAt: new Date()
        } 
      }
    );

    console.log(`✅ Generated ${allQuestions.length} HARD enhanced questions using FREE LLMs`);

    return NextResponse.json({
      message: 'Enhanced HARD questions generated successfully with FREE LLM Services',
      questionsCount: allQuestions.length,
      questions: allQuestions,
      metadata: questionDoc.metadata,
      companyIntelligence: questionDoc.companyIntelligence,
      breakdown: {
        categories: getCategoryBreakdown(allQuestions),
        difficulties: getDifficultyBreakdown(allQuestions),
        providers: getProviderBreakdown(allQuestions)
      },
      difficultyLevel: 'HARD'
    });

  } catch (error) {
    console.error('Error generating questions with free LLMs:', error);
    return NextResponse.json(
      { error: 'Failed to generate questions: ' + error },
      { status: 500 }
    );
  }
}

// Helper functions
function getQuestionCount(interviewType: string): number {
  switch (interviewType) {
    case 'mixed': return 25; // Increased for more challenge
    case 'technical': return 18; // Increased
    case 'behavioral': return 15; // Increased
    case 'aptitude': return 20; // Increased
    case 'dsa': return 10; // Increased
    default: return 18;
  }
}

function getDSAPoints(difficulty: string): number {
  switch (difficulty) {
    case 'easy': return 20; // Increased points
    case 'medium': return 35; // Increased points
    case 'hard': return 50; // Increased points for hard questions
    default: return 35;
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

function getProviderBreakdown(questions: any[]): { [key: string]: number } {
  const breakdown: { [key: string]: number } = {};
  questions.forEach(q => {
    const provider = q.provider || 'fallback';
    breakdown[provider] = (breakdown[provider] || 0) + 1;
  });
  return breakdown;
}