/**
 * Enhanced Interview AI Service - Rebuilt for Better Performance
 * Features:
 * - Multiple AI providers (Groq, Hugging Face, Gemini)
 * - Company research via web search for unknown companies
 * - Dynamic difficulty adjustment
 * - Better question generation with validation
 * - Comprehensive interview rounds management
 */

interface CompanyResearchData {
  name: string;
  industry: string;
  size: string;
  techStack: string[];
  interviewProcess: string[];
  difficulty: 'easy' | 'medium' | 'hard';
  focusAreas: string[];
  preparationTips: string[];
  commonQuestions: string[];
}

interface InterviewQuestion {
  id: string;
  question: string;
  expectedAnswer: string;
  category: 'technical' | 'behavioral' | 'dsa' | 'aptitude';
  difficulty: 'easy' | 'medium' | 'hard';
  points: number;
  timeLimit: number;
  evaluationCriteria: string[];
  tags: string[];
  hints: string[];
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
    explanation: string;
  }>;
  testCases: Array<{
    id: string;
    input: string;
    expectedOutput: string;
    hidden?: boolean;
  }>;
  constraints: string[];
  topics: string[];
  hints: string[];
  timeComplexity: string;
  spaceComplexity: string;
}

interface AptitudeQuestion {
  id: string;
  type: 'verbal' | 'numerical' | 'logical' | 'spatial';
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
  difficulty: 'easy' | 'medium' | 'hard';
  timeLimit: number;
}

interface InterviewRoundConfig {
  id: string;
  type: 'technical' | 'behavioral' | 'dsa' | 'aptitude';
  name: string;
  duration: number;
  questionCount: number;
  enabled: boolean;
  order: number;
}

export class EnhancedInterviewAI {
  private static instance: EnhancedInterviewAI;
  private groqApiKey: string;
  private huggingFaceApiKey: string;
  private geminiApiKey: string;
  private companyCache = new Map<string, CompanyResearchData>();

  private constructor() {
    this.groqApiKey = process.env.GROQ_API_KEY || process.env.NEXT_PUBLIC_GROQ_API_KEY || '';
    this.huggingFaceApiKey = process.env.HUGGINGFACE_API_KEY || process.env.NEXT_PUBLIC_HUGGINGFACE_API_KEY || '';
    this.geminiApiKey = process.env.GEMINI_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY || '';
    
    if (!this.groqApiKey && !this.huggingFaceApiKey && !this.geminiApiKey) {
      console.warn('No AI provider keys found - some features may be limited');
    }
  }

  public static getInstance(): EnhancedInterviewAI {
    if (!EnhancedInterviewAI.instance) {
      EnhancedInterviewAI.instance = new EnhancedInterviewAI();
    }
    return EnhancedInterviewAI.instance;
  }

  private async callAIProvider(messages: Array<{role: string; content: string}>, options?: {
    provider?: 'groq' | 'huggingface' | 'gemini';
    model?: string;
    temperature?: number;
    max_tokens?: number;
  }): Promise<string> {
    const provider = options?.provider || 'groq';
    
    try {
      switch (provider) {
        case 'groq':
          return await this.callGroqAPI(messages, options);
        case 'huggingface':
          return await this.callHuggingFaceAPI(messages, options);
        case 'gemini':
          return await this.callGeminiAPI(messages, options);
        default:
          throw new Error(`Unsupported provider: ${provider}`);
      }
    } catch (error) {
      console.error(`${provider} API call failed:`, error);
      // Fallback to next available provider
      if (provider === 'groq' && this.huggingFaceApiKey) {
        return await this.callHuggingFaceAPI(messages, options);
      } else if (provider === 'huggingface' && this.geminiApiKey) {
        return await this.callGeminiAPI(messages, options);
      }
      throw error;
    }
  }

