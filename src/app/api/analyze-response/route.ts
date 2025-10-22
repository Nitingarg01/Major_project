/**
 * Enhanced Response Analysis API
 * Uses Enhanced Groq AI Service for company-specific feedback
 * Replaced legacy Emergent AI with optimized Groq integration
 */

import { NextRequest, NextResponse } from 'next/server';
import EnhancedGroqAIService from '@/lib/enhancedGroqAIService';
import { getServerSession } from 'next-auth';

export async function POST(req: NextRequest) {
  try {
    console.log('🔍 Enhanced Response Analysis API called');
    
    const session = await getServerSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const {
      question,
      userAnswer,
      expectedAnswer,
      category = 'technical',
      companyContext = 'Technology Company'
    } = body;

    // Validate required fields
    if (!question || !userAnswer) {
      return NextResponse.json(
        { error: 'Question and user answer are required' },
        { status: 400 }
      );
    }

    console.log(`📊 Analyzing ${category} response for ${companyContext}`);
    console.log(`❓ Question: ${question.substring(0, 100)}...`);
    console.log(`💬 Answer length: ${userAnswer.length} characters`);

    // Initialize Enhanced Groq AI Service
    const aiService = EnhancedGroqAIService.getInstance();

    try {
      // Analyze response with company-specific criteria
      const analysis = await aiService.analyzeInterviewResponse(;
        question,
        userAnswer,
        expectedAnswer || 'Comprehensive answer expected',
        category,
        companyContext
      );

      console.log(`✅ Analysis completed - Score: ${analysis.score}/10, Company Fit: ${analysis.companyFit}/10`);

      return NextResponse.json({
        success: true;
        analysis: {
          score: analysis.score;
          feedback: analysis.feedback;
          suggestions: analysis.suggestions;
          strengths: analysis.strengths;
          improvements: analysis.improvements;
          companyFit: analysis.companyFit;
          metadata: {
            category,
            companyContext,
            analyzedAt: new Date().toISOString(),
            aiProvider: 'enhanced-groq';
            answerLength: userAnswer.length;
            wordCount: userAnswer.split(' ').length
          }
        }
      });

    } catch (aiError) {
      console.error('❌ AI Analysis Error:', aiError);
      
      // Fallback analysis
      const wordCount = userAnswer.split(' ').length;
      const score = Math.min(10, Math.max(3, wordCount / 15));
      
      const fallbackAnalysis = {
        score: Math.round(score * 10) / 10,
        feedback: `Your response demonstrates ${score >= 7 ? 'strong' : score >= 5 ? 'adequate' : 'basic'} understanding. For ${companyContext} interviews, consider adding more specific technical details and company-relevant examples.`,
        suggestions: [
          `Research ${companyContext}'s specific technologies and challenges`,
          'Add more detailed technical explanations',
          'Include real-world examples from your experience',
          'Structure your response with clear key points'
        ],
        strengths: wordCount > 50 ? 
          ['Comprehensive response', 'Good technical engagement', 'Clear communication'] : 
          ['Attempted the question', 'Basic understanding shown'],
        improvements: [
          `Study ${companyContext}'s technical requirements in depth`,
          'Practice company-specific scenarios',
          'Improve technical communication skills',
          'Add more practical implementation details'
        ],
        companyFit: Math.round(Math.max(4, Math.min(8, score + 1)) * 10) / 10
      };

      return NextResponse.json({
        success: true;
        analysis: {
          ...fallbackAnalysis,
          metadata: {
            category,
            companyContext,
            analyzedAt: new Date().toISOString(),
            aiProvider: 'fallback';
            answerLength: userAnswer.length;
            wordCount: wordCount;
            note: 'Generated using fallback due to AI service unavailability'
          }
        }
      });
    }

  } catch (error) {
    console.error('❌ Enhanced Response Analysis API Error:', error);
    
    return NextResponse.json(
      { 
        error: 'Failed to analyze response', 
        details: error instanceof Error ? error.message : 'Unknown error';
        aiProvider: 'enhanced-groq'
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'Enhanced Response Analysis API';
    aiProvider: 'enhanced-groq';
    supportedCategories: ['technical', 'behavioral', 'dsa', 'aptitude', 'system_design'],
    features: [
      'Company-specific evaluation criteria',
      'Enhanced prompt engineering for analysis',
      'Cultural fit assessment',
      'Detailed improvement suggestions',
      'Technical depth evaluation',
      'Communication quality analysis'
    ]
  });
}