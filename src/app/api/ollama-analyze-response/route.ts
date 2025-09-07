import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import OllamaService from '@/lib/ollamaService';

export async function POST(request: NextRequest) {
  try {
    console.log('🦙 Ollama Response Analysis API called');
    
    const body = await request.json();
    const {
      interviewId,
      questionId,
      userAnswer,
      question,
      expectedAnswer,
      category,
      companyName
    } = body;

    // Validate required fields
    if (!interviewId || !questionId || !userAnswer || !question) {
      return NextResponse.json(
        { error: 'Missing required fields: interviewId, questionId, userAnswer, question' },
        { status: 400 }
      );
    }

    // Connect to database
    const db = await connectDB();
    const interviewsCollection = db.collection('interviews');

    // Get interview details for context
    const interview = await interviewsCollection.findOne({ id: interviewId });
    
    if (!interview) {
      return NextResponse.json(
        { error: 'Interview not found' },
        { status: 404 }
      );
    }

    console.log('🚀 Analyzing response with Ollama...');
    
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
      expectedAnswer || 'No expected answer provided',
      category || 'general',
      companyName || interview.companyName
    );

    // Store the analysis in the database
    const responseData = {
      questionId,
      userAnswer,
      analysis,
      analyzedAt: new Date(),
      provider: 'ollama',
      model: 'llama3.1:8b'
    };

    // Update interview with response analysis
    await interviewsCollection.updateOne(
      { id: interviewId },
      {
        $push: {
          responses: responseData
        },
        $set: {
          lastUpdated: new Date()
        }
      }
    );

    console.log(`✅ Response analyzed using Ollama - Score: ${analysis.score}/10`);

    return NextResponse.json({
      success: true,
      analysis,
      provider: 'ollama',
      model: 'llama3.1:8b',
      companySpecific: true,
      message: 'Response analyzed successfully with company-specific insights'
    });

  } catch (error: any) {
    console.error('❌ Error in Ollama response analysis:', error);
    
    return NextResponse.json(
      {
        error: 'Failed to analyze response with Ollama',
        details: error.message,
        fallback: 'Consider using the fallback analysis endpoint'
      },
      { status: 500 }
    );
  }
}

// GET endpoint for analysis history
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const interviewId = searchParams.get('interviewId');

    if (!interviewId) {
      return NextResponse.json(
        { error: 'Interview ID is required' },
        { status: 400 }
      );
    }

    // Connect to database
    const db = await connectDB();
    const interviewsCollection = db.collection('interviews');

    // Get interview with responses
    const interview = await interviewsCollection.findOne(
      { id: interviewId },
      { projection: { responses: 1, companyName: 1, jobTitle: 1 } }
    );
    
    if (!interview) {
      return NextResponse.json(
        { error: 'Interview not found' },
        { status: 404 }
      );
    }

    const responses = interview.responses || [];
    const ollamaResponses = responses.filter((r: any) => r.provider === 'ollama');

    return NextResponse.json({
      success: true,
      responses: ollamaResponses,
      totalResponses: ollamaResponses.length,
      companyName: interview.companyName,
      jobTitle: interview.jobTitle
    });

  } catch (error: any) {
    console.error('❌ Error getting analysis history:', error);
    return NextResponse.json(
      { error: 'Failed to fetch analysis history' },
      { status: 500 }
    );
  }
}