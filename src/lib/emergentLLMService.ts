/**
 * Emergent LLM Service - Robust AI Integration
 * Handles question generation, response analysis, and interview feedback
 * Uses Emergent Universal Key for reliable multi-provider access
 */

import { config } from 'dotenv';
import { extractJSON } from './jsonExtractor';
import { emergentIntegration } from './emergentIntegration';

// Load environment variables
if (typeof process !== 'undefined') {
  config();
}

interface EmergentLLMRequest {
  messages: Array<{
    role: 'system' | 'user' | 'assistant';
    content: string;
  }>;
  provider?: 'openai' | 'anthropic' | 'gemini';
  model?: string;
  max_tokens?: number;
  temperature?: number;
}

interface EmergentLLMResponse {
  content: string;
  provider: string;
  model: string;
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
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

export class EmergentLLMService {
  private static instance: EmergentLLMService;
  private emergentApiKey: string;
  private geminiApiKey: string;
  private baseUrl = 'https://integrations.emergentagent.com/api/v1/llm/chat';

  private constructor() {
    this.emergentApiKey = process.env.EMERGENT_LLM_KEY || process.env.NEXT_PUBLIC_EMERGENT_LLM_KEY || '';
    this.geminiApiKey = process.env.GEMINI_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY || '';
    
    if (!this.emergentApiKey) {
      console.warn('⚠️ Emergent LLM key not found, will fallback to Gemini');
    }
    
    console.log('🔥 EmergentLLMService initialized with keys:', {
      emergent: !!this.emergentApiKey,
      gemini: !!this.geminiApiKey,
      emergentIntegrationReady: emergentIntegration.isConfigured()
    });
  }

  public static getInstance(): EmergentLLMService {
    if (!EmergentLLMService.instance) {
      EmergentLLMService.instance = new EmergentLLMService();
    }
    return EmergentLLMService.instance;
  }

  private async callEmergentAPI(request: EmergentLLMRequest): Promise<EmergentLLMResponse> {
    if (!emergentIntegration.isConfigured()) {
      throw new Error('Emergent API key not configured');
    }

    try {
      console.log('🚀 Calling Emergent Integration with provider:', request.provider || 'openai');
      
      const response = await emergentIntegration.makeRequest(
        request.messages,
        'general', // task type for optimal routing
        {
          provider: request.provider,
          model: request.model,
          temperature: request.temperature,
          max_tokens: request.max_tokens
        }
      );

      console.log('✅ Emergent Integration response received');
      
      return {
        content: response.content,
        provider: response.provider,
        model: response.model,
        usage: response.usage
      };
    } catch (error) {
      console.error('❌ Emergent Integration call failed:', error);
      throw error;
    }
  }

  private async callGeminiAPI(messages: any[]): Promise<EmergentLLMResponse> {
    if (!this.geminiApiKey) {
      throw new Error('Gemini API key not configured');
    }

    try {
      console.log('🔄 Falling back to Gemini API...');
      
      const { GoogleGenerativeAI } = await import('@google/generative-ai');
      const genAI = new GoogleGenerativeAI(this.geminiApiKey);
      const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

      // Convert messages to Gemini format
      const prompt = messages.map(msg => `${msg.role}: ${msg.content}`).join('\n\n');
      
      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      console.log('✅ Gemini API response received');
      
      return {
        content: text,
        provider: 'gemini',
        model: 'gemini-1.5-flash'
      };
    } catch (error) {
      console.error('❌ Gemini API call failed:', error);
      throw error;
    }
  }

  private async callLLM(request: EmergentLLMRequest): Promise<EmergentLLMResponse> {
    // Try Emergent first, fallback to Gemini
    try {
      return await this.callEmergentAPI(request);
    } catch (emergentError) {
      console.log('⚠️ Emergent API failed, trying Gemini fallback...');
      try {
        return await this.callGeminiAPI(request.messages);
      } catch (geminiError) {
        console.error('❌ Both Emergent and Gemini APIs failed');
        throw new Error(`All LLM providers failed. Emergent: ${emergentError}. Gemini: ${geminiError}`);
      }
    }
  }

