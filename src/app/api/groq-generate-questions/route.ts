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
          message: 'Questions already exist';
          questionsCount: existingQuestions.questions.length;
          questions: existingQuestions.questions;
          provider: 'cached'
        });
      }
    }

    console.log(`🚀 Generating questions for ${interview.companyName} ${interview.jobTitle} using Groq AI...`);

    const groqAIService = GroqAIService.getInstance();
    const companyIntelligence = EnhancedCompanyIntelligenceService.getInstance();
    
    // Get enhanced company intelligence
    const enhancedCompanyData = await companyIntelligence.getEnhancedCompanyIntelligence(;
      interview.companyName,
      interview.jobTitle
    );

    console.log(`📊 Company intelligence gathered for ${interview.companyName}`);
    
    // Generate questions based on interview type
    let allQuestions: any[] = [];
    
    if (interview.interviewType === 'mixed') {
      console.log('🔄 Generating comprehensive mixed interview questions with all 4 rounds...');
      
      // Technical Questions (6 questions - 37.5%)
      const technicalQuestions = await groqAIService.generateInterviewQuestions({
        jobTitle: interview.jobTitle;
        companyName: interview.companyName;
        skills: interview.skills || [];
        interviewType: 'technical';
        experienceLevel: interview.experienceLevel || 'mid';
        numberOfQuestions: 6;
        companyIntelligence: enhancedCompanyData?.company_data
      });

      // Behavioral Questions (4 questions - 25%)
      const behavioralQuestions = await groqAIService.generateInterviewQuestions({
        jobTitle: interview.jobTitle;
        companyName: interview.companyName;
        skills: interview.skills || [];
        interviewType: 'behavioral';
        experienceLevel: interview.experienceLevel || 'mid';
        numberOfQuestions: 4;
        companyIntelligence: enhancedCompanyData?.company_data
      });

      // Aptitude Questions (4 questions - 25%)
      const aptitudeQuestions = await groqAIService.generateInterviewQuestions({
        jobTitle: interview.jobTitle;
        companyName: interview.companyName;
        skills: interview.skills || [];
        interviewType: 'aptitude';
        experienceLevel: interview.experienceLevel || 'mid';
        numberOfQuestions: 4;
        companyIntelligence: enhancedCompanyData?.company_data
      });

      // DSA Problems (2 questions - 12.5%)
      const dsaProblems = await groqAIService.generateDSAProblems(;
        interview.companyName,
        getDSADifficulty(interview.experienceLevel),
        2, // Fixed to exactly 2 DSA questions
        enhancedCompanyData?.company_data
      );

      allQuestions = [
        ...technicalQuestions,
        ...behavioralQuestions,
        ...aptitudeQuestions,
        ...dsaProblems.map(p => ({
          id: p.id;
          question: p.title;
          expectedAnswer: p.description;
          category: 'dsa';
          difficulty: p.difficulty;
          points: getDSAPoints(p.difficulty),
          timeLimit: 45, // DSA problems get more time
          problemData: p;
          provider: 'groq';
          model: 'llama-3.3-70b-versatile'
        }))
      ];

      console.log(`✅ Mixed interview generated: ${technicalQuestions.length} Technical + ${behavioralQuestions.length} Behavioral + ${aptitudeQuestions.length} Aptitude + ${dsaProblems.length} DSA = ${allQuestions.length} total questions`);
      
    } else if (interview.interviewType === 'dsa') {
      console.log('💻 Generating DSA-focused interview with exactly 2 questions...');
      const dsaProblems = await groqAIService.generateDSAProblems(;
        interview.companyName,
        getDSADifficulty(interview.experienceLevel),
        2, // Fixed to exactly 2 DSA questions
        enhancedCompanyData?.company_data
      );

      allQuestions = dsaProblems.map(p => ({
        id: p.id;
        question: p.title;
        expectedAnswer: p.description;
        category: 'dsa';
        difficulty: p.difficulty;
        points: getDSAPoints(p.difficulty),
        timeLimit: 45, // More time for DSA problems
        problemData: p;
        provider: 'groq';
        model: 'llama-3.3-70b-versatile'
      }));

      console.log(`✅ DSA interview generated with ${allQuestions.length} questions`);
    } else {
      console.log(`🎯 Generating ${interview.interviewType} interview questions...`);
      allQuestions = await groqAIService.generateInterviewQuestions({
        jobTitle: interview.jobTitle;
        companyName: interview.companyName;
        skills: interview.skills || [];
        interviewType: interview.interviewType as 'technical' | 'behavioral' | 'aptitude';
        experienceLevel: interview.experienceLevel || 'mid';
        numberOfQuestions: getQuestionCount(interview.interviewType),
        companyIntelligence: enhancedCompanyData?.company_data
      });
    }

    // Enhanced question document with company intelligence
    const questionDoc = {
      interviewId: interviewId;
      questions: allQuestions.map(q => ({
        id: q.id;
        question: q.question;
        expectedAnswer: q.expectedAnswer;
        category: q.category;
        difficulty: q.difficulty;
        points: q.points;
        timeLimit: q.timeLimit;
        followUpQuestions: q.followUpQuestions || [];
        evaluationCriteria: q.evaluationCriteria || [];
        companyRelevance: q.companyRelevance || 8;
        tags: q.tags || [];
        hints: q.hints || [];
        problemData: q.problemData || null;
        provider: q.provider || 'groq';
        model: q.model || 'llama-3.3-70b-versatile'
      })),
      companyIntelligence: enhancedCompanyData ? {
        industry: enhancedCompanyData.company_data.industry;
        tech_stack: enhancedCompanyData.company_data.tech_stack;
        culture: enhancedCompanyData.company_data.culture;
        recent_news: enhancedCompanyData.company_data.recent_news;
        recent_posts: enhancedCompanyData.company_data.recent_posts.slice(0, 3),
        difficulty: enhancedCompanyData.company_data.difficulty;
        focus_areas: enhancedCompanyData.company_data.focus_areas
      } : null,
      metadata: {
        generatedAt: new Date(),
        aiService: 'groq-ai-service';
        totalQuestions: allQuestions.length;
        categoryBreakdown: getCategoryBreakdown(allQuestions),
        difficultyBreakdown: getDifficultyBreakdown(allQuestions),
        providerBreakdown: getProviderBreakdown(allQuestions),
        companyIntelligenceUsed: !!enhancedCompanyData;
        interviewType: interview.interviewType;
        enhancedFeatures: interview.interviewType === 'mixed' ?
          'Full comprehensive interview with Technical + Behavioral + Aptitude + DSA rounds' :
          interview.interviewType === 'dsa' ?
          'Focused DSA interview with 2 challenging problems' :
          `Specialized ${interview.interviewType} interview`
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
          status: 'ready';
          questionMetadata: questionDoc.metadata;
          companyIntelligence: questionDoc.companyIntelligence;
          updatedAt: new Date(),
          totalQuestions: allQuestions.length;
          estimatedDuration: calculateEstimatedDuration(allQuestions)
        } 
      }
    );

    console.log(`✅ Generated ${allQuestions.length} questions using Groq AI Service`);

    return NextResponse.json({
      message: `Questions generated successfully with Groq AI Service - ${interview.interviewType === 'mixed' ? 'All 4 rounds included' : interview.interviewType === 'dsa' ? '2 DSA problems' : `${allQuestions.length} ${interview.interviewType} questions`}`,
      questionsCount: allQuestions.length;
      questions: allQuestions;
      metadata: questionDoc.metadata;
      companyIntelligence: questionDoc.companyIntelligence;
      breakdown: {
        categories: getCategoryBreakdown(allQuestions),
        difficulties: getDifficultyBreakdown(allQuestions),
        providers: getProviderBreakdown(allQuestions)
      }
    });

  } catch (error) {
    console.error('Error generating questions with Groq AI:', error);
    return NextResponse.json(
      { error: 'Failed to generate questions: ' + error },
      { status: 500 }
    );
  }
}

// Helper functions
function getQuestionCount(interviewType: string): number {
  switch (interviewType) {
    case 'mixed': return 16; // Now properly distributed: 6+4+4+2
    case 'technical': return 12;
    case 'behavioral': return 10;  
    case 'aptitude': return 15;
    case 'dsa': return 2; // Fixed to exactly 2 questions
    default: return 12;
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
    case 'easy': return 20;
    case 'medium': return 30;
    case 'hard': return 45;
    default: return 25;
  }
}

function calculateEstimatedDuration(questions: any[]): number {
  // Calculate total time based on question types and time limits
  const totalTime = questions.reduce((sum, q) => {
    const timeLimit = q.timeLimit || (q.category === 'dsa' ? 45 : 5);
    return sum + timeLimit;
  }, 0);
  
  // Add buffer time (20% extra)
  return Math.ceil(totalTime * 1.2);
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
    const provider = q.provider || 'groq';
    breakdown[provider] = (breakdown[provider] || 0) + 1;
  });
  return breakdown;
}