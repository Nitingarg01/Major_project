/**
 * Multi-Round Interview Manager
 * Manages HR → Technical → Manager interview rounds in one session
 * Each round has different personality and question types
 */

export interface InterviewRound {
  id: string
  name: string
  type: 'HR' | 'Technical' | 'Manager'
  personality: 'professional' | 'friendly' | 'strict' | 'encouraging'
  description: string
  icon: string
  focusAreas: string[]
  questionTypes: string[]
  duration: number // in minutes
}

export interface RoundProgress {
  roundId: string
  roundName: string
  status: 'pending' | 'active' | 'completed'
  questionsTotal: number
  questionsAnswered: number
  timeSpent: number
  score: number
  startedAt?: Date
  completedAt?: Date
}

export interface MultiRoundSession {
  sessionId: string
  rounds: InterviewRound[]
  currentRoundIndex: number
  progress: RoundProgress[]
  overallScore: number
  startedAt: Date
  completedAt?: Date
  status: 'not_started' | 'in_progress' | 'completed'
}

export class MultiRoundInterviewManager {
  private static instance: MultiRoundInterviewManager
  private currentSession: MultiRoundSession | null = null

  // Predefined round configurations
  private roundTemplates: InterviewRound[] = [
    {
      id: 'hr_round',
      name: 'HR Round',
      type: 'HR',
      personality: 'friendly',
      description: 'Initial screening to understand your background and cultural fit',
      icon: '👥',
      focusAreas: [
        'Background verification',
        'Cultural fit assessment',
        'Career goals',
        'Soft skills',
        'Communication'
      ],
      questionTypes: ['behavioral', 'background', 'motivation'],
      duration: 15
    },
    {
      id: 'technical_round',
      name: 'Technical Round',
      type: 'Technical',
      personality: 'professional',
      description: 'Deep dive into your technical skills and problem-solving abilities',
      icon: '💻',
      focusAreas: [
        'Technical expertise',
        'Problem-solving',
        'Code quality',
        'System design',
        'Best practices'
      ],
      questionTypes: ['technical', 'coding', 'system-design'],
      duration: 30
    },
    {
      id: 'manager_round',
      name: 'Manager Round',
      type: 'Manager',
      personality: 'encouraging',
      description: 'Discussion about leadership, teamwork, and long-term fit',
      icon: '💼',
      focusAreas: [
        'Leadership potential',
        'Team collaboration',
        'Project experience',
        'Strategic thinking',
        'Long-term goals'
      ],
      questionTypes: ['leadership', 'behavioral', 'strategic'],
      duration: 20
    }
  ]

  private constructor() {}

  public static getInstance(): MultiRoundInterviewManager {
    if (!MultiRoundInterviewManager.instance) {
      MultiRoundInterviewManager.instance = new MultiRoundInterviewManager()
    }
    return MultiRoundInterviewManager.instance
  }

  /**
   * Initialize a new multi-round session
   */
  public initializeSession(
    companyName: string,
    jobTitle: string,
    rounds?: InterviewRound[]
  ): MultiRoundSession {
    const sessionRounds = rounds || this.roundTemplates
    
    const progress: RoundProgress[] = sessionRounds.map(round => ({
      roundId: round.id,
      roundName: round.name,
      status: 'pending' as const,
      questionsTotal: 0,
      questionsAnswered: 0,
      timeSpent: 0,
      score: 0
    }))

    this.currentSession = {
      sessionId: `session_${Date.now()}`,
      rounds: sessionRounds,
      currentRoundIndex: 0,
      progress,
      overallScore: 0,
      startedAt: new Date(),
      status: 'not_started'
    }

    console.log(`🎓 Multi-round interview initialized for ${companyName} - ${jobTitle}`)
    return this.currentSession
  }

  /**
   * Start the interview session
   */
  public startSession(): boolean {
    if (!this.currentSession) {
      console.error('No session initialized')
      return false
    }

    this.currentSession.status = 'in_progress'
    this.currentSession.progress[0].status = 'active'
    this.currentSession.progress[0].startedAt = new Date()

    return true
  }

  /**
   * Get current active round
   */
  public getCurrentRound(): InterviewRound | null {
    if (!this.currentSession) return null
    return this.currentSession.rounds[this.currentSession.currentRoundIndex] || null
  }

  /**
   * Get current round progress
   */
  public getCurrentProgress(): RoundProgress | null {
    if (!this.currentSession) return null
    return this.currentSession.progress[this.currentSession.currentRoundIndex] || null
  }

  /**
   * Update current round progress
   */
  public updateRoundProgress(update: Partial<RoundProgress>): void {
    if (!this.currentSession) return

    const currentProgress = this.currentSession.progress[this.currentSession.currentRoundIndex]
    if (currentProgress) {
      Object.assign(currentProgress, update)
    }
  }