  // Generate interview questions with multiple providers support
  public async generateInterviewQuestions(params: {
    jobTitle: string;
    companyName: string;
    skills: string[];
    interviewType: 'technical' | 'behavioral' | 'mixed' | 'aptitude';
    experienceLevel: 'entry' | 'mid' | 'senior';
    numberOfQuestions: number;
    companyIntelligence?: any;
  }): Promise<InterviewQuestion[]> {
    const systemMessage = `You are an expert interview question generator specializing in ${params.interviewType} interviews for ${params.companyName}. Generate high-quality, relevant questions that assess candidates effectively.`;
    
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
      ` : ''}
      
      Requirements:
      - Questions should be relevant to ${params.companyName} and ${params.jobTitle}
      - Appropriate difficulty for ${params.experienceLevel} level
      - Include comprehensive expected answers
      - Provide evaluation criteria and practical examples
      
      Return as valid JSON array:
      [
        {
          "id": "unique-question-id",
          "question": "Interview question text with clear context",
          "expectedAnswer": "Comprehensive expected answer with key points and examples",
          "category": "${params.interviewType}",
          "difficulty": "easy|medium|hard",
          "points": 10,
          "timeLimit": 5,
          "evaluationCriteria": ["criteria 1", "criteria 2", "criteria 3"],
          "tags": ["relevant", "tags", "for", "question"],
          "hints": ["helpful hint if needed"]
        }
      ]
    `;

    try {
      const provider = this.emergentApiKey ? 'openai' : undefined;
      const model = this.emergentApiKey ? 'gpt-4o-mini' : undefined;
      
      const response = await this.callLLM({
        messages: [
          { role: 'system', content: systemMessage },
          { role: 'user', content: userMessage }
        ],
        provider,
        model,
        max_tokens: 4000,
        temperature: 0.7
      });

      const questions = extractJSON(response.content);
      return questions.map((q: any, index: number) => ({
        ...q,
        id: q.id || `q-${Date.now()}-${index}`,
        category: params.interviewType,
        points: q.points || 10,
        timeLimit: q.timeLimit || 5,
        evaluationCriteria: q.evaluationCriteria || ['Accuracy', 'Clarity', 'Completeness'],
        tags: q.tags || [params.jobTitle, params.companyName],
        provider: response.provider,
        model: response.model
      }));
    } catch (error) {
      console.error('❌ Error generating interview questions:', error);
      return this.generateMockQuestions(params);
    }
  }

