import { NextRequest, NextResponse } from 'next/server';
import { aiInterviewModel } from '@/lib/aimodel';
import client from '@/lib/db';
import { ObjectId } from 'mongodb';
import { InterviewQuestion } from '@/lib/aimodel';

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

    // Get questions and answers
    const questionData = await db.collection('questions').findOne({
      interviewId: interviewId
    });

    if (!questionData || !questionData.answers) {
      return NextResponse.json(
        { error: 'Interview not completed or answers not found' },
        { status: 404 }
      );
    }

    // Convert questions to the expected format
    const questions: InterviewQuestion[] = questionData.questions.map((q: any, index: number) => ({
      id: `q_${index}`,
      question: q.question,
      expectedAnswer: q.expectedAnswer,
      difficulty: q.difficulty || 'medium',
      category: q.category || 'mixed',
      points: q.points || 8
    }));

    // Extract answers from the submitted data
    const answers: string[] = questionData.answers.map((answerObj: any) => {
      return answerObj.answer || '';
    });

    // Analyze performance using AI
    const analysis = await aiInterviewModel.analyzeInterviewPerformance(
      questions,
      answers,
      interview.jobTitle,
      interview.skills
    );

    // Calculate category-wise scores
    const categoryScores: { [key: string]: number } = {};
    const categoryQuestions: { [key: string]: number } = {};
    
    questions.forEach((q, index) => {
      const category = q.category;
      if (!categoryScores[category]) {
        categoryScores[category] = 0;
        categoryQuestions[category] = 0;
      }
      categoryQuestions[category]++;
      
      // Simple scoring based on answer length and content (you can enhance this)
      const answer = answers[index] || '';
      const score = calculateQuestionScore(answer, q.expectedAnswer, q.difficulty);
      categoryScores[category] += score;
    });

    // Average the category scores
    Object.keys(categoryScores).forEach(category => {
      categoryScores[category] = Math.round(categoryScores[category] / categoryQuestions[category]);
    });

    // Create performance report
    const performanceReport = {
      interviewId: interviewId,
      totalScore: analysis.score,
      categoryScores: categoryScores,
      overallFeedback: analysis.feedback,
      strengths: analysis.strengths,
      improvements: analysis.improvements,
      recommendations: analysis.recommendations,
      analysisDate: new Date(),
      anomalousActivity: {
        detected: false,
        concerns: [],
        riskLevel: 'low' as const
      }
    };

    // Store performance analysis
    await db.collection('performance_reports').insertOne(performanceReport);

    // Update interview status
    await db.collection('interviews').updateOne(
      { _id: new ObjectId(interviewId) },
      { $set: { status: 'analyzed' } }
    );

    return NextResponse.json({
      message: 'Performance analysis completed',
      analysis: performanceReport
    });

  } catch (error) {
    console.error('Error analyzing performance:', error);
    return NextResponse.json(
      { error: 'Failed to analyze performance' },
      { status: 500 }
    );
  }
}

function calculateQuestionScore(answer: string, expectedAnswer: string, difficulty: string): number {
  if (!answer || answer.trim().length < 10) {
    return 0;
  }

  // Basic scoring algorithm (you can enhance this with NLP)
  let baseScore = 50;
  
  // Length bonus
  if (answer.length > 50) baseScore += 20;
  if (answer.length > 150) baseScore += 10;
  
  // Keyword matching (simple approach)
  const expectedKeywords = expectedAnswer.toLowerCase().split(' ').filter(word => word.length > 3);
  const answerLower = answer.toLowerCase();
  
  let keywordMatches = 0;
  expectedKeywords.forEach(keyword => {
    if (answerLower.includes(keyword)) {
      keywordMatches++;
    }
  });
  
  const keywordScore = (keywordMatches / expectedKeywords.length) * 30;
  baseScore += keywordScore;
  
  // Difficulty adjustment
  const difficultyMultiplier = difficulty === 'hard' ? 0.8 : difficulty === 'easy' ? 1.2 : 1.0;
  baseScore *= difficultyMultiplier;
  
  return Math.min(100, Math.max(0, Math.round(baseScore)));
}