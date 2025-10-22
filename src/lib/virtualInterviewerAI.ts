/**
 * Virtual Interviewer AI Service
 * Handles natural conversation flow, follow-up questions, and real-time analysis
 */

import { SmartAIService } from './smartAIService'

export interface ConversationContext {
  companyName: string
  jobTitle: string
  interviewType: string
  currentQuestionIndex: number
  totalQuestions: number
  conversationHistory: Array<{
    speaker: 'ai' | 'user'
    message: string
    timestamp: Date
    questionIndex?: number
  }>
  userProfile?: {
    experience: string
    skills: string[]
    resume?: string
  }
}

export interface AIResponse {
  message: string
  type: 'question' | 'followup' | 'feedback' | 'transition' | 'closing'
  emotion: 'neutral' | 'encouraging' | 'probing' | 'supportive'
  shouldSpeak: boolean
  nextAction?: 'wait_for_response' | 'move_to_next' | 'end_interview'
}

export class VirtualInterviewerAI {
  private static instance: VirtualInterviewerAI
  private smartAI: SmartAIService

  private constructor() {
    this.smartAI = SmartAIService.getInstance()
  }

  public static getInstance(): VirtualInterviewerAI {
    if (!VirtualInterviewerAI.instance) {
      VirtualInterviewerAI.instance = new VirtualInterviewerAI()
    }
    return VirtualInterviewerAI.instance
  }

  /**
   * Generate welcome message for the interview
   */
  public generateWelcomeMessage(context: ConversationContext): AIResponse {
    const messages = [
      `Hello! I'm excited to speak with you today about the ${context.jobTitle} position at ${context.companyName}. I'm an AI interviewer, and I'll be conducting this ${context.interviewType} interview with you. We'll have a natural conversation, so feel free to speak naturally. Are you ready to begin?`,
      
      `Welcome to your ${context.interviewType} interview for ${context.jobTitle} at ${context.companyName}! I'm your AI interviewer, and I'm here to have a meaningful conversation about your experience and skills. I'll ask you ${context.totalQuestions} questions, and we can discuss each one in detail. Let's get started!`,
      
      `Hi there! Thanks for joining me today. I'm an AI interviewer, and I'll be conducting your ${context.interviewType} interview for the ${context.jobTitle} role at ${context.companyName}. This will be conversational, so please speak naturally and ask questions if you need clarification. Ready to dive in?`
    ]

    return {
      message: messages[Math.floor(Math.random() * messages.length)],
      type: 'question',
      emotion: 'encouraging',
      shouldSpeak: true,
      nextAction: 'wait_for_response'
    }
  }

  /**
   * Generate follow-up questions based on user response
   */
  public async generateFollowUp(
    userResponse: string,
    originalQuestion: string,
    context: ConversationContext
  ): Promise<AIResponse> {
    try {
      const prompt = `
You are an experienced AI interviewer conducting a ${context.interviewType} interview for a ${context.jobTitle} position at ${context.companyName}.

Original Question: "${originalQuestion}"
Candidate's Response: "${userResponse}"

Generate a natural, conversational follow-up that:
1. Acknowledges their response positively
2. Probes deeper into their answer with a specific follow-up question
3. Maintains a professional but friendly tone
4. Is relevant to the ${context.jobTitle} role

Keep the follow-up concise (1-2 sentences) and natural. Examples:
- "That's interesting! Can you walk me through how you approached that challenge?"
- "I see. What was the most difficult part of implementing that solution?"
- "Good point. How did you measure the success of that project?"

Generate only the follow-up response, nothing else.`

      const result = await this.smartAI.processRequest({
        task: 'question_generation',
        context: {
          jobTitle: context.jobTitle,
          companyName: context.companyName,
          interviewType: context.interviewType,
          numberOfQuestions: 1
        }
      })

      if (result.success && result.data) {
        // Extract follow-up from AI response
        const followUp = this.extractFollowUpFromResponse(result.data, userResponse)
        
        return {
          message: followUp,
          type: 'followup',
          emotion: 'probing',
          shouldSpeak: true,
          nextAction: 'wait_for_response'
        }
      }
    } catch (error) {
      console.error('Error generating AI follow-up:', error)
    }

    // Fallback to predefined follow-ups
    return this.generateFallbackFollowUp(userResponse, originalQuestion, context)
  }

  /**
   * Generate transition to next question
   */
  public generateTransition(
    currentQuestionIndex: number,
    totalQuestions: number,
    context: ConversationContext
  ): AIResponse {
    const isLastQuestion = currentQuestionIndex >= totalQuestions - 1
    
    if (isLastQuestion) {
      return {
        message: "Thank you for that response. We've covered all the questions I had prepared. Do you have any questions for me about the role or the company before we wrap up?",
        type: 'closing',
        emotion: 'supportive',
        shouldSpeak: true,
        nextAction: 'end_interview'
      }
    }

    const transitions = [
      "Great! Let's move on to the next question.",
      "Thank you for that insight. Now, let me ask you about something else.",
      "Excellent. I'd like to explore another area with you.",
      "That's helpful to know. Let's shift gears a bit.",
      "Perfect. Now I'm curious about your experience with..."
    ]

    return {
      message: transitions[Math.floor(Math.random() * transitions.length)],
      type: 'transition',
      emotion: 'neutral',
      shouldSpeak: true,
      nextAction: 'move_to_next'
    }
  }