  // Generate DSA problems with better error handling
  public async generateDSAProblems(
    companyName: string,
    difficulty: 'easy' | 'medium' | 'hard' = 'medium',
    count: number = 6
  ): Promise<DSAProblem[]> {
    const systemMessage = `You are an expert DSA problem generator creating interview problems for ${companyName}. Generate realistic, well-structured coding problems.`;
    
    const userMessage = `
      Generate exactly ${count} DSA problems for ${companyName} interviews.
      
      Requirements:
      - Difficulty: ${difficulty}
      - Each problem should be unique and test different concepts
      - Include comprehensive test cases and examples
      - Provide helpful hints for candidates
      - Make problems realistic for actual coding interviews
      
      Return as valid JSON array:
      [
        {
          "id": "unique-problem-id",
          "title": "Problem Title",
          "difficulty": "${difficulty}",
          "description": "Clear problem description with requirements and constraints",
          "examples": [
            {
              "input": "sample input format",
              "output": "expected output format", 
              "explanation": "explanation of the solution approach"
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
      const provider = this.emergentApiKey ? 'openai' : undefined;
      const model = this.emergentApiKey ? 'gpt-4o-mini' : undefined;
      
      const response = await this.callLLM({
        messages: [
          { role: 'system', content: systemMessage },
          { role: 'user', content: userMessage }
        ],
        provider,
        model,
        max_tokens: 6000,
        temperature: 0.8
      });

      const problems = extractJSON(response.content);
      return problems.map((p: any, index: number) => ({
        ...p,
        id: p.id || `dsa-${Date.now()}-${index}`,
        difficulty: difficulty,
        examples: p.examples || [],
        testCases: p.testCases || [],
        constraints: p.constraints || [],
        topics: p.topics || ['General'],
        hints: p.hints || [],
        provider: response.provider,
        model: response.model
      }));
    } catch (error) {
      console.error('❌ Error generating DSA problems:', error);
      return this.generateMockDSAProblems(difficulty, count);
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
    const systemMessage = `You are an expert interview evaluator providing constructive feedback for ${companyContext} interviews. Analyze responses fairly and provide actionable insights.`;
    
    const userMessage = `
      Analyze this interview response:
      
      Question (${category}): ${question}
      Expected Answer: ${expectedAnswer}
      Candidate Answer: ${userAnswer}
      Company Context: ${companyContext}
      
      Provide detailed analysis in JSON format:
      {
        "score": (0-10 score based on accuracy, completeness, and clarity),
        "feedback": "Constructive feedback paragraph highlighting key points",
        "suggestions": ["specific actionable improvement suggestions"],
        "strengths": ["what the candidate did well"],
        "improvements": ["specific areas that need work"]
      }
      
      Consider:
      - Technical accuracy and depth
      - Communication clarity and structure
      - Completeness of the response
      - Relevance to company context and role
      - Problem-solving approach demonstrated
    `;

    try {
      const provider = this.emergentApiKey ? 'openai' : undefined;
      const model = this.emergentApiKey ? 'gpt-4o-mini' : undefined;
      
      const response = await this.callLLM({
        messages: [
          { role: 'system', content: systemMessage },
          { role: 'user', content: userMessage }
        ],
        provider,
        model,
        max_tokens: 2000,
        temperature: 0.5
      });

      const analysis = extractJSON(response.content);
      return {
        score: Math.max(0, Math.min(10, analysis.score || 5)),
        feedback: analysis.feedback || 'Response analyzed successfully.',
        suggestions: analysis.suggestions || ['Continue practicing similar questions'],
        strengths: analysis.strengths || ['Attempted the question'],
        improvements: analysis.improvements || ['Add more detail to responses']
      };
    } catch (error) {
      console.error('❌ Error analyzing response:', error);
      return this.generateMockAnalysis(userAnswer);
    }
  }

  // Comprehensive performance analysis
  public async analyzeOverallPerformance(
    questions: any[],
    answers: string[],
    jobTitle: string,
    skills: string[]
  ): Promise<any> {
    const systemMessage = `You are an expert interview assessor providing comprehensive performance evaluation for a ${jobTitle} position.`;
    
    const prompt = `
      Analyze this complete interview performance for a ${jobTitle} position requiring skills: ${skills.join(', ')}.

      Questions and Answers Analysis:
      ${questions.map((q, index) => `
      Q${index + 1} [${q.difficulty}] [${q.category}]: ${q.question}
      Expected Key Points: ${q.expectedAnswer}
      Candidate Answer: ${answers[index] || 'No answer provided'}
      Max Points: ${q.points}
      `).join('\n')}

      Provide comprehensive analysis with:

      1. **Overall Performance Score** (0-10 scale)
      2. **Parameter-wise Scoring** (0-10 each):
         - Technical Knowledge
         - Problem Solving
         - Communication Skills
         - Analytical Thinking
         - Practical Application
      3. **Overall Verdict** (2-3 sentences summary)
      4. **Question-wise Feedback**
      5. **Strengths and Improvement Areas**

      Return ONLY a JSON object with this EXACT structure:
      {
        "overallScore": number (0-10),
        "parameterScores": {
          "Technical Knowledge": number (0-10),
          "Problem Solving": number (0-10), 
          "Communication Skills": number (0-10),
          "Analytical Thinking": number (0-10),
          "Practical Application": number (0-10)
        },
        "overallVerdict": "Brief 2-3 sentence performance summary",
        "adviceForImprovement": [
          {
            "question": "Question text",
            "advice": "Detailed feedback and improvement suggestions"
          }
        ],
        "strengths": ["strength1", "strength2", "strength3"],
        "improvements": ["improvement1", "improvement2", "improvement3"],
        "recommendations": ["recommendation1", "recommendation2", "recommendation3"]
      }
    `;

    try {
      const provider = this.emergentApiKey ? 'openai' : undefined;
      const model = this.emergentApiKey ? 'gpt-4o-mini' : undefined;
      
      const response = await this.callLLM({
        messages: [
          { role: 'system', content: systemMessage },
          { role: 'user', content: prompt }
        ],
        provider,  
        model,
        max_tokens: 4000,
        temperature: 0.3
      });

      return extractJSON(response.content);
    } catch (error) {
      console.error('❌ Error analyzing overall performance:', error);
      return this.generateMockOverallAnalysis(questions, answers);
    }
  }

  // Health check method
  public async healthCheck(): Promise<{
    emergentAvailable: boolean;
    geminiAvailable: boolean;
    status: string;
  }> {
    const status = {
      emergentAvailable: !!this.emergentApiKey,
      geminiAvailable: !!this.geminiApiKey,
      status: 'unknown'
    };

    if (status.emergentAvailable) {
      try {
        await this.callEmergentAPI({
          messages: [{ role: 'user', content: 'Test' }],
          max_tokens: 10
        });
        status.status = 'emergent_ready';
      } catch (error) {
        status.emergentAvailable = false;
        status.status = status.geminiAvailable ? 'gemini_fallback' : 'no_service';
      }
    } else {
      status.status = status.geminiAvailable ? 'gemini_only' : 'no_service';
    }

    return status;
  }

  // Mock fallback methods
  private generateMockQuestions(params: any): InterviewQuestion[] {
    const mockQuestions: InterviewQuestion[] = [];
    
    for (let i = 0; i < params.numberOfQuestions; i++) {
      mockQuestions.push({
        id: `mock-q-${i}`,
        question: `Tell me about your experience with ${params.skills[i % params.skills.length]} in the context of ${params.jobTitle} role at ${params.companyName}.`,
        expectedAnswer: `A comprehensive answer covering experience, challenges, achievements, and practical applications of ${params.skills[i % params.skills.length]}.`,
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

  private generateMockOverallAnalysis(questions: any[], answers: string[]) {
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
      adviceForImprovement: questions.slice(0, 3).map((q, i) => ({
        question: q.question,
        advice: `For this ${q.category} question, consider providing more detailed explanations and specific examples.`
      })),
      strengths: ["Attempted all questions", "Showed problem-solving approach", "Maintained professional communication"],
      improvements: ["Provide more detailed technical explanations", "Include specific examples from experience", "Structure responses more clearly"],
      recommendations: ["Practice more technical questions", "Work on communication skills", "Study company-specific technologies"]
    };
  }
}

export default EmergentLLMService;