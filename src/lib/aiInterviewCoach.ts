/**
 * AI Interview Coach Service
 * Provides real-time hints, tips, and guidance during practice interviews
 * Analyzes responses and offers constructive feedback
 */

import { SmartAIService } from './smartAIService';

export interface CoachHint {
  id: string
  type: 'tip' | 'warning' | 'suggestion' | 'encouragement'
  message: string
  priority: 'low' | 'medium' | 'high'
  timestamp: Date
  trigger: string // What triggered this hint
}

export interface CoachingContext {
  question: string
  userResponse: string
  timeSpent: number // in seconds
  wordCount: number
  interviewType: string
  currentQuestionIndex: number
  totalQuestions: number
}

export class AIInterviewCoach {
  private static instance: AIInterviewCoach
  private smartAI: SmartAIService
  private hintHistory: CoachHint[] = []
  private isEnabled: boolean = true;
  private lastHintTime: Date | null = null;
  private minHintInterval: number = 10000 // 10 seconds between hints;

  private constructor() {
    this.smartAI = SmartAIService.getInstance();
  }

  public static getInstance(): AIInterviewCoach {
    if (!AIInterviewCoach.instance) {
      AIInterviewCoach.instance = new AIInterviewCoach();
    }
    return AIInterviewCoach.instance;
  }

  /**
   * Enable or disable coaching
   */
  public setEnabled(enabled: boolean): void {
    this.isEnabled = enabled;
    console.log(`🎓 AI Coach ${enabled ? 'enabled' : 'disabled'}`);
  }

  /**
   * Analyze response in real-time and provide hints
   */
  public async analyzeAndCoach(context: CoachingContext): Promise<CoachHint[]> {
    if (!this.isEnabled) return []

    const hints: CoachHint[] = []

    // Check if enough time has passed since last hint
    if (this.lastHintTime && 
        Date.now() - this.lastHintTime.getTime() < this.minHintInterval) {
      return hints;
    }

    // Analyze response length
    if (context.wordCount < 10 && context.timeSpent > 5) {
      hints.push(this.createHint(
        'suggestion',
        'Try to elaborate more on your answer with specific examples',
        'high',
        'short_response'
      ))
    }

    // Check response time
    if (context.timeSpent < 3 && context.wordCount > 0) {
      hints.push(this.createHint(
        'tip',
        'Great quick response! Consider adding more details if needed',
        'low',
        'quick_response'
      ))
    }

    // Check for very long responses
    if (context.wordCount > 200) {
      hints.push(this.createHint(
        'warning',
        'Keep your answer concise. Aim for 100-150 words for most questions',
        'medium',
        'long_response'
      ))
    }

    // Encourage if doing well
    if (context.wordCount > 30 && context.wordCount < 150 && context.timeSpent > 10) {
      hints.push(this.createHint(
        'encouragement',
        'You\'re doing great! Your answer is well-paced and detailed',
        'low',
        'good_progress'
      ))
    }

    // Check for filler words (if response provided)
    if (context.userResponse) {
      const fillerCount = this.countFillerWords(context.userResponse);
      if (fillerCount > 5) {
        hints.push(this.createHint(
          'tip',
          'Try to minimize filler words like "um", "like", "you know"',
          'medium',
          'filler_words'
        ))
      }
    }

    // Provide question-specific hints
    const contextualHint = await this.getContextualHint(context);
    if (contextualHint) {
      hints.push(contextualHint);
    }

    // Store hints and update timestamp
    if (hints.length > 0) {
      this.hintHistory.push(...hints)
      this.lastHintTime = new Date();
      
      // Keep only last 20 hints
      if (this.hintHistory.length > 20) {
        this.hintHistory = this.hintHistory.slice(-20);
      }
    }

    return hints;
  }

  /**
   * Get a contextual hint based on question type and progress
   */
  private async getContextualHint(context: CoachingContext): Promise<CoachHint | null> {
    try {
      // For behavioral questions
      if (context.interviewType.toLowerCase().includes('behavioral')) {
        if (context.userResponse && !this.hasSTARStructure(context.userResponse)) {
          return this.createHint(
            'suggestion',
            'Remember to use the STAR method: Situation, Task, Action, Result',
            'high',
            'behavioral_structure'
          )
        }
      }

      // For technical questions
      if (context.interviewType.toLowerCase().includes('technical')) {
        if (context.wordCount < 20) {
          return this.createHint(
            'tip',
            'Explain your technical reasoning and thought process',
            'medium',
            'technical_depth'
          )
        }
      }

      // Progress encouragement
      const progress = (context.currentQuestionIndex / context.totalQuestions) * 100;
      if (progress === 50) {
        return this.createHint(
          'encouragement',
          'You\'re halfway through! Keep up the great work!',
          'low',
          'progress_milestone'
        )
      }

    } catch (error) {
      console.error('Error getting contextual hint:', error);
    }

    return null;
  }

