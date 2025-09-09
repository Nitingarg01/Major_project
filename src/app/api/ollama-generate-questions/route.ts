import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import OllamaService from '@/lib/ollamaService';

export async function POST(request: NextRequest) {
  try {
    console.log('🦙 Ollama Question Generation API called');
    
    const body = await request.json();
    const { interviewId, regenerate = false } = body;

    if (!interviewId) {
      return NextResponse.json(
        { error: 'Interview ID is required' },
        { status: 400 }
      );
    }

    // Connect to database
    const db = await connectDB();
    const interviewsCollection = db.collection('interviews');

    // Get interview details
    const interview = await interviewsCollection.findOne({ id: interviewId });
    
    if (!interview) {
      return NextResponse.json(
        { error: 'Interview not found' },
        { status: 404 }
      );
    }

    // Check if questions already exist and regenerate is false
    if (interview.questions && interview.questions.length > 0 && !regenerate) {
      console.log('✅ Returning existing questions');
      return NextResponse.json({
        success: true,
        questions: interview.questions,
        message: 'Questions already exist',
        provider: 'cached'
      });
    }

    console.log('🚀 Generating new questions with Ollama...');
    
    // Initialize Ollama service
    const ollamaService = OllamaService.getInstance();
    
    // Check if Ollama is available
    const healthCheck = await ollamaService.healthCheck();
    if (!healthCheck.ollamaAvailable) {
      throw new Error('Ollama service is not available');
    }

    let allQuestions: any[] = [];

    // Generate different types of questions based on interview type
    if (interview.interviewType === 'mixed' || interview.interviewType === 'technical') {
      console.log('📝 Generating technical questions...');
      const technicalQuestions = await ollamaService.generateInterviewQuestions({
        jobTitle: interview.jobTitle,
        companyName: interview.companyName,
        skills: interview.skills || [],
        interviewType: 'technical',
        experienceLevel: interview.experienceLevel || 'mid',
        numberOfQuestions: Math.ceil(interview.numberOfQuestions * 0.6)
      });
      allQuestions.push(...technicalQuestions);
    }

    if (interview.interviewType === 'mixed' || interview.interviewType === 'behavioral') {
      console.log('🧠 Generating behavioral questions...');
      const behavioralQuestions = await ollamaService.generateInterviewQuestions({
        jobTitle: interview.jobTitle,
        companyName: interview.companyName,
        skills: interview.skills || [],
        interviewType: 'behavioral',
        experienceLevel: interview.experienceLevel || 'mid',
        numberOfQuestions: Math.ceil(interview.numberOfQuestions * 0.4)
      });
      allQuestions.push(...behavioralQuestions);
    }

    if (interview.interviewType === 'system_design') {
      console.log('🏗️ Generating system design questions...');
      const systemQuestions = await ollamaService.generateInterviewQuestions({
        jobTitle: interview.jobTitle,
        companyName: interview.companyName,
        skills: interview.skills || [],
        interviewType: 'system_design',
        experienceLevel: interview.experienceLevel || 'mid',
        numberOfQuestions: interview.numberOfQuestions
      });
      allQuestions.push(...systemQuestions);
    }

    // Generate DSA problems if requested
    if (interview.includeDSA) {
      console.log('💻 Generating DSA problems...');
      const dsaProblems = await ollamaService.generateDSAProblems(
        interview.companyName,
        interview.difficulty || 'medium',
        Math.min(6, Math.floor(interview.numberOfQuestions * 0.3))
      );
      
      // Convert DSA problems to question format
      const dsaQuestions = dsaProblems.map(problem => ({
        id: problem.id,
        question: `Coding Problem: ${problem.title}\n\n${problem.description}`,
        expectedAnswer: `Implement an efficient solution with ${problem.timeComplexity} time complexity.`,
        category: 'dsa',
        difficulty: problem.difficulty,
        points: 15,
        timeLimit: 25,
        evaluationCriteria: ['Correctness', 'Efficiency', 'Code Quality', 'Edge Cases'],
        tags: [...problem.topics, interview.companyName],
        hints: problem.hints,
        dsaProblem: problem
      }));
      
      allQuestions.push(...dsaQuestions);
    }

    // Ensure we don't exceed the requested number of questions
    if (allQuestions.length > interview.numberOfQuestions) {
      allQuestions = allQuestions.slice(0, interview.numberOfQuestions);
    }

    // Add metadata
    const questionsWithMetadata = allQuestions.map((question, index) => ({
      ...question,
      order: index + 1,
      generatedAt: new Date(),
      provider: 'ollama',
      model: 'phi3:mini', // Optimized for speed
      companyRelevance: question.companyRelevance || 8
    }));

    // Update interview with questions
    await interviewsCollection.updateOne(
      { id: interviewId },
      {
        $set: {
          questions: questionsWithMetadata,
          questionsGenerated: true,
          lastUpdated: new Date(),
          questionProvider: 'ollama'
        }
      }
    );

    console.log(`✅ Generated ${questionsWithMetadata.length} questions using Ollama`);

    return NextResponse.json({
      success: true,
      questions: questionsWithMetadata,
      provider: 'ollama',
      model: 'phi3:mini', // Optimized for speed
      companySpecific: true,
      message: `Generated ${questionsWithMetadata.length} company-specific questions`
    });

  } catch (error: any) {
    console.error('❌ Error in Ollama question generation:', error);
    
    return NextResponse.json(
      {
        error: 'Failed to generate questions with Ollama',
        details: error.message,
        fallback: 'Consider using the fallback question generation endpoint'
      },
      { status: 500 }
    );
  }
}

// GET endpoint for company suggestions
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('company') || '';

    if (!query) {
      return NextResponse.json({ suggestions: [] });
    }

    const ollamaService = OllamaService.getInstance();
    const suggestions = ollamaService.getCompanySuggestions(query);

    return NextResponse.json({
      suggestions,
      source: 'ollama_service'
    });

  } catch (error: any) {
    console.error('❌ Error getting company suggestions:', error);
    return NextResponse.json(
      { error: 'Failed to fetch company suggestions', suggestions: [] },
      { status: 500 }
    );
  }
}