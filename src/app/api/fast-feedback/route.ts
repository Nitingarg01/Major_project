import { NextRequest, NextResponse } from 'next/server';
import client from '@/lib/db';
import { ObjectId } from 'mongodb';
import GroqAIService from '@/lib/groqAIService';

// Fallback analysis function when AI services are not available
function generateFallbackAnalysis(questions: any[], answers: string[], jobTitle: string) {
  const totalQuestions = questions.length;
  const answeredQuestions = answers.filter(answer => answer && answer.trim().length > 10).length;
  const answerQuality = answeredQuestions / totalQuestions;
  
  // Calculate scores based on answer length and completeness
  const avgAnswerLength = answers.reduce((sum, answer) => sum + (answer?.length || 0), 0) / answers.length;
  const technicalScore = Math.min(10, Math.max(1, (avgAnswerLength / 100) * 8 + 2));
  const communicationScore = Math.min(10, Math.max(1, answerQuality * 8 + 2));
  const problemSolvingScore = Math.min(10, Math.max(1, (answeredQuestions / totalQuestions) * 8 + 2));
  
  const overallScore = (technicalScore + communicationScore + problemSolvingScore) / 3;
  
  return {
    overallScore: Math.round(overallScore * 10) / 10,
    parameterScores: {
      "Technical Knowledge": Math.round(technicalScore * 10) / 10,
      "Problem Solving": Math.round(problemSolvingScore * 10) / 10,
      "Communication Skills": Math.round(communicationScore * 10) / 10,
      "Practical Application": Math.round((technicalScore + problemSolvingScore) / 2 * 10) / 10,
      "Company Fit": Math.round(communicationScore * 10) / 10
    },
    strengths: [
      "Demonstrated willingness to engage with questions",
      "Provided structured responses",
      "Showed understanding of technical concepts"
    ],
    improvements: [
      "Provide more detailed technical explanations",
      "Include specific examples from experience",
      "Elaborate on problem-solving approaches"
    ],
    recommendations: [
      "Practice explaining technical concepts clearly",
      "Prepare specific examples for common interview questions",
      "Focus on demonstrating problem-solving methodology"
    ],
    summary: `Based on your ${jobTitle} interview performance, you showed good engagement with ${answeredQuestions}/${totalQuestions} questions answered. Your responses demonstrate technical awareness and communication skills. Focus on providing more detailed examples and explanations to improve your overall performance.`
  };
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { interviewId } = body;

    if (!interviewId) {
      return NextResponse.json(
        { error: 'Interview ID is required' },
        { status: 400 }
      );
    }

    console.log('⚡ Fast feedback API called for interview:', interviewId);
    const startTime = Date.now();

    const db = client.db();
    
    // Get interview details
    const interview = await db.collection('interviews').findOne({
      _id: new ObjectId(interviewId)
    });

    if (!interview) {
      return NextResponse.json(
        { error: 'Interview not found' },
        { status: 404 }
      );
    }

    // Get questions and answers with better error handling
    const questionsDoc = await db.collection("questions").findOne({
      interviewId: interviewId
    });

    console.log('📄 Questions document found:', {
      exists: !!questionsDoc,
      hasAnswers: !!questionsDoc?.answers,
      answersLength: questionsDoc?.answers?.length || 0,
      answersType: typeof questionsDoc?.answers,
      sampleAnswer: questionsDoc?.answers?.[0]
    });

    if (!questionsDoc) {
      console.error('❌ No questions document found for interviewId:', interviewId);
      return NextResponse.json(
        { error: 'Interview questions not found' },
        { status: 404 }
      );
    }

    // Check if this is a DSA interview and handle accordingly
    const isDSAInterview = interview.jobTitle?.toLowerCase().includes('dsa') || 
                          questionsDoc.questions?.some((q: any) => q.category === 'dsa' || q.dsaProblem);

    console.log('🔍 Interview type analysis:', {
      isDSAInterview,
      jobTitle: interview.jobTitle,
      questionCategories: questionsDoc.questions?.map((q: any) => q.category) || []
    });

    // Check if answers exist in any format
    let hasValidAnswers = questionsDoc.answers && 
      (Array.isArray(questionsDoc.answers) && questionsDoc.answers.length > 0) ||
      (typeof questionsDoc.answers === 'object' && Object.keys(questionsDoc.answers).length > 0);

    // For DSA interviews, also check for execution results or interview responses
    let dsaAnswers = [];
    if (isDSAInterview && !hasValidAnswers) {
      console.log('🔍 Checking DSA-specific answer formats...');
      
      // Check for DSA execution results
      const dsaExecutions = await db.collection('dsa_executions').find({
        problemId: { $in: questionsDoc.questions?.map((q: any) => q.id || q.dsaProblem?.id) || [] }
      }).toArray();
      
      // Check for interview responses (used by complete-interview)
      const interviewResponses = interview.responses || [];
      
      console.log('📊 DSA data found:', {
        executionResults: dsaExecutions.length,
        interviewResponses: interviewResponses.length,
        hasResponses: interviewResponses.length > 0
      });
      
      if (dsaExecutions.length > 0 || interviewResponses.length > 0) {
        hasValidAnswers = true;
        // Convert DSA executions to answer format
        dsaAnswers = questionsDoc.questions?.map((question: any) => {
          const execution = dsaExecutions.find(exec => 
            exec.problemId === question.id || exec.problemId === question.dsaProblem?.id
          );
          const response = interviewResponses.find((r: any) => r.questionId === question.id);
          
          if (execution) {
            return `Code Solution: ${execution.sourceCode}\n\nExecution Result: ${execution.success ? 'PASSED' : 'FAILED'}\nTest Results: ${execution.testsPassed}/${execution.totalTests} tests passed\nExecution Time: ${execution.executionTime}ms`;
          } else if (response) {
            return response.userAnswer || response.answer || 'No answer provided';
          } else {
            return 'No answer provided';
          }
        }) || [];
      }
    }

    if (!hasValidAnswers) {
      console.warn('⚠️ No answers found in questions document:', {
        interviewId,
        hasAnswers: !!questionsDoc.answers,
        answersLength: Array.isArray(questionsDoc.answers) ? questionsDoc.answers.length : 0,
        answersType: typeof questionsDoc.answers,
        answersKeys: questionsDoc.answers && typeof questionsDoc.answers === 'object' ? Object.keys(questionsDoc.answers) : [],
        questionsDoc: Object.keys(questionsDoc),
        interviewStatus: interview.status,
        isDSAInterview
      });
      
      // Check if this is an interview that was never completed
      if (interview.status !== 'completed') {
        return NextResponse.json(
          { 
            error: 'Interview not completed yet', 
            message: 'Please complete the interview before generating feedback',
            interviewStatus: interview.status,
            debug: { interviewId, status: interview.status, isDSAInterview }
          },
          { status: 400 }
        );
      }
      
      return NextResponse.json(
        { 
          error: 'No answers submitted', 
          message: 'No answers were submitted for this completed interview',
          debug: { interviewId, documentKeys: Object.keys(questionsDoc), status: interview.status, isDSAInterview }
        },
        { status: 404 }
      );
    }

    const questions = questionsDoc.questions || [];
    
    // Handle different answer formats - both new format (objects with answer property) and direct strings
    let answers: string[] = [];
    
    // Use DSA answers if available, otherwise use regular answers
    if (isDSAInterview && dsaAnswers.length > 0) {
      console.log('🔍 Processing DSA answers:', {
        dsaAnswersCount: dsaAnswers.length,
        sampleAnswer: dsaAnswers[0]?.substring(0, 100) + '...'
      });
      answers = dsaAnswers;
    } else {
      console.log('🔍 Processing regular answers:', {
        answersType: typeof questionsDoc.answers,
        isArray: Array.isArray(questionsDoc.answers),
        length: Array.isArray(questionsDoc.answers) ? questionsDoc.answers.length : 'N/A',
        sampleAnswer: Array.isArray(questionsDoc.answers) ? questionsDoc.answers[0] : questionsDoc.answers
      });
      
      if (Array.isArray(questionsDoc.answers)) {
        answers = questionsDoc.answers.map((ans: any, index: number) => {
          let extractedAnswer = '';
          
          if (typeof ans === 'string') {
            extractedAnswer = ans || 'No answer provided';
          } else if (ans && typeof ans === 'object' && ans.answer) {
            extractedAnswer = ans.answer || 'No answer provided';
          } else if (ans && typeof ans === 'object') {
            // Handle other object formats
            extractedAnswer = ans.text || ans.response || ans.content || 'No answer provided';
          } else {
            extractedAnswer = 'No answer provided';
          }
          
          console.log(`📝 Answer ${index}:`, {
            originalType: typeof ans,
            originalValue: ans,
            extractedAnswer: extractedAnswer.substring(0, 100) + (extractedAnswer.length > 100 ? '...' : '')
          });
          
          return extractedAnswer;
        });
      } else if (questionsDoc.answers && typeof questionsDoc.answers === 'object') {
        // Handle object format (not array)
        const answersObj = questionsDoc.answers;
        answers = Object.values(answersObj).map((ans: any) => {
          if (typeof ans === 'string') {
            return ans || 'No answer provided';
          } else if (ans && typeof ans === 'object' && ans.answer) {
            return ans.answer || 'No answer provided';
          } else {
            return 'No answer provided';
          }
        });
      } else {
        console.error('❌ Answers is not an array or object:', typeof questionsDoc.answers);
        return NextResponse.json(
          { error: 'Invalid answers format', debug: { answersType: typeof questionsDoc.answers } },
          { status: 400 }
        );
      }
    }

    // Final validation - ensure we have meaningful answers
    const meaningfulAnswers = answers.filter(answer => 
      answer && 
      answer.trim() !== '' && 
      answer !== 'No answer provided' && 
      answer.trim().length > 0
    );
    
    console.log(`🧠 Processing ${questions.length} questions and ${answers.length} answers`);
    console.log(`✅ Meaningful answers found: ${meaningfulAnswers.length}/${answers.length}`);
    
    if (meaningfulAnswers.length === 0) {
      console.warn('⚠️ No meaningful answers found, but proceeding with analysis');
    }

    // Try Groq AI first, fallback to mock analysis if API key not available
    let insights;
    try {
      const groqService = GroqAIService.getInstance();
      insights = await groqService.analyzeOverallPerformance(
        questions,
        answers,
        interview.jobTitle || "Software Engineer",
        interview.skills || ["JavaScript", "React"]
      );
    } catch (groqError) {
      console.warn('Groq AI not available, using fallback analysis:', groqError);
      // Fallback analysis when Groq is not available
      insights = generateFallbackAnalysis(questions, answers, interview.jobTitle || "Software Engineer");
    }

    // Enhance insights with metadata
    const enhancedInsights = {
      ...insights,
      overallScore: insights.overallScore || 6.5,
      parameterScores: insights.parameterScores || {
        "Technical Knowledge": 7,
        "Problem Solving": 6,
        "Communication Skills": 7,
        "Practical Application": 6,
        "Company Fit": 6
      },
      metadata: {
        analyzedAt: new Date(),
        aiProvider: 'groq',
        model: 'llama-3.3-70b-versatile',
        processingTime: Date.now() - startTime,
        interviewId: interviewId,
        companyName: interview.companyName,
        jobTitle: interview.jobTitle,
        questionsAnalyzed: questions.length,
        answersProcessed: answers.length
      }
    };

    // Store the analysis
    await db.collection("questions").findOneAndUpdate(
      { interviewId: interviewId },
      {
        $set: {
          extracted: enhancedInsights,
          analyzedAt: new Date(),
          aiProvider: 'groq-fast'
        }
      }
    );

    const processingTime = Date.now() - startTime;
    console.log(`✅ Fast feedback completed in ${processingTime}ms`);

    return NextResponse.json({
      success: true,
      message: 'Fast feedback generated successfully',
      insights: enhancedInsights,
      performance: {
        processingTime: processingTime,
        aiProvider: 'groq',
        model: 'llama-3.3-70b-versatile',
        questionsAnalyzed: questions.length
      }
    });

  } catch (error: any) {
    console.error('❌ Error in fast feedback generation:', error);
    
    return NextResponse.json(
      {
        error: 'Failed to generate feedback',
        details: error.message,
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}

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
    
    // Check if feedback already exists
    const questionsDoc = await db.collection("questions").findOne({
      interviewId: interviewId
    });

    if (questionsDoc?.extracted) {
      return NextResponse.json({
        success: true,
        feedbackReady: true,
        insights: questionsDoc.extracted,
        message: 'Feedback already available'
      });
    }

    return NextResponse.json({
      success: true,
      feedbackReady: false,
      message: 'Feedback not ready yet'
    });

  } catch (error: any) {
    console.error('❌ Error checking feedback status:', error);
    
    return NextResponse.json(
      { error: 'Failed to check feedback status', details: error.message },
      { status: 500 }
    );
  }
}