import { NextRequest, NextResponse } from 'next/server';
import { aiInterviewModel } from '@/lib/aimodel';
import client from '@/lib/db';
import { ObjectId } from 'mongodb';

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

    // Get resume content if available
    let resumeContent = '';
    if (interview.projectContext?.length > 0 || interview.workExDetails?.length > 0) {
      resumeContent = `Projects: ${interview.projectContext?.join(', ') || 'None'}\nWork Experience: ${interview.workExDetails?.join(', ') || 'None'}`;
    }

    // Generate questions using AI
    const questions = await aiInterviewModel.generateInterviewQuestions({
      jobTitle: interview.jobTitle,
      companyName: interview.companyName,
      skills: interview.skills,
      jobDescription: interview.jobDesc,
      experienceLevel: interview.experienceLevel || 'mid',
      interviewType: interview.interviewType || 'mixed',
      resumeContent: resumeContent || undefined,
      numberOfQuestions: getQuestionCount(interview.interviewType)
    });

    // Store questions in database
    const questionDoc = {
      interviewId: interviewId,
      questions: questions.map(q => ({
        question: q.question,
        expectedAnswer: q.expectedAnswer,
        difficulty: q.difficulty,
        category: q.category,
        points: q.points
      })),
      createdAt: new Date(),
      status: 'ready'
    };

    // Check if questions already exist
    const existingQuestions = await db.collection('questions').findOne({
      interviewId: interviewId
    });

    if (existingQuestions) {
      // Update existing questions
      await db.collection('questions').updateOne(
        { interviewId: interviewId },
        { $set: questionDoc }
      );
    } else {
      // Insert new questions
      await db.collection('questions').insertOne(questionDoc);
    }

    // Update interview status
    await db.collection('interviews').updateOne(
      { _id: new ObjectId(interviewId) },
      { $set: { status: 'ready' } }
    );

    return NextResponse.json({
      message: 'Questions generated successfully',
      questionsCount: questions.length,
      questions: questions
    });

  } catch (error) {
    console.error('Error generating questions:', error);
    return NextResponse.json(
      { error: 'Failed to generate questions' },
      { status: 500 }
    );
  }
}

function getQuestionCount(interviewType: string): number {
  switch (interviewType) {
    case 'mixed': return 20;      // Increased for comprehensive coverage
    case 'technical': return 15;  // More technical depth
    case 'behavioral': return 12; // Better behavioral assessment  
    case 'aptitude': return 18;   // More aptitude challenges
    case 'dsa': return 14;        // More algorithm practice
    default: return 15;
  }
}