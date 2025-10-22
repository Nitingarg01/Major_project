import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

export async function POST(request: NextRequest) {
  try {
    const { interviewId, results, type } = await request.json();

    if (!interviewId || !results) {
      return NextResponse.json(
        { error: 'Interview ID and results are required' },
        { status: 400 }
      )
    }

    const { db } = await connectToDatabase();

    // Update the interview with results
    const updateResult = await db.collection('interviews').updateOne(;
      { _id: new ObjectId(interviewId) },
      {
        $set: {
          results: {
            ...results,
            type: type || 'standard',
            completedAt: new Date(),
            version: '2.0' // Virtual AI Interview version
          },
          status: 'completed',
          updatedAt: new Date()
        }
      }
    )

    if (updateResult.matchedCount === 0) {
      return NextResponse.json(
        { error: 'Interview not found' },
        { status: 404 }
      )
    }

    // If it's a virtual AI interview, also save detailed analytics
    if (type === 'virtual-ai') {
      await saveVirtualInterviewAnalytics(db, interviewId, results)
    }

    return NextResponse.json({
      success: true,
      message: 'Interview results saved successfully',
      interviewId
    })

  } catch (error) {
    console.error('Error saving interview results:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

async function saveVirtualInterviewAnalytics(db: any, interviewId: string, results: any) {
  try {
    // Extract detailed analytics for virtual AI interviews
    const analytics = {
      interviewId: new ObjectId(interviewId),
      type: 'virtual-ai',
      createdAt: new Date(),
      
      // Conversation metrics
      conversationMetrics: {
        totalExchanges: results.conversationHistory?.length || 0,
        averageResponseTime: results.averageResponseTime || 0,
        totalInterviewTime: results.totalTime || 0,
        questionsAnswered: results.answeredQuestions || 0,
        totalQuestions: results.totalQuestions || 0
      },

      // Response analysis
      responseAnalysis: results.responses?.map((response: any) => ({
        questionIndex: response.questionIndex,
        question: response.question,
        userAnswer: response.userAnswer,
        responseTime: response.responseTime,
        analysis: response.analysis || {},
        aiFollowUp: response.aiFollowUp,
        timestamp: response.timestamp
      })) || [],

      // Overall performance
      performance: {
        overallScore: results.overallScore || 0,
        strengths: results.strengths || [],
        improvements: results.improvements || [],
        scoreBreakdown: results.responses?.map((r: any) => ({
          questionIndex: r.questionIndex,
          score: r.analysis?.score || 0
        })) || []
      },

      // Technical metrics
      technicalMetrics: {
        speechToTextUsed: results.metadata?.speechToText || false,
        textToSpeechUsed: results.metadata?.textToSpeech || false,
        conversationFlowEnabled: results.metadata?.conversationFlow || false,
        realTimeAnalysis: results.metadata?.realTimeAnalysis || false
      },

      // Conversation flow analysis
      conversationFlow: {
        naturalness: calculateConversationNaturalness(results.conversationHistory),
        engagement: calculateEngagementScore(results.conversationHistory),
        followUpQuality: calculateFollowUpQuality(results.responses)
      }
    }

    // Save to virtual_interview_analytics collection
    await db.collection('virtual_interview_analytics').insertOne(analytics)

    console.log(`✅ Virtual interview analytics saved for interview ${interviewId}`);
  } catch (error) {
    console.error('Error saving virtual interview analytics:', error);
    // Don't throw error - analytics failure shouldn't fail the main save
  }
}

function calculateConversationNaturalness(conversationHistory: any[]): number {
  if (!conversationHistory || conversationHistory.length === 0) return 0;
  
  // Simple metric based on conversation flow
  let naturalness = 5 // Base score
  
  // Check for back-and-forth conversation
  let alternatingCount = 0;
  for (let i = 1; i < conversationHistory.length; i++) {
    if (conversationHistory[i].speaker !== conversationHistory[i-1].speaker) {
      alternatingCount++
    }
  }
  
  const alternatingRatio = alternatingCount / (conversationHistory.length - 1);
  naturalness += alternatingRatio * 3 // Up to 3 bonus points
  
  return Math.min(naturalness, 10);
}

function calculateEngagementScore(conversationHistory: any[]): number {
  if (!conversationHistory || conversationHistory.length === 0) return 0;
  
  const userMessages = conversationHistory.filter(msg => msg.speaker === 'user');
  const totalWords = userMessages.reduce((sum, msg) => {
    return sum + (msg.message?.split(' ').length || 0);
  }, 0)
  
  const averageWordsPerResponse = totalWords / Math.max(userMessages.length, 1);
  
  // Score based on response length (engagement indicator)
  if (averageWordsPerResponse > 50) return 10
  if (averageWordsPerResponse > 30) return 8
  if (averageWordsPerResponse > 20) return 6
  if (averageWordsPerResponse > 10) return 4
  return 2;
}

function calculateFollowUpQuality(responses: any[]): number {
  if (!responses || responses.length === 0) return 0;
  
  const responsesWithFollowUp = responses.filter(r => r.aiFollowUp);
  const followUpRatio = responsesWithFollowUp.length / responses.length;
  
  return followUpRatio * 10 // 0-10 scale based on follow-up frequency
}