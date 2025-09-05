/**
 * Free LLM Service - Vercel Compatible
 * Uses Together.ai, Groq, and Hugging Face as completely free alternatives
 * No rate limits issues, better consistency, enhanced reliability
 */

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
        apiUrl: 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent',
        apiKey: process.env.GEMINI_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY || '',
        models: {
          'gemini-pro': 'gemini-pro',
          'gemini-1.5-flash': 'gemini-1.5-flash'
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
          'mistral-7b': 'mistralai/Mistral-7B-Instruct-v0.1',
          'llama-2-7b': 'meta-llama/Llama-2-7b-chat-hf'
        },
        rateLimits: {
          requestsPerMinute: 10,
          requestsPerDay: 1000
        },
        priority: 3
      });
    }

    // Emergent LLM - FALLBACK Provider (Premium quality, pay-per-use)
    if (process.env.EMERGENT_LLM_KEY || process.env.NEXT_PUBLIC_EMERGENT_LLM_KEY) {
      this.providers.push({
        name: 'emergent',
        apiUrl: 'https://integrations.emergentagent.com/api/v1/llm/chat',
        apiKey: process.env.EMERGENT_LLM_KEY || process.env.NEXT_PUBLIC_EMERGENT_LLM_KEY || '',
        models: {
          'gpt-4o-mini': 'gpt-4o-mini',
          'gpt-4o': 'gpt-4o',
          'claude-3-haiku': 'claude-3-haiku'
        },
        rateLimits: {
          requestsPerMinute: 100,
          requestsPerDay: 10000
        },
        priority: 4
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
    } else if (provider.name === 'emergent') {
      return this.callEmergent(provider, request, modelName);
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

  private async callEmergent(provider: ProviderConfig, request: LLMRequest, modelName: string): Promise<LLMResponse> {
    const response = await fetch(provider.apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${provider.apiKey}`,
      },
      body: JSON.stringify({
        messages: request.messages,
        model: modelName,
        max_tokens: request.max_tokens || 4000,
        temperature: request.temperature || 0.7,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Emergent API error: ${response.status} ${response.statusText} - ${errorText}`);
    }

    const data = await response.json();
    
    if (data.content || data.message) {
      return {
        content: data.content || data.message,
        provider: provider.name,
        model: modelName,
        usage: data.usage
      };
    } else {
      throw new Error(`Invalid response format from Emergent: ${JSON.stringify(data)}`);
    }
  }

  // Convenience methods for different use cases
  public async generateInterviewQuestions(params: {
    jobTitle: string;
    companyName: string;
    skills: string[];
    interviewType: 'technical' | 'behavioral' | 'mixed';
    experienceLevel: 'entry' | 'mid' | 'senior';
    numberOfQuestions: number;
    companyIntelligence?: any;
  }): Promise<any[]> {
    const systemMessage = `You are an expert interview question generator specializing in ${params.interviewType} interviews for ${params.companyName}.`;
    
    let userMessage = `
      Generate exactly ${params.numberOfQuestions} high-quality ${params.interviewType} interview questions for:
      
      Position: ${params.jobTitle} at ${params.companyName}
      Experience Level: ${params.experienceLevel}
      Required Skills: ${params.skills.join(', ')}
      
      ${params.companyIntelligence ? `
      Company Context:
      - Industry: ${params.companyIntelligence.industry}
      - Tech Stack: ${params.companyIntelligence.tech_stack?.join(', ') || 'Not specified'}
      - Recent News: ${params.companyIntelligence.recent_news?.slice(0, 2).join(', ') || 'No recent updates'}
      - Culture: ${params.companyIntelligence.culture?.join(', ') || 'Innovation-focused'}
      ` : ''}
      
      Requirements:
      - Questions should be relevant to ${params.companyName} and current industry trends
      - Appropriate difficulty for ${params.experienceLevel} level
      - Include comprehensive expected answers
      - Provide evaluation criteria
      ${params.companyIntelligence?.recent_news ? '- Incorporate recent company developments where relevant' : ''}
      
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
      const response = await this.callLLM({
        messages: [
          { role: 'system', content: systemMessage },
          { role: 'user', content: userMessage }
        ],
        model: 'llama-3.1-8b'
      });

      const questions = JSON.parse(response.content.replace(/```json\n?|\n?```/g, ''));
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
      console.error('Error generating interview questions:', error);
      return this.generateMockQuestions(params);
    }
  }

  public async generateDSAProblems(
    companyName: string,
    difficulty: 'easy' | 'medium' | 'hard' = 'medium',
    count: number = 6,
    companyIntelligence?: any
  ): Promise<any[]> {
    const systemMessage = `You are an expert DSA problem generator specializing in creating interview problems for ${companyName}.`;
    
    const userMessage = `
      Generate exactly ${count} unique, high-quality DSA problems for ${companyName} interviews.
      
      Requirements:
      - Difficulty: ${difficulty}
      - Each problem should be unique and test different concepts
      - Include comprehensive test cases and examples
      - Provide helpful hints and complexity analysis
      - Make problems realistic for actual ${companyName} interviews
      ${companyIntelligence?.tech_stack ? `- Consider company's tech stack: ${companyIntelligence.tech_stack.join(', ')}` : ''}
      
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
      const response = await this.callLLM({
        messages: [
          { role: 'system', content: systemMessage },
          { role: 'user', content: userMessage }
        ],
        model: 'llama-3.1-8b'
      });

      const problems = JSON.parse(response.content.replace(/```json\n?|\n?```/g, ''));
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
      console.error('Error generating DSA problems:', error);
      return this.generateMockDSAProblems(difficulty, count);
    }
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
      const response = await this.callLLM({
        messages: [
          { role: 'system', content: systemMessage },
          { role: 'user', content: userMessage }
        ],
        model: 'llama-3.1-8b'
      });

      const analysis = JSON.parse(response.content.replace(/```json\n?|\n?```/g, ''));
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
  private generateMockQuestions(params: any): any[] {
    const mockQuestions: any[] = [];
    
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
        hints: ['Think about specific projects and outcomes'],
        provider: 'fallback',
        model: 'mock'
      });
    }
    
    return mockQuestions;
  }

  private generateMockDSAProblems(difficulty: string, count: number): any[] {
    const mockProblems: any[] = [];
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
        spaceComplexity: 'O(1)',
        provider: 'fallback',
        model: 'mock'
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