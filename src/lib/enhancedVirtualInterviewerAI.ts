/**
 * Enhanced Virtual Interviewer AI Service
 * Integrates ElevenLabs TTS with fallback to browser TTS
 * Improved conversation flow and response quality
 */

import { SmartAIService } from './smartAIService'
import ElevenLabsService from './elevenlabsService'

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
  personality?: 'professional' | 'friendly' | 'strict' | 'encouraging'
}

export interface AIResponse {
  message: string
  type: 'question' | 'followup' | 'feedback' | 'transition' | 'closing'
  emotion: 'neutral' | 'encouraging' | 'probing' | 'supportive'
  shouldSpeak: boolean
  nextAction?: 'wait_for_response' | 'move_to_next' | 'end_interview'
}

export interface SpeechOptions {
  useElevenLabs?: boolean
  personality?: 'professional' | 'friendly' | 'strict' | 'encouraging'
  onStart?: () => void
  onEnd?: () => void
  onError?: (error: any) => void
}

export class EnhancedVirtualInterviewerAI {
  private static instance: EnhancedVirtualInterviewerAI
  private smartAI: SmartAIService
  private elevenLabs: ElevenLabsService
  private currentAudio: HTMLAudioElement | null = null
  private currentUtterance: SpeechSynthesisUtterance | null = null

  private constructor() {
    this.smartAI = SmartAIService.getInstance()
    this.elevenLabs = ElevenLabsService.getInstance()
  }

  public static getInstance(): EnhancedVirtualInterviewerAI {
    if (!EnhancedVirtualInterviewerAI.instance) {
      EnhancedVirtualInterviewerAI.instance = new EnhancedVirtualInterviewerAI()
    }
    return EnhancedVirtualInterviewerAI.instance
  }

  /**
   * Speak text with ElevenLabs or fallback to browser TTS
   */
  public async speak(text: string, options?: SpeechOptions): Promise<void> {
    // Stop any ongoing speech
    this.stopSpeaking()

    const useElevenLabs = options?.useElevenLabs !== false
    const personality = options?.personality || 'professional'

    // Try ElevenLabs first if available
    if (useElevenLabs && this.elevenLabs.isServiceAvailable()) {
      try {
        const result = await this.elevenLabs.textToSpeech(text, {
          personality,
          onStart: options?.onStart,
          onEnd: options?.onEnd,
          onError: (error) => {
            console.warn('ElevenLabs failed, falling back to browser TTS:', error)
            // Fallback to browser TTS on error
            this.speakWithBrowserTTS(text, options)
          }
        })

        if (result.success && result.audio) {
          this.currentAudio = result.audio
          return
        }
      } catch (error) {
        console.warn('ElevenLabs exception, using browser TTS:', error)
        // Continue to fallback
      }
    }

    // Fallback to browser TTS
    this.speakWithBrowserTTS(text, options)
  }

  /**
   * Speak using browser's native TTS
   */
  private speakWithBrowserTTS(text: string, options?: SpeechOptions): void {
    if (!window.speechSynthesis) {
      console.error('Speech synthesis not supported')
      return
    }

    const utterance = new SpeechSynthesisUtterance(text)
    
    // Configure voice based on personality
    const personality = options?.personality || 'professional'
    this.configureBrowserVoice(utterance, personality)

    utterance.onstart = () => {
      if (options?.onStart) options.onStart()
    }

    utterance.onend = () => {
      if (options?.onEnd) options.onEnd()
    }

    utterance.onerror = (error) => {
      console.error('Browser TTS error:', error)
      if (options?.onError) options.onError(error)
    }

    this.currentUtterance = utterance
    window.speechSynthesis.speak(utterance)
  }

