/**
 * Optimized AI Service - Groq + Gemini Integration
 * Replaces Emergent AI with high-performance Groq API-based solutions
 * Strategic API distribution for maximum performance
 */

import Groq from 'groq-sdk';
import { config } from 'dotenv';
import { extractJSON } from './jsonExtractor';

// Load environment variables
if (typeof process !== 'undefined') {
  config();
}

interface GroqRequest {
  messages: Array<{
    role: 'system' | 'user' | 'assistant';
    content: string;
  }>;
  model?: string;
  max_tokens?: number;
  temperature?: number;
}

interface GroqResponse {
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
  category: 'technical' | 'behavioral' | 'dsa' | 'aptitude' | 'system_design';
  difficulty: 'easy' | 'medium' | 'hard';
  points: number;
  timeLimit?: number;
  evaluationCriteria: string[];
  tags: string[];
  hints?: string[];
  companyRelevance: number;
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
  companySpecific?: boolean;
}

interface CompanyData {
  name: string;
  industry?: string;
  techStack?: string[];
  culture?: string[];
  recentNews?: string[];
  interviewStyle?: string;
  commonQuestions?: string[];
}

export class OptimizedAIService {
  private static instance: OptimizedAIService;
  private groq: Groq;
  private groqApiKey: string;
  private geminiApiKey: string;
  private groqModel = 'llama-3.3-70b-versatile';
  
  // Company database for enhanced question generation
  private companyDatabase: Map<string, CompanyData> = new Map();

  private constructor() {
    this.groqApiKey = process.env.GROQ_API_KEY || process.env.NEXT_PUBLIC_GROQ_API_KEY || '';
    this.geminiApiKey = process.env.GEMINI_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY || '';
    
    if (!this.groqApiKey && !this.geminiApiKey) {
      console.error('❌ No AI API keys configured');
    }

    if (this.groqApiKey) {
      this.groq = new Groq({
        apiKey: this.groqApiKey,
      });
    }
    
    this.initializeCompanyDatabase();
    console.log('🚀 OptimizedAIService initialized:', {
      groq: !!this.groqApiKey,
      gemini: !!this.geminiApiKey
    });
  }

  public static getInstance(): OptimizedAIService {
    if (!OptimizedAIService.instance) {
      OptimizedAIService.instance = new OptimizedAIService();
    }
    return OptimizedAIService.instance;
  }

