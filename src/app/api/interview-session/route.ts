import { NextRequest, NextResponse } from 'next/server';
import client from '@/lib/db';
import { ObjectId } from 'mongodb';
import { EnhancedRoundManager } from '@/lib/enhancedRoundManager';

const roundManager = EnhancedRoundManager.getInstance();

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, interviewId, sessionData } = body;

    const db = client.db();

    switch (action) {
      case 'initialize':
        // Initialize a new interview session
        const { userId, companyName, jobTitle, interviewType } = sessionData;
        
        const session = await roundManager.initializeSession(
          userId,
          interviewId,
          companyName,
          jobTitle,
          interviewType
        );

        // Store session in database
        await db.collection('interview_sessions').insertOne({
          sessionId: session.sessionId,
          interviewId,
          userId,
          sessionData: session,
          createdAt: new Date(),
          status: 'active'
        });

        return NextResponse.json({
          success: true,
          session: session
        });

      case 'complete-round':
        // Complete a round and move to next
        const { answers, timeSpent, suspiciousActivity = [] } = sessionData;
        
        // Get current session
        const currentSession = await db.collection('interview_sessions').findOne({
          interviewId: interviewId,
          status: 'active'
        });

        if (!currentSession) {
          return NextResponse.json(
            { error: 'Session not found' },
            { status: 404 }
          );
        }

        const { session: updatedSession, roundResult } = await roundManager.completeRound(
          currentSession.sessionData,
          answers,
          timeSpent,
          suspiciousActivity
        );

        // Update session in database
        await db.collection('interview_sessions').updateOne(
          { sessionId: updatedSession.sessionId },
          { 
            $set: { 
              sessionData: updatedSession,
              updatedAt: new Date()
            }
          }
        );

        // Store round result
        await db.collection('interview_round_results').insertOne({
          sessionId: updatedSession.sessionId,
          interviewId,
          roundResult,
          createdAt: new Date()
        });

        return NextResponse.json({
          success: true,
          session: updatedSession,
          roundResult,
          isCompleted: updatedSession.sessionData.endTime !== undefined;
        });

      case 'finalize':
        // Generate final report
        const sessionToFinalize = await db.collection('interview_sessions').findOne({
          interviewId: interviewId,
          status: 'active'
        });

        if (!sessionToFinalize) {
          return NextResponse.json(
            { error: 'Session not found' },
            { status: 404 }
          );
        }

        const finalReport = await roundManager.generateFinalReport(sessionToFinalize.sessionData);

        // Store final report
        await db.collection('interview_reports').insertOne({
          interviewId,
          sessionId: sessionToFinalize.sessionId,
          report: finalReport,
          createdAt: new Date()
        });

        // Mark session as completed
        await db.collection('interview_sessions').updateOne(
          { sessionId: sessionToFinalize.sessionId },
          { 
            $set: { 
              status: 'completed',
              completedAt: new Date()
            }
          }
        );

        // Update interview status
        await db.collection('interviews').updateOne(
          { _id: new ObjectId(interviewId) },
          { $set: { status: 'completed' } }
        );

        return NextResponse.json({
          success: true,
          report: finalReport
        });

      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        );
    }

  } catch (error) {
    console.error('Interview session API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
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
    
    // Get active session
    const session = await db.collection('interview_sessions').findOne({
      interviewId: interviewId,
      status: 'active'
    });

    if (!session) {
      return NextResponse.json(
        { error: 'No active session found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      session: session.sessionData
    });

  } catch (error) {
    console.error('Get session error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}