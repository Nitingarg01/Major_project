import { NextRequest, NextResponse } from 'next/server';
import GroqAIService from '@/lib/groqAIService';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      question, 
      userAnswer, 
      expectedAnswer, 
      category, 
      companyContext,
      interviewId 
    } = body;

    if (!question || !userAnswer || !expectedAnswer || !category) {
      return NextResponse.json(
        { error: 'Missing required fields: question, userAnswer, expectedAnswer, category' },
        { status: 400 }
      );
    }

    console.log(`🔍 Analyzing ${category} response using Groq AI...`);

    const groqAIService = GroqAIService.getInstance();
    
    // Analyze the interview response
    const analysis = await groqAIService.analyzeInterviewResponse(;
      question,
      userAnswer,
      expectedAnswer,
      category,
      companyContext || 'General Company'
    );

    console.log('✅ Response analysis completed');

    return NextResponse.json({
      message: 'Response analyzed successfully',
      analysis: analysis,
      metadata: {
        analyzedAt: new Date(),
        service: 'groq-ai',
        questionCategory: category,
        wordCount: userAnswer.split(' ').length,
        responseLength: userAnswer.length
      }
    });

  } catch (error) {
    console.error('Error analyzing response with Groq AI:', error);
    return NextResponse.json(
      { 
        error: 'Failed to analyze response: ' + error,
        fallbackAnalysis: {
          score: 5,
          feedback: 'Unable to analyze response at this time. Please try again.',
          suggestions: ['Try providing more detailed answers'],
          strengths: ['Attempted the question'],
          improvements: ['Consider adding more specific examples']
        }
      },
      { status: 500 }
    );
  }
}