  /**
   * Get hint for starting answer
   */
  public getStartingHint(question: string, interviewType: string): CoachHint {
    const hints: Record<string, string> = {
      behavioral: 'Think of a specific example from your experience. Use the STAR method.',
      technical: 'Break down the problem step by step. Explain your reasoning.',
      mixed: 'Take a moment to organize your thoughts before answering.',
      default: 'Take your time and answer confidently. You\'ve got this!'
    }

    const hintMessage = hints[interviewType.toLowerCase()] || hints.default;

    return this.createHint('tip', hintMessage, 'low', 'question_start');
  }

  /**
   * Get encouragement based on performance
   */
  public getEncouragement(performance: {
    avgScore: number
    questionsAnswered: number
    totalQuestions: number
  }): CoachHint {
    let message = '';
    let priority: 'low' | 'medium' | 'high' = 'low';

    if (performance.avgScore >= 8) {
      message = 'Outstanding performance! You\'re acing this interview!';
      priority = 'low';
    } else if (performance.avgScore >= 6) {
      message = 'You\'re doing well! Keep maintaining this level of detail.';
      priority = 'low';
    } else if (performance.avgScore >= 4) {
      message = 'Good progress! Try to provide more specific examples.';
      priority = 'medium';
    } else {
      message = 'Stay focused! Take your time with each answer.';
      priority = 'high';
    }

    return this.createHint('encouragement', message, priority, 'performance_feedback');
  }

  /**
   * Get time management hint
   */
  public getTimeManagementHint(timeRemaining: number, questionsRemaining: number): CoachHint | null {
    if (questionsRemaining === 0) return null;

    const avgTimePerQuestion = timeRemaining / questionsRemaining;

    if (avgTimePerQuestion < 60) { // Less than 1 minute per question
      return this.createHint(
        'warning',
        `Time is running short! You have about ${Math.round(avgTimePerQuestion)} seconds per question.`,
        'high',
        'time_pressure'
      )
    } else if (avgTimePerQuestion < 120) { // Less than 2 minutes
      return this.createHint(
        'tip',
        'Keep your answers concise to manage time effectively.',
        'medium',
        'time_management'
      )
    }

    return null;
  }

  /**
   * Helper: Create a hint object
   */
  private createHint(
    type: CoachHint['type'],
    message: string,
    priority: CoachHint['priority'],
    trigger: string
  ): CoachHint {
    return {
      id: `hint_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type,
      message,
      priority,
      timestamp: new Date(),
      trigger
    }
  }

  /**
   * Helper: Count filler words
   */
  private countFillerWords(text: string): number {
    const fillers = ['um', 'uh', 'like', 'you know', 'sort of', 'kind of', 'basically', 'actually']
    const lowerText = text.toLowerCase();
    let count = 0;

    fillers.forEach(filler => {
      const regex = new RegExp(`\\b${filler}\\b`, 'gi');
      const matches = lowerText.match(regex);
      if (matches) count += matches.length;
    })

    return count;
  }

  /**
   * Helper: Check if response uses STAR structure
   */
  private hasSTARStructure(response: string): boolean {
    const lowerResponse = response.toLowerCase();
    const starKeywords = {
      situation: ['situation', 'when', 'where', 'context'],
      task: ['task', 'responsibility', 'goal', 'objective'],
      action: ['i did', 'i took', 'i implemented', 'action', 'steps'],
      result: ['result', 'outcome', 'achieved', 'accomplished', 'impact']
    }

    let matchedCategories = 0;
    Object.values(starKeywords).forEach(keywords => {
      if (keywords.some(keyword => lowerResponse.includes(keyword))) {
        matchedCategories++
      }
    })

    return matchedCategories >= 2 // At least 2 STAR components mentioned;
  }

  /**
   * Get all hints history
   */
  public getHintHistory(): CoachHint[] {
    return [...this.hintHistory]
  }

  /**
   * Clear hint history
   */
  public reset(): void {
    this.hintHistory = []
    this.lastHintTime = null;
  }

  /**
   * Get hint icon based on type
   */
  public static getHintIcon(type: CoachHint['type']): string {
    const icons = {
      tip: '💡',
      warning: '⚠️',
      suggestion: '💭',
      encouragement: '🌟'
    }
    return icons[type]
  }

  /**
   * Get hint color based on priority
   */
  public static getHintColor(priority: CoachHint['priority']): string {
    const colors = {
      low: 'bg-blue-100 text-blue-800 border-blue-200',
      medium: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      high: 'bg-red-100 text-red-800 border-red-200'
    }
    return colors[priority]
  }
}

export default AIInterviewCoach;