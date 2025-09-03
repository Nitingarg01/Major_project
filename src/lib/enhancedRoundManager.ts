import { Question, InterviewRound, InterviewPerformance } from '@/types/interview';
import CompanyIntelligenceService from './companyIntelligence';

export interface RoundResult {
  roundId: string;
  roundType: 'technical' | 'behavioral' | 'system-design' | 'cultural-fit' | 'aptitude' | 'dsa';
  questions: Question[];
  answers: string[];
  timeSpent: number;
  score: number;
  feedback: string;
  strengths: string[];
  improvements: string[];
  completedAt: Date;
}

export interface InterviewSession {
  sessionId: string;
  userId: string;
  interviewId: string;
  companyName: string;
  jobTitle: string;
  rounds: InterviewRound[];
  currentRound: number;
  sessionData: {
    startTime: Date;
    endTime?: Date;
    totalTimeSpent: number;
    overallProgress: number;
  };
  roundResults: RoundResult[];
  companyIntelligence?: any;
  sessionMetadata: {
    userAgent: string;
    ipAddress: string;
    cameraEnabled: boolean;
    suspiciousActivity: any[];
  };
}

export class EnhancedRoundManager {
  private static instance: EnhancedRoundManager;
  private companyIntelligence: CompanyIntelligenceService;
  
  public static getInstance(): EnhancedRoundManager {
    if (!EnhancedRoundManager.instance) {
      EnhancedRoundManager.instance = new EnhancedRoundManager();
    }
    return EnhancedRoundManager.instance;
  }

  constructor() {
    this.companyIntelligence = CompanyIntelligenceService.getInstance();
  }

  async initializeSession(
    userId: string,
    interviewId: string,
    companyName: string,
    jobTitle: string,
    interviewType: string
  ): Promise<InterviewSession> {
    const sessionId = this.generateSessionId();
    
    // Get company intelligence
    const intelligence = await this.companyIntelligence.getCompanyIntelligence(companyName);
    
    // Create enhanced rounds based on company and role
    const rounds = await this.createEnhancedRounds(companyName, jobTitle, interviewType, intelligence);
    
    const session: InterviewSession = {
      sessionId,
      userId,
      interviewId,
      companyName,
      jobTitle,
      rounds,
      currentRound: 0,
      sessionData: {
        startTime: new Date(),
        totalTimeSpent: 0,
        overallProgress: 0
      },
      roundResults: [],
      companyIntelligence: intelligence,
      sessionMetadata: {
        userAgent: '',
        ipAddress: '',
        cameraEnabled: false,
        suspiciousActivity: []
      }
    };

    return session;
  }

  private async createEnhancedRounds(
    companyName: string,
    jobTitle: string,
    interviewType: string,
    intelligence: any
  ): Promise<InterviewRound[]> {
    const rounds: InterviewRound[] = [];
    
    if (interviewType === 'mixed' || interviewType === 'technical') {
      // Technical Round with company-specific questions
      rounds.push({
        id: 'technical-round',
        type: 'technical',
        status: 'pending',
        questions: await this.generateCompanySpecificQuestions(
          companyName, 
          jobTitle, 
          'technical', 
          intelligence
        ),
        duration: intelligence?.interviewInsights?.timePerRound || 45
      });
    }

    if (interviewType === 'mixed' || interviewType === 'behavioral') {
      // Behavioral Round with company culture focus
      rounds.push({
        id: 'behavioral-round',
        type: 'behavioral',
        status: 'pending',
        questions: await this.generateCompanySpecificQuestions(
          companyName, 
          jobTitle, 
          'behavioral', 
          intelligence
        ),
        duration: 35
      });
    }

    // Company-specific cultural fit round
    rounds.push({
      id: 'cultural-fit-round',
      type: 'behavioral', // Using behavioral type but with cultural questions
      status: 'pending',
      questions: await this.generateCulturalFitQuestions(companyName, intelligence),
      duration: 25
    });

    // System design for senior roles
    if (jobTitle.toLowerCase().includes('senior') || jobTitle.toLowerCase().includes('lead')) {
      rounds.push({
        id: 'system-design-round',
        type: 'technical',
        status: 'pending',
        questions: await this.generateSystemDesignQuestions(companyName, intelligence),
        duration: 60
      });
    }

    return rounds;
  }

