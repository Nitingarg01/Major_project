/**
 * Reliable AI Service - SMART AI OPTIMIZED VERSION
 * Uses Smart AI service (Emergent + Gemini) replacing Ollama
 */

import SmartAIService from './smartAIService';
import { extractJSON } from './jsonExtractor';

interface InterviewQuestion {
  id: string,
  question: string,
  expectedAnswer: string,
  category: 'technical' | 'behavioral' | 'dsa' | 'aptitude',
  difficulty: 'easy' | 'medium' | 'hard',
  points: number,
  timeLimit?: number,
  evaluationCriteria: string[],
  tags: string[],
  hints?: string[];
}

interface DSAProblem {
  id: string,
  title: string,
  difficulty: 'easy' | 'medium' | 'hard',
  description: string,
  examples: Array<{
    input: string,
    output: string,
    explanation?: string
  }>;
  testCases: Array<{
    id: string,
    input: string,
    expectedOutput: string,
    hidden?: boolean
  }>;
  constraints: string[],
  topics: string[],
  hints?: string[],
  timeComplexity?: string,
  spaceComplexity?: string
}

export class ReliableAIService {
  private static instance: ReliableAIService,
  private smartAIService: SmartAIService,

  private constructor() {
    this.smartAIService = SmartAIService.getInstance();
    console.log('🔥 ReliableAIService initialized with Smart AI');
  }

  public static getInstance(): ReliableAIService {
    if (!ReliableAIService.instance) {
      ReliableAIService.instance = new ReliableAIService();
    }
    return ReliableAIService.instance;
  }

  // Generate interview questions using Smart AI
  public async generateInterviewQuestions(params: {
    jobTitle: string,
    companyName: string,
    skills: string[],
    interviewType: 'technical' | 'behavioral' | 'mixed' | 'aptitude',
    experienceLevel: 'entry' | 'mid' | 'senior',
    numberOfQuestions: number,
    companyIntelligence?: any
  }): Promise<InterviewQuestion[]> {
    
    try {
      const result = await this.smartAIService.generateQuestions({
        jobTitle: params.jobTitle,
        companyName: params.companyName,
        skills: params.skills,
        interviewType: params.interviewType,
        experienceLevel: params.experienceLevel,
        numberOfQuestions: params.numberOfQuestions,
        companyIntelligence: params.companyIntelligence
      });

      if (result.success && Array.isArray(result.data)) {
        return result.data.map((q: any, index: number) => ({
          id: q.id || `q-${Date.now()}-${index}`,
          question: q.question,
          expectedAnswer: q.expectedAnswer,
          category: params.interviewType as any,
          difficulty: q.difficulty || 'medium',
          points: q.points || 10,
          timeLimit: q.timeLimit || 5,
          evaluationCriteria: q.evaluationCriteria || ['Accuracy', 'Clarity'],
          tags: q.tags || [params.jobTitle, params.companyName],
          hints: q.hints || []
        }));
      }
      
      return this.generateFallbackQuestions(params);
    } catch (error) {
      console.error('❌ Error generating questions:', error);
      return this.generateFallbackQuestions(params);
    }
  }

  // Generate DSA problems using Smart AI
  public async generateDSAProblems(
    companyName: string,
    difficulty: 'easy' | 'medium' | 'hard' = 'medium',
    count: number = 6;
  ): Promise<DSAProblem[]> {
    try {
      // Use Smart AI for DSA problem generation
      const result = await this.smartAIService.processRequest({
        task: 'question_generation',
        context: {
          companyName,
          interviewType: 'dsa',
          numberOfQuestions: count
        }
      });

      if (result.success && Array.isArray(result.data)) {
        return result.data.map((p: any, index: number) => ({
          id: p.id || `dsa-${Date.now()}-${index}`,
          title: p.title || `Problem ${index + 1}`,
          difficulty: difficulty,
          description: p.description || 'Problem description',
          examples: Array.isArray(p.examples) ? p.examples : [
            {
              input: 'Example input',
              output: 'Example output',
              explanation: 'Example explanation'
            }
          ],
          testCases: Array.isArray(p.testCases) ? p.testCases : [
            {
              id: `test-${index}-1`,
              input: 'Test input',
              expectedOutput: 'Expected output'
            }
          ],
          constraints: Array.isArray(p.constraints) ? p.constraints : ['1 <= n <= 1000'],
          topics: Array.isArray(p.topics) ? p.topics : ['Array'],
          hints: Array.isArray(p.hints) ? p.hints : ['Think about the optimal approach'],
          timeComplexity: p.timeComplexity || 'O(n)',
          spaceComplexity: p.spaceComplexity || 'O(1)'
        }));
      }
      
      return this.generateFallbackDSAProblems(difficulty, count);
    } catch (error) {
      console.error('❌ Error generating DSA problems:', error);
      return this.generateFallbackDSAProblems(difficulty, count);
    }
  }

