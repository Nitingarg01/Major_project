/**
 * Hybrid AI Service - SMART AI OPTIMIZED VERSION
 * Uses Smart AI service (Emergent + Gemini) replacing Ollama
 */

import SmartAIService from './smartAIService';
import { GoogleGenerativeAI } from '@google/generative-ai';

interface InterviewQuestion {
  id: string;
  question: string;
  expectedAnswer: string;
  category: 'technical' | 'behavioral' | 'dsa' | 'aptitude';
  difficulty: 'easy' | 'medium' | 'hard';
  points: number;
  timeLimit?: number;
  evaluationCriteria: string[];
  tags: string[];
  hints?: string[];
}

export class HybridAIService {
  private static instance: HybridAIService;
  private smartAIService: SmartAIService;
  private geminiAI: GoogleGenerativeAI | null = null;

  private constructor() {
    this.smartAIService = SmartAIService.getInstance();
    
    // Initialize Gemini as backup
    const geminiKey = process.env.GEMINI_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY;
    if (geminiKey) {
      this.geminiAI = new GoogleGenerativeAI(geminiKey);
    }

    console.log('🔥 HybridAIService initialized with Smart AI');
  }

  public static getInstance(): HybridAIService {
    if (!HybridAIService.instance) {
      HybridAIService.instance = new HybridAIService();
    }
    return HybridAIService.instance;
  }

  // Generate interview questions using Smart AI
  public async generateInterviewQuestions(params: {
    jobTitle: string;
    companyName: string;
    skills: string[];
    interviewType: 'technical' | 'behavioral' | 'mixed' | 'aptitude';
    experienceLevel: 'entry' | 'mid' | 'senior';
    numberOfQuestions: number;
  }): Promise<InterviewQuestion[]> {
    try {
      const result = await this.smartAIService.generateQuestions({
        jobTitle: params.jobTitle,
        companyName: params.companyName,
        skills: params.skills,
        interviewType: params.interviewType,
        experienceLevel: params.experienceLevel,
        numberOfQuestions: params.numberOfQuestions
      });

      if (result.success && Array.isArray(result.data)) {
        return result.data;
      }

      return this.generateFallbackQuestions(params);
    } catch (error) {
      console.error('Error generating questions:', error);
      return this.generateFallbackQuestions(params);
    }
  }

  // Analyze interview response using Smart AI
  public async analyzeInterviewResponse(
    question: string,
    userAnswer: string,
    expectedAnswer: string,
    category: string,
    companyContext: string = 'Technology Company'
  ): Promise<any> {
    try {
      const result = await this.smartAIService.analyzeResponse(
        question,
        userAnswer,
        expectedAnswer,
        category,
        companyContext
      );

      if (result.success) {
        return result.data;
      }

      return this.generateFallbackAnalysis(userAnswer);
    } catch (error) {
      console.error('Error analyzing response:', error);
      return this.generateFallbackAnalysis(userAnswer);
    }
  }

  // Analyze overall performance using Smart AI
  public async analyzeOverallPerformance(
    questions: any[],
    answers: string[],
    jobTitle: string,
    skills: string[]
  ): Promise<any> {
    try {
      const result = await this.smartAIService.processRequest({
        task: 'performance_analysis',
        context: {
          jobTitle,
          skills
        }
      });

      if (result.success) {
        return result.data;
      }

      return this.generateFallbackPerformanceAnalysis(questions, answers);
    } catch (error) {
      console.error('Error analyzing performance:', error);
      return this.generateFallbackPerformanceAnalysis(questions, answers);
    }
  }

  // Get company suggestions using Smart AI
  public getCompanySuggestions(query: string): string[] {
    const suggestions = ['Google', 'Microsoft', 'Amazon', 'Meta', 'Apple', 'Netflix', 'Tesla', 'Spotify'];
    return suggestions.filter(company => 
      company.toLowerCase().includes(query.toLowerCase())
    ).slice(0, 5);
  }

  // Health check for the service
  public async getHealthStatus(): Promise<{
    status: string;
    services: any;
    primary: string;
    fallback: string;
  }> {
    try {
      const smartAIHealth = await this.smartAIService.getHealthStatus();
      
      return {
        status: 'healthy',
        services: {
          smartAI: smartAIHealth,
        },
        primary: smartAIHealth.emergentAvailable ? 'emergent' : (smartAIHealth.geminiAvailable ? 'gemini' : 'none'),
        fallback: smartAIHealth.fallbackAvailable ? 'available' : 'limited'
      };
    } catch (error) {
      return {
        status: 'error',
        services: { smartAI: { emergentAvailable: false, geminiAvailable: false } },
        primary: 'none',
        fallback: 'none'
      };
    }
  }

  // Test the service with a sample question
  public async testService(): Promise<any> {
    try {
      const result = await this.smartAIService.generateQuestions({
        jobTitle: 'Software Engineer',
        companyName: 'Google',
        skills: ['JavaScript', 'React'],
        interviewType: 'technical',
        experienceLevel: 'mid',
        numberOfQuestions: 1
      });

      return {
        success: result.success,
        provider: result.provider,
        model: result.model,
        sampleQuestion: result.data?.[0]?.question || 'No question generated'
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  // Fallback methods
  private generateFallbackQuestions(params: any): InterviewQuestion[] {
    const questions: InterviewQuestion[] = [];
    
    for (let i = 0; i < params.numberOfQuestions; i++) {
      questions.push({
        id: `hybrid-fallback-${i}`,
        question: `Tell me about your experience with ${params.skills[i % params.skills.length]} in a ${params.jobTitle} role.`,
        expectedAnswer: 'A comprehensive answer covering experience and practical applications.',
        category: params.interviewType as any,
        difficulty: 'medium',
        points: 10,
        timeLimit: 5,
        evaluationCriteria: ['Technical accuracy', 'Communication', 'Real-world application'],
        tags: [params.jobTitle, params.companyName],
        hints: ['Think about specific projects and outcomes']
      });
    }
    
    return questions;
  }

  private generateFallbackAnalysis(userAnswer: string) {
    const wordCount = userAnswer.split(' ').length;
    const score = Math.min(10, Math.max(3, wordCount / 10));
    
    return {
      score,
      feedback: `Your response demonstrates ${score >= 7 ? 'good' : 'basic'} understanding.`,
      suggestions: ['Add more specific examples', 'Structure your response better'],
      strengths: wordCount > 30 ? ['Comprehensive response'] : ['Attempted the question'],
      improvements: wordCount < 20 ? ['Provide more detailed answers'] : ['Continue developing technical depth']
    };
  }

  private generateFallbackPerformanceAnalysis(questions: any[], answers: string[]) {
    const avgWordCount = answers.reduce((sum, ans) => sum + ans.split(' ').length, 0) / answers.length;
    const score = Math.min(10, Math.max(4, avgWordCount / 15));
    
    return {
      overallScore: score,
      parameterScores: {
        "Technical Knowledge": Math.min(10, score + 1),
        "Problem Solving": score,
        "Communication Skills": Math.min(10, score + 0.5),
        "Analytical Thinking": Math.max(3, score - 0.5),
        "Practical Application": score
      },
      overallVerdict: `The candidate demonstrated ${score >= 7 ? 'strong' : score >= 5 ? 'adequate' : 'basic'} performance across the interview questions.`,
      strengths: ["Attempted all questions", "Showed problem-solving approach", "Maintained professional communication"],
      improvements: ["Provide more detailed technical explanations", "Include specific examples from experience", "Structure responses more clearly"],
      recommendations: ["Practice more technical questions", "Work on communication skills", "Study company-specific technologies"]
    };
  }
}

export default HybridAIService;