  private async generateCompanySpecificQuestions(
    companyName: string,
    jobTitle: string,
    roundType: string,
    intelligence: any
  ): Promise<Question[]> {
    if (!intelligence) {
      return this.getDefaultQuestions(roundType);
    }

    try {
      const questionTexts = this.companyIntelligence.generateCompanySpecificQuestions(
        intelligence,
        jobTitle,
        'medium',
        roundType as any
      );

      return questionTexts.map((text, index) => ({
        id: `${roundType}-${index + 1}`,
        question: text,
        expectedAnswer: this.generateExpectedAnswer(text, companyName, roundType),
        difficulty: 'medium',
        category: roundType as any,
        points: this.calculateQuestionPoints(roundType)
      }));
    } catch (error) {
      console.error('Error generating company-specific questions:', error);
      return this.getDefaultQuestions(roundType);
    }
  }

  private async generateCulturalFitQuestions(companyName: string, intelligence: any): Promise<Question[]> {
    const culturalQuestions = intelligence?.interviewInsights?.culturalFitQuestions || [
      'Why do you want to work at this company?',
      'How do you handle workplace conflicts?',
      'Describe your ideal work environment',
      'What motivates you in your career?'
    ];

    return culturalQuestions.map((text: string, index: number) => ({
      id: `cultural-${index + 1}`,
      question: this.enhanceQuestionWithCompanyContext(text, companyName, intelligence),
      expectedAnswer: this.generateCulturalExpectedAnswer(text, companyName, intelligence),
      difficulty: 'medium' as const,
      category: 'behavioral' as const,
      points: 20
    }));
  }

  private async generateSystemDesignQuestions(companyName: string, intelligence: any): Promise<Question[]> {
    const systemQuestions = intelligence?.companyData?.commonQuestions?.filter((q: string) => 
      q.toLowerCase().includes('design') || q.toLowerCase().includes('system')
    ) || [
      'Design a scalable web application',
      'How would you handle high traffic loads?',
      'Design a microservices architecture',
      'Implement a caching strategy'
    ];

    return systemQuestions.slice(0, 3).map((text: string, index: number) => ({
      id: `system-${index + 1}`,
      question: text,
      expectedAnswer: this.generateSystemDesignAnswer(text, companyName),
      difficulty: 'hard' as const,
      category: 'technical' as const,
      points: 30
    }));
  }

  private enhanceQuestionWithCompanyContext(question: string, companyName: string, intelligence: any): string {
    if (question.includes('company') && !question.includes(companyName)) {
      return question.replace('company', companyName);
    }
    
    if (question === 'Why do you want to work at this company?') {
      return `Why do you want to work at ${companyName}? What specifically attracts you to our mission and values?`;
    }
    
    if (question.includes('work environment')) {
      const culture = intelligence?.companyData?.culture?.join(', ') || 'collaborative environment';
      return `${question} How do you see yourself thriving in ${companyName}'s culture of ${culture}?`;
    }
    
    return question;
  }

  private generateExpectedAnswer(question: string, companyName: string, roundType: string): string {
    // Generate contextual expected answers based on company and question type
    if (roundType === 'technical') {
      return `A comprehensive technical solution demonstrating understanding of ${companyName}'s technology stack and scalability requirements. Should include specific technologies, architectural considerations, and best practices relevant to ${companyName}'s engineering culture.`;
    } else if (roundType === 'behavioral') {
      return `A structured response using the STAR method, showcasing experience relevant to ${companyName}'s values and culture. Should demonstrate alignment with company principles and show growth mindset.`;
    }
    
    return 'A detailed, thoughtful response demonstrating relevant experience and cultural fit.';
  }

