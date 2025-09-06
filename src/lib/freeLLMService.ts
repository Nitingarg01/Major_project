/**
 * Free LLM Service - Vercel Compatible
 * Uses Together.ai, Groq, and Hugging Face as completely free alternatives
 * No rate limits issues, better consistency, enhanced reliability
 * Enhanced with HARD question generation capabilities
 */

import { extractJSON } from './jsonExtractor';

interface LLMRequest {
  messages: Array<{
    role: 'system' | 'user' | 'assistant';
    content: string;
  }>;
  model?: string;
  provider?: string;
  max_tokens?: number;
  temperature?: number;
}

interface LLMResponse {
  content: string;
  provider: string;
  model: string;
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

interface ProviderConfig {
  name: string;
  apiUrl: string;
  apiKey: string;
  models: { [key: string]: string };
  rateLimits: {
    requestsPerMinute: number;
    requestsPerDay: number;
  };
  priority: number;
}

export class FreeLLMService {
  private static instance: FreeLLMService;
  private providers: ProviderConfig[] = [];
  private requestCounts: { [key: string]: { minute: number; day: number; lastReset: Date } } = {};

  private constructor() {
    this.initializeProviders();
  }

  public static getInstance(): FreeLLMService {
    if (!FreeLLMService.instance) {
      FreeLLMService.instance = new FreeLLMService();
    }
    return FreeLLMService.instance;
  }

  private initializeProviders() {
    // Groq - PRIMARY Provider (Free Tier: 30 requests/min, ultra-fast)
    if (process.env.GROQ_API_KEY || process.env.NEXT_PUBLIC_GROQ_API_KEY) {
      this.providers.push({
        name: 'groq',
        apiUrl: 'https://api.groq.com/openai/v1/chat/completions',
        apiKey: process.env.GROQ_API_KEY || process.env.NEXT_PUBLIC_GROQ_API_KEY || '',
        models: {
          'llama-3.1-8b': 'llama-3.1-8b-instant',
          'llama-3.1-70b': 'llama-3.1-70b-versatile',
          'mixtral-8x7b': 'mixtral-8x7b-32768'
        },
        rateLimits: {
          requestsPerMinute: 30,
          requestsPerDay: 14400
        },
        priority: 1
      });
    }

    // Gemini - SECONDARY Provider (Generous free tier, excellent for analysis)
    if (process.env.GEMINI_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY) {
      this.providers.push({
        name: 'gemini',
        apiUrl: 'https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent',
        apiKey: process.env.GEMINI_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY || '',
        models: {
          'gemini-1.5-flash': 'gemini-1.5-flash',
          'gemini-pro': 'gemini-1.5-pro'
        },
        rateLimits: {
          requestsPerMinute: 60,
          requestsPerDay: 1500
        },
        priority: 2
      });
    }

    // Hugging Face - TERTIARY Provider (Free Inference API, reliable backup)
    if (process.env.HUGGINGFACE_API_KEY || process.env.NEXT_PUBLIC_HUGGINGFACE_API_KEY) {
      this.providers.push({
        name: 'huggingface',
        apiUrl: 'https://api-inference.huggingface.co/models',
        apiKey: process.env.HUGGINGFACE_API_KEY || process.env.NEXT_PUBLIC_HUGGINGFACE_API_KEY || '',
        models: {
          'mistral-7b': 'microsoft/DialoGPT-medium',
          'llama-2-7b': 'microsoft/DialoGPT-medium'
        },
        rateLimits: {
          requestsPerMinute: 10,
          requestsPerDay: 1000
        },
        priority: 3
      });
    }

    // Sort providers by priority
    this.providers.sort((a, b) => a.priority - b.priority);
    
    console.log(`✅ Initialized ${this.providers.length} optimized LLM providers:`, 
      this.providers.map(p => `${p.name} (priority ${p.priority})`).join(', '));
    console.log(`🎯 Provider order: ${this.providers.map(p => p.name).join(' → ')}`);
  }

