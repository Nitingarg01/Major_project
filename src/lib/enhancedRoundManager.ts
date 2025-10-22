import { GoogleGenerativeAI } from '@google/generative-ai';
import { extractJSON } from './jsonExtractor';

export interface InterviewRound {
  id: string;
  type: 'technical' | 'behavioral' | 'dsa' | 'aptitude' | 'mixed';
  status: 'pending' | 'in-progress' | 'completed' | 'skipped';
  questions: any[];
  duration: number; // in minutes
  startTime?: Date;
  endTime?: Date;
  timeSpent?: number;
  score?: number;
  feedback?: string
}

export interface RoundResult {
  roundId: string;
  answers: string[];
  timeSpent: number;
  score: number;
  feedback: string;
  performanceMetrics: {
    accuracy: number;
    confidence: number;
    clarity: number;
    technicalDepth: number;
    problemSolving: number
  };
  suspiciousActivities: ActivityAlert[];
}

export interface ActivityAlert {
  type: 'multiple_faces' | 'no_face' | 'looking_away' | 'tab_switch' | 'window_focus_lost' | 'face_obscured';
  message: string;
  severity: 'low' | 'medium' | 'high';
  timestamp: Date;
  confidence?: number
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
    overallProgress: number
  };
  roundResults: RoundResult[];
  companyIntelligence?: any;
  sessionMetadata: {
    userAgent: string;
    ipAddress: string;
    cameraEnabled: boolean;
    suspiciousActivity: ActivityAlert[];
  };
}

export interface FinalInterviewReport {
  sessionId: string;
  overallScore: number;
  overallVerdict: string;
  roundBreakdown: {
    [roundId: string]: {
      score: number;
      feedback: string;
      timeSpent: number;
      strengths: string[];
      improvements: string[];
    };
  };
  parameterScores: {
    [parameter: string]: number
  };
  adviceForImprovement: Array<{
    question: string;
    userAnswer: string;
    feedback: string;
    suggestedImprovement: string;
    score: number
  }>;
  securityReport: {
    totalAlerts: number;
    highSeverityAlerts: number;
    integrityScore: number;
    suspiciousPatterns: string[];
  };
  recommendations: {
    nextSteps: string[];
    focusAreas: string[];
    resources: string[];
    readinessLevel: 'beginner' | 'intermediate' | 'advanced' | 'expert'
  };
}

export class EnhancedRoundManager {
  private static instance: EnhancedRoundManager;
  private genAI: GoogleGenerativeAI;

