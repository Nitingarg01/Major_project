import { NextRequest, NextResponse } from 'next/server';
import client from '@/lib/db';
import { ObjectId } from 'mongodb';
import FreeLLMService from '@/lib/freeLLMService';
import EnhancedCompanyIntelligenceService from '@/lib/enhancedCompanyIntelligence';

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
          message: 'Questions already exist',
          questionsCount: existingQuestions.questions.length,
          questions: existingQuestions.questions
        });
      }
    }

    const emergentAI = EmergentAIService.getInstance();
    
    // Generate enhanced questions based on interview type
    let allQuestions: any[] = [];
    
    if (interview.interviewType === 'mixed') {
      // Generate mixed questions with enhanced DSA problems
      console.log('Generating mixed interview questions...');
      
      // Technical Questions (40%)
      const technicalQuestions = await emergentAI.generateInterviewQuestions({
        jobTitle: interview.jobTitle,
        companyName: interview.companyName,
        skills: interview.skills || [],
        interviewType: 'technical',
        experienceLevel: interview.experienceLevel || 'mid',
        numberOfQuestions: 8
      });

      // Behavioral Questions (30%)
      const behavioralQuestions = await emergentAI.generateInterviewQuestions({
        jobTitle: interview.jobTitle,
        companyName: interview.companyName,
        skills: interview.skills || [],
        interviewType: 'behavioral',
        experienceLevel: interview.experienceLevel || 'mid',
        numberOfQuestions: 6
      });

      // DSA Problems (5+ unique problems as requested)
      const dsaProblems = await emergentAI.generateDSAQuestions(
        interview.companyName,
        getDSADifficulty(interview.experienceLevel),
        6 // Generate 6 unique DSA problems
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
          problemData: p
        }))
      ];
    } else if (interview.interviewType === 'dsa') {
      // Generate only DSA problems (5+ unique as requested)
      console.log('Generating DSA-only interview questions...');
      const dsaProblems = await emergentAI.generateDSAQuestions(
        interview.companyName,
        getDSADifficulty(interview.experienceLevel),
        8 // Generate 8 unique DSA problems for DSA-only interviews
      );

      allQuestions = dsaProblems.map(p => ({
        id: p.id,
        question: p.title,
        expectedAnswer: p.description,
        category: 'dsa',
        difficulty: p.difficulty,
        points: getDSAPoints(p.difficulty),
        problemData: p
      }));
    } else {
      // Generate single-type questions (technical/behavioral)
      console.log(`Generating ${interview.interviewType} interview questions...`);
      allQuestions = await emergentAI.generateInterviewQuestions({
        jobTitle: interview.jobTitle,
        companyName: interview.companyName,
        skills: interview.skills || [],
        interviewType: interview.interviewType,
        experienceLevel: interview.experienceLevel || 'mid',
        numberOfQuestions: getEnhancedQuestionCount(interview.interviewType)
      });
    }

    // Enhanced question document with metadata
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
        companyRelevance: q.companyRelevance || 7,
        tags: q.tags || [],
        hints: q.hints || [],
        problemData: q.problemData || null,
        aptitudeData: q.aptitudeData || null
      })),
      metadata: {
        generatedAt: new Date(),
        aiService: 'emergent-ai',
        totalQuestions: allQuestions.length,
        categoryBreakdown: getCategoryBreakdown(allQuestions),
        difficultyBreakdown: getDifficultyBreakdown(allQuestions)
      },
      status: 'ready'
    };

    // Store or update questions
    const result = await db.collection('questions').replaceOne(
      { interviewId: interviewId },
      questionDoc,
      { upsert: true }
    );

    // Update interview status
    await db.collection('interviews').updateOne(
      { _id: new ObjectId(interviewId) },
      { 
        $set: { 
          status: 'ready',
          questionMetadata: questionDoc.metadata,
          updatedAt: new Date()
        } 
      }
    );

    console.log(`✅ Generated ${allQuestions.length} questions successfully`);

    return NextResponse.json({
      message: 'Enhanced questions generated successfully with Emergent AI',
      questionsCount: allQuestions.length,
      questions: allQuestions,
      metadata: questionDoc.metadata,
      breakdown: {
        categories: getCategoryBreakdown(allQuestions),
        difficulties: getDifficultyBreakdown(allQuestions)
      }
    });

  } catch (error) {
    console.error('Error generating enhanced questions:', error);
    return NextResponse.json(
      { error: 'Failed to generate enhanced questions: ' + error },
      { status: 500 }
    );
  }
}

// Helper functions
function buildResumeContent(interview: any): string {
  const parts = [];
  
  if (interview.projectContext?.length > 0) {
    parts.push(`Projects: ${interview.projectContext.join(', ')}`);
  }
  
  if (interview.workExDetails?.length > 0) {
    parts.push(`Work Experience: ${interview.workExDetails.join(', ')}`);
  }
  
  if (interview.skills?.length > 0) {
    parts.push(`Skills: ${interview.skills.join(', ')}`);
  }
  
  return parts.join('\n') || 'No resume information provided';
}

function getEnhancedQuestionCount(interviewType: string): number {
  switch (interviewType) {
    case 'mixed': return 25;      // Comprehensive mixed interview
    case 'technical': return 18;  // In-depth technical assessment
    case 'behavioral': return 15; // Thorough behavioral evaluation
    case 'aptitude': return 20;   // Comprehensive aptitude test
    case 'dsa': return 6;         // Quality DSA problems (fewer but complex)
    default: return 20;
  }
}

function getDifficultyDistribution(experienceLevel: string) {
  switch (experienceLevel) {
    case 'entry':
      return { easy: 60, medium: 30, hard: 10 };
    case 'mid':
      return { easy: 30, medium: 50, hard: 20 };
    case 'senior':
      return { easy: 20, medium: 40, hard: 40 };
    case 'lead':
      return { easy: 10, medium: 30, hard: 60 };
    default:
      return { easy: 40, medium: 40, hard: 20 };
  }
}

function getDSADifficulty(experienceLevel: string): 'easy' | 'medium' | 'hard' {
  switch (experienceLevel) {
    case 'entry': return 'easy';
    case 'mid': return 'medium';
    case 'senior':
    case 'lead': return 'hard';
    default: return 'medium';
  }
}

function getAptitudeDifficulty(experienceLevel: string): 'easy' | 'medium' | 'hard' {
  switch (experienceLevel) {
    case 'entry': return 'easy';
    case 'mid': return 'medium';
    case 'senior':
    case 'lead': return 'hard';
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

function getAptitudePoints(difficulty: string): number {
  switch (difficulty) {
    case 'easy': return 5;
    case 'medium': return 8;
    case 'hard': return 12;
    default: return 8;
  }
}

function isDSASkill(skill: string): boolean {
  const dsaSkills = [
    'algorithms', 'data structures', 'dynamic programming', 
    'graph theory', 'tree traversal', 'sorting', 'searching',
    'arrays', 'strings', 'hash tables', 'linked lists'
  ];
  return dsaSkills.some(dsaSkill => 
    skill.toLowerCase().includes(dsaSkill)
  );
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