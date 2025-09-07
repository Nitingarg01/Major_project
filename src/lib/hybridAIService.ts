/**
 * Hybrid AI Service - Combines Ollama + Gemini for Reliability
 * Uses Ollama when available, falls back to Gemini for production reliability
 */

import OllamaService from './ollamaService';
import { aiInterviewModel } from './aimodel';
import { extractJSON } from './jsonExtractor';

interface InterviewQuestion {
  id: string;
  question: string;
  expectedAnswer: string;
  category: 'technical' | 'behavioral' | 'dsa' | 'aptitude' | 'system_design';
  difficulty: 'easy' | 'medium' | 'hard';
  points: number;
  timeLimit?: number;
  evaluationCriteria: string[];
  tags: string[];
  hints?: string[];
  companyRelevance: number;
}

interface ResponseAnalysis {
  score: number;
  feedback: string;
  suggestions: string[];
  strengths: string[];
  improvements: string[];
}

interface QuestionGenerationParams {
  jobTitle: string;
  companyName: string;
  skills: string[];
  jobDescription?: string;
  experienceLevel: 'entry' | 'mid' | 'senior';
  interviewType: 'technical' | 'behavioral' | 'aptitude' | 'dsa' | 'mixed' | 'system_design';
  resumeContent?: string;
  numberOfQuestions?: number;
}

export class HybridAIService {
  private static instance: HybridAIService;
  private ollamaService: OllamaService;

  private constructor() {
    this.ollamaService = OllamaService.getInstance();
    console.log('🤖 HybridAIService initialized - Ollama + Gemini fallback');
  }

  public static getInstance(): HybridAIService {
    if (!HybridAIService.instance) {
      HybridAIService.instance = new HybridAIService();
    }
    return HybridAIService.instance;
  }

  /**
   * Generate interview questions using hybrid approach
   */
  public async generateInterviewQuestions(params: QuestionGenerationParams): Promise<InterviewQuestion[]> {
    console.log('🎯 Generating questions using hybrid approach...');
    
    try {
      // First, try Ollama for company-specific questions
      const ollamaHealth = await this.ollamaService.healthCheck();
      
      if (ollamaHealth.ollamaAvailable && ollamaHealth.modelLoaded) {
        console.log('✅ Using Ollama for company-specific question generation');
        return await this.generateWithOllama(params);
      } else {
        console.log('⚠️ Ollama not available, using Gemini fallback');
        return await this.generateWithGemini(params);
      }
    } catch (error) {
      console.error('❌ Ollama generation failed, falling back to Gemini:', error);
      return await this.generateWithGemini(params);
    }
  }

  /**
   * Analyze interview response using hybrid approach
   */
  public async analyzeResponse(
    question: string,
    userAnswer: string,
    expectedAnswer: string,
    category: string,
    companyContext: string
  ): Promise<ResponseAnalysis> {
    console.log('🔍 Analyzing response using hybrid approach...');
    
    try {
      // Try Ollama first for company-specific analysis
      const ollamaHealth = await this.ollamaService.healthCheck();
      
      if (ollamaHealth.ollamaAvailable && ollamaHealth.modelLoaded) {
        console.log('✅ Using Ollama for company-specific response analysis');
        return await this.ollamaService.analyzeInterviewResponse(
          question, userAnswer, expectedAnswer, category, companyContext
        );
      } else {
        console.log('⚠️ Ollama not available, using Gemini fallback');
        return await this.analyzeWithGemini(question, userAnswer, expectedAnswer, category, companyContext);
      }
    } catch (error) {
      console.error('❌ Ollama analysis failed, falling back to Gemini:', error);
      return await this.analyzeWithGemini(question, userAnswer, expectedAnswer, category, companyContext);
    }
  }

