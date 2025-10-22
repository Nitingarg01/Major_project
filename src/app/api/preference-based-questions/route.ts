import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/app/auth';
import client from '@/lib/db';
import { ObjectId } from 'mongodb';
import { preferenceBasedQuestionGenerator } from '@/lib/preferenceBasedQuestionGenerator';
import { userPreferencesService } from '@/lib/userPreferencesService';
import { QuestionGenerationRequest } from '@/types/userPreferences';

/**
 * Generate preference-based interview questions with company-unique DSA problems
 */
export async function POST(request: NextRequest) {
  try {
    console.log('🎯 Preference-Based Questions API called');

    // Check authentication
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { 
      interviewId, 
      jobTitle, 
      companyName, 
      skills, 
      experienceLevel, 
      interviewType, 
      numberOfQuestions,
      forceRegenerate = false
    } = body;

    // Validate required fields
    if (!interviewId || !jobTitle || !companyName || !skills || !Array.isArray(skills)) {
      return NextResponse.json(
        { error: 'Missing required fields: interviewId, jobTitle, companyName, skills' },
        { status: 400 }
      );
    }

    // Validate ObjectId format
    if (!/^[0-9a-fA-F]{24}$/.test(interviewId)) {
      return NextResponse.json(
        { error: 'Invalid interview ID format' },
        { status: 400 }
      );
    }

    const db = client.db('Cluster0');
    
    // Get interview details
    const interview = await db.collection('interviews').findOne({
      _id: new ObjectId(interviewId),
      userId: session.user.id
    });

    if (!interview) {
      return NextResponse.json(
        { error: 'Interview not found or access denied' },
        { status: 404 }
      );
    }

    // Check if preference-based questions already exist
    if (!forceRegenerate) {
      const existingQuestions = await db.collection('questions').findOne({
        interviewId: interviewId,
        'metadata.questionType': 'preference-based'
      });

      if (existingQuestions && existingQuestions.questions?.length > 0) {
        console.log('✅ Returning existing preference-based questions');
        return NextResponse.json({
          success: true,
          message: 'Preference-based questions already exist',
          questions: existingQuestions.questions,
          metadata: existingQuestions.metadata,
          fromCache: true
        });
      }
    }

    console.log(`🚀 Generating preference-based questions for ${companyName} ${jobTitle}...`);

    // Get user preferences
    const userPreferences = await userPreferencesService.getUserPreferences(session.user.id);
    console.log('📊 User preferences loaded:', {
      defaultDifficulty: userPreferences.defaultDifficulty,
      dsaFocus: userPreferences.dsaPreferences.companySpecificFocus,
      questionDistribution: userPreferences.questionDistribution
    });

    // Prepare generation request
    const generationRequest: QuestionGenerationRequest = {
      userPreferences,
      jobTitle,
      companyName,
      skills,
      experienceLevel: experienceLevel || 'mid',
      interviewType: interviewType || 'mixed',
      numberOfQuestions: numberOfQuestions || 20,
      companyIntelligence: null,
      forceUniqueGeneration: true
    };

    // Generate preference-based questions
    const generationResult = await preferenceBasedQuestionGenerator.generatePreferenceBasedQuestions(;
      generationRequest
    );

    if (!generationResult.success) {
      throw new Error('Question generation failed');
    }

    console.log(`✅ Generated ${generationResult.questions.length} preference-based questions`);
    console.log(`🔥 Unique DSA problems: ${generationResult.metadata.uniqueDSAProblems}`);
    console.log(`🎯 Preference alignment: ${generationResult.metadata.preferenceAlignment}%`);

    // Store questions in database
    const questionDoc = {
      interviewId: interviewId,
      userId: session.user.id,
      questions: generationResult.questions,
      answers: [],
      metadata: {
        ...generationResult.metadata,
        questionType: 'preference-based',
        generatedAt: new Date(),
        userPreferenceVersion: userPreferences.version,
        companySpecific: true,
        uniqueGeneration: true
      }
    };

    // Replace existing questions
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
          status: 'ready',
          questionType: 'preference-based',
          questionMetadata: questionDoc.metadata,
          updatedAt: new Date()
        }
      }
    );

    console.log(`🎉 Successfully generated and stored preference-based questions for interview ${interviewId}`);

    return NextResponse.json({
      success: true,
      message: `Generated ${generationResult.questions.length} preference-based questions with ${generationResult.metadata.uniqueDSAProblems} unique DSA problems`,
      questions: generationResult.questions,
      metadata: generationResult.metadata,
      statistics: {
        totalQuestions: generationResult.questions.length,
        preferenceAlignment: `${generationResult.metadata.preferenceAlignment}%`,
        uniqueDSAProblems: generationResult.metadata.uniqueDSAProblems,
        companySpecific: true,
        generationTime: `${generationResult.metadata.generationTime}ms`,
        questionBreakdown: this.getQuestionBreakdown(generationResult.questions)
      }
    });

  } catch (error: any) {
    console.error('❌ Error in preference-based question generation:', error);
    
    return NextResponse.json(
      {
        error: 'Failed to generate preference-based questions',
        details: error.message,
        suggestion: 'Please try again or check your preferences settings'
      },
      { status: 500 }
    );
  }
}

/**
 * Get user preferences endpoint
 */
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const userPreferences = await userPreferencesService.getUserPreferences(session.user.id);
    
    return NextResponse.json({
      success: true,
      preferences: userPreferences,
      message: 'User preferences retrieved successfully'
    });

  } catch (error: any) {
    console.error('❌ Error getting user preferences:', error);
    
    return NextResponse.json(
      {
        error: 'Failed to get user preferences',
        details: error.message
      },
      { status: 500 }
    );
  }
}

/**
 * Helper function to analyze question breakdown
 */
function getQuestionBreakdown(questions: any[]): { [key: string]: number } {
  const breakdown: { [key: string]: number } = {};
  
  questions.forEach(q => {
    breakdown[q.category] = (breakdown[q.category] || 0) + 1;
  });
  
  return breakdown;
}