  private initializeCompanyDatabase() {
    // Enhanced company database with comprehensive intelligence
    const companies = [
      // Big Tech (FAANG+)
      {
        name: 'Google',
        industry: 'Technology',
        techStack: ['Go', 'Python', 'Java', 'C++', 'Kubernetes', 'TensorFlow', 'BigQuery', 'Spanner'],
        culture: ['Innovation', 'Data-driven', 'Collaboration', 'Think big', 'Focus on user'],
        interviewStyle: 'Technical depth, system design, behavioral, Googleyness',
        commonQuestions: ['Design a search engine', 'Scale to billions of users', 'MapReduce concepts']
      },
      {
        name: 'Meta',
        industry: 'Social Media',
        techStack: ['React', 'PHP', 'Python', 'GraphQL', 'PyTorch', 'Hack', 'React Native'],
        culture: ['Move fast', 'Be bold', 'Focus on impact', 'Be open', 'Build social value'],
        interviewStyle: 'Product sense, technical execution, leadership, culture fit',
        commonQuestions: ['Design Facebook feed', 'How would you improve Instagram?', 'Handle fake news']
      },
      {
        name: 'Amazon',
        industry: 'E-commerce/Cloud',
        techStack: ['Java', 'Python', 'AWS', 'DynamoDB', 'Lambda', 'S3', 'EC2', 'Kinesis'],
        culture: ['Customer obsession', 'Ownership', 'Invent and simplify', 'Bias for action', 'Dive deep'],
        interviewStyle: 'Leadership principles, technical problems, system design, behavioral',
        commonQuestions: ['Design Amazon marketplace', 'Tell me about a time you failed', 'Scale AWS services']
      },
      {
        name: 'Microsoft',
        industry: 'Technology',
        techStack: ['C#', 'TypeScript', 'Azure', 'PowerShell', '.NET', 'Teams', 'Office 365'],
        culture: ['Respect', 'Integrity', 'Accountability', 'Inclusive', 'Growth mindset'],
        interviewStyle: 'Technical skills, problem-solving, collaboration, growth mindset',
        commonQuestions: ['Design Office 365', 'How do you handle conflict?', 'Azure architecture']
      },
      {
        name: 'Apple',
        industry: 'Consumer Electronics',
        techStack: ['Swift', 'Objective-C', 'iOS', 'macOS', 'Metal', 'Core Data', 'Xcode'],
        culture: ['Innovation', 'Excellence', 'Privacy', 'Simplicity', 'Think different'],
        interviewStyle: 'Product focus, technical excellence, attention to detail, design thinking',
        commonQuestions: ['Design iPhone feature', 'Optimize for performance', 'Privacy considerations']
      },
      {
        name: 'Netflix',
        industry: 'Streaming/Entertainment',
        techStack: ['Java', 'Python', 'React', 'AWS', 'Microservices', 'Kafka', 'Cassandra'],
        culture: ['Freedom and responsibility', 'High performance', 'Candor', 'Innovation'],
        interviewStyle: 'Culture fit, technical depth, real-world scenarios, keeper test',
        commonQuestions: ['Design video streaming', 'Handle service failures', 'Content recommendation']
      },
      {
        name: 'OpenAI',
        industry: 'AI & Machine Learning',
        techStack: ['Python', 'PyTorch', 'Kubernetes', 'React', 'PostgreSQL', 'Redis'],
        culture: ['AI safety', 'Beneficial AGI', 'Transparency', 'Collaboration', 'Research excellence'],
        interviewStyle: 'Technical depth, AI/ML knowledge, ethics, research thinking',
        commonQuestions: ['Design language model', 'AI safety considerations', 'Scale ML training']
      },
      {
        name: 'Anthropic',
        industry: 'AI & Machine Learning',
        techStack: ['Python', 'PyTorch', 'JAX', 'React', 'Kubernetes', 'GCP'],
        culture: ['AI safety', 'Constitutional AI', 'Research rigor', 'Responsible development'],
        interviewStyle: 'Research background, AI alignment, technical depth, safety focus',
        commonQuestions: ['Constitutional AI principles', 'RLHF implementation', 'AI safety research']
      },
      {
        name: 'Tesla',
        industry: 'Automotive & Energy',
        techStack: ['Python', 'C++', 'React', 'PostgreSQL', 'Docker', 'Kubernetes', 'ROS'],
        culture: ['Innovation', 'Sustainability', 'First principles', 'Move fast', 'Excellence'],
        interviewStyle: 'Technical excellence, innovation, problem-solving, mission alignment',
        commonQuestions: ['Autonomous driving algorithms', 'Battery optimization', 'Manufacturing efficiency']
      },
      {
        name: 'Stripe',
        industry: 'Fintech',
        techStack: ['Ruby', 'Scala', 'React', 'PostgreSQL', 'Kafka', 'Kubernetes'],
        culture: ['User obsession', 'Rigor', 'Transparency', 'Global scale'],
        interviewStyle: 'System design, financial systems, product thinking, attention to detail',
        commonQuestions: ['Payment processing', 'Financial compliance', 'Global payments']
      }
    ];

    companies.forEach(company => {
      this.companyDatabase.set(company.name.toLowerCase(), company);
    });
  }

  public getCompanySuggestions(query: string): string[] {
    const suggestions: string[] = [];
    const queryLower = query.toLowerCase();
    
    // Find matches from company database
    for (const [key, company] of this.companyDatabase) {
      if (company.name.toLowerCase().includes(queryLower)) {
        suggestions.push(company.name);
      }
    }
    
    // Add popular companies if no matches
    if (suggestions.length === 0 && query.length > 0) {
      const popularCompanies = [
        'Google', 'Meta', 'Amazon', 'Microsoft', 'Apple', 'Tesla', 
        'OpenAI', 'Anthropic', 'Netflix', 'Stripe', 'Uber', 'Airbnb'
      ];
      return popularCompanies.filter(name => 
        name.toLowerCase().includes(queryLower)
      ).slice(0, 8);
    }
    
    return suggestions.slice(0, 10);
  }

