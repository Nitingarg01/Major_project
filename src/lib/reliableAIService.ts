/**
 * Reliable AI Service - Simplified and robust AI integration
 * Handles question generation, response analysis, and interview feedback
 * Uses Emergent LLM as primary with Gemini as fallback
 */

import { extractJSON } from './jsonExtractor';

interface AIRequest {
  messages: Array<{
    role: 'system' | 'user' | 'assistant';
    content: string;
  }>;
  provider?: 'openai' | 'anthropic' | 'gemini';
  model?: string;
  max_tokens?: number;
  temperature?: number;
}

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

interface DSAProblem {
  id: string;
  title: string;
  difficulty: 'easy' | 'medium' | 'hard';
  description: string;
  examples: Array<{
    input: string;
    output: string;
    explanation?: string;
  }>;
  testCases: Array<{
    id: string;
    input: string;
    expectedOutput: string;
    hidden?: boolean;
  }>;
  constraints: string[];
  topics: string[];
  hints?: string[];
  timeComplexity?: string;
  spaceComplexity?: string;
}

export class ReliableAIService {
  private static instance: ReliableAIService;
  private emergentApiKey: string;
  private geminiApiKey: string;
  private baseUrl = 'https://integrations.emergentagent.com/api/v1/llm/chat';

  private constructor() {
    this.emergentApiKey = process.env.EMERGENT_LLM_KEY || process.env.NEXT_PUBLIC_EMERGENT_LLM_KEY || '';
    this.geminiApiKey = process.env.GEMINI_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY || '';
    
    console.log('🔥 ReliableAIService initialized with keys:', {
      emergent: !!this.emergentApiKey,
      gemini: !!this.geminiApiKey
    });
  }

  public static getInstance(): ReliableAIService {
    if (!ReliableAIService.instance) {
      ReliableAIService.instance = new ReliableAIService();
    }
    return ReliableAIService.instance;
  }