  /**
   * Analyze overall interview performance
   */
  public async analyzeOverallPerformance(
    questions: any[],
    answers: string[],
    jobTitle: string,
    companyName: string,
    skills: string[]
  ): Promise<any> {
    console.log('📊 Analyzing overall performance using hybrid approach...');
    
    try {
      const ollamaHealth = await this.ollamaService.healthCheck();
      
      if (ollamaHealth.ollamaAvailable && ollamaHealth.modelLoaded) {
        console.log('✅ Using Ollama for company-specific performance analysis');
        return await this.ollamaService.analyzeOverallPerformance(
          questions, answers, jobTitle, companyName, skills
        );
      } else {
        console.log('⚠️ Ollama not available, using Gemini fallback');
        return await this.analyzePerformanceWithGemini(questions, answers, jobTitle, companyName, skills);
      }
    } catch (error) {
      console.error('❌ Ollama performance analysis failed, falling back to Gemini:', error);
      return await this.analyzePerformanceWithGemini(questions, answers, jobTitle, companyName, skills);
    }
  }

  /**
   * Get company suggestions with enhanced intelligence
   */
  public getCompanySuggestions(query: string): string[] {
    // Always use Ollama's enhanced company database for suggestions
    return this.ollamaService.getCompanySuggestions(query);
  }

  /**
   * Get service health status
   */
  public async getServiceHealth(): Promise<{
    ollama: any;
    gemini: boolean;
    primary: string;
    fallback: string;
  }> {
    try {
      const ollamaHealth = await this.ollamaService.healthCheck();
      const geminiHealth = !!process.env.GEMINI_API_KEY;
      
      return {
        ollama: ollamaHealth,
        gemini: geminiHealth,
        primary: ollamaHealth.ollamaAvailable ? 'ollama' : 'gemini',
        fallback: ollamaHealth.ollamaAvailable ? 'gemini' : 'none'
      };
    } catch (error) {
      return {
        ollama: { ollamaAvailable: false, modelLoaded: false, status: 'error' },
        gemini: !!process.env.GEMINI_API_KEY,
        primary: 'gemini',
        fallback: 'none'
      };
    }
  }

  // Private methods for specific service implementations

  private async generateWithOllama(params: QuestionGenerationParams): Promise<InterviewQuestion[]> {
    const questions = await this.ollamaService.generateInterviewQuestions({
      jobTitle: params.jobTitle,
      companyName: params.companyName,
      skills: params.skills,
      interviewType: params.interviewType as any,
      experienceLevel: params.experienceLevel,
      numberOfQuestions: params.numberOfQuestions || 10
    });

    return questions.map((q: any) => ({
      id: q.id || `hybrid-${Date.now()}-${Math.random()}`,
      question: q.question,
      expectedAnswer: q.expectedAnswer,
      category: params.interviewType as any,
      difficulty: q.difficulty || 'medium',
      points: q.points || 10,
      timeLimit: q.timeLimit || 5,
      evaluationCriteria: q.evaluationCriteria || ['Technical accuracy', 'Communication', 'Problem solving'],
      tags: q.tags || [params.companyName, params.jobTitle],
      hints: q.hints || [],
      companyRelevance: q.companyRelevance || 8
    }));
  }

  private async generateWithGemini(params: QuestionGenerationParams): Promise<InterviewQuestion[]> {
    console.log('🔄 Using Gemini for question generation...');
    
    const geminiQuestions = await aiInterviewModel.generateInterviewQuestions({
      jobTitle: params.jobTitle,
      companyName: params.companyName,
      skills: params.skills,
      jobDescription: params.jobDescription || '',
      experienceLevel: params.experienceLevel,
      interviewType: params.interviewType,
      resumeContent: params.resumeContent,
      numberOfQuestions: params.numberOfQuestions || 10
    });

    return geminiQuestions.map((q: any) => ({
      id: q.id || `gemini-${Date.now()}-${Math.random()}`,
      question: q.question,
      expectedAnswer: q.expectedAnswer,
      category: q.category || params.interviewType,
      difficulty: q.difficulty || 'medium',
      points: q.points || 10,
      timeLimit: 5,
      evaluationCriteria: ['Technical accuracy', 'Communication', 'Problem solving'],
      tags: [params.companyName, params.jobTitle],
      hints: [],
      companyRelevance: 7 // Slightly lower than Ollama since it's less company-specific
    }));
  }