  public async callGroqAPI(request: GroqRequest): Promise<GroqResponse> {
    if (!this.groqApiKey) {
      throw new Error('Groq API key not configured');
    }

    try {
      console.log('🚀 Calling Groq API with model:', request.model || this.groqModel);
      
      const chatCompletion = await this.groq.chat.completions.create({
        messages: request.messages as any,
        model: request.model || this.groqModel,
        max_tokens: request.max_tokens || 4000,
        temperature: request.temperature || 0.7,
      });

      const content = chatCompletion.choices[0]?.message?.content || '';
      console.log('✅ Groq API response received');
      
      return {
        content: content,
        provider: 'groq',
        model: request.model || this.groqModel,
        usage: chatCompletion.usage ? {
          prompt_tokens: chatCompletion.usage.prompt_tokens,
          completion_tokens: chatCompletion.usage.completion_tokens,
          total_tokens: chatCompletion.usage.total_tokens
        } : undefined
      };
    } catch (error) {
      console.error('❌ Groq API call failed:', error);
      throw error;
    }
  }

  private async callGeminiAPI(messages: any[]): Promise<GroqResponse> {
    if (!this.geminiApiKey) {
      throw new Error('Gemini API key not configured');
    }

    try {
      console.log('🔄 Calling Gemini API...');
      
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

  // QUESTION GENERATION - Uses OpenAI GPT-4o-mini for best speed
  public async generateInterviewQuestions(params: {
    jobTitle: string;
    companyName: string;
    skills: string[];
    interviewType: 'technical' | 'behavioral' | 'mixed' | 'system_design' | 'aptitude';
    experienceLevel: 'entry' | 'mid' | 'senior';
    numberOfQuestions: number;
  }): Promise<InterviewQuestion[]> {
    
    const companyData = this.companyDatabase.get(params.companyName.toLowerCase());
    
    const systemMessage = `You are an expert interview question generator specializing in ${params.interviewType} interviews for ${params.companyName}. Generate high-quality, company-specific questions.`;
    
    const userMessage = `Generate exactly ${params.numberOfQuestions} ${params.interviewType} interview questions for:

Position: ${params.jobTitle} at ${params.companyName}
Experience Level: ${params.experienceLevel}
Required Skills: ${params.skills.join(', ')}

${companyData ? `
Company Context:
- Industry: ${companyData.industry}
- Tech Stack: ${companyData.techStack?.join(', ')}
- Culture: ${companyData.culture?.join(', ')}
- Interview Style: ${companyData.interviewStyle}
- Focus Areas: ${companyData.commonQuestions?.join(', ')}
` : ''}

Requirements:
- Questions must be specific to ${params.companyName} and their actual work
- Appropriate difficulty for ${params.experienceLevel} level
- Include comprehensive expected answers
- Focus on company-specific scenarios and challenges
- Avoid generic questions

Return ONLY a valid JSON array:
[
  {
    "id": "unique-question-id",
    "question": "Company-specific interview question with clear context",
    "expectedAnswer": "Comprehensive expected answer with company-specific insights and examples",
    "category": "${params.interviewType}",
    "difficulty": "easy|medium|hard",
    "points": 10,
    "timeLimit": 5,
    "evaluationCriteria": ["Company-specific criteria", "Technical accuracy", "Communication"],
    "tags": ["${params.companyName}", "${params.jobTitle}", "relevant-tech"],
    "hints": ["Company-specific hints"],
    "companyRelevance": 9
  }
]`;

    try {
      const response = await this.callGroqAPI({
        messages: [
          { role: 'system', content: systemMessage },
          { role: 'user', content: userMessage }
        ],
        model: this.groqModel,
        max_tokens: 6000,
        temperature: 0.8
      });

      const questions = extractJSON(response.content);
      
      if (!Array.isArray(questions)) {
        throw new Error('Invalid JSON response format');
      }

      return questions.map((q: any, index: number) => ({
        ...q,
        id: q.id || `q-${Date.now()}-${index}`,
        category: params.interviewType,
        points: q.points || 10,
        timeLimit: q.timeLimit || 5,
        evaluationCriteria: q.evaluationCriteria || ['Technical accuracy', 'Company relevance', 'Communication'],
        tags: [...(q.tags || []), params.companyName, params.jobTitle],
        companyRelevance: q.companyRelevance || 8,
        provider: 'groq',
        model: this.groqModel
      }));
    } catch (error) {
      console.error('❌ Error generating interview questions:', error);
      return this.generateFallbackQuestions(params);
    }
  }

  // DSA PROBLEMS - Uses OpenAI GPT-4o-mini for structured coding problems
  public async generateDSAProblems(
    companyName: string,
    difficulty: 'easy' | 'medium' | 'hard' = 'medium',
    count: number = 6
  ): Promise<DSAProblem[]> {
    
    const companyData = this.companyDatabase.get(companyName.toLowerCase());
    
    const systemMessage = `You are an expert algorithm and data structures interviewer creating ${companyName}-specific coding problems.`;
    
    const userMessage = `Generate exactly ${count} DSA problems for ${companyName} interviews.

${companyData ? `
Company Context:
- ${companyName} works with: ${companyData.techStack?.join(', ')}
- Common challenges: ${companyData.commonQuestions?.join(', ')}
- Focus on problems they would actually encounter
` : `Research ${companyName}'s technical challenges and create relevant problems.`}

Requirements:
- Difficulty: ${difficulty}
- Each problem should be unique and test different concepts
- Include comprehensive test cases and examples
- Make problems realistic for ${companyName} technical interviews
- Include company-relevant context in problem descriptions

Return ONLY a valid JSON array:
[
  {
    "id": "unique-problem-id",
    "title": "Company-specific problem title",
    "difficulty": "${difficulty}",
    "description": "Clear problem description with ${companyName} context and requirements",
    "examples": [
      {
        "input": "sample input format",
        "output": "expected output format",
        "explanation": "detailed explanation with company context"
      }
    ],
    "testCases": [
      {
        "id": "test-1",
        "input": "test input data",
        "expectedOutput": "expected result",
        "hidden": false
      }
    ],
    "constraints": ["realistic constraint 1", "realistic constraint 2"],
    "topics": ["relevant algorithms", "data structures"],
    "hints": ["company-specific hints"],
    "timeComplexity": "O(n)",
    "spaceComplexity": "O(1)",
    "companySpecific": true
  }
]`;

    try {
      const response = await this.callGroqAPI({
        messages: [
          { role: 'system', content: systemMessage },
          { role: 'user', content: userMessage }
        ],
        model: this.groqModel,
        max_tokens: 8000,
        temperature: 0.7
      });

      const problems = extractJSON(response.content);
      
      if (!Array.isArray(problems)) {
        throw new Error('Invalid JSON response format');
      }

      return problems.map((p: any, index: number) => ({
        ...p,
        id: p.id || `dsa-${Date.now()}-${index}`,
        difficulty: difficulty,
        examples: p.examples || [],
        testCases: p.testCases || [],
        constraints: p.constraints || [],
        topics: p.topics || ['General'],
        hints: p.hints || [],
        companySpecific: true,
        provider: 'groq',
        model: this.groqModel
      }));
    } catch (error) {
      console.error('❌ Error generating DSA problems:', error);
      return this.generateFallbackDSAProblems(companyName, difficulty, count);
    }
  }

  // RESPONSE ANALYSIS - Uses Anthropic Claude 3.5 Sonnet for detailed analysis
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
    
    const companyData = this.companyDatabase.get(companyContext.toLowerCase());
    
    const systemMessage = `You are a senior technical interviewer at ${companyContext} providing detailed, constructive feedback. Your analysis should be thorough, fair, and actionable.`;
    
    const userMessage = `Analyze this interview response for ${companyContext}:

Question (${category}): ${question}
Expected Answer: ${expectedAnswer}
Candidate Answer: ${userAnswer}

${companyData ? `
Company Evaluation Standards:
- ${companyContext} values: ${companyData.culture?.join(', ')}
- Technical focus: ${companyData.techStack?.join(', ')}
- Interview style: ${companyData.interviewStyle}
` : `Use industry standards and known practices for ${companyContext}.`}

Provide detailed analysis considering ${companyContext}'s specific standards and culture.

Return ONLY valid JSON:
{
  "score": (0-10 score based on company standards),
  "feedback": "Detailed, constructive feedback paragraph considering company culture and technical standards",
  "suggestions": ["specific actionable improvement suggestions for ${companyContext}"],
  "strengths": ["what they did well according to company values"],
  "improvements": ["areas to improve specifically for ${companyContext}"]
}

Consider:
- Technical accuracy for ${companyContext}'s tech stack
- Communication style fitting company culture
- Problem-solving approach they value
- Company-specific best practices`;

    try {
      const response = await this.callGroqAPI({
        messages: [
          { role: 'system', content: systemMessage },
          { role: 'user', content: userMessage }
        ],
        model: this.groqModel,
        max_tokens: 3000,
        temperature: 0.5
      });

      const analysis = extractJSON(response.content);
      
      return {
        score: Math.max(0, Math.min(10, analysis.score || 5)),
        feedback: analysis.feedback || 'Response analyzed successfully.',
        suggestions: analysis.suggestions || ['Continue practicing for this company'],
        strengths: analysis.strengths || ['Attempted the question'],
        improvements: analysis.improvements || ['Add more company-specific insights']
      };
    } catch (error) {
      console.error('❌ Error analyzing response:', error);
      return this.generateFallbackAnalysis(userAnswer, companyContext);
    }
  }

  // OVERALL PERFORMANCE ANALYSIS - Uses Anthropic Claude 3.5 Sonnet for comprehensive evaluation
  public async analyzeOverallPerformance(
    questions: any[],
    answers: string[],
    jobTitle: string,
    companyName: string,
    skills: string[]
  ): Promise<any> {
    const companyData = this.companyDatabase.get(companyName.toLowerCase());
    
    const systemMessage = `You are a senior hiring manager at ${companyName} providing comprehensive interview performance evaluation for a ${jobTitle} position.`;
    
    const userMessage = `Analyze this complete interview performance for ${jobTitle} at ${companyName}:

${companyData ? `
Company Standards:
- ${companyName} culture: ${companyData.culture?.join(', ')}
- Technical requirements: ${companyData.techStack?.join(', ')}
- Evaluation style: ${companyData.interviewStyle}
` : `Use industry standards for ${companyName}.`}

Position: ${jobTitle} at ${companyName}
Required Skills: ${skills.join(', ')}

Questions and Responses:
${questions.map((q, index) => `
Q${index + 1} [${q.difficulty}] [${q.category}]: ${q.question}
Expected: ${q.expectedAnswer}
Candidate: ${answers[index] || 'No answer provided'}
Points: ${q.points}
`).join('\n')}

Provide comprehensive analysis considering ${companyName}'s hiring standards.

Return ONLY valid JSON:
{
  "overallScore": (0-10 based on company standards),
  "parameterScores": {
    "Technical Knowledge": (0-10),
    "Problem Solving": (0-10),
    "Communication Skills": (0-10),
    "Company Culture Fit": (0-10),
    "Practical Application": (0-10)
  },
  "overallVerdict": "2-3 sentence summary considering ${companyName}'s standards",
  "adviceForImprovement": [
    {
      "question": "Question text",
      "advice": "Company-specific improvement advice"
    }
  ],
  "strengths": ["company-relevant strengths"],
  "improvements": ["areas to improve for ${companyName}"],
  "recommendations": ["specific recommendations for ${companyName} interviews"]
}`;

    try {
      const response = await this.callGroqAPI({
        messages: [
          { role: 'system', content: systemMessage },
          { role: 'user', content: userMessage }
        ],
        model: this.groqModel,
        max_tokens: 5000,
        temperature: 0.3
      });

      return extractJSON(response.content);
    } catch (error) {
      console.error('❌ Error analyzing overall performance:', error);
      return this.generateFallbackOverallAnalysis(questions, answers, companyName);
    }
  }

  // Health check method
  public async healthCheck(): Promise<{
    emergentAvailable: boolean;
    geminiAvailable: boolean;
    status: string;
    companyDatabaseSize: number;
  }> {
    const status = {
      emergentAvailable: !!this.emergentApiKey,
      geminiAvailable: !!this.geminiApiKey,
      status: 'unknown',
      companyDatabaseSize: this.companyDatabase.size
    };

    if (status.emergentAvailable) {
      try {
        await this.callEmergentAPI({
          messages: [{ role: 'user', content: 'Health check' }],
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

  // Fallback methods for error cases
  private generateFallbackQuestions(params: any): InterviewQuestion[] {
    const companyData = this.companyDatabase.get(params.companyName.toLowerCase());
    const questions: InterviewQuestion[] = [];
    
    for (let i = 0; i < params.numberOfQuestions; i++) {
      questions.push({
        id: `fallback-q-${i}`,
        question: `Based on ${params.companyName}'s focus on ${companyData?.techStack?.[0] || 'technology'}, describe your experience with ${params.skills[i % params.skills.length]} and how it applies to their ${params.jobTitle} role.`,
        expectedAnswer: `A comprehensive answer covering experience with ${params.skills[i % params.skills.length]}, specific examples relevant to ${params.companyName}, and understanding of their technical challenges.`,
        category: params.interviewType,
        difficulty: ['easy', 'medium', 'hard'][i % 3] as 'easy' | 'medium' | 'hard',
        points: 10,
        timeLimit: 5,
        evaluationCriteria: ['Technical accuracy', 'Company relevance', 'Communication clarity'],
        tags: [params.companyName, params.jobTitle, params.skills[i % params.skills.length]],
        hints: [`Think about ${params.companyName}'s specific use cases`],
        companyRelevance: 7
      });
    }
    