  private async callEmergentAPI(request: AIRequest): Promise<string> {
    if (!this.emergentApiKey) {
      throw new Error('Emergent API key not configured');
    }

    const response = await fetch(this.baseUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.emergentApiKey}`,
      },
      body: JSON.stringify({
        messages: request.messages,
        provider: request.provider || 'openai',
        model: request.model || 'gpt-4o-mini',
        max_tokens: request.max_tokens || 4000,
        temperature: request.temperature || 0.7,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Emergent API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    return data.content || data.message || 'No response received';
  }

  private async callGeminiAPI(messages: any[]): Promise<string> {
    if (!this.geminiApiKey) {
      throw new Error('Gemini API key not configured');
    }

    const { GoogleGenerativeAI } = await import('@google/generative-ai');
    const genAI = new GoogleGenerativeAI(this.geminiApiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    const prompt = messages.map(msg => `${msg.role}: ${msg.content}`).join('\n\n');
    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  }

  private async callAI(request: AIRequest): Promise<string> {
    // Try Emergent first, fallback to Gemini
    try {
      if (this.emergentApiKey) {
        return await this.callEmergentAPI(request);
      }
    } catch (emergentError) {
      console.log('⚠️ Emergent API failed, trying Gemini fallback...');
    }

    try {
      if (this.geminiApiKey) {
        return await this.callGeminiAPI(request.messages);
      }
    } catch (geminiError) {
      console.error('❌ Both APIs failed');
      throw new Error('All AI providers failed');
    }

    throw new Error('No AI providers configured');
  }

  // Generate interview questions
  public async generateInterviewQuestions(params: {
    jobTitle: string;
    companyName: string;
    skills: string[];
    interviewType: 'technical' | 'behavioral' | 'mixed' | 'aptitude';
    experienceLevel: 'entry' | 'mid' | 'senior';
    numberOfQuestions: number;
    companyIntelligence?: any;
  }): Promise<InterviewQuestion[]> {
    const systemMessage = `You are an expert interview question generator. Generate high-quality, relevant questions for ${params.companyName}.`;
    
    const userMessage = `
      Generate exactly ${params.numberOfQuestions} ${params.interviewType} interview questions for:
      
      Position: ${params.jobTitle} at ${params.companyName}
      Experience Level: ${params.experienceLevel}
      Required Skills: ${params.skills.join(', ')}
      
      Return as valid JSON array:
      [
        {
          "id": "unique-question-id",
          "question": "Interview question text",
          "expectedAnswer": "Comprehensive expected answer",
          "category": "${params.interviewType}",
          "difficulty": "easy|medium|hard",
          "points": 10,
          "timeLimit": 5,
          "evaluationCriteria": ["criteria 1", "criteria 2"],
          "tags": ["relevant", "tags"],
          "hints": ["helpful hint"]
        }
      ]
    `;

    try {
      const response = await this.callAI({
        messages: [
          { role: 'system', content: systemMessage },
          { role: 'user', content: userMessage }
        ],
        max_tokens: 4000,
        temperature: 0.7
      });

      const questions = extractJSON(response);
      return questions.map((q: any, index: number) => ({
        ...q,
        id: q.id || `q-${Date.now()}-${index}`,
        category: params.interviewType,
        points: q.points || 10,
        timeLimit: q.timeLimit || 5,
        evaluationCriteria: q.evaluationCriteria || ['Accuracy', 'Clarity'],
        tags: q.tags || [params.jobTitle, params.companyName]
      }));
    } catch (error) {
      console.error('❌ Error generating questions:', error);
      return this.generateFallbackQuestions(params);
    }
  }

  // Generate DSA problems
  public async generateDSAProblems(
    companyName: string,
    difficulty: 'easy' | 'medium' | 'hard' = 'medium',
    count: number = 6
  ): Promise<DSAProblem[]> {
    const systemMessage = `Generate DSA problems for ${companyName} interviews.`;
    
    const userMessage = `
      Generate exactly ${count} DSA problems with difficulty: ${difficulty}
      
      Return as valid JSON array:
      [
        {
          "id": "unique-problem-id",
          "title": "Problem Title",
          "difficulty": "${difficulty}",
          "description": "Clear problem description",
          "examples": [
            {
              "input": "sample input",
              "output": "expected output", 
              "explanation": "explanation"
            }
          ],
          "testCases": [
            {
              "id": "test-1",
              "input": "test input",
              "expectedOutput": "expected result",
              "hidden": false
            }
          ],
          "constraints": ["constraint 1"],
          "topics": ["Array", "Hash Table"],
          "hints": ["helpful hint"],
          "timeComplexity": "O(n)",
          "spaceComplexity": "O(1)"
        }
      ]
    `;

    try {
      const response = await this.callAI({
        messages: [
          { role: 'system', content: systemMessage },
          { role: 'user', content: userMessage }
        ],
        max_tokens: 6000,
        temperature: 0.8
      });

      const problems = extractJSON(response);
      return problems.map((p: any, index: number) => ({
        ...p,
        id: p.id || `dsa-${Date.now()}-${index}`,
        difficulty: difficulty
      }));
    } catch (error) {
      console.error('❌ Error generating DSA problems:', error);
      return this.generateFallbackDSAProblems(difficulty, count);
    }
  }

  // Analyze interview responses
  public async analyzeInterviewResponse(
    question: string,
    userAnswer: string,
    expectedAnswer: string,
    category: string
  ): Promise<{
    score: number;
    feedback: string;
    suggestions: string[];
    strengths: string[];
    improvements: string[];
  }> {
    const systemMessage = `You are an expert interview evaluator. Analyze responses fairly.`;
    
    const userMessage = `
      Analyze this interview response:
      
      Question (${category}): ${question}
      Expected Answer: ${expectedAnswer}
      Candidate Answer: ${userAnswer}
      
      Return JSON:
      {
        "score": (0-10 score),
        "feedback": "Constructive feedback",
        "suggestions": ["improvement suggestions"],
        "strengths": ["what they did well"],
        "improvements": ["areas to improve"]
      }
    `;

    try {
      const response = await this.callAI({
        messages: [
          { role: 'system', content: systemMessage },
          { role: 'user', content: userMessage }
        ],
        max_tokens: 2000,
        temperature: 0.5
      });

      const analysis = extractJSON(response);
      return {
        score: Math.max(0, Math.min(10, analysis.score || 5)),
        feedback: analysis.feedback || 'Response analyzed successfully.',
        suggestions: analysis.suggestions || ['Continue practicing'],
        strengths: analysis.strengths || ['Attempted the question'],
        improvements: analysis.improvements || ['Add more detail']
      };
    } catch (error) {
      console.error('❌ Error analyzing response:', error);
      return this.generateFallbackAnalysis(userAnswer);
    }
  }

  // Fallback methods
  private generateFallbackQuestions(params: any): InterviewQuestion[] {
    const mockQuestions: InterviewQuestion[] = [];
    
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
    const problems = [
      {
        title: "Two Sum",
        description: "Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.",
        topics: ["Array", "Hash Table"]
      },
      {
        title: "Valid Parentheses", 
        description: "Given a string s containing just brackets, determine if the input string is valid.",
        topics: ["String", "Stack"]
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