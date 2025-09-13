import { NextRequest, NextResponse } from 'next/server';
import client from '@/lib/db';
import { ObjectId } from 'mongodb';
import GroqAIService from '@/lib/groqAIService';
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

    console.log(`🚀 Generating questions for ${interview.companyName} ${interview.jobTitle} using Groq AI...`);

    const groqAIService = GroqAIService.getInstance();
    const companyIntelligence = EnhancedCompanyIntelligenceService.getInstance();
    
    // Get enhanced company intelligence
    const enhancedCompanyData = await companyIntelligence.getEnhancedCompanyIntelligence(
      interview.companyName,
      interview.jobTitle
    );

    console.log(`📊 Company intelligence gathered for ${interview.companyName}`);
    
    // Generate questions based on interview type
    let allQuestions: any[] = [];
    
    if (interview.interviewType === 'mixed') {
      console.log('🔄 Generating comprehensive mixed interview questions...');
      
      // Technical Questions (40%)
      const technicalQuestions = await groqAIService.generateInterviewQuestions({
        jobTitle: interview.jobTitle,
        companyName: interview.companyName,
        skills: interview.skills || [],
        interviewType: 'technical',
        experienceLevel: interview.experienceLevel || 'mid',
        numberOfQuestions: 8,
        companyIntelligence: enhancedCompanyData?.company_data
      });

      // Behavioral Questions (30%)
      const behavioralQuestions = await groqAIService.generateInterviewQuestions({
        jobTitle: interview.jobTitle,
        companyName: interview.companyName,
        skills: interview.skills || [],
        interviewType: 'behavioral',
        experienceLevel: interview.experienceLevel || 'mid',
        numberOfQuestions: 6,
        companyIntelligence: enhancedCompanyData?.company_data
      });

      // DSA Problems (30%)
      const dsaProblems = await groqAIService.generateDSAProblems(
        interview.companyName,
        getDSADifficulty(interview.experienceLevel),
        6,
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
          difficulty: p.difficulty,
          points: getDSAPoints(p.difficulty),
          problemData: p,
          provider: 'groq',
          model: 'llama-3.3-70b-versatile'
        }))
      ];
    } else if (interview.interviewType === 'dsa') {
      console.log('💻 Generating DSA-focused interview questions...');
      const dsaProblems = await groqAIService.generateDSAProblems(
        interview.companyName,
        getDSADifficulty(interview.experienceLevel),
        8,
        enhancedCompanyData?.company_data
      );

      allQuestions = dsaProblems.map(p => ({
        id: p.id,
        question: p.title,
        expectedAnswer: p.description,
        category: 'dsa',
        difficulty: p.difficulty,
        points: getDSAPoints(p.difficulty),
        problemData: p,
        provider: 'groq',
        model: 'llama-3.3-70b-versatile'
      }));
    } else {
      console.log(`🎯 Generating ${interview.interviewType} interview questions...`);
      allQuestions = await emergentLLMService.generateInterviewQuestions({
        jobTitle: interview.jobTitle,
        companyName: interview.companyName,
        skills: interview.skills || [],
        interviewType: interview.interviewType as 'technical' | 'behavioral' | 'aptitude',
        experienceLevel: interview.experienceLevel || 'mid',
        numberOfQuestions: getQuestionCount(interview.interviewType),
        companyIntelligence: enhancedCompanyData?.company_data
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
        difficulty: q.difficulty,
        points: q.points,
        timeLimit: q.timeLimit,
        followUpQuestions: q.followUpQuestions || [],
        evaluationCriteria: q.evaluationCriteria || [],
        companyRelevance: q.companyRelevance || 8,
        tags: q.tags || [],
        hints: q.hints || [],
        problemData: q.problemData || null,
        provider: q.provider || 'emergent',
        model: q.model || 'gpt-4o-mini'
      })),
      companyIntelligence: enhancedCompanyData ? {
        industry: enhancedCompanyData.company_data.industry,
        tech_stack: enhancedCompanyData.company_data.tech_stack,
        culture: enhancedCompanyData.company_data.culture,
        recent_news: enhancedCompanyData.company_data.recent_news,
        recent_posts: enhancedCompanyData.company_data.recent_posts.slice(0, 3),
        difficulty: enhancedCompanyData.company_data.difficulty,
        focus_areas: enhancedCompanyData.company_data.focus_areas
      } : null,
      metadata: {
        generatedAt: new Date(),
        aiService: 'emergent-llm-service',
        totalQuestions: allQuestions.length,
        categoryBreakdown: getCategoryBreakdown(allQuestions),
        difficultyBreakdown: getDifficultyBreakdown(allQuestions),
        providerBreakdown: getProviderBreakdown(allQuestions),
        companyIntelligenceUsed: !!enhancedCompanyData
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

    console.log(`✅ Generated ${allQuestions.length} questions using Emergent LLM Service`);

    return NextResponse.json({
      message: 'Questions generated successfully with Emergent LLM Service',
      questionsCount: allQuestions.length,
      questions: allQuestions,
      metadata: questionDoc.metadata,
      companyIntelligence: questionDoc.companyIntelligence,
      breakdown: {
        categories: getCategoryBreakdown(allQuestions),
        difficulties: getDifficultyBreakdown(allQuestions),
        providers: getProviderBreakdown(allQuestions)
      }
    });

  } catch (error) {
    console.error('Error generating questions with Emergent LLM:', error);
    return NextResponse.json(
      { error: 'Failed to generate questions: ' + error },
      { status: 500 }
    );
  }
}

// Helper functions
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

function getDSADifficulty(experienceLevel: string): 'easy' | 'medium' | 'hard' {
  switch (experienceLevel) {
    case 'entry': return 'easy';
    case 'mid': return 'medium';
    case 'senior': return 'hard';
    default: return 'medium';
  }
}

function getDSAPoints(difficulty: string): number {
  switch (difficulty) {
    case 'easy': return 15;
    case 'medium': return 25;
    case 'hard': return 40;
    default: return 20;
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
    const provider = q.provider || 'emergent';
    breakdown[provider] = (breakdown[provider] || 0) + 1;
  });
  return breakdown;
}