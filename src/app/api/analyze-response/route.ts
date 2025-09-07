import { NextRequest, NextResponse } from 'next/server';
import { hybridAIService } from '@/lib/hybridAIService';
import client from '@/lib/db';
import { ObjectId } from 'mongodb';

export async function POST(request: NextRequest) {
  try {
    console.log('🔍 Enhanced Response Analysis API called');
    
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

    const db = client.db();
    
    // Get interview details for context
    const interview = await db.collection('interviews').findOne({
      _id: new ObjectId(interviewId)
    });
    
    if (!interview) {
      return NextResponse.json(
        { error: 'Interview not found' },
        { status: 404 }
      );
    }

    console.log(`🚀 Analyzing response for ${interview.companyName} - ${interview.jobTitle}`);

    // Analyze the response using hybrid AI service
    const analysis = await hybridAIService.analyzeResponse(
      question,
      userAnswer,
      expectedAnswer || 'No expected answer provided',
      category || 'general',
      companyName || interview.companyName
    );

    console.log(`✅ Response analyzed - Score: ${analysis.score}/10`);

    // Store the analysis in the database with enhanced metadata
    const responseData = {
      questionId,
      userAnswer,
      analysis: {
        ...analysis,
        analyzedAt: new Date(),
        aiProvider: 'hybrid',
        companyContext: companyName || interview.companyName,
        category: category || 'general'
      },
      metadata: {
        questionCategory: category,
        companyName: companyName || interview.companyName,
        jobTitle: interview.jobTitle,
        analyzedAt: new Date()
      }
    };

    // Update interview with response analysis
    await db.collection('interviews').updateOne(
      { _id: new ObjectId(interviewId) },
      {
        $push: {
          'responses': responseData
        } as any,
        $set: {
          lastUpdated: new Date(),
          status: 'in-progress' // Update status to show interview is ongoing
        }
      }
    );

    // Get service health for response
    const serviceHealth = await hybridAIService.getServiceHealth();

    return NextResponse.json({
      success: true,
      analysis,
      serviceInfo: {
        primary: serviceHealth.primary,
        fallback: serviceHealth.fallback,
        companySpecific: true,
        enhancedAnalysis: true
      },
      metadata: {
        questionId,
        category: category || 'general',
        company: companyName || interview.companyName,
        analyzedAt: new Date().toISOString()
      },
      message: 'Response analyzed successfully with enhanced company-specific insights'
    });

  } catch (error: any) {
    console.error('❌ Error analyzing response:', error);
    
    return NextResponse.json(
      {
        error: 'Failed to analyze response',
        details: error.message,
        timestamp: new Date().toISOString(),
        fallback: 'Consider using the basic analysis endpoint'
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

    const db = client.db();
    
    // Get interview with responses
    const interview = await db.collection('interviews').findOne(
      { _id: new ObjectId(interviewId) },
      { projection: { responses: 1, companyName: 1, jobTitle: 1, createdAt: 1 } }
    );
    
    if (!interview) {
      return NextResponse.json(
        { error: 'Interview not found' },
        { status: 404 }
      );
    }

    const responses = interview.responses || [];
    
    // Calculate summary statistics
    const scores = responses
      .map((r: any) => r.analysis?.score || 0)
      .filter((score: number) => score > 0);
    
    const averageScore = scores.length > 0 
      ? Math.round(scores.reduce((sum: number, score: number) => sum + score, 0) / scores.length * 10) / 10
      : 0;

    return NextResponse.json({
      success: true,
      interview: {
        id: interviewId,
        companyName: interview.companyName,
        jobTitle: interview.jobTitle,
        createdAt: interview.createdAt
      },
      responses,
      statistics: {
        totalResponses: responses.length,
        averageScore,
        completedResponses: scores.length,
        highestScore: scores.length > 0 ? Math.max(...scores) : 0,
        lowestScore: scores.length > 0 ? Math.min(...scores) : 0
      }
    });

  } catch (error: any) {
    console.error('❌ Error getting analysis history:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch analysis history',
        details: error.message
      },
      { status: 500 }
    );
  }
}