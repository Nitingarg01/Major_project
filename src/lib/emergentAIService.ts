/**
 * Enhanced AI Service using Emergent LLM Key for Interview Tasks
 * Handles question generation, response analysis, and interview feedback
 */

import { extractJSON } from './jsonExtractor';

interface EmergentAIRequest {
  messages: Array<{
    role: 'system' | 'user' | 'assistant';
    content: string;
  }>;
  model?: string;
  provider?: string;
  max_tokens?: number;
  temperature?: number;
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

export class EmergentAIService {
  private static instance: EmergentAIService;
  private emergentApiKey: string;
  private baseUrl = 'https://integrations.emergentagent.com/api/v1/llm/chat';

  private constructor() {
    this.emergentApiKey = process.env.EMERGENT_LLM_KEY || process.env.NEXT_PUBLIC_EMERGENT_LLM_KEY || '';
    if (!this.emergentApiKey) {
      console.warn('Emergent LLM key not found, using mock responses');
    }
  }

  public static getInstance(): EmergentAIService {
    if (!EmergentAIService.instance) {
      EmergentAIService.instance = new EmergentAIService();
    }
    return EmergentAIService.instance;
  }

  private async callEmergentAPI(request: EmergentAIRequest): Promise<string> {
    if (!this.emergentApiKey) {
      throw new Error('Emergent API key not configured');
    }

    try {
      const response = await fetch(this.baseUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.emergentApiKey}`,
        },
        body: JSON.stringify({
          ...request,
          provider: request.provider || 'openai',
          model: request.model || 'gpt-4o-mini',
          max_tokens: request.max_tokens || 4000,
          temperature: request.temperature || 0.7,
        }),
      });

      if (!response.ok) {
        throw new Error(`Emergent API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      return data.content || data.message || 'No response received';
    } catch (error) {
      console.error('Emergent API call failed:', error);
      throw error;
    }
  }

  // Generate 5+ unique DSA questions for interview rounds
  public async generateDSAQuestions(
    companyName: string,
    difficulty: 'easy' | 'medium' | 'hard' = 'medium',
    count: number = 6
  ): Promise<DSAProblem[]> {
    const systemMessage = `You are an expert algorithm and data structures interviewer. Generate ${count} unique, high-quality DSA problems for ${companyName} interviews.`;
    
    const userMessage = `
      Generate exactly ${count} unique DSA problems with the following requirements:
      - Company: ${companyName}
      - Difficulty: ${difficulty}
      - Each problem should be unique and test different concepts
      - Include comprehensive test cases
      - Provide helpful hints
      - Make problems realistic for actual interviews

      Return as JSON array with this exact structure:
      [
        {
          "id": "unique-problem-id",
          "title": "Problem Title",
          "difficulty": "${difficulty}",
          "description": "Clear problem description with constraints and requirements",
          "examples": [
            {
              "input": "sample input format",
              "output": "expected output format", 
              "explanation": "why this is the correct output"
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
          "constraints": ["constraint 1", "constraint 2"],
          "topics": ["Array", "Hash Table", "etc"],
          "hints": ["helpful hint 1", "helpful hint 2"],
          "timeComplexity": "O(n)",
          "spaceComplexity": "O(1)"
        }
      ]
    `;

    try {
      const response = await this.callEmergentAPI({
        messages: [
          { role: 'system', content: systemMessage },
          { role: 'user', content: userMessage }
        ]
      });

      const problems = extractJSON(response);
      return problems.map((p: any, index: number) => ({
        ...p,
        id: p.id || `dsa-${Date.now()}-${index}`,
        difficulty: difficulty,
        examples: p.examples || [],
        testCases: p.testCases || [],
        constraints: p.constraints || [],
        topics: p.topics || ['General'],
        hints: p.hints || []
      }));
    } catch (error) {
      console.error('Error generating DSA problems:', error);
      return this.generateMockDSAProblems(difficulty, count);
    }
  }