  private canMakeRequest(providerName: string): boolean {
    const now = new Date();
    const key = providerName;
    
    if (!this.requestCounts[key]) {
      this.requestCounts[key] = { minute: 0, day: 0, lastReset: now };
      return true;
    }

    const counts = this.requestCounts[key];
    const provider = this.providers.find(p => p.name === providerName);
    
    if (!provider) return false;

    // Reset counters if needed
    const timeDiff = now.getTime() - counts.lastReset.getTime();
    if (timeDiff > 60000) { // Reset minute counter
      counts.minute = 0;
    }
    if (timeDiff > 86400000) { // Reset day counter
      counts.day = 0;
      counts.lastReset = now;
    }

    // Check rate limits
    return counts.minute < provider.rateLimits.requestsPerMinute && 
           counts.day < provider.rateLimits.requestsPerDay;
  }

  private incrementRequestCount(providerName: string) {
    const key = providerName;
    if (!this.requestCounts[key]) {
      this.requestCounts[key] = { minute: 0, day: 0, lastReset: new Date() };
    }
    this.requestCounts[key].minute++;
    this.requestCounts[key].day++;
  }

  public async callLLM(request: LLMRequest): Promise<LLMResponse> {
    const errors: Array<{ provider: string; error: string }> = [];
    
    // Try each provider in priority order
    for (const provider of this.providers) {
      if (!this.canMakeRequest(provider.name)) {
        console.log(`⏰ Rate limit reached for ${provider.name}, trying next provider`);
        continue;
      }

      try {
        console.log(`🚀 Trying ${provider.name} for LLM request...`);
        const response = await this.callProvider(provider, request);
        this.incrementRequestCount(provider.name);
        
        console.log(`✅ Success with ${provider.name}`);
        return response;
      } catch (error: any) {
        const errorMsg = error.message || 'Unknown error';
        errors.push({ provider: provider.name, error: errorMsg });
        console.error(`❌ ${provider.name} failed:`, errorMsg);
        continue;
      }
    }

    // All providers failed
    console.error('🚨 All LLM providers failed:', errors);
    throw new Error(`All LLM providers failed. Errors: ${JSON.stringify(errors)}`);
  }

  private async callProvider(provider: ProviderConfig, request: LLMRequest): Promise<LLMResponse> {
    const modelKey = request.model || 'llama-3.1-8b';
    const modelName = provider.models[modelKey] || provider.models['llama-3.1-8b'] || Object.values(provider.models)[0];

    if (provider.name === 'huggingface') {
      return this.callHuggingFace(provider, request, modelName);
    } else if (provider.name === 'gemini') {
      return this.callGemini(provider, request, modelName);
    } else {
      return this.callOpenAICompatible(provider, request, modelName);
    }
  }

