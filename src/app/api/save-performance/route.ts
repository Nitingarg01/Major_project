import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/app/auth'
import { connectToDatabase } from '@/lib/db'
import { ObjectId } from 'mongodb'

export async function POST(request: NextRequest) {
  try {
    console.log('💾 Save performance API called')
    
    const session = await auth()
    console.log('🔐 Session check:', { hasSession: !!session, hasUserId: !!session?.user?.id })
    
    if (!session?.user?.id) {
      console.log('❌ Unauthorized: No session or user ID')
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    console.log('📋 Request body received:', { 
      hasInterviewId: !!body.interviewId,
      hasJobTitle: !!body.jobTitle,
      hasCompanyName: !!body.companyName,
      hasScore: body.score !== undefined,
      score: body.score,
      interviewId: body.interviewId
    })
    
    const {
      interviewId,
      jobTitle,
      companyName,
      interviewType,
      experienceLevel,
      totalQuestions,
      correctAnswers,
      score,
      timeSpent,
      feedback,
      roundResults
    } = body

    // Validate required fields
    if (!interviewId || !jobTitle || !companyName || score === undefined) {
      console.log('Validation failed:', { interviewId, jobTitle, companyName, score })
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      )
    }

    console.log('Connecting to database...')
    const { db } = await connectToDatabase()
    console.log('Database connected successfully')

    // Validate ObjectId format
    let userObjectId, interviewObjectId
    try {
      userObjectId = new ObjectId(session.user.id)
      interviewObjectId = new ObjectId(interviewId)
      console.log('ObjectIds created successfully')
    } catch (objectIdError) {
      console.error('Invalid ObjectId format:', objectIdError)
      return NextResponse.json(
        { success: false, error: 'Invalid ID format' },
        { status: 400 }
      )
    }

    // Save performance data
    const performanceData = {
      userId: userObjectId,
      interviewId: interviewObjectId,
      jobTitle,
      companyName,
      interviewType: interviewType || 'mixed',
      experienceLevel: experienceLevel || 'mid',
      completedAt: new Date(),
      totalQuestions: totalQuestions || 0,
      correctAnswers: correctAnswers || 0,
      score: Math.round(score),
      timeSpent: timeSpent || 0,
      feedback: {
        overall: feedback?.overall || 'Interview completed successfully.',
        strengths: feedback?.strengths || [],
        improvements: feedback?.improvements || [],
        recommendations: feedback?.recommendations || []
      },
      roundResults: roundResults || []
    }

    console.log('Inserting performance data...')
    const result = await db.collection('performances').insertOne(performanceData)
    console.log('Performance data inserted with ID:', result.insertedId)

    // Update interview status to completed and remove from active list
    console.log('Updating interview status...')
    const updateResult = await db.collection('interviews').updateOne(
      { _id: interviewObjectId },
      { 
        $set: { 
          status: 'completed',
          completedAt: new Date(),
          performanceId: result.insertedId
        }
      }
    )
    console.log('Interview updated:', updateResult.modifiedCount, 'documents modified')

    return NextResponse.json({
      success: true,
      performanceId: result.insertedId.toString(),
      message: 'Performance data saved successfully'
    })

  } catch (error) {
    console.error('Error saving performance data:', error)
    console.error('Error details:', {
      name: error instanceof Error ? error.name : 'Unknown',
      message: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined
    })
    
    return NextResponse.json(
      { 
        success: false, 
        error: 'Internal server error',
        details: process.env.NODE_ENV === 'development' ? (error instanceof Error ? error.message : String(error)) : undefined
      },
      { status: 500 }
    )
  }
}