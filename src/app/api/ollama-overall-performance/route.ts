import { NextRequest, NextResponse } from 'next/server';
import OllamaService from '@/lib/ollamaService';

export async function POST(request: NextRequest) {
  try {
    console.log('📊 Ollama Overall Performance Analysis API called');
    
    const body = await request.json();
    const { questions, answers, jobTitle, companyName, skills } = body;

    if (!questions || !answers || !jobTitle || !companyName) {
      return NextResponse.json(
        { error: 'Missing required fields: questions, answers, jobTitle, companyName' },
        { status: 400 }
      );
    }

    console.log(`🎯 Analyzing overall performance for ${jobTitle} at ${companyName}...`);
    
    // Initialize Ollama service
    const ollamaService = OllamaService.getInstance();
    
    // Check if Ollama is available
    const healthCheck = await ollamaService.healthCheck();
    if (!healthCheck.ollamaAvailable) {
      throw new Error('Ollama service is not available');
    }

    // Analyze overall performance
    const performanceAnalysis = await ollamaService.analyzeOverallPerformance(
      questions,
      answers,
      jobTitle,
      companyName,
      skills || []
    );

    const responseData = {
      success: true,
      performanceAnalysis,
      metadata: {
        provider: 'ollama',
        model: 'phi3:mini', // Optimized model
        timestamp: new Date().toISOString(),
        analysisType: 'comprehensive',
        companySpecific: true,
        questionsAnalyzed: questions.length,
        answersAnalyzed: answers.length
      }
    };

    console.log(`✅ Overall performance analysis completed with score: ${performanceAnalysis.overallScore}/10`);

    return NextResponse.json(responseData);

  } catch (error: any) {
    console.error('❌ Error in Ollama overall performance analysis:', error);
    
    // Fallback analysis - ensure answers is defined and is array
    const avgAnswerLength = (answers && Array.isArray(answers) && answers.length > 0) 
      ? answers.reduce((sum: number, ans: string) => sum + (ans || '').length, 0) / answers.length
      : 50; // Default if no answers provided
    const fallbackAnalysis = {
      overallScore: Math.min(10, Math.max(3, avgAnswerLength / 100)),
      parameterScores: {
        "Technical Knowledge": 6,
        "Problem Solving": 5,
        "Communication Skills": 6,
        "Company Culture Fit": 5,
        "Practical Application": 5
      },
      overallVerdict: `Performance analysis completed with basic evaluation for ${companyName} ${jobTitle} position.`,
      adviceForImprovement: questions.slice(0, 3).map((q: any, i: number) => ({
        question: q.question || `Question ${i + 1}`,
        advice: `For ${companyName}, focus on their specific technical challenges and company values.`
      })),
      strengths: ["Completed all questions", "Showed engagement", "Professional approach"],
      improvements: [`Study ${companyName}'s technology stack`, "Practice company-specific scenarios", "Improve technical communication"],
      recommendations: [`Research ${companyName}'s recent projects`, "Practice with their interview style", "Study industry best practices"]
    };

    return NextResponse.json({
      success: false,
      performanceAnalysis: fallbackAnalysis,
      error: 'Ollama analysis failed, using fallback',
      details: error.message,
      metadata: {
        provider: 'ollama_fallback',
        model: 'phi3:mini',
        timestamp: new Date().toISOString(),
        analysisType: 'fallback',
        questionsAnalyzed: questions.length,
        answersAnalyzed: answers.length
      }
    }, { status: 206 }); // 206 Partial Content
  }
}