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

    const { interviewId } = await request.json();

    if (!interviewId) {
      return NextResponse.json(
        { error: 'Interview ID is required' },
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

    // Generate comprehensive performance report
    const questionsAndResponses = interview.questions.map((q: any) => 
      `Q: ${q.question}\nA: ${q.response || 'No response'}\nInstant Feedback: ${q.feedback || 'N/A'}`
    ).join('\n\n');

    const reportPrompt = `You are an expert interview coach. Analyze this complete interview and provide a comprehensive performance evaluation.

Job Title: ${interview.jobTitle}
Company: ${interview.companyName || 'Not specified'}
Interview Type: ${interview.interviewType}
Experience Level: ${interview.experienceLevel}

Interview Questions and Responses:
${questionsAndResponses}

Provide a detailed JSON evaluation with:
{
  "overallScore": (0-100),
  "summary": "Brief overall assessment (2-3 sentences)",
  "strengths": ["strength 1", "strength 2", "strength 3"],
  "improvements": ["improvement area 1", "improvement area 2", "improvement area 3"],
  "detailedFeedback": "Comprehensive feedback covering communication skills, technical knowledge, problem-solving approach, and interview presence (4-5 sentences)",
  "actionableAdvice": ["specific advice 1", "specific advice 2", "specific advice 3"],
  "categoryScores": {
    "communication": (0-100),
    "technicalSkills": (0-100),
    "problemSolving": (0-100),
    "cultureFit": (0-100)
  }
}

Return ONLY valid JSON, no other text.`;

    const completion = await groq.chat.completions.create({
      messages: [{ role: 'user', content: reportPrompt }],
      model: 'mixtral-8x7b-32768',
      temperature: 0.7,
      max_tokens: 1500,
    });

    let performanceReport;
    try {
      const responseText = completion.choices[0]?.message?.content || '{}';
      const jsonMatch = responseText.match(/```json\s*([\s\S]*?)\s*```/) || 
                       responseText.match(/```\s*([\s\S]*?)\s*```/) ||
                       [null, responseText];
      performanceReport = JSON.parse(jsonMatch[1] || responseText);
    } catch (err) {
      console.error('Failed to parse performance report:', err);
      // Fallback report
      performanceReport = {
        overallScore: 75,
        summary: 'You completed the interview successfully and showed good potential.',
        strengths: ['Clear communication', 'Relevant experience', 'Professional demeanor'],
        improvements: ['Provide more specific examples', 'Structure answers better', 'Show more enthusiasm'],
        detailedFeedback: 'Overall, you demonstrated solid interview skills. Your responses showed understanding of the role requirements. To improve further, consider using the STAR method for behavioral questions and providing more quantifiable results.',
        actionableAdvice: [
          'Practice the STAR method for behavioral questions',
          'Research company-specific information before interviews',
          'Prepare questions to ask the interviewer'
        ],
        categoryScores: {
          communication: 75,
          technicalSkills: 70,
          problemSolving: 75,
          cultureFit: 80
        }
      };
    }

    // Save performance report
    await db.collection('performanceReports').insertOne({
      interviewId: new ObjectId(interviewId),
      userId: session.user.id,
      ...performanceReport,
      createdAt: new Date()
    });

    // Update interview status
    await db.collection('interviews').updateOne(
      { _id: new ObjectId(interviewId) },
      {
        $set: {
          status: 'completed',
          completedAt: new Date(),
          performanceReport
        }
      }
    );

    return NextResponse.json({ success: true, report: performanceReport });

  } catch (error: any) {
    console.error('Error completing interview:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to complete interview' },
      { status: 500 }
    );
  }
}