  private generateCulturalExpectedAnswer(question: string, companyName: string, intelligence: any): string {
    const values = intelligence?.companyData?.values?.join(', ') || 'innovation and excellence';
    const culture = intelligence?.companyData?.culture?.join(', ') || 'collaborative culture';
    
    return `Response should demonstrate understanding of ${companyName}'s core values (${values}) and show alignment with their ${culture}. Include specific examples of how past experiences align with company culture and mission.`;
  }

  private generateSystemDesignAnswer(question: string, companyName: string): string {
    return `Comprehensive system design covering scalability, reliability, and performance considerations. Should reference technologies and patterns commonly used at ${companyName}, including specific architectural decisions, data flow, API design, and handling of edge cases. Include discussion of trade-offs and alternatives.`;
  }

  private getDefaultQuestions(roundType: string): Question[] {
    const defaultQuestions = {
      technical: [
        'Explain the difference between synchronous and asynchronous programming',
        'How would you optimize a slow database query?',
        'Describe the MVC architecture pattern',
        'What is the difference between REST and GraphQL?'
      ],
      behavioral: [
        'Tell me about a challenging project you worked on',
        'Describe a time you had to learn a new technology quickly',
        'How do you handle tight deadlines?',
        'Tell me about a time you had to work with a difficult team member'
      ]
    };

    const questions = defaultQuestions[roundType as keyof typeof defaultQuestions] || defaultQuestions.technical;
    
    return questions.map((text, index) => ({
      id: `default-${roundType}-${index + 1}`,
      question: text,
      expectedAnswer: 'Provide a detailed response with specific examples and technical details.',
      difficulty: 'medium' as const,
      category: roundType as any,
      points: 25
    }));
  }

  private calculateQuestionPoints(roundType: string): number {
    const pointsMap = {
      'technical': 30,
      'behavioral': 20,
      'system-design': 35,
      'cultural-fit': 15
    };
    
    return pointsMap[roundType as keyof typeof pointsMap] || 25;
  }

  async completeRound(
    session: InterviewSession,
    answers: string[],
    timeSpent: number,
    suspiciousActivity: any[] = []
  ): Promise<{ session: InterviewSession; roundResult: RoundResult }> {
    const currentRound = session.rounds[session.currentRound];
    
    // Evaluate round performance with company-specific criteria
    const roundResult = await this.evaluateRoundPerformance(
      currentRound,
      answers,
      timeSpent,
      session.companyName,
      session.companyIntelligence,
      suspiciousActivity
    );

    // Update session
    session.roundResults.push(roundResult);
    session.sessionData.totalTimeSpent += timeSpent;
    session.sessionMetadata.suspiciousActivity.push(...suspiciousActivity);
    
    // Mark current round as completed
    session.rounds[session.currentRound].status = 'completed';
    session.rounds[session.currentRound].score = roundResult.score;
    session.rounds[session.currentRound].feedback = roundResult.feedback;

    // Move to next round or complete session
    if (session.currentRound < session.rounds.length - 1) {
      session.currentRound++;
      session.rounds[session.currentRound].status = 'in-progress';
    } else {
      session.sessionData.endTime = new Date();
      session.sessionData.overallProgress = 100;
    }

    // Update progress
    session.sessionData.overallProgress = ((session.currentRound + 1) / session.rounds.length) * 100;

    return { session, roundResult };
  }

