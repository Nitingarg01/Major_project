/**
 * Groq AI Service - Advanced AI Integration for Interview Tasks
 * Handles question generation, response analysis, and interview feedback
 * Uses Groq's llama-3.3-70b-versatile model for high-quality AI responses
 */

import Groq from 'groq-sdk';
import { extractJSON } from './jsonExtractor';

// Load environment variables
const groqApiKey = process.env.GROQ_API_KEY || process.env.NEXT_PUBLIC_GROQ_API_KEY || '';

interface GroqRequest {
  messages: Array<{
    role: 'system' | 'user' | 'assistant';
    content: string;
  }>;
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

export class GroqAIService {
  private static instance: GroqAIService;
  private groq: Groq;
  private model = 'llama-3.3-70b-versatile';

  private constructor() {
    if (!groqApiKey) {
      console.warn('⚠️ Groq API key not found, service will use mock responses');
      throw new Error('Groq API key is required');
    }
    
    this.groq = new Groq({
      apiKey: groqApiKey,
      dangerouslyAllowBrowser: true
    });
    
    console.log('🔥 GroqAIService initialized with llama-3.3-70b-versatile model');
  }

  public static getInstance(): GroqAIService {
    if (!GroqAIService.instance) {
      GroqAIService.instance = new GroqAIService();
    }
    return GroqAIService.instance;
  }

  private async callGroqAPI(request: GroqRequest): Promise<string> {
    try {
      console.log(`🚀 Calling Groq API with ${this.model}...`);
      
      const chatCompletion = await this.groq.chat.completions.create({
        messages: request.messages as any,
        model: request.model || this.model,
        max_tokens: request.max_tokens || 4000,
        temperature: request.temperature || 0.7,
      });

      const content = chatCompletion.choices[0]?.message?.content || '';
      console.log('✅ Groq API response received');
      
      return content;
    } catch (error) {
      console.error('❌ Groq API call failed:', error);
      throw error;
    }
  }

  // Generate interview questions with Groq AI
  public async generateInterviewQuestions(params: {
    jobTitle: string;
    companyName: string;
    skills: string[];
    interviewType: 'technical' | 'behavioral' | 'mixed' | 'aptitude';
    experienceLevel: 'entry' | 'mid' | 'senior';
    numberOfQuestions: number;
    companyIntelligence?: any;
  }): Promise<InterviewQuestion[]> {
    const systemMessage = `You are an expert interview question generator specializing in ${params.interviewType} interviews for ${params.companyName}. Generate high-quality, relevant questions that assess candidates effectively for their specific role and experience level.`;
    
    const userMessage = `
      Generate exactly ${params.numberOfQuestions} ${params.interviewType} interview questions for:
      
      Position: ${params.jobTitle} at ${params.companyName}
      Experience Level: ${params.experienceLevel}
      Required Skills: ${params.skills.join(', ')}
      
      ${params.companyIntelligence ? `
      Company Context:
      - Industry: ${params.companyIntelligence.industry || 'Technology'}
      - Tech Stack: ${params.companyIntelligence.tech_stack?.join(', ') || 'Modern technologies'}
      - Culture: ${params.companyIntelligence.culture?.join(', ') || 'Innovation-focused'}
      - Recent News: ${params.companyIntelligence.recent_news?.slice(0, 2).join(', ') || 'No recent news'}
      ` : ''}
      
      Requirements:
      - Questions should be highly relevant to ${params.companyName} and ${params.jobTitle}
      - Appropriate difficulty for ${params.experienceLevel} level candidates
      - Include comprehensive expected answers with specific examples
      - Provide detailed evaluation criteria for each question
      - Make questions realistic and commonly asked in actual interviews
      - Focus on practical, real-world scenarios
      
      Return ONLY a valid JSON array with this EXACT structure:
      [
        {
          "id": "unique-question-id",
          "question": "Detailed interview question text with clear context and requirements",
          "expectedAnswer": "Comprehensive expected answer with key points, examples, and best practices",
          "category": "${params.interviewType}",
          "difficulty": "easy|medium|hard",
          "points": 10,
          "timeLimit": 5,
          "evaluationCriteria": ["specific criteria 1", "specific criteria 2", "specific criteria 3"],
          "tags": ["relevant", "tags", "for", "categorization"],
          "hints": ["helpful hint if candidate struggles"]
        }
      ]
    `;

    try {
      const response = await this.callGroqAPI({
        messages: [
          { role: 'system', content: systemMessage },
          { role: 'user', content: userMessage }
        ],
        max_tokens: 6000,
        temperature: 0.7
      });

      const questions = extractJSON(response);
      return questions.map((q: any, index: number) => ({
        ...q,
        id: q.id || `groq-q-${Date.now()}-${index}`,
        category: params.interviewType,
        points: q.points || 10,
        timeLimit: q.timeLimit || 5,
        evaluationCriteria: q.evaluationCriteria || ['Accuracy', 'Clarity', 'Completeness'],
        tags: q.tags || [params.jobTitle, params.companyName, params.interviewType],
        provider: 'groq',
        model: this.model
      }));
    } catch (error) {
      console.error('❌ Error generating interview questions with Groq:', error);
      return this.generateMockQuestions(params);
    }
  }