  /**
   * Complete current round and move to next
   */
  public completeCurrentRound(score: number): boolean {
    if (!this.currentSession) return false

    const currentIndex = this.currentSession.currentRoundIndex
    const currentProgress = this.currentSession.progress[currentIndex]

    if (currentProgress) {
      currentProgress.status = 'completed'
      currentProgress.score = score
      currentProgress.completedAt = new Date()
    }

    // Check if there are more rounds
    if (currentIndex < this.currentSession.rounds.length - 1) {
      // Move to next round
      this.currentSession.currentRoundIndex++
      const nextProgress = this.currentSession.progress[this.currentSession.currentRoundIndex]
      nextProgress.status = 'active'
      nextProgress.startedAt = new Date()
      
      console.log(`➡️ Moving to ${nextProgress.roundName}`)
      return true
    } else {
      // All rounds completed
      this.completeSession()
      return false
    }
  }

  /**
   * Complete the entire session
   */
  private completeSession(): void {
    if (!this.currentSession) return

    // Calculate overall score
    const totalScore = this.currentSession.progress.reduce((sum, p) => sum + p.score, 0)
    this.currentSession.overallScore = totalScore / this.currentSession.progress.length

    this.currentSession.status = 'completed'
    this.currentSession.completedAt = new Date()

    console.log(`✅ Multi-round interview completed! Overall score: ${this.currentSession.overallScore.toFixed(1)}/10`)
  }

  /**
   * Get session summary
   */
  public getSessionSummary(): {
    completed: boolean
    currentRound: string
    roundsCompleted: number
    totalRounds: number
    overallScore: number
    timeSpent: number
    roundScores: { round: string; score: number }[]
  } | null {
    if (!this.currentSession) return null

    const roundsCompleted = this.currentSession.progress.filter(p => p.status === 'completed').length
    const totalTimeSpent = this.currentSession.progress.reduce((sum, p) => sum + p.timeSpent, 0)
    const currentRound = this.getCurrentRound()

    return {
      completed: this.currentSession.status === 'completed',
      currentRound: currentRound?.name || 'Unknown',
      roundsCompleted,
      totalRounds: this.currentSession.rounds.length,
      overallScore: this.currentSession.overallScore,
      timeSpent: totalTimeSpent,
      roundScores: this.currentSession.progress.map(p => ({
        round: p.roundName,
        score: p.score
      }))
    }
  }

  /**
   * Get transition message between rounds
   */
  public getTransitionMessage(): string {
    if (!this.currentSession) return ''

    const previousIndex = this.currentSession.currentRoundIndex - 1
    const currentRound = this.getCurrentRound()
    
    if (!currentRound || previousIndex < 0) return ''

    const previousProgress = this.currentSession.progress[previousIndex]
    const scoreText = previousProgress.score >= 7 ? 'excellent' : previousProgress.score >= 5 ? 'good' : 'fair'

    return `Great job on the ${previousProgress.roundName}! You scored ${previousProgress.score.toFixed(1)}/10, which is ${scoreText}. Now, let's move to the ${currentRound.name}. ${currentRound.description}. Are you ready?`
  }

  /**
   * Get welcome message for current round
   */
  public getRoundWelcomeMessage(): string {
    const round = this.getCurrentRound()
    if (!round) return ''

    const messages = {
      HR: `Welcome to the HR round! I'll be asking you about your background, experience, and what motivates you. Let's have a friendly conversation about your journey.`,
      Technical: `Now for the technical round. I'll evaluate your technical skills, problem-solving abilities, and understanding of core concepts. Take your time to explain your thought process.`,
      Manager: `Welcome to the final round with the hiring manager! We'll discuss your leadership potential, team collaboration, and how you'd fit into our organization's future. Let's have an insightful discussion.`
    }

    return messages[round.type] || 'Let\'s begin this round!'
  }

  /**
   * Check if all rounds are completed
   */
  public isSessionCompleted(): boolean {
    return this.currentSession?.status === 'completed' || false
  }

  /**
   * Get current session
   */
  public getCurrentSession(): MultiRoundSession | null {
    return this.currentSession
  }

  /**
   * Reset session
   */
  public reset(): void {
    this.currentSession = null
  }

  /**
   * Get round templates
   */
  public getRoundTemplates(): InterviewRound[] {
    return [...this.roundTemplates]
  }

  /**
   * Get progress percentage
   */
  public getProgressPercentage(): number {
    if (!this.currentSession) return 0

    const completed = this.currentSession.progress.filter(p => p.status === 'completed').length
    const total = this.currentSession.rounds.length
    
    return (completed / total) * 100
  }

  /**
   * Get estimated time remaining
   */
  public getEstimatedTimeRemaining(): number {
    if (!this.currentSession) return 0

    let remainingTime = 0
    for (let i = this.currentSession.currentRoundIndex; i < this.currentSession.rounds.length; i++) {
      remainingTime += this.currentSession.rounds[i].duration
    }

    return remainingTime * 60 // Convert to seconds
  }
}

export default MultiRoundInterviewManager