  private async evaluateRoundPerformance(
    round: InterviewRound,
    answers: string[],
    timeSpent: number,
    companyName: string,
    intelligence: any,
    suspiciousActivity: any[]
  ): Promise<RoundResult> {
    const questions = round.questions;
    let totalScore = 0;
    const strengths: string[] = [];
    const improvements: string[] = [];
    
    // Enhanced scoring with company-specific criteria
    for (let i = 0; i < questions.length && i < answers.length; i++) {
      const question = questions[i];
      const answer = answers[i];
      
      const questionScore = await this.evaluateAnswerWithAI(
        question,
        answer,
        companyName,
        intelligence
      );
      
      totalScore += questionScore;
      
      // Determine strengths and improvements
      if (questionScore >= 0.8 * (question.points || 25)) {
        strengths.push(this.getStrengthFeedback(question, companyName));
      } else if (questionScore < 0.5 * (question.points || 25)) {
        improvements.push(this.getImprovementFeedback(question, companyName));
      }
    }

    // Apply company-specific scoring adjustments
    const adjustedScore = this.applyCompanySpecificScoring(
      totalScore, 
      round.type, 
      companyName, 
      intelligence
    );

    // Factor in time management and suspicious activity
    const finalScore = this.applyPerformancePenalties(
      adjustedScore,
      timeSpent,
      round.duration,
      suspiciousActivity
    );

    // Generate comprehensive feedback
    const feedback = this.generateComprehensiveFeedback(
      round,
      finalScore,
      strengths,
      improvements,
      companyName,
      intelligence
    );

    return {
      roundId: round.id,
      roundType: round.type,
      questions,
      answers,
      timeSpent,
      score: Math.min(100, Math.max(0, finalScore)),
      feedback,
      strengths,
      improvements,
      completedAt: new Date()
    };
  }

  private async evaluateAnswerWithAI(
    question: Question,
    answer: string,
    companyName: string,
    intelligence: any
  ): Promise<number> {
    // Basic scoring logic (would be enhanced with actual AI evaluation)
    let score = 0;
    const maxPoints = question.points || 25;
    
    // Answer length and depth check
    if (answer.length > 50) score += maxPoints * 0.3;
    if (answer.length > 150) score += maxPoints * 0.2;
    
    // Technical keywords for technical questions
    if (question.category === 'technical') {
      const techKeywords = intelligence?.companyData?.techStack || [];
      const keywordMatches = techKeywords.filter(keyword => 
        answer.toLowerCase().includes(keyword.toLowerCase())
      ).length;
      score += Math.min(maxPoints * 0.3, keywordMatches * 5);
    }
    
    // Company-specific keywords
    const companyKeywords = [
      ...intelligence?.companyData?.values || [],
      ...intelligence?.companyData?.culture || []
    ];
    
    const companyKeywordMatches = companyKeywords.filter(keyword =>
      answer.toLowerCase().includes(keyword.toLowerCase())
    ).length;
    
    score += Math.min(maxPoints * 0.2, companyKeywordMatches * 3);
    
    // Detailed response bonus
    if (answer.includes('example') || answer.includes('specifically') || answer.includes('experience')) {
      score += maxPoints * 0.1;
    }
    
    return Math.min(maxPoints, score);
  }

  private applyCompanySpecificScoring(
    baseScore: number,
    roundType: string,
    companyName: string,
    intelligence: any
  ): number {
    let multiplier = 1.0;
    
    // Company-specific scoring adjustments
    if (companyName === 'Google' || companyName === 'Meta') {
      // Higher standards for technical rounds at top tech companies
      if (roundType === 'technical') {
        multiplier = 0.9;
      }
    } else if (companyName === 'Amazon') {
      // Strong emphasis on behavioral/leadership principles
      if (roundType === 'behavioral') {
        multiplier = 1.1;
      }
    }
    
    return baseScore * multiplier;
  }

  private applyPerformancePenalties(
    score: number,
    timeSpent: number,
    expectedTime: number,
    suspiciousActivity: any[]
  ): number {
    let penalizedScore = score;
    
    // Time management penalty
    if (timeSpent > expectedTime * 60 * 1.2) { // 20% over time
      penalizedScore *= 0.9;
    }
    
    // Suspicious activity penalties
    const highSeverityActivities = suspiciousActivity.filter(activity => 
      activity.severity === 'high'
    ).length;
    
    if (highSeverityActivities > 0) {
      penalizedScore *= Math.max(0.7, 1 - (highSeverityActivities * 0.1));
    }
    
    return penalizedScore;
  }

