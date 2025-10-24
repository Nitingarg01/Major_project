import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/app/auth';
import { connectToDatabase } from '@/lib/db';
import { ObjectId } from 'mongodb';
import Groq from 'groq-sdk';

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { interviewId, questionIndex, response } = await request.json();

    if (!interviewId || questionIndex === undefined || !response) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const { db } = await connectToDatabase();
    const interview = await db.collection('interviews').findOne({
      _id: new ObjectId(interviewId),
      userId: session.user.id
    });

    if (!interview) {
      return NextResponse.json({ error: 'Interview not found' }, { status: 404 });
    }

    const question = interview.questions[questionIndex];
    if (!question) {
      return NextResponse.json({ error: 'Question not found' }, { status: 404 });
    }

    // Generate instant feedback using Groq
    const feedbackPrompt = `You are an expert interviewer providing instant feedback.

Question: ${question.question}
Question Type: ${question.type}
Difficulty: ${question.difficulty}
Expected Key Points: ${question.expectedPoints.join(', ')}

Candidate's Response:
${response}

Provide brief, encouraging feedback (2-3 sentences) that:
1. Acknowledges what they did well
2. Suggests one improvement
3. Is constructive and motivating

Keep it conversational and supportive.`;

    const completion = await groq.chat.completions.create({
      messages: [{ role: 'user', content: feedbackPrompt }],
      model: 'mixtral-8x7b-32768',
      temperature: 0.7,
      max_tokens: 200,
    });

    const feedback = completion.choices[0]?.message?.content || 'Good response! Let\'s move to the next question.';

    // Update interview with response and feedback
    await db.collection('interviews').updateOne(
      { _id: new ObjectId(interviewId) },
      {
        $set: {
          [`questions.${questionIndex}.response`]: response,
          [`questions.${questionIndex}.feedback`]: feedback,
          currentQuestionIndex: questionIndex,
          updatedAt: new Date()
        }
      }
    );

    return NextResponse.json({ success: true, feedback });

  } catch (error: any) {
    console.error('Error submitting response:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to submit response' },
      { status: 500 }
    );
  }
}