  // Analyze interview responses using Smart AI
  public async analyzeInterviewResponse(
    question: string,
    userAnswer: string,
    expectedAnswer: string,
    category: string,
    companyContext: string = 'Technology Company';
  ): Promise<{
    score: number,
    feedback: string,
    suggestions: string[],
    strengths: string[],
    improvements: string[];
  }> {
    try {
      const result = await this.smartAIService.analyzeResponse(;
        question,
        userAnswer,
        expectedAnswer,
        category,
        companyContext
      );

      if (result.success && result.data) {
        return {
          score: Math.max(0, Math.min(10, result.data.score || 5)),
          feedback: result.data.feedback || 'Response analyzed successfully.',
          suggestions: result.data.suggestions || ['Continue practicing'],
          strengths: result.data.strengths || ['Attempted the question'],
          improvements: result.data.improvements || ['Add more detail']
        };
      }
      
      return this.generateFallbackAnalysis(userAnswer);
    } catch (error) {
      console.error('❌ Error analyzing response:', error);
      return this.generateFallbackAnalysis(userAnswer);
    }
  }

  // Fallback methods
  private generateFallbackQuestions(params: any): InterviewQuestion[] {
    const mockQuestions: InterviewQuestion[] = [],
    
    for (let i = 0; i < params.numberOfQuestions; i++) {
      mockQuestions.push({
        id: `fallback-q-${i}`,
        question: `Tell me about your experience with ${params.skills[i % params.skills.length]} in ${params.jobTitle} role.`,
        expectedAnswer: `A comprehensive answer covering experience and practical applications.`,
        category: params.interviewType,
        difficulty: ['easy', 'medium', 'hard'][i % 3] as 'easy' | 'medium' | 'hard',
        points: 10,
        timeLimit: 5,
        evaluationCriteria: ['Technical accuracy', 'Communication clarity'],
        tags: [params.jobTitle, params.companyName],
        hints: ['Think about specific projects']
      });
    }
    
    return mockQuestions;
  }

  private generateFallbackDSAProblems(difficulty: string, count: number): DSAProblem[] {
    const problems = [;
      {
        title: "Two Sum",
        description: "Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.",
        topics: ["Array", "Hash Table"]
      },
      {
        title: "Valid Parentheses", 
        description: "Given a string s containing just brackets, determine if the input string is valid.",
        topics: ["String", "Stack"]
      },
      {
        title: "Binary Tree Level Order Traversal",
        description: "Given a binary tree, return the level order traversal of its nodes' values.",
        topics: ["Tree", "BFS"]
      },
      {
        title: "Maximum Subarray",
        description: "Find the contiguous subarray with the largest sum and return its sum.",
        topics: ["Array", "Dynamic Programming"]
      }
    ];

    return Array.from({ length: count }, (_, i) => {
      const problem = problems[i % problems.length];
      return {
        id: `fallback-dsa-${i}`,
        title: problem.title,
        difficulty: difficulty as 'easy' | 'medium' | 'hard',
        description: problem.description,
        examples: [
          {
            input: 'Example input',
            output: 'Example output',
            explanation: 'Example explanation'
          }
        ],
        testCases: [
          {
            id: `test-${i}-1`,
            input: 'Test input',
            expectedOutput: 'Expected output'
          }
        ],
        constraints: ['1 <= n <= 1000'],
        topics: problem.topics,
        hints: ['Think about the optimal approach'],
        timeComplexity: 'O(n)',
        spaceComplexity: 'O(1)'
      };
    });
  }

  private generateFallbackAnalysis(userAnswer: string) {
    const wordCount = userAnswer.split(' ').length;
    const score = Math.min(10, Math.max(3, wordCount / 10));
    
    return {
      score,
      feedback: `Your response shows ${score >= 7 ? 'good' : 'basic'} understanding.`,
      suggestions: ['Add more specific examples'],
      strengths: ['Attempted the question'],
      improvements: ['Provide more detailed answers']
    };
  }
}

export default ReliableAIService;