  private async analyzeWithGemini(
    question: string,
    userAnswer: string,
    expectedAnswer: string,
    category: string,
    companyContext: string
  ): Promise<ResponseAnalysis> {
    console.log('🔄 Using Gemini for response analysis...');
    
    const prompt = `You are an expert interviewer evaluating a candidate's response for ${companyContext}.

Question: ${question}
Category: ${category}
Expected Answer: ${expectedAnswer}
Candidate's Answer: ${userAnswer}

Provide detailed analysis in JSON format:
{
  "score": (0-10 score),
  "feedback": "detailed feedback considering ${companyContext}'s standards",
  "suggestions": ["specific improvement suggestions for ${companyContext}"],
  "strengths": ["what they did well"],
  "improvements": ["areas to improve for ${companyContext}"]
}`;

    try {
      const result = await aiInterviewModel.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      const analysis = extractJSON(text);
      
      return {
        score: Math.max(0, Math.min(10, analysis.score || 5)),
        feedback: analysis.feedback || 'Response analyzed successfully.',
        suggestions: analysis.suggestions || ['Continue practicing'],
        strengths: analysis.strengths || ['Attempted the question'],
        improvements: analysis.improvements || ['Add more technical details']
      };
    } catch (error) {
      console.error('Gemini analysis error:', error);
      return this.generateFallbackAnalysis(userAnswer, companyContext);
    }
  }

  private async analyzePerformanceWithGemini(
    questions: any[],
    answers: string[],
    jobTitle: string,
    companyName: string,
    skills: string[]
  ): Promise<any> {
    console.log('🔄 Using Gemini for performance analysis...');
    
    try {
      return await aiInterviewModel.analyzeInterviewPerformance(
        questions, answers, jobTitle, skills
      );
    } catch (error) {
      console.error('Gemini performance analysis error:', error);
      return this.generateFallbackPerformanceAnalysis(questions, answers, companyName);
    }
  }

  private generateFallbackAnalysis(userAnswer: string, companyContext: string): ResponseAnalysis {
    const wordCount = userAnswer.split(' ').length;
    const score = Math.min(10, Math.max(3, wordCount / 15));
    
    return {
      score,
      feedback: `Your response shows ${score >= 7 ? 'good' : score >= 5 ? 'adequate' : 'basic'} understanding. For ${companyContext} interviews, consider adding more specific technical details.`,
      suggestions: [`Research ${companyContext}'s specific technologies`, 'Add more detailed explanations', 'Include real-world examples'],
      strengths: wordCount > 30 ? ['Comprehensive response', 'Good engagement'] : ['Attempted the question'],
      improvements: [`Study ${companyContext}'s requirements`, 'Practice company-specific scenarios', 'Improve technical depth']
    };
  }

  private generateFallbackPerformanceAnalysis(questions: any[], answers: string[], companyName: string) {
    const avgWordCount = answers.reduce((sum, ans) => sum + ans.split(' ').length, 0) / answers.length;
    const score = Math.min(10, Math.max(4, avgWordCount / 20));
    
    return {
      overallScore: score,
      parameterScores: {
        "Technical Knowledge": Math.min(10, score + 1),
        "Problem Solving": score,
        "Communication Skills": Math.min(10, score + 0.5),
        "Company Culture Fit": Math.max(3, score - 0.5),
        "Practical Application": score
      },
      overallVerdict: `The candidate demonstrated ${score >= 7 ? 'strong' : score >= 5 ? 'adequate' : 'basic'} performance for ${companyName} interview standards.`,
      adviceForImprovement: questions.slice(0, 3).map((q, i) => ({
        question: q.question,
        advice: `For ${companyName}, focus more on their specific technical challenges and company culture values.`
      })),
      strengths: ["Attempted all questions", "Showed problem-solving approach", "Professional communication"],
      improvements: [`Study ${companyName}'s specific technologies`, "Practice company scenarios", "Improve technical depth"],
      recommendations: [`Research ${companyName}'s recent projects`, "Practice with their tech stack", "Study their values"]
    };
  }
}

export const hybridAIService = HybridAIService.getInstance();
export default HybridAIService;