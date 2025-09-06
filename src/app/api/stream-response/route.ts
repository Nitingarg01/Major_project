import { NextRequest, NextResponse } from 'next/server'
import { aiInterviewModel } from '@/lib/aimodel'

export async function POST(request: NextRequest) {
  try {
    const { question, userAnswer, expectedAnswer, difficulty } = await request.json()

    if (!question || !userAnswer) {
      return NextResponse.json(
        { error: "Question and user answer are required" },
        { status: 400 }
      )
    }

    // Create a readable stream for real-time response
    const encoder = new TextEncoder()
    
    const stream = new ReadableStream({
      async start(controller) {
        try {
          // Generate feedback using AI model
          const prompt = `
          You are an expert interview evaluator. Analyze this interview response and provide detailed feedback.
          
          Question: ${question}
          Expected Answer: ${expectedAnswer}
          Candidate's Answer: ${userAnswer}
          Difficulty: ${difficulty}
          
          Provide feedback in the following JSON format:
          {
            "score": number (0-10),
            "feedback": "detailed constructive feedback",
            "strengths": ["strength1", "strength2"],
            "improvements": ["improvement1", "improvement2"],
            "tips": ["tip1", "tip2"]
          }
          
          Be constructive and encouraging while being honest about areas for improvement.
          `

          // Simulate streaming response
          const feedbackChunks = [
            { type: 'status', data: 'Analyzing your response...' },
            { type: 'status', data: 'Evaluating technical accuracy...' },
            { type: 'status', data: 'Assessing communication clarity...' },
            { type: 'status', data: 'Generating improvement suggestions...' },
            { type: 'status', data: 'Finalizing feedback...' }
          ]

          // Send status updates
          for (const chunk of feedbackChunks) {
            controller.enqueue(encoder.encode(`data: ${JSON.stringify(chunk)}\n\n`))
            await new Promise(resolve => setTimeout(resolve, 800)) // Simulate processing time
          }

          // Generate actual feedback using AI
          const result = await aiInterviewModel.generateContent(prompt)
          const response = await result.response
          const text = response.text()
          
          // Parse and clean the response
          const cleanedText = text.replace(/```json\n?|\n?```/g, '').trim()
          const feedback = JSON.parse(cleanedText)
          
          // Send final feedback
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({
            type: 'feedback',
            data: feedback
          })}\n\n`))
          
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({
            type: 'complete',
            data: 'Feedback analysis complete!'
          })}\n\n`))
          
        } catch (error) {
          console.error('Streaming error:', error)
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({
            type: 'error',
            data: 'Failed to generate feedback'
          })}\n\n`))
        } finally {
          controller.close()
        }
      }
    })

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    })

  } catch (error) {
    console.error('Stream API error:', error)
    return NextResponse.json(
      { error: 'Failed to process request' },
      { status: 500 }
    )
  }
}