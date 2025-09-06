import { NextRequest, NextResponse } from 'next/server';
import EnhancedCompanyIntelligenceService from '@/lib/enhancedCompanyIntelligence';

// ✅ PERFORMANCE OPTIMIZATION: Add overall timeout to prevent hanging requests
const OVERALL_TIMEOUT = 8000; // 8 seconds total timeout

export async function POST(request: NextRequest) {
  return new Promise(async (resolve) => {
    // Set overall timeout for the entire request
    const timeoutId = setTimeout(() => {
      resolve(NextResponse.json(
        { error: 'Request timeout. Company intelligence took too long to fetch.' },
        { status: 408 }
      ));
    }, OVERALL_TIMEOUT);

    try {
      const body = await request.json();
      const { companyName, jobTitle = 'Software Engineer' } = body;

      if (!companyName) {
        clearTimeout(timeoutId);
        resolve(NextResponse.json(
          { error: 'Company name is required' },
          { status: 400 }
        ));
        return;
      }

      console.log(`🔍 Fetching FAST enhanced company intelligence for ${companyName}...`);

      const intelligenceService = EnhancedCompanyIntelligenceService.getInstance();
      const intelligence = await intelligenceService.getEnhancedCompanyIntelligence(
        companyName,
        jobTitle
      );

      if (!intelligence) {
        clearTimeout(timeoutId);
        resolve(NextResponse.json(
          { error: 'Failed to gather company intelligence' },
          { status: 500 }
        ));
        return;
      }

      console.log(`✅ Company intelligence gathered successfully for ${companyName} (FAST mode)`);

      clearTimeout(timeoutId);
      resolve(NextResponse.json({
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
      }));

    } catch (error) {
      console.error('Error fetching company intelligence:', error);
      clearTimeout(timeoutId);
      resolve(NextResponse.json(
        { error: 'Failed to fetch company intelligence: ' + error },
        { status: 500 }
      ));
    }
  });
}

export async function GET(request: NextRequest) {
  return new Promise(async (resolve) => {
    // Set overall timeout for GET requests too
    const timeoutId = setTimeout(() => {
      resolve(NextResponse.json(
        { error: 'GET request timeout' },
        { status: 408 }
      ));
    }, OVERALL_TIMEOUT);

    try {
      const searchParams = request.nextUrl.searchParams;
      const companyName = searchParams.get('company');
      const jobTitle = searchParams.get('jobTitle') || 'Software Engineer';

      if (!companyName) {
        clearTimeout(timeoutId);
        resolve(NextResponse.json(
          { error: 'Company name is required' },
          { status: 400 }
        ));
        return;
      }

      const intelligenceService = EnhancedCompanyIntelligenceService.getInstance();
      const intelligence = await intelligenceService.getEnhancedCompanyIntelligence(
        companyName,
        jobTitle
      );

      if (!intelligence) {
        clearTimeout(timeoutId);
        resolve(NextResponse.json(
          { error: 'Company not found or intelligence unavailable' },
          { status: 404 }
        ));
        return;
      }

      clearTimeout(timeoutId);
      resolve(NextResponse.json({
        ...intelligence,
        performance: {
          optimized: true,
          fast_mode: true
        }
      }));

    } catch (error) {
      console.error('Error in GET company intelligence:', error);
      clearTimeout(timeoutId);
      resolve(NextResponse.json(
        { error: 'Failed to fetch company intelligence' },
        { status: 500 }
      ));
    }
  });
}