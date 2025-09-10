import { NextRequest, NextResponse } from 'next/server';
import { enhancedDSAService } from '@/lib/enhancedDSAService';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      companyName, 
      count = 5, 
      experienceLevel = 'mid',
      challengeType = 'algorithm',
      previousProblemIds = [],
      generateUnique = false,
      generateInteractive = false
    } = body;

    if (!companyName) {
      return NextResponse.json(
        { error: 'Company name is required' },
        { status: 400 }
      );
    }

    console.log(`🎯 Generating DSA problems for ${companyName}:`, {
      count,
      experienceLevel,
      challengeType,
      generateUnique,
      generateInteractive
    });

    let problems;

    if (generateInteractive) {
      // Generate interactive coding challenges
      problems = await enhancedDSAService.generateInteractiveCodingChallenges(
        companyName,
        challengeType,
        count
      );
    } else if (generateUnique) {
      // Generate completely unique problems
      problems = await enhancedDSAService.generateUniqueProblems(
        companyName,
        previousProblemIds,
        count,
        experienceLevel
      );
    } else {
      // Generate standard company-specific problems
      problems = await enhancedDSAService.generateCompanySpecificDSAProblems(
        companyName,
        count,
        experienceLevel
      );
    }

    // Get company insights
    const companyInsights = enhancedDSAService.getCompanyInsights(companyName);

    return NextResponse.json({
      success: true,
      message: `Generated ${problems.length} DSA problems for ${companyName}`,
      problems,
      companyInsights,
      metadata: {
        generatedAt: new Date(),
        count: problems.length,
        companyName,
        experienceLevel,
        generateUnique,
        generateInteractive,
        challengeType: generateInteractive ? challengeType : undefined
      }
    });

  } catch (error: any) {
    console.error('❌ Error generating company DSA problems:', error);
    return NextResponse.json(
      { 
        error: 'Failed to generate DSA problems: ' + error.message,
        success: false
      },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    // Health check for the service
    const healthStatus = await enhancedDSAService.healthCheck();
    
    return NextResponse.json({
      service: 'Enhanced DSA Service',
      status: healthStatus.status,
      emergentAvailable: healthStatus.emergentAvailable,
      supportedCompanies: [
        'Google', 'Amazon', 'Meta', 'Microsoft', 'Apple', 'Netflix'
      ],
      features: [
        'Company-specific problems',
        'Interactive coding challenges', 
        'Unique problem generation',
        'Experience level adaptation',
        'Multiple programming languages'
      ]
    });

  } catch (error: any) {
    return NextResponse.json(
      { 
        error: 'Service health check failed: ' + error.message,
        status: 'error'
      },
      { status: 500 }
    );
  }
}