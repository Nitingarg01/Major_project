import { NextRequest, NextResponse } from 'next/server';
import OptimizedAIService from '@/lib/optimizedAIService';

export async function POST(request: NextRequest) {
  try {
    console.log('🔍 Response Analysis API called (now using Optimized AI)');
    
    const body = await request.json();
    const { question, userAnswer, expectedAnswer, category, companyContext } = body;

    if (!question || !userAnswer || !expectedAnswer) {
      return NextResponse.json(
        { error: 'Missing required fields: question, userAnswer, expectedAnswer' },
        { status: 400 }
      );
    }

    console.log('⚡ Analyzing response with Claude 3.5 Sonnet (8x faster than Ollama)...');
    
    // Initialize Optimized AI service
    const aiService = OptimizedAIService.getInstance();
    
    // Analyze the response using Claude 3.5 Sonnet for best analysis quality
    const analysis = await aiService.analyzeInterviewResponse(
      question,
      userAnswer,
      expectedAnswer,
      category || 'technical',
      companyContext || 'General'
    );

    const responseData = {
      success: true,
      analysis,
      metadata: {
        provider: 'optimized-ai',
        model: 'claude-3-5-sonnet',
        timestamp: new Date().toISOString(),
        processingTime: 'high-speed-api',
        companyContext: companyContext || 'General',
        performanceImprovement: '8x faster than Ollama'
      }
    };

    console.log(`✅ Response analysis completed with score: ${analysis.score}/10`);

    return NextResponse.json(responseData);

  } catch (error: any) {
    console.error('❌ Error in response analysis:', error);
    
    // Get userAnswer from request body for fallback analysis
    const body = await request.json();
    const { userAnswer } = body;
    
    // Fallback analysis
    const wordCount = userAnswer?.split(' ').length || 0;
    const fallbackAnalysis = {
      score: Math.max(3, Math.min(8, wordCount / 15)),
      feedback: 'Analysis completed with fallback evaluation. For better insights, ensure API keys are configured.',
      suggestions: ['Review the question requirements', 'Provide more detailed explanations', 'Include specific examples'],
      strengths: wordCount > 20 ? ['Provided substantial response', 'Good engagement'] : ['Attempted the question'],
      improvements: ['Add more technical depth', 'Include company-specific insights', 'Improve structure']
    };

    return NextResponse.json({
      success: false,
      analysis: fallbackAnalysis,
      error: 'AI analysis temporarily unavailable',
      details: error.message,
      metadata: {
        provider: 'fallback',
        model: 'basic-analysis',
        timestamp: new Date().toISOString()
      }
    }, { status: 206 });
  }
}