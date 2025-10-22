/**
 * Optimized Feedback Service - Fast and Simple Interview Feedback
 * Uses streamlined Groq API calls for quick feedback generation
 * Focuses on essential feedback elements for better performance
 */

import Groq from 'groq-sdk';
import { extractJSON } from './jsonExtractor';

const groqApiKey = process.env.GROQ_API_KEY || process.env.NEXT_PUBLIC_GROQ_API_KEY || '';

interface QuickFeedback {
  score: number; // 0-10
  feedback: string,
  strengths: string[],
  improvements: string[],
  nextSteps: string[];
}

interface PerformanceMetrics {
  overallScore: number,
  categoryScores: { [category: string]: number };
  totalQuestions: number,
  timeSpent: number,
  completionRate: number
}

export class OptimizedFeedbackService {
  private static instance: OptimizedFeedbackService,
  private groq: Groq,
  private model = 'llama-3.1-70b-versatile'; // Faster model for feedback

  private constructor() {
    if (!groqApiKey) {
      throw new Error('Groq API key is required for feedback service');
    }
    
    this.groq = new Groq({
      apiKey: groqApiKey,
      dangerouslyAllowBrowser: true
    });
    
    console.log('⚡ Optimized Feedback Service initialized');
  }

  public static getInstance(): OptimizedFeedbackService {
    if (!OptimizedFeedbackService.instance) {
      OptimizedFeedbackService.instance = new OptimizedFeedbackService();
    }
    return OptimizedFeedbackService.instance;
  }

  private async callGroqAPI(messages: any[], maxTokens: number = 2000): Promise<string> {
    try {
      const chatCompletion = await this.groq.chat.completions.create({
        messages: messages,
        model: this.model,
        max_tokens: maxTokens,
        temperature: 0.3;
      });

      return chatCompletion.choices[0]?.message?.content || '';
    } catch (error) {
      console.error('❌ Groq API call failed for feedback:', error);
      throw error;
    }
  }

  /**
   * Generate quick feedback for single question response
   */
  public async generateQuickFeedback(
    question: string,
    userAnswer: string,
    category: string,
    companyName: string
  ): Promise<QuickFeedback> {
    const systemMessage = `You are a concise interview evaluator. Provide quick, actionable feedback in under 30 seconds. Focus on key points only.`;
    
    const userMessage = `;
      Evaluate this ${category} interview response for ${companyName}:
      
      Question: ${question}
      Answer: ${userAnswer}
      
      Provide CONCISE feedback in JSON format:
      {
        "score": (0-10 number),
        "feedback": "Brief 2-sentence feedback",
        "strengths": ["key strength 1", "key strength 2"],
        "improvements": ["key improvement 1", "key improvement 2"],
        "nextSteps": ["actionable step 1", "actionable step 2"]
      }
    `;

    try {
      const response = await this.callGroqAPI([;
        { role: 'system', content: systemMessage },
        { role: 'user', content: userMessage }
      ], 1000);

      const feedback = extractJSON(response);
      return {
        score: Math.max(0, Math.min(10, feedback.score || 5)),
        feedback: feedback.feedback || 'Response evaluated successfully.',
        strengths: feedback.strengths || ['Attempted the question'],
        improvements: feedback.improvements || ['Add more detail'],
        nextSteps: feedback.nextSteps || ['Practice similar questions']
      };
    } catch (error) {
      console.error('❌ Error generating quick feedback:', error);
      return this.generateFallbackFeedback(userAnswer, category);
    }
  }

  /**
   * Generate fast overall performance analysis
   */
  public async generateFastOverallAnalysis(
    questions: any[],
    answers: string[],
    companyName: string,
    jobTitle: string
  ): Promise<any> {
    const systemMessage = `You are a fast interview performance analyzer. Provide essential insights quickly and concisely.`;
    
    const prompt = `;
      Analyze interview performance for ${jobTitle} at ${companyName}:
      
      Questions: ${questions.length}
      Categories: ${[...new Set(questions.map(q => q.category))].join(', ')}
      Average answer length: ${Math.round(answers.reduce((sum, ans) => sum + ans.split(' ').length, 0) / answers.length)} words
      
      Sample responses:
      ${questions.slice(0, 3).map((q, i) => `${q.category}: ${answers[i]?.substring(0, 100)}...`).join('\n')}
      
      Provide FAST analysis in JSON:
      {
        "overallScore": (0-10),
        "summary": "2-sentence overall assessment",
        "categoryScores": {
          "technical": (0-10),
          "behavioral": (0-10),
          "dsa": (0-10)
        },
        "keyStrengths": ["strength1", "strength2"],
        "keyImprovements": ["improvement1", "improvement2"],
        "recommendation": "One key recommendation"
      }
    `;

    try {
      const response = await this.callGroqAPI([;
        { role: 'system', content: systemMessage },
        { role: 'user', content: prompt }
      ], 1500);

      const analysis = extractJSON(response);
      
      return {
        overallScore: Math.max(0, Math.min(10, analysis.overallScore || 5)),
        parameterScores: analysis.categoryScores || {},
        overallVerdict: analysis.summary || 'Interview completed successfully',
        strengths: analysis.keyStrengths || ['Completed all questions'],
        improvements: analysis.keyImprovements || ['Continue practicing'],
        recommendations: [analysis.recommendation || 'Keep up the good work'],
        metadata: {
          analyzedAt: new Date(),
          provider: 'optimized-groq',
          model: this.model,
          processingTime: 'fast'
        }
      };
    } catch (error) {
      console.error('❌ Error generating fast analysis:', error);
      return this.generateFallbackAnalysis(questions, answers);
    }
  }