  private async callGroqAPI(messages: Array<{role: string; content: string}>, options?: any): Promise<string> {
    if (!this.groqApiKey) {
      throw new Error('Groq API key not configured');
    }

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.groqApiKey}`,
      },
      body: JSON.stringify({
        model: options?.model || 'llama-3.1-8b-instant',
        messages,
        temperature: options?.temperature || 0.7,
        max_tokens: options?.max_tokens || 4000,
        stream: false,
      }),
    });

    if (!response.ok) {
      throw new Error(`Groq API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    return data.choices[0]?.message?.content || 'No response received';
  }

  private async callHuggingFaceAPI(messages: Array<{role: string; content: string}>, options?: any): Promise<string> {
    if (!this.huggingFaceApiKey) {
      throw new Error('Hugging Face API key not configured');
    }

    // Convert messages to a single prompt for Hugging Face
    const prompt = messages.map(m => `${m.role}: ${m.content}`).join('\n');

    const response = await fetch('https://api-inference.huggingface.co/models/microsoft/DialoGPT-large', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.huggingFaceApiKey}`,
      },
      body: JSON.stringify({
        inputs: prompt,
        parameters: {
          max_length: options?.max_tokens || 1000,
          temperature: options?.temperature || 0.7,
        },
      }),
    });

    if (!response.ok) {
      throw new Error(`Hugging Face API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    return data[0]?.generated_text || 'No response received';
  }

  private async callGeminiAPI(messages: Array<{role: string; content: string}>, options?: any): Promise<string> {
    if (!this.geminiApiKey) {
      throw new Error('Gemini API key not configured');
    }

    const { GoogleGenerativeAI } = await import('@google/generative-ai');
    const genAI = new GoogleGenerativeAI(this.geminiApiKey);
    const model = genAI.getGenerativeModel({ model: options?.model || 'gemini-pro' });

    // Convert messages to Gemini format
    const prompt = messages.map(m => m.content).join('\n');
    
    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  }

  /**
   * Research company information using web search for unknown companies
   */
  public async researchCompany(companyName: string): Promise<CompanyResearchData> {
    // Check cache first
    const cacheKey = companyName.toLowerCase().trim();
    if (this.companyCache.has(cacheKey)) {
      return this.companyCache.get(cacheKey)!;
    }

    try {
      // Try web search for company information
      const searchResponse = await fetch(`https://api.search.brave.com/res/v1/web/search?q=${encodeURIComponent(companyName + ' company interview process tech stack')}&count=5`, {
        headers: {
          'X-Subscription-Token': 'BSAqGzMj9w_f_VWfCBPnHG8kU_N8Cmu', // Demo token - replace with actual if available
        }
      }).catch(() => null);

      let webContext = '';
      if (searchResponse?.ok) {
        const searchData = await searchResponse.json();
        webContext = searchData.web?.results?.slice(0, 3).map((r: any) => 
          `${r.title}: ${r.description}`
        ).join(' ') || '';
      }

      // Use AI to analyze and structure company data
      const systemMessage = `You are a company research expert. Analyze the provided information about ${companyName} and structure it into company data for interview preparation.`;
      
      const userMessage = `
        Research ${companyName} and provide structured company information:
        
        ${webContext ? `Web Search Context: ${webContext}` : ''}
        
        Please provide detailed company information in this JSON format:
        {
          "name": "${companyName}",
          "industry": "specific industry sector",
          "size": "startup|small|medium|large|enterprise",
          "techStack": ["technology1", "technology2", "etc"],
          "interviewProcess": ["process step 1", "process step 2"],
          "difficulty": "easy|medium|hard",
          "focusAreas": ["focus area 1", "focus area 2"],
          "preparationTips": ["tip 1", "tip 2", "tip 3"],
          "commonQuestions": ["common question 1", "common question 2"]
        }
        
        If you don't have specific information, make educated guesses based on:
        - Company name and typical industry patterns
        - Common tech stacks for companies in similar sectors
        - Standard interview processes for tech companies
        
        Ensure all arrays have at least 3-5 relevant items.
      `;

      const response = await this.callAIProvider([
        { role: 'system', content: systemMessage },
        { role: 'user', content: userMessage }
      ], { provider: 'groq', model: 'llama-3.1-8b-instant' });

      const companyData = JSON.parse(response.replace(/```json\n?|\n?```/g, ''));
      
      // Validate and enhance the data
      const enhancedData: CompanyResearchData = {
        name: companyData.name || companyName,
        industry: companyData.industry || 'Technology',
        size: companyData.size || 'medium',
        techStack: Array.isArray(companyData.techStack) ? companyData.techStack : ['JavaScript', 'React', 'Node.js'],
        interviewProcess: Array.isArray(companyData.interviewProcess) ? companyData.interviewProcess : ['Phone Screening', 'Technical Interview', 'System Design', 'Cultural Fit'],
        difficulty: companyData.difficulty || 'medium',
        focusAreas: Array.isArray(companyData.focusAreas) ? companyData.focusAreas : ['Problem Solving', 'System Design', 'Communication'],
        preparationTips: Array.isArray(companyData.preparationTips) ? companyData.preparationTips : ['Practice coding problems', 'Understand system design basics', 'Research company values'],
        commonQuestions: Array.isArray(companyData.commonQuestions) ? companyData.commonQuestions : ['Tell me about yourself', 'Why do you want to work here?', 'Describe a challenging project']
      };

      // Cache the result
      this.companyCache.set(cacheKey, enhancedData);
      return enhancedData;

    } catch (error) {
      console.error('Error researching company:', error);
      
      // Return default company data as fallback
      const fallbackData: CompanyResearchData = {
        name: companyName,
        industry: 'Technology',
        size: 'medium',
        techStack: ['JavaScript', 'React', 'Node.js', 'Python', 'SQL'],
        interviewProcess: ['Phone Screening', 'Technical Interview', 'System Design', 'Final Round'],
        difficulty: 'medium',
        focusAreas: ['Problem Solving', 'Technical Skills', 'Communication', 'Cultural Fit'],
        preparationTips: [
          'Practice coding problems on LeetCode',
          'Review system design fundamentals',
          'Prepare behavioral questions with STAR method',
          'Research the company and its products'
        ],
        commonQuestions: [
          'Tell me about yourself',
          'Why do you want to work here?',
          'Describe a challenging project you worked on',
          'How do you handle conflicts in a team?'
        ]
      };

      this.companyCache.set(cacheKey, fallbackData);
      return fallbackData;
    }
  }

  /**
   * Generate comprehensive interview questions with dynamic difficulty
   */
  public async generateInterviewQuestions(params: {
    companyName: string;
    jobTitle: string;
    skills: string[];
    experienceLevel: 'entry' | 'mid' | 'senior';
    rounds: InterviewRoundConfig[];
  }): Promise<{[roundType: string]: InterviewQuestion[]}> {
    const companyData = await this.researchCompany(params.companyName);
    const questionsByRound: {[roundType: string]: InterviewQuestion[]} = {};

    for (const round of params.rounds) {
      if (!round.enabled) continue;

      const systemMessage = `You are an expert ${round.type} interviewer for ${params.companyName}. Generate high-quality, company-specific interview questions.`;
      
      const userMessage = `
        Generate exactly ${round.questionCount} ${round.type} interview questions for:
        
        Company: ${params.companyName} (${companyData.industry}, ${companyData.size} company)
        Position: ${params.jobTitle}
        Experience Level: ${params.experienceLevel}
        Skills Required: ${params.skills.join(', ')}
        Company Tech Stack: ${companyData.techStack.join(', ')}
        Company Focus Areas: ${companyData.focusAreas.join(', ')}
        
        Difficulty Adjustment:
        - Entry level: Focus on fundamentals and basic concepts
        - Mid level: Include practical scenarios and problem-solving
        - Senior level: Emphasize system design, leadership, and complex problem-solving
        
        For ${companyData.name}:
        - Company Size: ${companyData.size}
        - Industry: ${companyData.industry}
        - Difficulty Level: ${companyData.difficulty}
        
        Return as JSON array:
        [
          {
            "id": "unique-question-id",
            "question": "Interview question text",
            "expectedAnswer": "Comprehensive expected answer with key points to look for",
            "category": "${round.type}",
            "difficulty": "easy|medium|hard",
            "points": 10,
            "timeLimit": ${round.duration / round.questionCount},
            "evaluationCriteria": ["specific criteria 1", "criteria 2", "criteria 3"],
            "tags": ["relevant", "tags", "for", "question"],
            "hints": ["helpful hint if candidate struggles"],
            "companyRelevance": 8
          }
        ]
        
        Requirements:
        - Questions should be directly relevant to ${params.companyName}
        - Include scenarios specific to ${companyData.industry}
        - Reference technologies from their stack when appropriate
        - Difficulty should match ${params.experienceLevel} level
        - Questions should test skills: ${params.skills.join(', ')}
      `;

      try {
        const response = await this.callAIProvider([
          { role: 'system', content: systemMessage },
          { role: 'user', content: userMessage }
        ], { provider: 'groq', model: 'llama-3.1-8b-instant' });

        const questions = JSON.parse(response.replace(/```json\n?|\n?```/g, ''));
        
        questionsByRound[round.type] = questions.map((q: any, index: number) => ({
          id: q.id || `${round.type}-${Date.now()}-${index}`,
          question: q.question || `Sample ${round.type} question ${index + 1}`,
          expectedAnswer: q.expectedAnswer || 'Expected answer not provided',
          category: round.type,
          difficulty: q.difficulty || this.getDifficultyForLevel(params.experienceLevel),
          points: q.points || 10,
          timeLimit: q.timeLimit || Math.ceil(round.duration / round.questionCount),
          evaluationCriteria: q.evaluationCriteria || ['Accuracy', 'Clarity', 'Completeness'],
          tags: q.tags || [params.jobTitle, params.companyName, round.type],
          hints: q.hints || ['Take your time to think through the problem'],
          companyRelevance: q.companyRelevance || 7
        }));

      } catch (error) {
        console.error(`Error generating ${round.type} questions:`, error);
        questionsByRound[round.type] = this.generateFallbackQuestions(round, params, companyData);
      }
    }

    return questionsByRound;
  }

  /**
   * Generate DSA problems with company-specific focus
   */
  public async generateDSAProblems(
    companyName: string,
    difficulty: 'easy' | 'medium' | 'hard',
    count: number = 3
  ): Promise<DSAProblem[]> {
    const companyData = await this.researchCompany(companyName);
    
    const systemMessage = `You are an expert DSA interviewer specializing in creating diverse, company-relevant coding problems. Generate problems that test different algorithmic concepts and data structures.`;
    
    const userMessage = `
      Generate exactly ${count} unique and varied DSA problems for ${companyName}:
      
      Requirements:
      - Difficulty: ${difficulty}
      - Company: ${companyName} (${companyData.industry} industry)
      - Each problem should test DIFFERENT algorithmic concepts
      - Include variety: arrays, trees, graphs, dynamic programming, strings, etc.
      - Problems should reflect real-world scenarios from ${companyData.industry}
      - Include comprehensive test cases (at least 3-4 per problem)
      - Provide progressive hints
      
      Ensure variety across these categories:
      1. Array/String manipulation (Two Sum, Sliding Window, etc.)
      2. Tree/Graph problems (DFS, BFS, Tree traversal)
      3. Dynamic Programming (Fibonacci, Coin Change, etc.)
      4. System Design related (Rate Limiter, Cache, etc.)
      5. String algorithms (Pattern matching, parsing)
      
      Return as JSON array:
      [
        {
          "id": "unique-problem-id-${Date.now()}",
          "title": "Descriptive Problem Title",
          "difficulty": "${difficulty}",
          "description": "Clear, detailed problem description with context relevant to ${companyData.industry}. Include what the function should do, input/output format, and any special conditions.",
          "examples": [
            {
              "input": "Clear example input",
              "output": "Expected output",
              "explanation": "Step-by-step explanation of how we get the output"
            },
            {
              "input": "Second example input",
              "output": "Expected output for second example",
              "explanation": "Explanation for the second example"
            }
          ],
          "testCases": [
            {
              "id": "test-1",
              "input": "test input matching examples",
              "expectedOutput": "expected result",
              "hidden": false
            },
            {
              "id": "test-2",
              "input": "edge case test",
              "expectedOutput": "expected result for edge case",
              "hidden": false
            },
            {
              "id": "test-3",
              "input": "complex test case",
              "expectedOutput": "expected result for complex case",
              "hidden": true
            }
          ],
          "constraints": ["Specific constraint 1", "Specific constraint 2", "Performance constraint"],
          "topics": ["Primary topic", "Secondary topic"],
          "hints": ["Initial gentle hint", "More specific hint", "Almost giving away hint"],
          "timeComplexity": "Expected optimal time complexity",
          "spaceComplexity": "Expected space complexity"
        }
      ]
      
      Make each problem unique and interesting, avoiding generic LeetCode copies. Focus on practical scenarios that ${companyName} engineers might encounter.
    `;

    try {
      const response = await this.callAIProvider([
        { role: 'system', content: systemMessage },
        { role: 'user', content: userMessage }
      ], { provider: 'groq', model: 'llama-3.1-8b-instant', temperature: 0.8, max_tokens: 6000 });

      const problems = JSON.parse(response.replace(/```json\n?|\n?```/g, ''));
      return problems.map((p: any, index: number) => ({
        ...p,
        id: p.id || `dsa-${Date.now()}-${index}`,
        difficulty,
        examples: Array.isArray(p.examples) ? p.examples : [],
        testCases: Array.isArray(p.testCases) ? p.testCases : [],
        constraints: Array.isArray(p.constraints) ? p.constraints : [],
        topics: Array.isArray(p.topics) ? p.topics : ['Array'],
        hints: Array.isArray(p.hints) ? p.hints : []
      }));
    } catch (error) {
      console.error('Error generating DSA problems:', error);
      return this.generateFallbackDSAProblems(difficulty, count);
    }
  }

  /**
   * Generate aptitude questions
   */
  public async generateAptitudeQuestions(
    types: string[],
    difficulty: 'easy' | 'medium' | 'hard',
    count: number = 10
  ): Promise<AptitudeQuestion[]> {
    const systemMessage = `You are an aptitude test expert. Generate high-quality aptitude questions.`;
    
    const userMessage = `
      Generate exactly ${count} aptitude questions:
      
      Types: ${types.join(', ')}
      Difficulty: ${difficulty}
      
      Distribute evenly across types.
      
      Return as JSON array:
      [
        {
          "id": "unique-id",
          "type": "verbal|numerical|logical|spatial",
          "question": "Question text",
          "options": ["option 1", "option 2", "option 3", "option 4"],
          "correctAnswer": 0,
          "explanation": "Why this is correct",
          "difficulty": "${difficulty}",
          "timeLimit": 60
        }
      ]
    `;

    try {
      const response = await this.callAIProvider([
        { role: 'system', content: systemMessage },
        { role: 'user', content: userMessage }
      ], { provider: 'groq', model: 'llama-3.1-8b-instant' });

      const questions = JSON.parse(response.replace(/```json\n?|\n?```/g, ''));
      return questions.map((q: any, index: number) => ({
        ...q,
        id: q.id || `apt-${Date.now()}-${index}`
      }));
    } catch (error) {
      console.error('Error generating aptitude questions:', error);
      return this.generateFallbackAptitudeQuestions(types, difficulty, count);
    }
  }

  private getDifficultyForLevel(level: string): 'easy' | 'medium' | 'hard' {
    switch (level) {
      case 'entry': return 'easy';
      case 'senior': return 'hard';
      default: return 'medium';
    }
  }

  private generateFallbackQuestions(round: InterviewRoundConfig, params: any, companyData: CompanyResearchData): InterviewQuestion[] {
    const questions: InterviewQuestion[] = [];
    
    for (let i = 0; i < round.questionCount; i++) {
      questions.push({
        id: `fallback-${round.type}-${i}`,
        question: `Tell me about your experience with ${params.skills[i % params.skills.length]} at ${params.companyName}.`,
        expectedAnswer: `Comprehensive answer covering experience with ${params.skills[i % params.skills.length]}.`,
        category: round.type as any,
        difficulty: this.getDifficultyForLevel(params.experienceLevel),
        points: 10,
        timeLimit: Math.ceil(round.duration / round.questionCount),
        evaluationCriteria: ['Technical accuracy', 'Communication', 'Real-world application'],
        tags: [params.jobTitle, params.companyName, round.type],
        hints: ['Think about specific projects and outcomes'],
        companyRelevance: 6
      });
    }
    
    return questions;
  }

  private generateFallbackDSAProblems(difficulty: string, count: number): DSAProblem[] {
    const problems: DSAProblem[] = [];
    const templates = [
      {
        title: 'Two Sum Problem',
        topics: ['Array', 'Hash Table'],
        description: 'Given an array of integers and a target sum, find two numbers that add up to the target.',
        examples: [
          { input: 'nums = [2,7,11,15], target = 9', output: '[0,1]', explanation: 'nums[0] + nums[1] = 2 + 7 = 9' }
        ],
        testCases: [
          { id: 'test1', input: 'nums = [2,7,11,15], target = 9', expectedOutput: '[0,1]' },
          { id: 'test2', input: 'nums = [3,2,4], target = 6', expectedOutput: '[1,2]' }
        ],
        constraints: ['2 ≤ nums.length ≤ 10^4', '-10^9 ≤ nums[i] ≤ 10^9'],
        hints: ['Use a hash map to store complements', 'For each number x, look for target - x']
      },
      {
        title: 'Valid Parentheses',
        topics: ['String', 'Stack'],
        description: 'Determine if a string of parentheses is valid. Open brackets must be closed by the same type in correct order.',
        examples: [
          { input: 's = "()"', output: 'true', explanation: 'The parentheses are properly matched' },
          { input: 's = "([)]"', output: 'false', explanation: 'Brackets are not properly nested' }
        ],
        testCases: [
          { id: 'test1', input: 's = "()"', expectedOutput: 'true' },
          { id: 'test2', input: 's = "()[]{}"', expectedOutput: 'true' },
          { id: 'test3', input: 's = "(]"', expectedOutput: 'false' }
        ],
        constraints: ['1 ≤ s.length ≤ 10^4', 's consists of parentheses only'],
        hints: ['Use a stack to track opening brackets', 'Match each closing bracket with the most recent opening']
      },
      {
        title: 'Binary Tree Level Order Traversal',
        topics: ['Tree', 'BFS', 'Queue'],
        description: 'Given a binary tree, return the level order traversal of its nodes\' values (left to right, level by level).',
        examples: [
          { input: 'root = [3,9,20,null,null,15,7]', output: '[[3],[9,20],[15,7]]', explanation: 'Level 1: [3], Level 2: [9,20], Level 3: [15,7]' }
        ],
        testCases: [
          { id: 'test1', input: 'root = [3,9,20,null,null,15,7]', expectedOutput: '[[3],[9,20],[15,7]]' },
          { id: 'test2', input: 'root = [1]', expectedOutput: '[[1]]' }
        ],
        constraints: ['Number of nodes ≤ 2000', '-1000 ≤ Node.val ≤ 1000'],
        hints: ['Use BFS with a queue', 'Process nodes level by level', 'Track level boundaries']
      },
      {
        title: 'Maximum Subarray Sum',
        topics: ['Array', 'Dynamic Programming'],
        description: 'Find the contiguous subarray with the largest sum and return its sum.',
        examples: [
          { input: 'nums = [-2,1,-3,4,-1,2,1,-5,4]', output: '6', explanation: 'Subarray [4,-1,2,1] has the largest sum 6' }
        ],
        testCases: [
          { id: 'test1', input: 'nums = [-2,1,-3,4,-1,2,1,-5,4]', expectedOutput: '6' },
          { id: 'test2', input: 'nums = [1]', expectedOutput: '1' }
        ],
        constraints: ['1 ≤ nums.length ≤ 10^5', '-10^4 ≤ nums[i] ≤ 10^4'],
        hints: ['Use Kadane\'s algorithm', 'Keep track of current and maximum sum', 'Reset current sum when it becomes negative']
      },
      {
        title: 'Merge Intervals',
        topics: ['Array', 'Sorting'],
        description: 'Given intervals, merge all overlapping intervals and return non-overlapping intervals.',
        examples: [
          { input: 'intervals = [[1,3],[2,6],[8,10],[15,18]]', output: '[[1,6],[8,10],[15,18]]', explanation: '[1,3] and [2,6] overlap, so merge to [1,6]' }
        ],
        testCases: [
          { id: 'test1', input: 'intervals = [[1,3],[2,6],[8,10],[15,18]]', expectedOutput: '[[1,6],[8,10],[15,18]]' },
          { id: 'test2', input: 'intervals = [[1,4],[4,5]]', expectedOutput: '[[1,5]]' }
        ],
        constraints: ['1 ≤ intervals.length ≤ 10^4', 'intervals[i].length == 2'],
        hints: ['Sort intervals by start time', 'Iterate and merge overlapping intervals', 'Two intervals overlap if start2 ≤ end1']
      },
      {
        title: 'Longest Palindromic Substring',
        topics: ['String', 'Dynamic Programming'],
        description: 'Given a string, find the longest palindromic substring.',
        examples: [
          { input: 's = "babad"', output: '"bab"', explanation: '"aba" is also a valid answer' },
          { input: 's = "cbbd"', output: '"bb"', explanation: 'The longest palindrome is "bb"' }
        ],
        testCases: [
          { id: 'test1', input: 's = "babad"', expectedOutput: '"bab"' },
          { id: 'test2', input: 's = "cbbd"', expectedOutput: '"bb"' }
        ],
        constraints: ['1 ≤ s.length ≤ 1000', 's consists of digits and letters'],
        hints: ['Expand around centers', 'Check both odd and even length palindromes', 'Use dynamic programming for optimization']
      }
    ];

    for (let i = 0; i < count; i++) {
      const template = templates[i % templates.length];
      problems.push({
        id: `fallback-dsa-${Date.now()}-${i}`,
        title: template.title,
        difficulty: difficulty as any,
        description: template.description,
        examples: template.examples,
        testCases: template.testCases,
        constraints: template.constraints,
        topics: template.topics,
        hints: template.hints,
        timeComplexity: 'O(n)',
        spaceComplexity: 'O(1)'
      });
    }

    return problems;
  }

  private generateFallbackAptitudeQuestions(types: string[], difficulty: string, count: number): AptitudeQuestion[] {
    const questions: AptitudeQuestion[] = [];
    
    for (let i = 0; i < count; i++) {
      const type = types[i % types.length] as any;
      questions.push({
        id: `fallback-apt-${i}`,
        type,
        question: `This is a ${difficulty} level ${type} question.`,
        options: ['Option A', 'Option B', 'Option C', 'Option D'],
        correctAnswer: 0,
        explanation: 'This is the correct answer.',
        difficulty: difficulty as any,
        timeLimit: 60
      });
    }

    return questions;
  }
}

export default EnhancedInterviewAI;