  // Generate technical and behavioral questions
  public async generateInterviewQuestions(params: {
    jobTitle: string;
    companyName: string;
    skills: string[];
    interviewType: 'technical' | 'behavioral' | 'mixed';
    experienceLevel: 'entry' | 'mid' | 'senior';
    numberOfQuestions: number;
  }): Promise<InterviewQuestion[]> {
    const systemMessage = `You are an expert technical interviewer specializing in ${params.interviewType} interviews for ${params.companyName}.`;
    
    const userMessage = `
      Generate exactly ${params.numberOfQuestions} high-quality ${params.interviewType} interview questions for:
      
      Position: ${params.jobTitle} at ${params.companyName}
      Experience Level: ${params.experienceLevel}
      Required Skills: ${params.skills.join(', ')}
      
      Requirements:
      - Questions should be relevant to ${params.companyName} and ${params.jobTitle}
      - Appropriate difficulty for ${params.experienceLevel} level
      - Include comprehensive expected answers
      - Provide evaluation criteria
      
      Return as JSON array:
      [
        {
          "id": "unique-question-id",
          "question": "Interview question text",
          "expectedAnswer": "Comprehensive expected answer with key points",
          "category": "${params.interviewType}",
          "difficulty": "easy|medium|hard",
          "points": 10,
          "timeLimit": 5,
          "evaluationCriteria": ["criteria 1", "criteria 2"],
          "tags": ["relevant", "tags"],
          "hints": ["helpful hint if needed"]
        }
      ]
    `;

    try {
      const response = await this.callEmergentAPI({
        messages: [
          { role: 'system', content: systemMessage },
          { role: 'user', content: userMessage }
        ]
      });

      const questions = extractJSON(response);
      return questions.map((q: any, index: number) => ({
        ...q,
        id: q.id || `q-${Date.now()}-${index}`,
        category: params.interviewType,
        points: q.points || 10,
        timeLimit: q.timeLimit || 5,
        evaluationCriteria: q.evaluationCriteria || ['Accuracy', 'Clarity', 'Completeness'],
        tags: q.tags || [params.jobTitle, params.companyName]
      }));
    } catch (error) {
      console.error('Error generating interview questions:', error);
      return this.generateMockQuestions(params);
    }
  }

  // Analyze interview responses
  public async analyzeInterviewResponse(
    question: string,
    userAnswer: string,
    expectedAnswer: string,
    category: string,
    companyContext: string
  ): Promise<{
    score: number;
    feedback: string;
    suggestions: string[];
    strengths: string[];
    improvements: string[];
  }> {
    const systemMessage = `You are an expert interview evaluator providing constructive feedback for ${companyContext} interviews.`;
    
    const userMessage = `
      Analyze this interview response:
      
      Question (${category}): ${question}
      Expected Answer: ${expectedAnswer}
      Candidate Answer: ${userAnswer}
      Company Context: ${companyContext}
      
      Provide detailed analysis in JSON format:
      {
        "score": (0-10 score),
        "feedback": "Constructive feedback paragraph",
        "suggestions": ["specific improvement suggestions"],
        "strengths": ["what they did well"],
        "improvements": ["areas to improve"]
      }
      
      Consider technical accuracy, communication clarity, completeness, and company relevance.
    `;

    try {
      const response = await this.callEmergentAPI({
        messages: [
          { role: 'system', content: systemMessage },
          { role: 'user', content: userMessage }
        ]
      });

      const analysis = JSON.parse(response.replace(/```json\n?|\n?```/g, ''));
      return {
        score: Math.max(0, Math.min(10, analysis.score || 5)),
        feedback: analysis.feedback || 'Response analyzed successfully.',
        suggestions: analysis.suggestions || ['Continue practicing similar questions'],
        strengths: analysis.strengths || ['Attempted the question'],
        improvements: analysis.improvements || ['Add more detail to responses']
      };
    } catch (error) {
      console.error('Error analyzing response:', error);
      return this.generateMockAnalysis(userAnswer);
    }
  }