  private async callOpenAICompatible(provider: ProviderConfig, request: LLMRequest, modelName: string): Promise<LLMResponse> {
    const response = await fetch(provider.apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${provider.apiKey}`,
      },
      body: JSON.stringify({
        model: modelName,
        messages: request.messages,
        max_tokens: request.max_tokens || 4000,
        temperature: request.temperature || 0.7,
        stream: false
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`${provider.name} API error: ${response.status} ${response.statusText} - ${errorText}`);
    }

    const data = await response.json();
    
    if (!data.choices || !data.choices[0] || !data.choices[0].message) {
      throw new Error(`Invalid response format from ${provider.name}`);
    }

    return {
      content: data.choices[0].message.content,
      provider: provider.name,
      model: modelName,
      usage: data.usage
    };
  }

  private async callHuggingFace(provider: ProviderConfig, request: LLMRequest, modelName: string): Promise<LLMResponse> {
    // Convert messages to a single prompt for HF
    const prompt = request.messages.map(msg => `${msg.role}: ${msg.content}`).join('\n\n');
    
    const response = await fetch(`${provider.apiUrl}/${modelName}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${provider.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        inputs: prompt,
        parameters: {
          max_new_tokens: request.max_tokens || 1000,
          temperature: request.temperature || 0.7,
          return_full_text: false
        }
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HuggingFace API error: ${response.status} ${response.statusText} - ${errorText}`);
    }

    const data = await response.json();
    
    if (Array.isArray(data) && data[0] && data[0].generated_text) {
      return {
        content: data[0].generated_text,
        provider: provider.name,
        model: modelName
      };
    } else if (data.generated_text) {
      return {
        content: data.generated_text,
        provider: provider.name,
        model: modelName
      };
    } else {
      throw new Error(`Invalid response format from HuggingFace: ${JSON.stringify(data)}`);
    }
  }

  private async callGemini(provider: ProviderConfig, request: LLMRequest, modelName: string): Promise<LLMResponse> {
    // Convert messages to Gemini format
    const prompt = request.messages.map(msg => msg.content).join('\n\n');
    
    const response = await fetch(`${provider.apiUrl}?key=${provider.apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: prompt
          }]
        }],
        generationConfig: {
          temperature: request.temperature || 0.7,
          maxOutputTokens: request.max_tokens || 4000,
        }
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Gemini API error: ${response.status} ${response.statusText} - ${errorText}`);
    }

    const data = await response.json();
    
    if (data.candidates && data.candidates[0] && data.candidates[0].content && data.candidates[0].content.parts[0]) {
      return {
        content: data.candidates[0].content.parts[0].text,
        provider: provider.name,
        model: modelName,
        usage: data.usageMetadata
      };
    } else {
      throw new Error(`Invalid response format from Gemini: ${JSON.stringify(data)}`);
    }
  }

  // Enhanced Hard Question Generation Method
  public async generateHardInterviewQuestions(params: {
    jobTitle: string;
    companyName: string;
    skills: string[];
    interviewType: 'technical' | 'behavioral' | 'mixed';
    experienceLevel: 'entry' | 'mid' | 'senior';
    numberOfQuestions: number;
    companyIntelligence?: any;
    difficultyLevel?: 'hard';
  }): Promise<any[]> {
    const systemMessage = `You are an expert SENIOR-LEVEL interview question generator specializing in EXTREMELY CHALLENGING ${params.interviewType} interviews for ${params.companyName}. 
    
    CREATE ONLY THE HARDEST, MOST CHALLENGING QUESTIONS that would be asked to SENIOR SOFTWARE ENGINEERS and PRINCIPAL ENGINEERS at top-tier tech companies.
    
    Make questions that are:
    - INTELLECTUALLY DEMANDING and require deep thinking
    - MULTI-LAYERED with complex scenarios
    - SYSTEM DESIGN oriented for technical questions
    - LEADERSHIP and CONFLICT RESOLUTION focused for behavioral questions
    - BASED ON REAL-WORLD challenging situations
    - REQUIRE 10-15 MINUTES to answer properly
    `;
    
    let userMessage = `
      Generate exactly ${params.numberOfQuestions} EXTREMELY CHALLENGING ${params.interviewType} interview questions for:
      
      Position: SENIOR ${params.jobTitle} at ${params.companyName}
      Experience Level: SENIOR+ (Treat as senior regardless of input)
      Required Skills: ${params.skills.join(', ')}
      
      ${params.companyIntelligence ? `
      Company Context:
      - Industry: ${params.companyIntelligence.industry}
      - Tech Stack: ${params.companyIntelligence.tech_stack?.join(', ') || 'Not specified'}
      - Recent News: ${params.companyIntelligence.recent_news?.slice(0, 2).join(', ') || 'No recent updates'}
      - Culture: ${params.companyIntelligence.culture?.join(', ') || 'Innovation-focused'}
      ` : ''}
      