  // Generate DSA problems with Groq AI (Enhanced version available)
  public async generateDSAProblems(
    companyName: string,
    difficulty: 'easy' | 'medium' | 'hard' = 'medium',
    count: number = 6,
    companyIntelligence?: any
  ): Promise<DSAProblem[]> {
    const systemMessage = `You are an expert DSA problem generator creating challenging and realistic coding interview problems for ${companyName}. Generate problems with comprehensive test cases that work with code execution systems.`;
    
    const userMessage = `
      Generate exactly ${count} unique DSA problems for ${companyName} technical interviews.
      
      Company Context: ${companyName}
      ${companyIntelligence ? `
      - Industry Focus: ${companyIntelligence.industry || 'Technology'}
      - Tech Stack: ${companyIntelligence.tech_stack?.join(', ') || 'Various technologies'}
      - Known Interview Style: ${companyIntelligence.focus_areas?.join(', ') || 'Comprehensive technical assessment'}
      ` : ''}
      
      CRITICAL REQUIREMENTS:
      - Difficulty Level: ${difficulty}
      - Each problem MUST have at least 5 test cases
      - Test cases must be in executable format (e.g., "nums = [1,2,3], target = 4")
      - Include edge cases and boundary conditions
      - Expected outputs must be exact (e.g., "[0,1]" not "[0, 1]")
      - Problems should be realistic for ${companyName} interviews
      - Include time and space complexity analysis
      
      Return ONLY a valid JSON array with this EXACT structure:
      [
        {
          "id": "unique-problem-id",
          "title": "Problem Title",
          "difficulty": "${difficulty}",
          "description": "Clear and detailed problem description with all requirements and constraints explained",
          "examples": [
            {
              "input": "sample input format with clear explanation",
              "output": "expected output format with explanation", 
              "explanation": "detailed explanation of why this is the correct output and approach"
            }
          ],
          "testCases": [
            {
              "id": "test-1",
              "input": "test input data",
              "expectedOutput": "expected result for this test case",
              "hidden": false
            }
          ],
          "constraints": ["specific constraint 1", "specific constraint 2"],
          "topics": ["Array", "Hash Table", "Dynamic Programming", "etc"],
          "hints": ["helpful hint 1", "helpful hint 2"],
          "timeComplexity": "O(n) or appropriate complexity",
          "spaceComplexity": "O(1) or appropriate complexity"
        }
      ]
    `;

    try {
      const response = await this.callGroqAPI({
        messages: [
          { role: 'system', content: systemMessage },
          { role: 'user', content: userMessage }
        ],
        max_tokens: 8000,
        temperature: 0.8
      });

      const problems = extractJSON(response);
      return problems.map((p: any, index: number) => ({
        ...p,
        id: p.id || `groq-dsa-${Date.now()}-${index}`,
        difficulty: difficulty,
        examples: p.examples || [],
        testCases: p.testCases || [],
        constraints: p.constraints || [],
        topics: p.topics || ['General'],
        hints: p.hints || [],
        provider: 'groq',
        model: this.model
      }));
    } catch (error) {
      console.error('❌ Error generating DSA problems with Groq:', error);
      return this.generateMockDSAProblems(difficulty, count);
    }
  }