  /**
   * Configure browser voice based on personality
   */
  private configureBrowserVoice(
    utterance: SpeechSynthesisUtterance,
    personality: string
  ): void {
    const voices = window.speechSynthesis.getVoices()
    
    // Select voice based on personality
    let preferredVoice = null
    
    switch (personality) {
      case 'professional':
        preferredVoice = voices.find(v => 
          v.name.includes('Google US English') || 
          v.name.includes('Microsoft David') ||
          v.name.includes('Samantha')
        )
        utterance.rate = 0.95
        utterance.pitch = 1.0
        break
      
      case 'friendly':
        preferredVoice = voices.find(v => 
          v.name.includes('Google UK English Female') ||
          v.name.includes('Microsoft Zira') ||
          v.name.includes('Karen')
        )
        utterance.rate = 1.0
        utterance.pitch = 1.1
        break
      
      case 'strict':
        preferredVoice = voices.find(v => 
          v.name.includes('Google UK English Male') ||
          v.name.includes('Microsoft Mark')
        )
        utterance.rate = 0.9
        utterance.pitch = 0.9
        break
      
      case 'encouraging':
        preferredVoice = voices.find(v => 
          v.name.includes('Google US English Female') ||
          v.name.includes('Microsoft Eva')
        )
        utterance.rate = 1.05
        utterance.pitch = 1.2
        break
    }

    if (preferredVoice) {
      utterance.voice = preferredVoice
    }
    
    utterance.volume = 0.9
  }

  /**
   * Stop any ongoing speech
   */
  public stopSpeaking(): void {
    // Stop ElevenLabs audio
    if (this.currentAudio) {
      this.currentAudio.pause()
      this.currentAudio.currentTime = 0
      this.currentAudio = null
    }

    // Stop browser TTS
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel()
    }
    