  private getStrengthFeedback(question: Question, companyName: string): string {
    const feedbackTemplates = [
      `Strong technical knowledge demonstrated, aligning well with ${companyName}'s expectations`,
      `Excellent problem-solving approach that would fit ${companyName}'s engineering culture`,
      `Clear communication skills evident, valuable for ${companyName}'s collaborative environment`,
      `Good understanding of best practices relevant to ${companyName}'s tech stack`
    ];
    
    return feedbackTemplates[Math.floor(Math.random() * feedbackTemplates.length)];
  }

  private getImprovementFeedback(question: Question, companyName: string): string {
    const improvementTemplates = [
      `Consider studying ${companyName}'s specific technology stack and architectural patterns`,
      `Practice more detailed explanations with concrete examples from your experience`,
      `Research ${companyName}'s engineering principles and incorporate them into your responses`,
      `Develop deeper understanding of scalability concepts important to ${companyName}`
    ];
    
    return improvementTemplates[Math.floor(Math.random() * improvementTemplates.length)];
  }

  private generateComprehensiveFeedback(
    round: InterviewRound,
    score: number,
    strengths: string[],
    improvements: string[],
    companyName: string,
    intelligence: any
  ): string {
    const roundType = round.type;
    const companyValues = intelligence?.companyData?.values?.join(', ') || 'innovation and excellence';
    
    let feedback = `**${companyName} ${roundType.toUpperCase()} Round Feedback (Score: ${Math.round(score)}/100)**\n\n`;
    
    // Overall performance
    if (score >= 80) {
      feedback += `🎉 Excellent performance! You've demonstrated strong alignment with ${companyName}'s expectations for this role.\n\n`;
    } else if (score >= 60) {
      feedback += `👍 Good performance with room for improvement. You show potential for success at ${companyName}.\n\n`;
    } else {
      feedback += `📚 This round needs more preparation. Focus on understanding ${companyName}'s core values: ${companyValues}.\n\n`;
    }
    
    // Strengths
    if (strengths.length > 0) {
      feedback += `**Strengths:**\n`;
      strengths.forEach((strength, index) => {
        feedback += `${index + 1}. ${strength}\n`;
      });
      feedback += '\n';
    }
    
    // Areas for improvement
    if (improvements.length > 0) {
      feedback += `**Areas for Improvement:**\n`;
      improvements.forEach((improvement, index) => {
        feedback += `${index + 1}. ${improvement}\n`;
      });
      feedback += '\n';
    }
    
    // Company-specific recommendations
    const companyTips = intelligence?.companyData?.preparationTips || [];
    if (companyTips.length > 0) {
      feedback += `**${companyName}-Specific Preparation Tips:**\n`;
      companyTips.slice(0, 3).forEach((tip: string, index: number) => {
        feedback += `${index + 1}. ${tip}\n`;
      });
    }
    
    return feedback;
  }

  async generateFinalReport(session: InterviewSession): Promise<InterviewPerformance> {
    const totalScore = session.roundResults.reduce((sum, result) => sum + result.score, 0);
    const averageScore = totalScore / session.roundResults.length;
    
    const allStrengths = session.roundResults.flatMap(result => result.strengths);
    const allImprovements = session.roundResults.flatMap(result => result.improvements);
    
    // Generate company-specific recommendations
    const recommendations = this.generateCompanySpecificRecommendations(
      session.companyName,
      session.jobTitle,
      session.roundResults,
      session.companyIntelligence
    );

    // Assess suspicious activity risk
    const suspiciousActivity = {
      detected: session.sessionMetadata.suspiciousActivity.length > 0,
      concerns: session.sessionMetadata.suspiciousActivity.map(activity => activity.message),
      riskLevel: this.assessRiskLevel(session.sessionMetadata.suspiciousActivity) as 'low' | 'medium' | 'high'
    };

    return {
      totalScore: averageScore,
      roundScores: session.roundResults.reduce((acc, result) => {
        acc[result.roundId] = result.score;
        return acc;
      }, {} as { [roundId: string]: number }),
      overallFeedback: this.generateOverallFeedback(session, averageScore),
      strengths: [...new Set(allStrengths)], // Remove duplicates
      improvements: [...new Set(allImprovements)], // Remove duplicates
      recommendations,
      anomalousActivity: suspiciousActivity
    };
  }

