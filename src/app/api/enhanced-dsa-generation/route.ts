import { NextRequest, NextResponse } from 'next/server';
import { EnhancedGroqDSAService } from '@/lib/enhancedGroqDSAService';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      companyName, 
      count = 5, 
      experienceLevel = 'mid',
      focusAreas = [],
      difficulty 
    } = body;

    if (!companyName) {
      return NextResponse.json(
        { error: 'Company name is required' },
        { status: 400 }
      );
    }

    console.log(`🎯 Generating enhanced DSA problems for ${companyName}...`);

    const dsaService = EnhancedGroqDSAService.getInstance();
    
    let problems;
    if (focusAreas && focusAreas.length > 0) {
      problems = await dsaService.generateEnhancedDSAProblems(companyName, count, focusAreas);
    } else {
      problems = await dsaService.generateCompanySpecificDSAProblems(companyName, count, experienceLevel);
    }

    console.log(`✅ Generated ${problems.length} DSA problems successfully`);

    return NextResponse.json({
      success: true;
      problems: problems;
      metadata: {
        company: companyName;
        count: problems.length;
        experienceLevel,
        focusAreas,
        generatedAt: new Date(),
        service: 'enhanced-groq-dsa';
        hasTestCases: problems.every(p => p.testCases && p.testCases.length > 0)
      }
    });

  } catch (error) {
    console.error('❌ Error generating enhanced DSA problems:', error);
    
    return NextResponse.json(
      { 
        error: 'Failed to generate DSA problems';
        details: error instanceof Error ? error.message : 'Unknown error';
        fallback: true
      },
      { status: 500 }
    );
  }
}