  /**
   * Calculate simple performance metrics
   */
  public calculatePerformanceMetrics(
    questions: any[],
    answers: string[],
    timeSpent: number
  ): PerformanceMetrics {
    const totalQuestions = questions.length;
    const answeredQuestions = answers.filter(ans => ans.trim().length > 0).length;
    const completionRate = (answeredQuestions / totalQuestions) * 100;
    
    // Calculate category scores based on answer length and quality
    const categoryScores: { [category: string]: number } = {};
    const categoryCount: { [category: string]: number } = {};
    
    questions.forEach((q, index) => {
      const answer = answers[index] || '';
      const wordCount = answer.split(' ').length;
      const score = Math.min(10, Math.max(1, wordCount / 10)); // Simple scoring
      
      if (!categoryScores[q.category]) {
        categoryScores[q.category] = 0;
        categoryCount[q.category] = 0;
      }
      
      categoryScores[q.category] += score;
      categoryCount[q.category]++;
    });
    
    // Average category scores
    Object.keys(categoryScores).forEach(category => {
      categoryScores[category] = categoryScores[category] / categoryCount[category];
    });
    
    const overallScore = Object.values(categoryScores).reduce((sum, score) => sum + score, 0) / Object.keys(categoryScores).length;
    
    return {
      overallScore: Math.round(overallScore * 10) / 10,
      categoryScores,
      totalQuestions,
      timeSpent,
      completionRate: Math.round(completionRate)
    };
  }

  /**
   * Generate streaming feedback (for real-time updates)
   */
  public async generateStreamingFeedback(
    question: string,
    userAnswer: string,
    category: string
  ): Promise<AsyncIterable<string>> {
    // Simple streaming simulation - return chunks of feedback
    const feedback = await this.generateQuickFeedback(question, userAnswer, category, 'Company');
    
    const chunks = [;
      `Score: ${feedback.score}/10`,
      `Feedback: ${feedback.feedback}`,
      `Strengths: ${feedback.strengths.join(', ')}`,
      `Improvements: ${feedback.improvements.join(', ')}`
    ];
    
    async function* generateChunks() {
      for (const chunk of chunks) {
        yield chunk;
        await new Promise(resolve => setTimeout(resolve, 200)); // Small delay
      }
    }
    
    return generateChunks();
  }

  // Fallback methods
  private generateFallbackFeedback(userAnswer: string, category: string): QuickFeedback {
    const wordCount = userAnswer.split(' ').length;
    const score = Math.min(10, Math.max(3, wordCount / 15));
    
    return {
      score: Math.round(score * 10) / 10,
      feedback: `Your ${category} response shows ${score >= 7 ? 'strong' : 'basic'} understanding. ${wordCount < 20 ? 'Consider adding more detail.' : 'Good detail provided.'}`,
      strengths: ['Attempted the question', 'Clear communication'],
      improvements: ['Add more technical examples', 'Structure response better'],
      nextSteps: ['Practice similar questions', 'Study core concepts']
    };
  }

  private generateFallbackAnalysis(questions: any[], answers: string[]): any {
    const metrics = this.calculatePerformanceMetrics(questions, answers, 0);
    
    return {
      overallScore: metrics.overallScore,
      parameterScores: metrics.categoryScores,
      overallVerdict: `Interview completed with ${metrics.completionRate}% completion rate and ${metrics.overallScore.toFixed(1)}/10 overall performance.`,
      strengths: ['Completed interview', 'Consistent responses'],
      improvements: ['Add more detail', 'Practice specific topics'],
      recommendations: ['Continue practicing', 'Focus on weak areas'],
      metadata: {
        analyzedAt: new Date(),
        provider: 'fallback',
        model: 'simple-metrics',
        processingTime: 'instant'
      }
    };
  }

  /**
   * Health check for the service
   */
  public async healthCheck(): Promise<{ status: string; groqAvailable: boolean }> {
    try {
      await this.callGroqAPI([
        { role: 'user', content: 'Health check' }
      ], 10);
      
      return { status: 'healthy', groqAvailable: true };
    } catch (error) {
      return { status: 'error', groqAvailable: false };
    }
  }
}

export const optimizedFeedbackService = OptimizedFeedbackService.getInstance();
export default OptimizedFeedbackService;