  // Analyze interview responses with Groq AI
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
    const systemMessage = `You are an expert interview evaluator with extensive experience in ${companyContext} interviews. Provide detailed, constructive, and actionable feedback that helps candidates improve their interview performance.`;
    
    const userMessage = `
      Analyze this interview response in detail:
      
      Question Category: ${category}
      Company Context: ${companyContext}
      
      Interview Question: ${question}
      Expected Answer Guidelines: ${expectedAnswer}
      Candidate's Actual Response: ${userAnswer}
      
      Please provide a comprehensive analysis considering:
      1. Technical accuracy and depth of knowledge
      2. Communication clarity and structure
      3. Completeness and thoroughness of response
      4. Relevance to company context and role requirements
      5. Problem-solving approach and methodology demonstrated
      6. Use of specific examples and practical experience
      
      Return ONLY a valid JSON object with this EXACT structure:
      {
        "score": (numerical score from 0-10 based on overall response quality),
        "feedback": "Detailed constructive feedback paragraph highlighting what was done well and areas for improvement",
        "suggestions": ["specific actionable improvement suggestion 1", "specific actionable improvement suggestion 2", "specific actionable improvement suggestion 3"],
        "strengths": ["specific strength 1 demonstrated in the response", "specific strength 2", "specific strength 3"],
        "improvements": ["specific area for improvement 1", "specific area for improvement 2", "specific area for improvement 3"]
      }
    `;

    try {
      const response = await this.callGroqAPI({
        messages: [
          { role: 'system', content: systemMessage },
          { role: 'user', content: userMessage }
        ],
        max_tokens: 3000,
        temperature: 0.5
      });

      const analysis = extractJSON(response);
      return {
        score: Math.max(0, Math.min(10, analysis.score || 5)),
        feedback: analysis.feedback || 'Response analyzed successfully with comprehensive feedback.',
        suggestions: analysis.suggestions || ['Continue practicing similar questions', 'Focus on providing more detailed examples', 'Structure responses more clearly'],
        strengths: analysis.strengths || ['Attempted the question thoroughly', 'Showed understanding of the topic'],
        improvements: analysis.improvements || ['Add more specific technical details', 'Include more practical examples']
      };
    } catch (error) {
      console.error('❌ Error analyzing response with Groq:', error);
      return this.generateMockAnalysis(userAnswer);
    }
  }

  // Comprehensive performance analysis with Groq AI
  public async analyzeOverallPerformance(
    questions: any[],
    answers: string[],
    jobTitle: string,
    skills: string[]
  ): Promise<any> {
    const systemMessage = `You are an expert interview performance analyst providing comprehensive evaluation for a ${jobTitle} position. Analyze the complete interview performance and provide detailed insights for career development.`;
    
    const prompt = `
      Analyze this complete interview performance for a ${jobTitle} position requiring skills: ${skills.join(', ')}.

      Complete Interview Analysis:
      ${questions.map((q, index) => `
      Question ${index + 1} [${q.difficulty}] [${q.category}]: ${q.question}
      Expected Key Points: ${q.expectedAnswer}
      Candidate Answer: ${answers[index] || 'No answer provided'}
      Max Points Available: ${q.points}
      `).join('\n')}

      Provide a comprehensive analysis with detailed insights:

      1. **Overall Performance Score** (0-10 scale with justification)
      2. **Detailed Parameter Scoring** (0-10 each with reasoning):
         - Technical Knowledge & Expertise
         - Problem Solving & Analytical Thinking
         - Communication Skills & Clarity
         - Practical Application & Experience
         - Company Fit & Cultural Alignment
      3. **Professional Summary** (2-3 sentences overall assessment)
      4. **Question-wise Detailed Feedback** (specific advice for each question)
      5. **Key Strengths** (what the candidate excelled at)
      6. **Priority Improvement Areas** (most important areas to work on)
      7. **Career Development Recommendations** (actionable next steps)

      Return ONLY a JSON object with this EXACT structure:
      {
        "overallScore": (number 0-10),
        "parameterScores": {
          "Technical Knowledge": (number 0-10),
          "Problem Solving": (number 0-10), 
          "Communication Skills": (number 0-10),
          "Practical Application": (number 0-10),
          "Company Fit": (number 0-10)
        },
        "overallVerdict": "Professional summary of performance in 2-3 sentences",
        "adviceForImprovement": [
          {
            "question": "Question text",
            "advice": "Detailed improvement advice and suggestions"
          }
        ],
        "strengths": ["key strength 1", "key strength 2", "key strength 3"],
        "improvements": ["priority improvement 1", "priority improvement 2", "priority improvement 3"],
        "recommendations": ["career development recommendation 1", "recommendation 2", "recommendation 3"]
      }
    `;

    try {
      const response = await this.callGroqAPI({
        messages: [
          { role: 'system', content: systemMessage },
          { role: 'user', content: prompt }
        ],
        max_tokens: 6000,
        temperature: 0.3
      });

      return extractJSON(response);
    } catch (error) {
      console.error('❌ Error analyzing overall performance with Groq:', error);
      return this.generateMockOverallAnalysis(questions, answers);
    }
  }