    return questions;
  }

  private generateFallbackDSAProblems(companyName: string, difficulty: string, count: number): DSAProblem[] {
    const problems: DSAProblem[] = [];
    
    const problemTemplates = [
      {
        title: 'Two Sum',
        description: 'Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.',
        topics: ['Array', 'Hash Table']
      },
      {
        title: 'Valid Parentheses',
        description: 'Given a string s containing just brackets, determine if the input string is valid.',
        topics: ['String', 'Stack']
      },
      {
        title: 'Binary Tree Level Order Traversal',
        description: 'Given a binary tree, return the level order traversal of its nodes values.',
        topics: ['Tree', 'BFS']
      }
    ];

    for (let i = 0; i < count; i++) {
      const template = problemTemplates[i % problemTemplates.length];
      problems.push({
        id: `fallback-dsa-${i}`,
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
        spaceComplexity: 'O(1)',
        companySpecific: false
      });
    }
    
    return problems;
  }

  private generateFallbackAnalysis(userAnswer: string, companyContext: string) {
    const wordCount = userAnswer.split(' ').length;
    const score = Math.max(0, Math.min(10, wordCount / 15));
    
    return {
      score,
      feedback: `Your response shows ${score >= 7 ? 'good' : score >= 5 ? 'adequate' : 'basic'} understanding. For ${companyContext} interviews, consider adding more specific technical details and company-relevant examples.`,
      suggestions: [`Research ${companyContext}'s specific technologies and challenges`, 'Add more detailed technical explanations', 'Include real-world examples from your experience'],
      strengths: wordCount > 30 ? ['Comprehensive response', 'Good engagement with the question'] : ['Attempted the question', 'Shows basic understanding'],
      improvements: [`Study ${companyContext}'s technical requirements in depth`, 'Practice company-specific scenarios', 'Improve technical communication skills']
    };
  }

  private generateFallbackOverallAnalysis(questions: any[], answers: string[], companyName: string) {
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
      overallVerdict: `The candidate demonstrated ${score >= 7 ? 'strong' : score >= 5 ? 'adequate' : 'basic'} performance for ${companyName} interview standards. ${score >= 7 ? 'Shows good potential for the role.' : 'Would benefit from additional preparation.'}`,
      adviceForImprovement: questions.slice(0, 3).map((q, i) => ({
        question: q.question,
        advice: `For ${companyName}, focus more on their specific technical challenges and company culture values. Research their recent projects and technologies.`
      })),
      strengths: ["Attempted all questions", "Showed problem-solving approach", "Maintained professional communication"],
      improvements: [`Study ${companyName}'s specific technologies and recent developments`, "Practice company-specific interview scenarios", "Improve technical depth and communication"],
      recommendations: [`Research ${companyName}'s recent projects and technical blog posts`, "Practice with their technology stack", "Study their company values and culture", "Prepare specific examples relevant to their business"]
    };
  }
}

export const optimizedAIService = OptimizedAIService.getInstance();
export default OptimizedAIService;