  // Mock fallback methods
  private generateMockDSAProblems(difficulty: string, count: number): DSAProblem[] {
    const mockProblems: DSAProblem[] = [];
    const problemTemplates = [
      {
        title: "Two Sum",
        description: "Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.",
        topics: ["Array", "Hash Table"]
      },
      {
        title: "Valid Parentheses", 
        description: "Given a string s containing just the characters '(', ')', '{', '}', '[' and ']', determine if the input string is valid.",
        topics: ["String", "Stack"]
      },
      {
        title: "Merge Two Sorted Lists",
        description: "You are given the heads of two sorted linked lists list1 and list2. Merge the two lists in a sorted list.",
        topics: ["Linked List", "Recursion"]
      },
      {
        title: "Binary Tree Inorder Traversal",
        description: "Given the root of a binary tree, return the inorder traversal of its nodes' values.",
        topics: ["Tree", "Depth-First Search"]
      },
      {
        title: "Maximum Subarray",
        description: "Given an integer array nums, find the contiguous subarray with the largest sum, and return its sum.",
        topics: ["Array", "Dynamic Programming"]
      },
      {
        title: "Climbing Stairs",
        description: "You are climbing a staircase. It takes n steps to reach the top. Each time you can either climb 1 or 2 steps.",
        topics: ["Dynamic Programming", "Math"]
      }
    ];

    for (let i = 0; i < count; i++) {
      const template = problemTemplates[i % problemTemplates.length];
      mockProblems.push({
        id: `mock-dsa-${i}`,
        title: template.title,
        difficulty: difficulty as 'easy' | 'medium' | 'hard',
        description: template.description,
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
        constraints: ['1 <= n <= 1000', 'Time limit: 2 seconds'],
        topics: template.topics,
        hints: ['Think about the optimal approach', 'Consider edge cases'],
        timeComplexity: 'O(n)',
        spaceComplexity: 'O(1)'
      });
    }
    
    return mockProblems;
  }

  private generateMockQuestions(params: any): InterviewQuestion[] {
    const mockQuestions: InterviewQuestion[] = [];
    
    for (let i = 0; i < params.numberOfQuestions; i++) {
      mockQuestions.push({
        id: `mock-q-${i}`,
        question: `Tell me about your experience with ${params.skills[i % params.skills.length]} in the context of ${params.jobTitle} role.`,
        expectedAnswer: `A comprehensive answer covering experience, challenges, and achievements with ${params.skills[i % params.skills.length]}.`,
        category: params.interviewType,
        difficulty: ['easy', 'medium', 'hard'][i % 3] as 'easy' | 'medium' | 'hard',
        points: 10,
        timeLimit: 5,
        evaluationCriteria: ['Technical accuracy', 'Communication clarity', 'Real-world application'],
        tags: [params.jobTitle, params.companyName, params.skills[i % params.skills.length]],
        hints: ['Think about specific projects and outcomes']
      });
    }
    
    return mockQuestions;
  }

  private generateMockAnalysis(userAnswer: string) {
    const wordCount = userAnswer.split(' ').length;
    const score = Math.min(10, Math.max(3, wordCount / 10));
    
    return {
      score,
      feedback: `Your response demonstrates ${score >= 7 ? 'good' : score >= 5 ? 'adequate' : 'basic'} understanding. ${wordCount < 20 ? 'Consider providing more detailed explanations.' : 'Good level of detail provided.'}`,
      suggestions: ['Add more specific examples', 'Structure your response better', 'Include technical details'],
      strengths: wordCount > 30 ? ['Comprehensive response', 'Good detail level'] : ['Attempted the question'],
      improvements: wordCount < 20 ? ['Provide more detailed answers', 'Include specific examples'] : ['Continue developing technical depth']
    };
  }
}

export default EmergentAIService;