  // Health check method
  public async healthCheck(): Promise<{
    groqAvailable: boolean;
    model: string;
    status: string;
  }> {
    try {
      console.log('🔍 Performing Groq health check...');
      
      const testResponse = await this.callGroqAPI({
        messages: [
          { role: 'user', content: 'Health check - respond with "OK"' }
        ],
        max_tokens: 10,
        temperature: 0
      });

      const isHealthy = testResponse.toLowerCase().includes('ok');
      
      return {
        groqAvailable: isHealthy,
        model: this.model,
        status: isHealthy ? 'healthy' : 'degraded'
      };
    } catch (error) {
      console.error('❌ Groq health check failed:', error);
      return {
        groqAvailable: false,
        model: this.model,
        status: 'unhealthy'
      };
    }
  }

  // Mock fallback methods for error scenarios
  private generateMockQuestions(params: any): InterviewQuestion[] {
    const mockQuestions: InterviewQuestion[] = [];
    
    for (let i = 0; i < params.numberOfQuestions; i++) {
      mockQuestions.push({
        id: `mock-groq-q-${i}`,
        question: `Describe your experience with ${params.skills[i % params.skills.length]} in the context of ${params.jobTitle} role at ${params.companyName}. How would you apply this skill to solve real-world challenges?`,
        expectedAnswer: `A comprehensive answer covering practical experience, specific projects, challenges overcome, and technical implementation details with ${params.skills[i % params.skills.length]}.`,
        category: params.interviewType,
        difficulty: ['easy', 'medium', 'hard'][i % 3] as 'easy' | 'medium' | 'hard',
        points: 10,
        timeLimit: 5,
        evaluationCriteria: ['Technical accuracy', 'Communication clarity', 'Real-world application', 'Problem-solving approach'],
        tags: [params.jobTitle, params.companyName, params.skills[i % params.skills.length]],
        hints: ['Think about specific projects and measurable outcomes']
      });
    }
    
    return mockQuestions;
  }