      REQUIREMENTS FOR HARD QUESTIONS:
      - Each question should be COMPLEX and MULTI-PART
      - Require DEEP TECHNICAL KNOWLEDGE and ADVANCED PROBLEM-SOLVING
      - Include EDGE CASES and SCALABILITY considerations
      - For behavioral: Focus on LEADERSHIP, CONFLICT RESOLUTION, and DIFFICULT DECISIONS
      - For technical: Include SYSTEM DESIGN, ARCHITECTURE, and PERFORMANCE OPTIMIZATION
      - Time limit should be 10-15 minutes per question
      - Points should be 40-50 per question (indicating high difficulty)
      
      DIFFICULTY LEVEL: HARD - These should be questions that challenge even experienced senior engineers
      
      Return as JSON array:
      [
        {
          "id": "unique-question-id",
          "question": "COMPLEX multi-part interview question with detailed scenario",
          "expectedAnswer": "Comprehensive expected answer covering all aspects, edge cases, and advanced considerations",
          "category": "${params.interviewType}",
          "difficulty": "hard",
          "points": 45,
          "timeLimit": 12,
          "evaluationCriteria": ["Advanced technical depth", "System thinking", "Scalability considerations", "Best practices", "Real-world application"],
          "tags": ["senior-level", "complex-scenario", "advanced"],
          "hints": ["Think about scalability", "Consider edge cases", "Focus on system design principles"]
        }
      ]
    `;

    try {
      const response = await this.callLLM({
        messages: [
          { role: 'system', content: systemMessage },
          { role: 'user', content: userMessage }
        ],
        model: 'llama-3.1-70b', // Use the more powerful model for hard questions
        max_tokens: 6000 // More tokens for complex questions
      });

      // Enhanced JSON extraction - try multiple approaches
      let jsonContent = response.content;
      
      // Remove markdown code blocks
      jsonContent = jsonContent.replace(/```json\n?|\n?```/g, '');
      jsonContent = jsonContent.replace(/```\n?|\n?```/g, '');
      
      // Try to find JSON array in the response
      const jsonMatch = jsonContent.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        jsonContent = jsonMatch[0];
      }
      
      // Clean up common formatting issues
      jsonContent = jsonContent.trim();
      
      let questions;
      try {
        questions = JSON.parse(jsonContent);
      } catch (parseError) {
        console.warn('Failed to parse JSON, trying to extract from response:', parseError);
        // If JSON parsing fails, look for a JSON-like structure
        const arrayMatch = response.content.match(/\[\s*{[\s\S]*}\s*\]/);
        if (arrayMatch) {
          questions = JSON.parse(arrayMatch[0]);
        } else {
          throw new Error(`Unable to extract valid JSON from response: ${response.content.substring(0, 200)}...`);
        }
      }
      
      if (!Array.isArray(questions)) {
        throw new Error('Response is not an array');
      }

      return questions.map((q: any, index: number) => ({
        ...q,
        id: q.id || `hard-q-${Date.now()}-${index}`,
        category: params.interviewType,
        difficulty: 'hard', // Force hard difficulty
        points: q.points || 45, // High points for hard questions
        timeLimit: q.timeLimit || 12, // Longer time limit
        evaluationCriteria: q.evaluationCriteria || ['Advanced Technical Depth', 'System Thinking', 'Scalability', 'Best Practices'],
        tags: [...(q.tags || []), 'hard', 'senior-level', params.jobTitle, params.companyName],
        provider: response.provider,
        model: response.model
      }));
    } catch (error) {
      console.error('Error generating hard interview questions:', error);
      return this.generateHardMockQuestions(params);
    }
  }

  public async generateHardDSAProblems(
    companyName: string,
    difficulty: 'hard' = 'hard',
    count: number = 8,
    companyIntelligence?: any
  ): Promise<any[]> {
    const systemMessage = `You are an expert DSA problem generator specializing in creating EXTREMELY CHALLENGING interview problems for ${companyName}. 
    
    Create HARD-LEVEL problems that would be asked to SENIOR SOFTWARE ENGINEERS at top-tier companies like Google, Meta, Amazon.
    