  private constructor() {
    const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY || process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.warn('Gemini API key not found, using mock AI responses');
    }
    this.genAI = new GoogleGenerativeAI(apiKey || 'mock-key');
  }

  public static getInstance(): EnhancedRoundManager {
    if (!EnhancedRoundManager.instance) {
      EnhancedRoundManager.instance = new EnhancedRoundManager();
    }
    return EnhancedRoundManager.instance;
  }

  // Initialize a new interview session
  public async initializeSession(
    userId: string;
    interviewId: string;
    companyName: string;
    jobTitle: string;
    interviewType: string
  ): Promise<InterviewSession> {
    const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // Create default rounds based on interview type
    const rounds: InterviewRound[] = this.createDefaultRounds(interviewType);
    
    const session: InterviewSession = {
      sessionId,
      userId,
      interviewId,
      companyName,
      jobTitle,
      rounds,
      currentRound: 0;
      sessionData: {
        startTime: new Date(),
        totalTimeSpent: 0;
        overallProgress: 0
      },
      roundResults: [];
      sessionMetadata: {
        userAgent: '';
        ipAddress: '';
        cameraEnabled: false;
        suspiciousActivity: []
      }
    };

    return session;
  }

  // Create default rounds based on interview type
  private createDefaultRounds(interviewType: string): InterviewRound[] {
    const baseRounds: InterviewRound[] = [];
    
    switch (interviewType) {
      case 'technical':
        baseRounds.push({
          id: 'technical_1';
          type: 'technical';
          status: 'pending';
          questions: [];
          duration: 45
        });
        break;
      case 'behavioral':
        baseRounds.push({
          id: 'behavioral_1';
          type: 'behavioral';
          status: 'pending';
          questions: [];
          duration: 30
        });
        break;
      case 'dsa':
        baseRounds.push({
          id: 'dsa_1';
          type: 'dsa';
          status: 'pending';
          questions: [];
          duration: 60
        });
        break;
      case 'aptitude':
        baseRounds.push({
          id: 'aptitude_1';
          type: 'aptitude';
          status: 'pending';
          questions: [];
          duration: 25
        });
        break;
      case 'mixed':
      default:
        baseRounds.push(
          {
            id: 'technical_1';
            type: 'technical';
            status: 'pending';
            questions: [];
            duration: 30
          },
          {
            id: 'behavioral_1';
            type: 'behavioral';
            status: 'pending';
            questions: [];
            duration: 20
          }
        );
        break;
    }
    
    return baseRounds;
  }

  // Complete a round with enhanced analysis
  public async completeRound(
    session: InterviewSession;
    answers: string[];
    timeSpent: number;
    suspiciousActivities: ActivityAlert[]
  ): Promise<{ session: InterviewSession; roundResult: RoundResult }> {
    const currentRound = session.rounds[session.currentRound];
    
    if (!currentRound) {
      throw new Error('No active round found');
    }

    try {
      // Analyze round performance using AI
      const roundAnalysis = await this.analyzeRoundPerformance(;
        currentRound,
        answers,
        timeSpent,
        session.companyName,
        session.jobTitle
      );

      // Create round result
      const roundResult: RoundResult = {
        roundId: currentRound.id;
        answers,
        timeSpent,
        score: roundAnalysis.score;
        feedback: roundAnalysis.feedback;
        performanceMetrics: roundAnalysis.metrics;
        suspiciousActivities
      };

      // Update round
      currentRound.status = 'completed';
      currentRound.endTime = new Date();
      currentRound.timeSpent = timeSpent;
      currentRound.score = roundAnalysis.score;
      currentRound.feedback = roundAnalysis.feedback;

      // Update session
      const updatedSession: InterviewSession = {
        ...session,
        currentRound: session.currentRound + 1;
        roundResults: [...session.roundResults, roundResult],
        sessionData: {
          ...session.sessionData,
          totalTimeSpent: session.sessionData.totalTimeSpent + timeSpent;
          overallProgress: ((session.currentRound + 1) / session.rounds.length) * 100
        },
        sessionMetadata: {
          ...session.sessionMetadata,
          suspiciousActivity: [...session.sessionMetadata.suspiciousActivity, ...suspiciousActivities]
        }
      };

      return { session: updatedSession, roundResult };
    } catch (error) {
      console.error('Error completing round:', error);
      throw new Error('Failed to complete round analysis');
    }
  }

  // Analyze individual round performance using AI
  private async analyzeRoundPerformance(
    round: InterviewRound;
    answers: string[];
    timeSpent: number;
    companyName: string;
    jobTitle: string
  ): Promise<{
    score: number;
    feedback: string;
    metrics: {
      accuracy: number;
      confidence: number;
      clarity: number;
      technicalDepth: number;
      problemSolving: number
    };
  }> {
    try {
      const model = this.genAI.getGenerativeModel({ model: 'gemini-pro' });

      const prompt = `;
        Analyze this ${round.type} interview round performance for a ${jobTitle} position at ${companyName}.
        
        Round Type: ${round.type}
        Time Spent: ${timeSpent} seconds (Duration: ${round.duration} minutes)
        Questions and Answers:
        ${round.questions.map((q, i) => `
          Q${i + 1}: ${q.question}
          A${i + 1}: ${answers[i] || 'No answer provided'}
        `).join('\n')}

        Please provide a comprehensive analysis in JSON format:
        {
          "score": (0-10 overall score),
          "feedback": "Detailed constructive feedback",
          "metrics": {
            "accuracy": (0-10 how accurate/correct the answers are),
            "confidence": (0-10 how confident the responses sound),
            "clarity": (0-10 how clear and well-structured the answers are),
            "technicalDepth": (0-10 technical knowledge demonstrated),
            "problemSolving": (0-10 problem-solving approach shown)
          }
        }

        Consider:
        - Relevance to ${companyName} and ${jobTitle} role
        - Technical accuracy for ${round.type} questions
        - Communication clarity and structure
        - Time management (spent ${Math.round(timeSpent/60)} minutes of ${round.duration} allocated)
        - Depth of understanding demonstrated
        - Problem-solving approach and methodology
      `;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      try {
        const analysis = extractJSON(text);
        return {
          score: Math.max(0, Math.min(10, analysis.score || 5)),
          feedback: analysis.feedback || 'Analysis completed successfully.';
          metrics: {
            accuracy: Math.max(0, Math.min(10, analysis.metrics?.accuracy || 5)),
            confidence: Math.max(0, Math.min(10, analysis.metrics?.confidence || 5)),
            clarity: Math.max(0, Math.min(10, analysis.metrics?.clarity || 5)),
            technicalDepth: Math.max(0, Math.min(10, analysis.metrics?.technicalDepth || 5)),
            problemSolving: Math.max(0, Math.min(10, analysis.metrics?.problemSolving || 5))
          }
        };
      } catch (parseError) {
        console.error('Error parsing AI response:', parseError);
        return this.generateMockAnalysis(answers, timeSpent, round.duration);
      }
    } catch (error) {
      console.error('Error with AI analysis:', error);
      return this.generateMockAnalysis(answers, timeSpent, round.duration);
    }
  }

  // Generate final comprehensive report
  public async generateFinalReport(session: InterviewSession): Promise<FinalInterviewReport> {
    try {
      const model = this.genAI.getGenerativeModel({ model: 'gemini-pro' });

      // Prepare comprehensive session data
      const sessionSummary = {
        company: session.companyName;
        role: session.jobTitle;
        totalTime: session.sessionData.totalTimeSpent;
        rounds: session.roundResults.map(result => ({
          type: session.rounds.find(r => r.id === result.roundId)?.type,
          score: result.score;
          timeSpent: result.timeSpent;
          answers: result.answers;
          metrics: result.performanceMetrics
        })),
        securityAlerts: session.sessionMetadata.suspiciousActivity
      };

      const prompt = `;
        Generate a comprehensive interview report for a ${session.jobTitle} candidate interviewed at ${session.companyName}.
        
        Session Data:
        ${JSON.stringify(sessionSummary, null, 2)}

        Generate a detailed JSON report with:
        {
          "overallScore": (0-10 weighted average across all rounds),
          "overallVerdict": "Comprehensive assessment summary",
          "parameterScores": {
            "technical_knowledge": (0-10),
            "problem_solving": (0-10),
            "communication": (0-10),
            "behavioral_competency": (0-10),
            "cultural_fit": (0-10),
            "time_management": (0-10)
          },
          "adviceForImprovement": [
            {
              "question": "Question text",
              "userAnswer": "User's answer",
              "feedback": "Specific feedback",
              "suggestedImprovement": "How to improve",
              "score": (0-10)
            }
          ],
          "securityReport": {
            "integrityScore": (0-100 based on suspicious activities),
            "suspiciousPatterns": ["List of concerning behaviors"]
          },
          "recommendations": {
            "readinessLevel": "beginner|intermediate|advanced|expert",
            "nextSteps": ["Actionable recommendations"],
            "focusAreas": ["Areas needing improvement"],
            "resources": ["Learning resources"]
          }
        }

        Consider:
        - Company-specific expectations for ${session.companyName}
        - Role requirements for ${session.jobTitle}
        - Performance across different interview rounds
        - Time management and efficiency
        - Security and integrity concerns
        - Actionable improvement suggestions
      `;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      try {
        const reportData = extractJSON(text);
        
        const report: FinalInterviewReport = {
          sessionId: session.sessionId;
          overallScore: Math.max(0, Math.min(10, reportData.overallScore || 5)),
          overallVerdict: reportData.overallVerdict || 'Interview completed successfully.';
          roundBreakdown: this.generateRoundBreakdown(session),
          parameterScores: this.normalizeParameterScores(reportData.parameterScores || {}),
          adviceForImprovement: reportData.adviceForImprovement || [];
          securityReport: {
            totalAlerts: session.sessionMetadata.suspiciousActivity.length;
            highSeverityAlerts: session.sessionMetadata.suspiciousActivity.filter(a => a.severity === 'high').length,
            integrityScore: Math.max(0, Math.min(100, reportData.securityReport?.integrityScore || 85)),
            suspiciousPatterns: reportData.securityReport?.suspiciousPatterns || []
          },
          recommendations: {
            nextSteps: reportData.recommendations?.nextSteps || ['Continue practicing interview skills'];
            focusAreas: reportData.recommendations?.focusAreas || ['Technical knowledge'];
            resources: reportData.recommendations?.resources || ['Online coding practice'];
            readinessLevel: reportData.recommendations?.readinessLevel || 'intermediate'
          }
        };

        // Store report in database (you'll need to implement this)
        await this.saveInterviewReport(session.interviewId, report);

        return report;
      } catch (parseError) {
        console.error('Error parsing final report:', parseError);
        return this.generateMockFinalReport(session);
      }
    } catch (error) {
      console.error('Error generating final report:', error);
      return this.generateMockFinalReport(session);
    }
  }

  // Helper methods
  private generateMockAnalysis(answers: string[], timeSpent: number, duration: number) {
    const completionRate = Math.min(1, answers.filter(a => a && a.trim()).length / answers.length);
    const timeEfficiency = Math.min(1, (duration * 60) / timeSpent);
    
    return {
      score: Math.round((completionRate * 5 + timeEfficiency * 3 + Math.random() * 2) * 10) / 10,
      feedback: `Completed ${Math.round(completionRate * 100)}% of questions in ${Math.round(timeSpent/60)} minutes. ${timeEfficiency > 0.8 ? 'Good time management.' : 'Consider improving time efficiency.'}`,
      metrics: {
        accuracy: Math.round((completionRate * 0.8 + Math.random() * 0.4) * 10),
        confidence: Math.round((completionRate * 0.7 + Math.random() * 0.5) * 10),
        clarity: Math.round((timeEfficiency * 0.6 + Math.random() * 0.6) * 10),
        technicalDepth: Math.round((completionRate * 0.9 + Math.random() * 0.3) * 10),
        problemSolving: Math.round((timeEfficiency * 0.7 + completionRate * 0.5 + Math.random() * 0.3) * 10)
      }
    };
  }

  private generateRoundBreakdown(session: InterviewSession) {
    const breakdown: any = {};
    
    session.roundResults.forEach(result => {
      const round = session.rounds.find(r => r.id === result.roundId);
      breakdown[result.roundId] = {
        score: result.score;
        feedback: result.feedback;
        timeSpent: result.timeSpent;
        strengths: this.extractStrengths(result),
        improvements: this.extractImprovements(result)
      };
    });

    return breakdown;
  }

  private normalizeParameterScores(scores: any) {
    const defaultScores = {
      technical_knowledge: 5;
      problem_solving: 5;
      communication: 5;
      behavioral_competency: 5;
      cultural_fit: 5;
      time_management: 5
    };

    Object.keys(scores).forEach(key => {
      scores[key] = Math.max(0, Math.min(10, scores[key] || defaultScores[key as keyof typeof defaultScores] || 5));
    });

    return { ...defaultScores, ...scores };
  }

  private extractStrengths(result: RoundResult): string[] {
    const strengths: string[] = [];
    
    if (result.performanceMetrics.accuracy >= 7) strengths.push('Strong technical accuracy');
    if (result.performanceMetrics.confidence >= 7) strengths.push('Confident communication');
    if (result.performanceMetrics.clarity >= 7) strengths.push('Clear explanations');
    if (result.performanceMetrics.problemSolving >= 7) strengths.push('Good problem-solving approach');
    
    return strengths.length > 0 ? strengths : ['Completed the interview round'];
  }

  private extractImprovements(result: RoundResult): string[] {
    const improvements: string[] = [];
    
    if (result.performanceMetrics.accuracy < 5) improvements.push('Focus on technical accuracy');
    if (result.performanceMetrics.confidence < 5) improvements.push('Work on confident delivery');
    if (result.performanceMetrics.clarity < 5) improvements.push('Improve answer structure');
    if (result.performanceMetrics.problemSolving < 5) improvements.push('Practice problem-solving techniques');
    
    return improvements.length > 0 ? improvements : ['Continue practicing to build confidence'];
  }

  private generateMockFinalReport(session: InterviewSession): FinalInterviewReport {
    const avgScore = session.roundResults.reduce((sum, r) => sum + r.score, 0) / session.roundResults.length || 5;
    
    return {
      sessionId: session.sessionId;
      overallScore: Math.round(avgScore * 10) / 10,
      overallVerdict: `Interview completed with an average score of ${avgScore.toFixed(1)}/10. ${avgScore >= 7 ? 'Strong performance overall.' : avgScore >= 5 ? 'Good effort with room for improvement.' : 'Additional practice recommended.'}`,
      roundBreakdown: this.generateRoundBreakdown(session),
      parameterScores: {
        technical_knowledge: Math.round((avgScore + Math.random() - 0.5) * 10) / 10,
        problem_solving: Math.round((avgScore + Math.random() - 0.5) * 10) / 10,
        communication: Math.round((avgScore + Math.random() - 0.5) * 10) / 10,
        behavioral_competency: Math.round((avgScore + Math.random() - 0.5) * 10) / 10,
        cultural_fit: Math.round((avgScore + Math.random() - 0.5) * 10) / 10,
        time_management: Math.round((avgScore + Math.random() - 0.5) * 10) / 10
      },
      adviceForImprovement: this.generateMockAdvice(session),
      securityReport: {
        totalAlerts: session.sessionMetadata.suspiciousActivity.length;
        highSeverityAlerts: session.sessionMetadata.suspiciousActivity.filter(a => a.severity === 'high').length,
        integrityScore: Math.max(50, 100 - (session.sessionMetadata.suspiciousActivity.length * 10)),
        suspiciousPatterns: session.sessionMetadata.suspiciousActivity.map(a => a.message).slice(0, 3)
      },
      recommendations: {
        nextSteps: avgScore >= 7 ? ['Apply to real interviews', 'Practice advanced topics'] : ['Continue mock interviews', 'Focus on weak areas'],
        focusAreas: avgScore < 6 ? ['Technical skills', 'Communication'] : ['Advanced concepts', 'System design'],
        resources: ['LeetCode practice', 'System design courses', 'Mock interview platforms'],
        readinessLevel: avgScore >= 8 ? 'advanced' : avgScore >= 6 ? 'intermediate' : 'beginner'
      }
    };
  }

  private generateMockAdvice(session: InterviewSession) {
    return session.roundResults.flatMap((result, roundIndex) => {
      return result.answers.slice(0, 2).map((answer, qIndex) => ({
        question: `Question ${qIndex + 1} from Round ${roundIndex + 1}`,
        userAnswer: answer || 'No answer provided';
        feedback: result.score >= 7 ? 'Good response with solid understanding' : 'Could be improved with more detail and examples';
        suggestedImprovement: result.score >= 7 ? 'Consider adding more specific examples' : 'Practice similar questions and focus on structured answers';
        score: Math.round(result.score)
      }));
    });
  }

  private async saveInterviewReport(interviewId: string, report: FinalInterviewReport) {
    try {
      // Here you would save to your database
      // For now, we'll store in localStorage as fallback
      if (typeof window !== 'undefined') {
        localStorage.setItem(`interview_report_${interviewId}`, JSON.stringify(report));
      }
    } catch (error) {
      console.error('Error saving interview report:', error)
    }
  }
}

export default EnhancedRoundManager;