    this.currentUtterance = null
  }

  /**
   * Check if currently speaking
   */
  public isSpeaking(): boolean {
    const elevenLabsSpeaking = this.currentAudio && !this.currentAudio.paused
    const browserSpeaking = window.speechSynthesis?.speaking || false
    return elevenLabsSpeaking || browserSpeaking
  }

  /**
   * Generate welcome message with personality
   */
  public generateWelcomeMessage(context: ConversationContext): AIResponse {
    const personality = context.personality || 'professional'
    
    const messages = {
      professional: [
        `Good ${this.getTimeOfDay()}! I'm your AI interviewer for the ${context.jobTitle} position at ${context.companyName}. I'll be conducting this ${context.interviewType} interview with ${context.totalQuestions} questions. Let's begin.`,
        `Hello, and thank you for joining me today. I'm conducting your ${context.interviewType} interview for the ${context.jobTitle} role at ${context.companyName}. We have ${context.totalQuestions} questions to cover. Shall we start?`
      ],
      friendly: [
        `Hey there! Great to meet you! I'm excited to chat with you about the ${context.jobTitle} position at ${context.companyName}. This will be a relaxed ${context.interviewType} interview. Ready to dive in?`,
        `Hi! Welcome! I'm your friendly AI interviewer today. We'll have a great conversation about the ${context.jobTitle} role at ${context.companyName}. No stress - just ${context.totalQuestions} questions to explore together!`
      ],
      strict: [
        `Good ${this.getTimeOfDay()}. I am conducting your ${context.interviewType} interview for ${context.companyName}. We have ${context.totalQuestions} questions. Time is valuable, so let's proceed efficiently.`,
        `Welcome. This is a ${context.interviewType} interview for the ${context.jobTitle} position. I expect clear, concise responses to ${context.totalQuestions} questions. Let's begin.`
      ],
      encouraging: [
        `Hello and welcome! I'm so excited to meet you today! You're interviewing for ${context.jobTitle} at ${context.companyName}, and I know you'll do amazing! Let's have a wonderful conversation about your experience!`,
        `Hi there! Don't be nervous - you've got this! I'm here to help you shine in this ${context.interviewType} interview for ${context.companyName}. We'll go through ${context.totalQuestions} questions together. You're going to do great!`
      ]
    }

    const personalityMessages = messages[personality]
    const message = personalityMessages[Math.floor(Math.random() * personalityMessages.length)]

    return {
      message,
      type: 'question',
      emotion: personality === 'encouraging' ? 'encouraging' : 'neutral',
      shouldSpeak: true,
      nextAction: 'wait_for_response'
    }
  }

  /**
   * Generate follow-up questions with better context
   */
  public async generateFollowUp(
    userResponse: string,
    originalQuestion: string,
    context: ConversationContext
  ): Promise<AIResponse> {
    const personality = context.personality || 'professional'
    
    try {
      // Use SmartAI for intelligent follow-ups
      const result = await this.smartAI.processRequest({
        task: 'response_analysis',
        context: {
          question: originalQuestion,
          userAnswer: userResponse,
          interviewType: context.interviewType,
          companyName: context.companyName,
          jobTitle: context.jobTitle
        }
      })

      if (result.success && result.data) {
        const followUp = this.makeFollowUpConversational(
          this.extractFollowUpQuestion(result.data, userResponse),
          personality
        )
        
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

    // Fallback to personality-based follow-ups
    return this.generateFallbackFollowUp(userResponse, originalQuestion, context)
  }

  /**
   * Analyze response with detailed feedback
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
    confidence: number
    clarity: number
    relevance: number
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
          improvements: result.data.improvements || ['Add more examples'],
          feedback: result.data.feedback || 'Good response',
          confidence: this.calculateConfidence(userResponse),
          clarity: this.calculateClarity(userResponse),
          relevance: this.calculateRelevance(userResponse, question)
        }
      }
    } catch (error) {
      console.error('Error analyzing response:', error)
    }

    return this.generateFallbackAnalysis(userResponse, question)
  }

  /**
   * Generate transition with personality
   */
  public generateTransition(
    currentQuestionIndex: number,
    totalQuestions: number,
    context: ConversationContext
  ): AIResponse {
    const personality = context.personality || 'professional'
    const isLastQuestion = currentQuestionIndex >= totalQuestions - 1
    
    if (isLastQuestion) {
      const closingMessages = {
        professional: "Thank you for your responses. We've completed all questions. Do you have any questions about the role?",
        friendly: "That was great! We've finished all the questions. Anything you'd like to ask me?",
        strict: "Interview concluded. Questions from your side?",
        encouraging: "You did wonderfully! We've covered everything. What questions do you have for me?"
      }
      
      return {
        message: closingMessages[personality],
        type: 'closing',
        emotion: 'supportive',
        shouldSpeak: true,
        nextAction: 'end_interview'
      }
    }

    const transitionMessages = {
      professional: ["Let's move to the next question.", "Thank you. Next question."],
      friendly: ["Great! Let's talk about something else!", "Awesome! Moving on!"],
      strict: ["Next question.", "Proceeding."],
      encouraging: ["You're doing great! Next question!", "Excellent! Let's continue!"]
    }

    const messages = transitionMessages[personality]
    const message = messages[Math.floor(Math.random() * messages.length)]

    return {
      message,
      type: 'transition',
      emotion: 'neutral',
      shouldSpeak: true,
      nextAction: 'move_to_next'
    }
  }

  // Helper methods
  
  private getTimeOfDay(): string {
    const hour = new Date().getHours()
    if (hour < 12) return 'morning'
    if (hour < 18) return 'afternoon'
    return 'evening'
  }

  private makeFollowUpConversational(question: string, personality: string): string {
    const starters = {
      professional: ["I see.", "Understood.", "Thank you for that."],
      friendly: ["That's interesting!", "Cool!", "I like that!"],
      strict: ["Noted.", "Acknowledged.", "Proceed."],
      encouraging: ["That's great!", "Wonderful!", "I love that!"]
    }
    
    const personalityStarters = starters[personality as keyof typeof starters] || starters.professional
    const starter = personalityStarters[Math.floor(Math.random() * personalityStarters.length)]
    
    return `${starter} ${question}`
  }

  private extractFollowUpQuestion(aiData: any, userResponse: string): string {
    if (Array.isArray(aiData) && aiData.length > 0 && aiData[0].question) {
      return aiData[0].question
    }
    
    const responseLength = userResponse.split(' ').length
    if (responseLength < 15) {
      return "Could you elaborate on that with more details?"
    }
    return "What was the most challenging aspect of that experience?"
  }

  private generateFallbackFollowUp(
    userResponse: string,
    originalQuestion: string,
    context: ConversationContext
  ): AIResponse {
    const personality = context.personality || 'professional'
    const followUps = [
      "Can you give me a specific example from your experience?",
      "How did that experience prepare you for this role?",
      "What would you do differently in hindsight?",
      "How did you measure success in that situation?"
    ]

    return {
      message: this.makeFollowUpConversational(
        followUps[Math.floor(Math.random() * followUps.length)],
        personality
      ),
      type: 'followup',
      emotion: 'probing',
      shouldSpeak: true,
      nextAction: 'wait_for_response'
    }
  }

  private calculateConfidence(response: string): number {
    let score = 5
    const lowerResponse = response.toLowerCase()
    
    // Positive indicators
    if (lowerResponse.includes('i am confident') || lowerResponse.includes('definitely')) score += 2
    if (lowerResponse.includes('i believe') || lowerResponse.includes('i think')) score += 1
    if (response.length > 100) score += 1
    
    // Negative indicators
    if (lowerResponse.includes('maybe') || lowerResponse.includes('perhaps')) score -= 1
    if (lowerResponse.includes('not sure') || lowerResponse.includes('i guess')) score -= 2
    
    return Math.max(1, Math.min(10, score))
  }

  private calculateClarity(response: string): number {
    const sentences = response.split(/[.!?]+/).filter(s => s.trim())
    const avgLength = response.split(' ').length / Math.max(sentences.length, 1)
    
    // Optimal sentence length is 15-25 words
    let score = 7
    if (avgLength < 10) score -= 2 // Too short
    if (avgLength > 30) score -= 2 // Too long
    if (avgLength >= 15 && avgLength <= 25) score += 2 // Perfect
    
    return Math.max(1, Math.min(10, score))
  }

  private calculateRelevance(response: string, question: string): number {
    const questionWords = question.toLowerCase().split(' ').filter(w => w.length > 4)
    const responseWords = response.toLowerCase().split(' ')
    
    let matchCount = 0
    questionWords.forEach(qw => {
      if (responseWords.some(rw => rw.includes(qw) || qw.includes(rw))) {
        matchCount++
      }
    })
    
    const relevanceScore = (matchCount / Math.max(questionWords.length, 1)) * 10
    return Math.max(3, Math.min(10, relevanceScore))
  }

  private generateFallbackAnalysis(userResponse: string, question: string) {
    const wordCount = userResponse.split(' ').length
    const hasExamples = /example|instance|time when|once|previously/i.test(userResponse)

    let score = 5
    const strengths: string[] = []
    const improvements: string[] = []

    if (wordCount > 50) {
      score += 2
      strengths.push('Detailed and comprehensive response')
    } else if (wordCount < 20) {
      score -= 1
      improvements.push('Provide more detailed explanations')
    }

    if (hasExamples) {
      score += 2
      strengths.push('Included specific examples')
    } else {
      improvements.push('Add concrete examples from experience')
    }

    return {
      score: Math.min(score, 10),
      strengths,
      improvements,
      feedback: `Your response was ${wordCount > 50 ? 'comprehensive' : 'concise'}${hasExamples ? ' with good examples' : ''}. ${improvements.length > 0 ? 'Consider: ' + improvements[0] : 'Well done!'}`,
      confidence: this.calculateConfidence(userResponse),
      clarity: this.calculateClarity(userResponse),
      relevance: this.calculateRelevance(userResponse, question)
    }
  }
}

export default EnhancedVirtualInterviewerAI