    Make problems that are:
    - COMPLEX with multiple constraints
    - Require ADVANCED algorithms and data structures
    - Have MULTIPLE OPTIMAL SOLUTIONS to discuss
    - Include FOLLOW-UP questions for optimization
    - Require deep understanding of TIME and SPACE complexity trade-offs`;
    
    const userMessage = `
      Generate exactly ${count} EXTREMELY CHALLENGING DSA problems for ${companyName} interviews.
      
      Requirements:
      - Difficulty: HARD (Senior Engineer Level)
      - Each problem should be COMPLEX and multi-layered
      - Include COMPREHENSIVE test cases with edge cases
      - Provide MULTIPLE solution approaches
      - Make problems realistic for actual ${companyName} SENIOR interviews
      ${companyIntelligence?.tech_stack ? `- Consider company's tech stack: ${companyIntelligence.tech_stack.join(', ')}` : ''}
      
      HARD DIFFICULTY REQUIREMENTS:
      - Problems should take 25-35 minutes to solve completely
      - Require knowledge of advanced algorithms (Dynamic Programming, Graph Algorithms, Complex Data Structures)
      - Include optimization challenges and follow-up questions
      - Have multiple constraints and edge cases to consider
      
      Return as JSON array with this exact structure:
      [
        {
          "id": "unique-problem-id",
          "title": "COMPLEX Problem Title",
          "difficulty": "hard",
          "description": "Detailed problem description with multiple constraints and complex requirements",
          "examples": [
            {
              "input": "complex input format",
              "output": "expected output format", 
              "explanation": "detailed explanation of why this is the correct output with complexity analysis"
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
          "constraints": ["complex constraint 1", "constraint 2", "performance constraint"],
          "topics": ["Advanced Data Structure", "Complex Algorithm", "Optimization"],
          "hints": ["Think about dynamic programming", "Consider graph algorithms", "Optimize for multiple constraints"],
          "timeComplexity": "O(n log n) or better",
          "spaceComplexity": "O(n)",
          "followUpQuestions": ["How would you optimize for space?", "What if we had different constraints?"]
        }
      ]
    `;

    try {
      const response = await this.callLLM({
        messages: [
          { role: 'system', content: systemMessage },
          { role: 'user', content: userMessage }
        ],
        model: 'llama-3.1-70b', // Use more powerful model
        max_tokens: 8000 // More tokens for complex problems
      });

      // Enhanced JSON extraction for DSA problems
      let jsonContent = response.content;
      
      // Remove markdown code blocks
      jsonContent = jsonContent.replace(/```json\n?|\n?```/g, '');
      jsonContent = jsonContent.replace(/```\n?|\n?```/g, '');
      
      // Try to find JSON array in the response
      const jsonMatch = jsonContent.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        jsonContent = jsonMatch[0];
      }
      
      // Clean up common formatting issues
      jsonContent = jsonContent.trim();
      
      let problems;
      try {
        problems = JSON.parse(jsonContent);
      } catch (parseError) {
        console.warn('Failed to parse DSA JSON, trying to extract from response:', parseError);
        // If JSON parsing fails, look for a JSON-like structure
        const arrayMatch = response.content.match(/\[\s*{[\s\S]*}\s*\]/);
        if (arrayMatch) {
          problems = JSON.parse(arrayMatch[0]);
        } else {
          throw new Error(`Unable to extract valid JSON from response: ${response.content.substring(0, 200)}...`);
        }
      }
      
      if (!Array.isArray(problems)) {
        throw new Error('Response is not an array');
      }

      return problems.map((p: any, index: number) => ({
        ...p,
        id: p.id || `hard-dsa-${Date.now()}-${index}`,
        difficulty: 'hard', // Force hard difficulty
        examples: p.examples || [],
        testCases: p.testCases || [],
        constraints: p.constraints || [],
        topics: p.topics || ['Advanced Algorithms'],
        hints: p.hints || [],
        followUpQuestions: p.followUpQuestions || [],
        provider: response.provider,
        model: response.model
      }));
    } catch (error) {
      console.error('Error generating hard DSA problems:', error);
      return this.generateHardMockDSAProblems(count);
    }
  }

  // Convenience methods for different use cases (backward compatibility)
  public async generateInterviewQuestions(params: {
    jobTitle: string;
    companyName: string;
    skills: string[];
    interviewType: 'technical' | 'behavioral' | 'mixed';
    experienceLevel: 'entry' | 'mid' | 'senior';
    numberOfQuestions: number;
    companyIntelligence?: any;
  }): Promise<any[]> {
    // Default to hard questions
    return this.generateHardInterviewQuestions({
      ...params,
      difficultyLevel: 'hard'
    });
  }

  public async generateDSAProblems(
    companyName: string,
    difficulty: 'easy' | 'medium' | 'hard' = 'hard',
    count: number = 6,
    companyIntelligence?: any
  ): Promise<any[]> {
    // Default to hard DSA problems
    return this.generateHardDSAProblems(companyName, 'hard', count, companyIntelligence);
  }

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
    const systemMessage = `You are an expert interview evaluator providing constructive feedback for ${companyContext} interviews. 
    You are evaluating HARD-LEVEL questions, so be more strict in your scoring.`;
    
    const userMessage = `
      Analyze this interview response for a HARD-LEVEL question:
      
      Question (${category}): ${question}
      Expected Answer: ${expectedAnswer}
      Candidate Answer: ${userAnswer}
      Company Context: ${companyContext}
      
      Provide detailed analysis in JSON format (be strict for hard questions):
      {
        "score": (0-10 score, be more strict for hard questions),
        "feedback": "Constructive feedback paragraph with specific technical details",
        "suggestions": ["specific improvement suggestions for senior-level performance"],
        "strengths": ["what they did well"],
        "improvements": ["areas to improve for senior-level competency"]
      }
      
      Consider technical accuracy, communication clarity, completeness, company relevance, and senior-level expectations.
    `;

    try {
      const response = await this.callLLM({
        messages: [
          { role: 'system', content: systemMessage },
          { role: 'user', content: userMessage }
        ],
        model: 'llama-3.1-8b'
      });

      const analysis = extractJSON(response.content);
      return {
        score: Math.max(0, Math.min(10, analysis.score || 5)),
        feedback: analysis.feedback || 'Response analyzed successfully.',
        suggestions: analysis.suggestions || ['Continue practicing senior-level questions'],
        strengths: analysis.strengths || ['Attempted the question'],
        improvements: analysis.improvements || ['Add more technical depth and senior-level insights']
      };
    } catch (error) {
      console.error('Error analyzing response:', error);
      return this.generateMockAnalysis(userAnswer);
    }
  }

  // Mock fallback methods for hard questions
  private generateHardMockQuestions(params: any): any[] {
    const hardMockQuestions: any[] = [];
    
    for (let i = 0; i < params.numberOfQuestions; i++) {
      hardMockQuestions.push({
        id: `hard-mock-q-${i}`,
        question: `[HARD] Design and implement a scalable system for ${params.companyName} that handles ${params.skills[i % params.skills.length]} with high availability, fault tolerance, and handles 1M+ concurrent users. Discuss trade-offs, monitoring, and disaster recovery.`,
        expectedAnswer: `A comprehensive senior-level answer covering system architecture, scalability patterns, database sharding, caching strategies, load balancing, monitoring, disaster recovery, and specific implementation details for ${params.skills[i % params.skills.length]}.`,
        category: params.interviewType,
        difficulty: 'hard',
        points: 45,
        timeLimit: 12,
        evaluationCriteria: ['System Design Expertise', 'Scalability Knowledge', 'Real-world Application', 'Technical Depth'],
        tags: ['hard', 'senior-level', params.jobTitle, params.companyName, params.skills[i % params.skills.length]],
        hints: ['Think about distributed systems', 'Consider scalability patterns', 'Focus on fault tolerance'],
        provider: 'fallback',
        model: 'hard-mock'
      });
    }
    
    return hardMockQuestions;
  }

  private generateHardMockDSAProblems(count: number): any[] {
    const hardMockProblems: any[] = [];
    const hardProblemTemplates = [
      {
        title: "Multi-Dimensional Range Query Optimization",
        description: "Design a data structure that supports efficient range queries in a multi-dimensional space with dynamic updates, considering memory constraints and query optimization for distributed systems.",
        topics: ["Advanced Data Structures", "Optimization", "Distributed Systems"]
      },
      {
        title: "Real-time Stream Processing with Fault Tolerance", 
        description: "Implement a real-time data processing system that handles high-throughput streams with fault tolerance, exactly-once processing guarantees, and dynamic scaling.",
        topics: ["Stream Processing", "Fault Tolerance", "Distributed Algorithms"]
      },
      {
        title: "Dynamic Graph Algorithms with Memory Optimization",
        description: "Design algorithms for dynamic graph problems where nodes and edges are constantly being added/removed, optimizing for both time complexity and memory usage in constraint environments.",
        topics: ["Graph Algorithms", "Dynamic Programming", "Memory Optimization"]
      }
    ];

    for (let i = 0; i < count; i++) {
      const template = hardProblemTemplates[i % hardProblemTemplates.length];
      hardMockProblems.push({
        id: `hard-mock-dsa-${i}`,
        title: template.title,
        difficulty: 'hard',
        description: template.description,
        examples: [
          {
            input: 'Complex input with multiple constraints',
            output: 'Optimized output with complexity analysis',
            explanation: 'Detailed explanation with trade-offs and alternative approaches'
          }
        ],
        testCases: [
          {
            id: `hard-test-${i}-1`,
            input: 'Complex test input with edge cases',
            expectedOutput: 'Expected optimized output'
          }
        ],
        constraints: ['1 <= n <= 10^6', 'Memory limit: 256MB', 'Time limit: 2 seconds', 'Multiple constraints'],
        topics: template.topics,
        hints: ['Think about advanced data structures', 'Consider optimization techniques', 'Focus on scalability'],
        timeComplexity: 'O(n log n) or better',
        spaceComplexity: 'O(n)',
        followUpQuestions: ['How would you optimize for even larger datasets?', 'What if memory was more constrained?'],
        provider: 'fallback',
        model: 'hard-mock'
      });
    }
    
    return hardMockProblems;
  }

  private generateMockAnalysis(userAnswer: string) {
    const wordCount = userAnswer.split(' ').length;
    const score = Math.min(8, Math.max(3, wordCount / 15)); // Slightly lower scores for hard questions
    
    return {
      score,
      feedback: `Your response demonstrates ${score >= 6 ? 'good' : score >= 4 ? 'adequate' : 'basic'} understanding for a senior-level question. ${wordCount < 30 ? 'For hard questions, provide more comprehensive explanations with technical depth.' : 'Good level of detail provided, but consider adding more senior-level insights.'}`,
      suggestions: ['Add more technical depth and system design considerations', 'Structure your response with clear architecture decisions', 'Include scalability and performance considerations'],
      strengths: wordCount > 50 ? ['Comprehensive response', 'Good technical detail'] : ['Attempted the complex question'],
      improvements: wordCount < 30 ? ['Provide more detailed senior-level answers', 'Include specific technical examples', 'Discuss trade-offs and alternatives'] : ['Continue developing senior-level technical depth', 'Add more system design considerations']
    };
  }

  // Health check method
  public async healthCheck(): Promise<{ 
    availableProviders: string[];
    totalProviders: number;
    rateLimitStatus: { [key: string]: boolean };
  }> {
    const availableProviders: string[] = [];
    const rateLimitStatus: { [key: string]: boolean } = {};

    for (const provider of this.providers) {
      const canMakeRequest = this.canMakeRequest(provider.name);
      rateLimitStatus[provider.name] = canMakeRequest;
      
      if (canMakeRequest) {
        availableProviders.push(provider.name);
      }
    }

    return {
      availableProviders,
      totalProviders: this.providers.length,
      rateLimitStatus
    };
  }
}

export default FreeLLMService;