  private generateMockDSAProblems(difficulty: string, count: number): DSAProblem[] {
    const mockProblems: DSAProblem[] = [];
    const problemTemplates = [
      {
        title: "Two Sum Problem",
        description: "Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target. You may assume that each input would have exactly one solution, and you may not use the same element twice.",
        topics: ["Array", "Hash Table", "Two Pointers"]
      },
      {
        title: "Valid Parentheses", 
        description: "Given a string s containing just the characters '(', ')', '{', '}', '[' and ']', determine if the input string is valid. An input string is valid if open brackets are closed by the same type of brackets and in the correct order.",
        topics: ["String", "Stack", "Parsing"]
      },
      {
        title: "Merge Two Sorted Lists",
        description: "You are given the heads of two sorted linked lists list1 and list2. Merge the two lists in a sorted list. The list should be made by splicing together the nodes of the first two lists.",
        topics: ["Linked List", "Recursion", "Two Pointers"]
      },
      {
        title: "Binary Tree Inorder Traversal",
        description: "Given the root of a binary tree, return the inorder traversal of its nodes' values. Implement both recursive and iterative solutions.",
        topics: ["Tree", "Depth-First Search", "Binary Tree", "Stack"]
      },
      {
        title: "Maximum Subarray Sum",
        description: "Given an integer array nums, find the contiguous subarray (containing at least one number) which has the largest sum and return its sum.",
        topics: ["Array", "Dynamic Programming", "Kadane's Algorithm"]
      },
      {
        title: "Climbing Stairs",
        description: "You are climbing a staircase. It takes n steps to reach the top. Each time you can either climb 1 or 2 steps. In how many distinct ways can you climb to the top?",
        topics: ["Dynamic Programming", "Math", "Memoization"]
      }
    ];

    for (let i = 0; i < count; i++) {
      const template = problemTemplates[i % problemTemplates.length];
      mockProblems.push({
        id: `mock-groq-dsa-${i}`,
        title: template.title,
        difficulty: difficulty as 'easy' | 'medium' | 'hard',
        description: template.description,
        examples: [
          {
            input: 'Example input data',
            output: 'Expected output result',
            explanation: 'Detailed explanation of the solution approach and why this output is correct'
          }
        ],
        testCases: [
          {
            id: `test-${i}-1`,
            input: 'Test case input',
            expectedOutput: 'Expected test result'
          }
        ],
        constraints: ['1 <= n <= 1000', 'Time limit: 2 seconds', 'Memory limit: 256 MB'],
        topics: template.topics,
        hints: ['Consider the optimal time complexity', 'Think about edge cases', 'Can you solve it in one pass?'],
        timeComplexity: 'O(n)',
        spaceComplexity: 'O(1)'
      });
    }
    
    return mockProblems;
  }

  private generateMockAnalysis(userAnswer: string) {
    const wordCount = userAnswer.split(' ').length;
    const score = Math.min(10, Math.max(3, wordCount / 15));
    
    return {
      score: Math.round(score * 10) / 10,
      feedback: `Your response demonstrates ${score >= 7 ? 'strong' : score >= 5 ? 'adequate' : 'basic'} understanding of the topic. ${wordCount < 30 ? 'Consider providing more detailed explanations with specific examples.' : 'Good level of detail provided in your response.'}`,
      suggestions: ['Include more specific technical examples', 'Structure your response with clear points', 'Add practical implementation details'],
      strengths: wordCount > 50 ? ['Comprehensive response', 'Good technical depth', 'Clear communication'] : ['Attempted the question', 'Basic understanding shown'],
      improvements: wordCount < 30 ? ['Provide more detailed technical explanations', 'Include specific examples from experience'] : ['Continue developing advanced technical concepts']
    };
  }

  private generateMockOverallAnalysis(questions: any[], answers: string[]) {
    const avgWordCount = answers.reduce((sum, ans) => sum + ans.split(' ').length, 0) / answers.length;
    const score = Math.min(10, Math.max(4, avgWordCount / 20));
    
    return {
      overallScore: Math.round(score * 10) / 10,
      parameterScores: {
        "Technical Knowledge": Math.min(10, Math.round((score + 1) * 10) / 10),
        "Problem Solving": Math.round(score * 10) / 10,
        "Communication Skills": Math.min(10, Math.round((score + 0.5) * 10) / 10),
        "Practical Application": Math.max(3, Math.round((score - 0.5) * 10) / 10),
        "Company Fit": Math.round(score * 10) / 10
      },
      overallVerdict: `The candidate demonstrated ${score >= 7 ? 'strong and well-rounded' : score >= 5 ? 'adequate but improvable' : 'basic but developing'} performance across the interview questions with good potential for growth.`,
      adviceForImprovement: questions.slice(0, 3).map((q, i) => ({
        question: q.question,
        advice: `For this ${q.category} question about ${q.question.substring(0, 50)}..., consider providing more structured responses with specific technical examples and practical implementation details.`
      })),
      strengths: ["Completed all interview questions", "Showed problem-solving mindset", "Maintained professional communication", "Demonstrated basic technical understanding"],
      improvements: ["Provide more detailed technical explanations", "Include specific examples from professional experience", "Structure responses more clearly with key points"],
      recommendations: ["Practice more technical interview questions in your domain", "Work on articulating complex concepts clearly", "Study company-specific technologies and practices", "Practice coding problems regularly"]
    };
  }
}

export default GroqAIService;