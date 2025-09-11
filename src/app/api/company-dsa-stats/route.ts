import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/app/auth';
import { enhancedDSAGenerator } from '@/lib/enhancedDSAGenerator';

/**
 * Get DSA problem statistics for a company
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const companyName = searchParams.get('company');

    if (!companyName) {
      return NextResponse.json(
        { error: 'Company name is required' },
        { status: 400 }
      );
    }

    console.log(`📊 Getting DSA stats for company: ${companyName}`);

    const stats = await enhancedDSAGenerator.getCompanyProblemStats(companyName);

    return NextResponse.json({
      success: true,
      company: companyName,
      statistics: stats,
      message: `DSA statistics retrieved for ${companyName}`
    });

  } catch (error: any) {
    console.error('❌ Error getting company DSA stats:', error);
    
    return NextResponse.json(
      {
        error: 'Failed to retrieve company DSA statistics',
        details: error.message
      },
      { status: 500 }
    );
  }
}

/**
 * Generate new unique DSA problems for a company (admin/testing endpoint)
 */
export async function POST(request: NextRequest) {
  try {
    // Optional: Add admin authentication here
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { companyName, count = 3, difficulties = ['medium', 'medium', 'hard'], experienceLevel = 'mid' } = body;

    if (!companyName) {
      return NextResponse.json(
        { error: 'Company name is required' },
        { status: 400 }
      );
    }

    console.log(`🔧 Admin: Generating ${count} DSA problems for ${companyName}`);

    // For testing, we'll create a minimal user preferences object
    const testPreferences = {
      dsaPreferences: {
        preferredTopics: ['arrays', 'strings', 'trees', 'graphs'],
        avoidTopics: [],
        companySpecificFocus: true,
        difficultyProgression: true,
        realWorldScenarios: true,
        interviewStylePreference: 'company_specific' as const
      }
    };

    const problems = await enhancedDSAGenerator.generateUniqueCompanyDSAProblems(
      companyName,
      testPreferences as any,
      count,
      difficulties,
      experienceLevel
    );

    return NextResponse.json({
      success: true,
      company: companyName,
      problems: problems,
      count: problems.length,
      message: `Generated ${problems.length} unique DSA problems for ${companyName}`
    });

  } catch (error: any) {
    console.error('❌ Error generating company DSA problems:', error);
    
    return NextResponse.json(
      {
        error: 'Failed to generate company DSA problems',
        details: error.message
      },
      { status: 500 }
    );
  }
}