  private generateCompanySpecificRecommendations(
    companyName: string,
    jobTitle: string,
    roundResults: RoundResult[],
    intelligence: any
  ): string[] {
    const recommendations: string[] = [];
    const avgScore = roundResults.reduce((sum, result) => sum + result.score, 0) / roundResults.length;
    
    // Company-specific recommendations based on performance
    if (companyName === 'Google') {
      recommendations.push(
        'Study Google\'s engineering practices and system design principles',
        'Practice coding problems similar to Google\'s interview style',
        'Research Google\'s recent AI initiatives and be prepared to discuss them'
      );
    } else if (companyName === 'Amazon') {
      recommendations.push(
        'Master all 16 Amazon Leadership Principles with specific STAR examples',
        'Understand Amazon\'s customer obsession culture deeply',
        'Practice system design for e-commerce and cloud platforms'
      );
    }
    
    // Performance-based recommendations
    if (avgScore < 60) {
      recommendations.push(
        `Focus on fundamental concepts relevant to ${companyName}`,
        'Practice more mock interviews before applying',
        `Research ${companyName}'s recent developments and challenges`
      );
    } else if (avgScore >= 80) {
      recommendations.push(
        `You're well-prepared for ${companyName}! Keep practicing system design`,
        'Prepare thoughtful questions about the role and team',
        'Research the specific team and projects you\'d be joining'
      );
    }
    
    return recommendations;
  }

  private generateOverallFeedback(session: InterviewSession, averageScore: number): string {
    const companyName = session.companyName;
    const intelligence = session.companyIntelligence;
    const companyValues = intelligence?.companyData?.values?.join(', ') || 'innovation and excellence';
    
    let feedback = `**Overall ${companyName} Interview Performance**\n\n`;
    
    feedback += `You completed ${session.roundResults.length} interview rounds with an average score of ${Math.round(averageScore)}/100.\n\n`;
    
    if (averageScore >= 85) {
      feedback += `🌟 **Outstanding Performance!** You've demonstrated excellent alignment with ${companyName}'s culture and values (${companyValues}). You appear well-prepared for a role at ${companyName}.\n\n`;
    } else if (averageScore >= 70) {
      feedback += `✅ **Strong Performance!** You show good potential for ${companyName}. With some targeted preparation in your weaker areas, you'd be ready for the real interview.\n\n`;
    } else if (averageScore >= 50) {
      feedback += `📈 **Moderate Performance.** You have a foundation to build on, but need more preparation to meet ${companyName}'s standards. Focus on understanding their core values and technical requirements.\n\n`;
    } else {
      feedback += `📚 **Needs Significant Improvement.** This practice session shows you need substantial preparation before interviewing at ${companyName}. Consider focusing on fundamentals and company culture.\n\n`;
    }
    
    // Add time management feedback
    const totalTime = Math.round(session.sessionData.totalTimeSpent / 60);
    const expectedTime = session.rounds.reduce((sum, round) => sum + round.duration, 0);
    
    if (totalTime <= expectedTime) {
      feedback += `⏱️ **Good Time Management:** You completed the interview within the expected timeframe (${totalTime} minutes).\n\n`;
    } else {
      feedback += `⏰ **Time Management:** Consider practicing to improve your pace. You took ${totalTime} minutes vs expected ${expectedTime} minutes.\n\n`;
    }
    
    return feedback;
  }

  private assessRiskLevel(suspiciousActivities: any[]): string {
    const highSeverity = suspiciousActivities.filter(a => a.severity === 'high').length;
    const mediumSeverity = suspiciousActivities.filter(a => a.severity === 'medium').length;
    
    if (highSeverity >= 3) return 'high';
    if (highSeverity >= 1 || mediumSeverity >= 5) return 'medium';
    return 'low';
  }

  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

export default EnhancedRoundManager;