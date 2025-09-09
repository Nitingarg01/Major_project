import { NextRequest, NextResponse } from 'next/server';
import OllamaService from '@/lib/ollamaService';

export async function POST(request: NextRequest) {
  try {
    console.log('🔍 Ollama Response Analysis API called');
    
    const body = await request.json();
    const { question, userAnswer, expectedAnswer, category, companyContext } = body;

    if (!question || !userAnswer || !expectedAnswer) {
      return NextResponse.json(
        { error: 'Missing required fields: question, userAnswer, expectedAnswer' },
        { status: 400 }
      );
    }

    console.log('📊 Analyzing response with Ollama...');
    
    // Initialize Ollama service
    const ollamaService = OllamaService.getInstance();
    
    // Check if Ollama is available
    const healthCheck = await ollamaService.healthCheck();
    if (!healthCheck.ollamaAvailable) {
      throw new Error('Ollama service is not available');
    }

    // Analyze the response
    const analysis = await ollamaService.analyzeInterviewResponse(
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
        provider: 'ollama',
        model: 'phi3:mini', // Optimized model
        timestamp: new Date().toISOString(),
        processingTime: 'optimized',
        companyContext: companyContext || 'General'
      }
    };

    console.log(`✅ Response analysis completed with score: ${analysis.score}/10`);

    return NextResponse.json(responseData);

  } catch (error: any) {
    console.error('❌ Error in Ollama response analysis:', error);
    
    // Fallback analysis
    const fallbackAnalysis = {
      score: 5,
      feedback: 'Analysis completed with basic evaluation. For better insights, ensure Ollama service is running.',
      suggestions: ['Review the question requirements', 'Provide more detailed explanations', 'Include specific examples'],
      strengths: ['Attempted the question', 'Provided a response'],
      improvements: ['Add more technical depth', 'Include company-specific insights', 'Improve structure']
    };

    return NextResponse.json({
      success: false,
      analysis: fallbackAnalysis,
      error: 'Ollama analysis failed, using fallback',
      details: error.message,
      metadata: {
        provider: 'ollama_fallback',
        model: 'phi3:mini',
        timestamp: new Date().toISOString(),
        processingTime: 'fallback'
      }
    }, { status: 206 }); // 206 Partial Content
  }
}