  /**
   * Analyze user response and provide feedback
   */
  public async analyzeResponse(
    userResponse: string,
    question: string,
    context: ConversationContext
  ): Promise<{
    score: number
    strengths: string[]
    improvements: string[]
    feedback: string
  }> {
    try {
      const result = await this.smartAI.processRequest({
        task: 'response_analysis',
        context: {
          question,
          userAnswer: userResponse,
          expectedAnswer: 'Comprehensive response with examples',
          interviewType: context.interviewType,
          companyName: context.companyName
        }
      })

      if (result.success && result.data) {
        return {
          score: result.data.score || 7,
          strengths: result.data.strengths || ['Clear communication'],
          improvements: result.data.improvements || ['Add more specific examples'],
          feedback: result.data.feedback || 'Good response overall'
        }
      }
    } catch (error) {
      console.error('Error analyzing response:', error)
    }

    // Fallback analysis
    return this.generateFallbackAnalysis(userResponse, question)
  }

  /**
   * Generate encouraging responses during pauses
   */
  public generateEncouragement(): AIResponse {
    const encouragements = [
      "Take your time to think about it.",
      "No rush, I'm here when you're ready.",
      "Feel free to think through your answer.",
      "Take a moment to gather your thoughts.",
      "I'm listening whenever you're ready to continue."
    ]

    return {
      message: encouragements[Math.floor(Math.random() * encouragements.length)],
      type: 'feedback',
      emotion: 'supportive',
      shouldSpeak: true,
      nextAction: 'wait_for_response'
    }
  }

  /**
   * Handle clarification requests
   */
  public generateClarification(
    originalQuestion: string,
    clarificationRequest: string,
    context: ConversationContext
  ): AIResponse {
    const clarifications = [
      `Of course! Let me rephrase that question. ${this.simplifyQuestion(originalQuestion)}`,
      `Sure, I can clarify. What I'm looking for is ${this.explainQuestionIntent(originalQuestion, context)}`,
      `Absolutely! Let me break that down for you. ${this.provideQuestionContext(originalQuestion, context)}`
    ]

    return {
      message: clarifications[Math.floor(Math.random() * clarifications.length)],
      type: 'question',
      emotion: 'supportive',
      shouldSpeak: true,
      nextAction: 'wait_for_response'
    }
  }

  // Private helper methods

  private extractFollowUpFromResponse(aiData: any, userResponse: string): string {
    // Extract meaningful follow-up from AI response
    if (Array.isArray(aiData) && aiData.length > 0) {
      const question = aiData[0]
      if (question.question) {
        return this.makeFollowUpConversational(question.question)
      }
    }
    
    return this.generateContextualFollowUp(userResponse)
  }

  private makeFollowUpConversational(question: string): string {
    const conversationalStarters = [
      "That's interesting! ",
      "I see. ",
      "Good point. ",
      "Thanks for sharing that. ",
      "That makes sense. "
    ]
    
    const starter = conversationalStarters[Math.floor(Math.random() * conversationalStarters.length)]
    return starter + question
  }

  private generateContextualFollowUp(userResponse: string): string {
    const responseLength = userResponse.split(' ').length
    
    if (responseLength < 10) {
      return "Can you elaborate on that a bit more? I'd love to hear more details about your experience."
    } else if (responseLength > 50) {
      return "That's a comprehensive answer! What would you say was the most challenging aspect of what you just described?"
    } else {
      return "Interesting approach! How did you measure the success of that solution?"
    }
  }

  private generateFallbackFollowUp(
    userResponse: string,
    originalQuestion: string,
    context: ConversationContext
  ): AIResponse {
    const followUps = [
      "That's a great start! Can you give me a specific example of how you've applied that in practice?",
      "I appreciate that perspective. What challenges did you face when implementing that approach?",
      "Interesting! How do you think that experience would translate to this role at " + context.companyName + "?",
      "Good insight! What would you do differently if you encountered a similar situation again?",
      "That's valuable experience. How did you measure the impact of your work?"
    ]

    return {
      message: followUps[Math.floor(Math.random() * followUps.length)],
      type: 'followup',
      emotion: 'probing',
      shouldSpeak: true,
      nextAction: 'wait_for_response'
    }
  }

  private generateFallbackAnalysis(userResponse: string, question: string) {
    const wordCount = userResponse.split(' ').length
    const hasExamples = userResponse.toLowerCase().includes('example') || 
                       userResponse.toLowerCase().includes('instance') ||
                       userResponse.toLowerCase().includes('time when')

    let score = 5
    const strengths: string[] = []
    const improvements: string[] = []

    if (wordCount > 30) {
      score += 1
      strengths.push('Detailed response')
    } else {
      improvements.push('Provide more detailed explanations')
    }

    if (hasExamples) {
      score += 1
      strengths.push('Included specific examples')
    } else {
      improvements.push('Add concrete examples from your experience')
    }

    if (wordCount > 50) {
      score += 1
      strengths.push('Comprehensive coverage of the topic')
    }

    return {
      score: Math.min(score, 10),
      strengths,
      improvements,
      feedback: `Your response was ${wordCount > 30 ? 'detailed' : 'concise'}${hasExamples ? ' and included good examples' : ' but could benefit from specific examples'}.`
    }
  }

  private simplifyQuestion(question: string): string {
    // Simplify complex questions
    return question.replace(/complex|sophisticated|elaborate/gi, 'detailed')
                  .replace(/utilize|implement|execute/gi, 'use')
  }

  private explainQuestionIntent(question: string, context: ConversationContext): string {
    return `your experience and approach to ${this.extractKeyTopic(question)} in the context of a ${context.jobTitle} role.`
  }

  private provideQuestionContext(question: string, context: ConversationContext): string {
    return `This question helps me understand how you'd handle ${this.extractKeyTopic(question)} at ${context.companyName}.`
  }

  private extractKeyTopic(question: string): string {
    // Extract the main topic from the question
    const topics = question.toLowerCase().match(/(problem solving|teamwork|leadership|technical challenges|project management|communication|conflict resolution)/g)
    return topics ? topics[0] : 'this type of situation'
  }
}

export default VirtualInterviewerAI