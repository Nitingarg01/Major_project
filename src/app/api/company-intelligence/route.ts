import { NextRequest, NextResponse } from 'next/server';
import EnhancedCompanyIntelligenceService from '@/lib/enhancedCompanyIntelligence';

export async function POST(request: NextRequest): Promise<Response> {
  try {
    const body = await request.json();
    const { companyName, jobTitle = 'Software Engineer' } = body;

    if (!companyName) {
      return NextResponse.json(
        { error: 'Company name is required' },
        { status: 400 }
      );
    }

    console.log(`🔍 Fetching FAST enhanced company intelligence for ${companyName}...`);

    const intelligenceService = EnhancedCompanyIntelligenceService.getInstance();
    const intelligence = await intelligenceService.getEnhancedCompanyIntelligence(
      companyName,
      jobTitle
    );

    if (!intelligence) {
      return NextResponse.json(
        { error: 'Failed to gather company intelligence' },
        { status: 500 }
      );
    }

    console.log(`✅ Company intelligence gathered successfully for ${companyName} (FAST mode)`);

    return NextResponse.json({
      message: 'Company intelligence gathered successfully (OPTIMIZED)',
      company: companyName,
      jobTitle: jobTitle,
      intelligence: intelligence,
      features: {
        real_time_news: intelligence.company_data.recent_news.length > 0,
        company_posts: intelligence.company_data.recent_posts.length > 0,
        enhanced_insights: true,
        interview_preparation: true,
        performance_optimized: true // New flag
      },
      performance: {
        optimized: true,
        parallel_processing: true,
        circuit_breaker: true,
        timeout_protection: true
      }
    });

  } catch (error) {
    console.error('Error fetching company intelligence:', error);
    return NextResponse.json(
      { error: 'Failed to fetch company intelligence: ' + error },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest): Promise<Response> {
  try {
    const searchParams = request.nextUrl.searchParams;
    const companyName = searchParams.get('company');
    const jobTitle = searchParams.get('jobTitle') || 'Software Engineer';

    if (!companyName) {
      return NextResponse.json(
        { error: 'Company name is required' },
        { status: 400 }
      );
    }

    const intelligenceService = EnhancedCompanyIntelligenceService.getInstance();
    const intelligence = await intelligenceService.getEnhancedCompanyIntelligence(
      companyName,
      jobTitle
    );

    if (!intelligence) {
      return NextResponse.json(
        { error: 'Company not found or intelligence unavailable' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      ...intelligence,
      performance: {
        optimized: true,
        fast_mode: true
      }
    });

  } catch (error) {
    console.error('Error in GET company intelligence:', error);
    return NextResponse.json(
      { error: 'Failed to fetch company intelligence' },
      { status: 500 }
    );
  }
}