import { GoogleGenerativeAI } from '@google/generative-ai';
import { extractJSON } from './jsonExtractor';

interface QuestionGenerationParams {
  jobTitle: string;
  companyName: string;
  skills: string[];
  jobDescription?: string;
  experienceLevel: 'entry' | 'mid' | 'senior' | 'lead';
  interviewType: 'technical' | 'behavioral' | 'dsa' | 'aptitude' | 'mixed';
  resumeContent?: string;
  numberOfQuestions: number;
  difficultyDistribution?: {
    easy: number;
    medium: number;
    hard: number;
  };
}

interface EnhancedQuestion {
  id: string;
  question: string;
  expectedAnswer: string;
  category: 'technical' | 'behavioral' | 'dsa' | 'aptitude' | 'system_design';
  difficulty: 'easy' | 'medium' | 'hard';
  points: number;
  timeLimit?: number; // in minutes
  followUpQuestions?: string[];
  evaluationCriteria: string[];
  companyRelevance: number; // 1-10 scale
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
  companies?: string[];
}

interface AptitudeQuestion {
  id: string;
  type: 'verbal' | 'numerical' | 'logical' | 'spatial';
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
  difficulty: 'easy' | 'medium' | 'hard';
  timeLimit: number; // in seconds
}

export class EnhancedAIService {
  private static instance: EnhancedAIService;
  private genAI: GoogleGenerativeAI;
  private apiKey: string;

  private constructor() {
    this.apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY || process.env.GEMINI_API_KEY || '';
    if (!this.apiKey) {
      console.warn('Gemini API key not found, using mock responses');
    }
    this.genAI = new GoogleGenerativeAI(this.apiKey);
  }

  public static getInstance(): EnhancedAIService {
    if (!EnhancedAIService.instance) {
      EnhancedAIService.instance = new EnhancedAIService();
    }
    return EnhancedAIService.instance;
  }

  // Generate comprehensive interview questions
  public async generateEnhancedQuestions(params: QuestionGenerationParams): Promise<EnhancedQuestion[]> {
    if (!this.apiKey) {
      return this.generateMockQuestions(params);
    }

    try {
      const model = this.genAI.getGenerativeModel({ model: 'gemini-pro' });

      const prompt = this.buildQuestionGenerationPrompt(params);
      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      try {
        const questions = extractJSON(text);
        return this.validateAndEnhanceQuestions(questions, params);
      } catch (parseError) {
        console.error('Error parsing AI response:', parseError);
        return this.generateMockQuestions(params);
      }
    } catch (error) {
      console.error('Error generating questions with AI:', error);
      return this.generateMockQuestions(params);
    }
  }

  // Generate DSA problems
  public async generateDSAProblems(
    companyName: string,
    difficulty: 'easy' | 'medium' | 'hard',
    topics: string[],
    count: number = 3
  ): Promise<DSAProblem[]> {
    if (!this.apiKey) {
      return this.generateMockDSAProblems(difficulty, count);
    }

    try {
      const model = this.genAI.getGenerativeModel({ model: 'gemini-pro' });

      const prompt = `
        Generate ${count} high-quality DSA problems for ${companyName} interview.
        
        Requirements:
        - Difficulty: ${difficulty}
        - Topics: ${topics.join(', ')}
        - Each problem should be realistic and company-appropriate
        - Include comprehensive test cases
        - Provide hints for guidance
        
        Return JSON array with this structure:
        [
          {
            "id": "unique-problem-id",
            "title": "Problem Title",
            "difficulty": "${difficulty}",
            "description": "Clear problem description with examples",
            "examples": [
              {
                "input": "sample input",
                "output": "expected output",
                "explanation": "why this is the output"
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
            "topics": ["relevant topics"],
            "hints": ["helpful hint 1", "helpful hint 2"],
            "timeComplexity": "O(n)",
            "spaceComplexity": "O(1)",
            "companies": ["${companyName}"]
          }
        ]
      `;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      try {
        const problems = JSON.parse(text.replace(/```json\n?|\n?```/g, ''));
        return problems.map((p: any) => ({
          ...p,
          id: p.id || `dsa-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
        }));
      } catch (parseError) {
        console.error('Error parsing DSA problems:', parseError);
        return this.generateMockDSAProblems(difficulty, count);
      }
    } catch (error) {
      console.error('Error generating DSA problems:', error);
      return this.generateMockDSAProblems(difficulty, count);
    }
  }

  // Generate aptitude questions
  public async generateAptitudeQuestions(
    types: ('verbal' | 'numerical' | 'logical' | 'spatial')[],
    difficulty: 'easy' | 'medium' | 'hard',
    count: number = 10
  ): Promise<AptitudeQuestion[]> {
    if (!this.apiKey) {
      return this.generateMockAptitudeQuestions(types, difficulty, count);
    }

    try {
      const model = this.genAI.getGenerativeModel({ model: 'gemini-pro' });

      const prompt = `
        Generate ${count} high-quality aptitude questions.
        
        Requirements:
        - Types: ${types.join(', ')}
        - Difficulty: ${difficulty}
        - Mix of question types evenly
        - Realistic time limits
        - Clear explanations
        
        Return JSON array:
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

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      try {
        const questions = JSON.parse(text.replace(/```json\n?|\n?```/g, ''));
        return questions.map((q: any) => ({
          ...q,
          id: q.id || `apt-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
        }));
      } catch (parseError) {
        console.error('Error parsing aptitude questions:', parseError);
        return this.generateMockAptitudeQuestions(types, difficulty, count);
      }
    } catch (error) {
      console.error('Error generating aptitude questions:', error);
      return this.generateMockAptitudeQuestions(types, difficulty, count);
    }
  }

  // Real-time interview analysis
  public async analyzeResponse(
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
    if (!this.apiKey) {
      return this.generateMockAnalysis(userAnswer);
    }

    try {
      const model = this.genAI.getGenerativeModel({ model: 'gemini-pro' });

      const prompt = `
        Analyze this interview response for ${companyContext}:
        
        Question (${category}): ${question}
        Expected Answer: ${expectedAnswer}
        User Answer: ${userAnswer}
        
        Provide detailed analysis in JSON format:
        {
          "score": (0-10 score),
          "feedback": "Constructive feedback paragraph",
          "suggestions": ["specific improvement suggestions"],
          "strengths": ["what they did well"],
          "improvements": ["areas to improve"]
        }
        
        Consider:
        - Technical accuracy
        - Communication clarity
        - Completeness of answer
        - Relevance to company context
        - Problem-solving approach
      `;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      try {
        const analysis = JSON.parse(text.replace(/```json\n?|\n?```/g, ''));
        return {
          score: Math.max(0, Math.min(10, analysis.score || 5)),
          feedback: analysis.feedback || 'Response analyzed successfully.',
          suggestions: analysis.suggestions || ['Continue practicing similar questions'],
          strengths: analysis.strengths || ['Attempted the question'],
          improvements: analysis.improvements || ['Add more detail to responses']
        };
      } catch (parseError) {
        return this.generateMockAnalysis(userAnswer);
      }
    } catch (error) {
      console.error('Error analyzing response:', error);
      return this.generateMockAnalysis(userAnswer);
    }
  }

  // Private helper methods
  private buildQuestionGenerationPrompt(params: QuestionGenerationParams): string {
    return `
      Generate ${params.numberOfQuestions} high-quality interview questions for:
      
      Position: ${params.jobTitle} at ${params.companyName}
      Experience Level: ${params.experienceLevel}
      Interview Type: ${params.interviewType}
      Required Skills: ${params.skills.join(', ')}
      ${params.jobDescription ? `Job Description: ${params.jobDescription}` : ''}
      ${params.resumeContent ? `Candidate Background: ${params.resumeContent}` : ''}
      
      Generate questions in JSON format:
      [
        {
          "id": "unique-question-id",
          "question": "Interview question text",
          "expectedAnswer": "Comprehensive expected answer with key points",
          "category": "technical|behavioral|system_design",
          "difficulty": "easy|medium|hard",
          "points": 10,
          "timeLimit": 5,
          "followUpQuestions": ["follow up question 1"],
          "evaluationCriteria": ["criteria 1", "criteria 2"],
          "companyRelevance": 8,
          "tags": ["relevant", "tags"],
          "hints": ["helpful hint if needed"]
        }
      ]
      
      Requirements:
      - Questions should be specific to ${params.companyName} and ${params.jobTitle}
      - Mix of difficulty levels appropriate for ${params.experienceLevel} level
      - Include both technical and behavioral aspects for mixed interviews
      - Provide realistic expected answers
      - Include evaluation criteria for fair assessment
      - Add company-relevant context and scenarios
      - Ensure questions test the specified skills: ${params.skills.join(', ')}
      
      ${params.interviewType === 'mixed' ? 
        `Distribute questions across categories:
        - 40% Technical questions
        - 30% Behavioral questions  
        - 20% Problem-solving scenarios
        - 10% Company/role specific questions` : 
        `Focus primarily on ${params.interviewType} questions with high relevance to the role.`
      }
    `;
  }

  private validateAndEnhanceQuestions(questions: any[], params: QuestionGenerationParams): EnhancedQuestion[] {
    return questions.map((q, index) => ({
      id: q.id || `q-${Date.now()}-${index}`,
      question: q.question || `Sample question ${index + 1}`,
      expectedAnswer: q.expectedAnswer || 'Expected answer not provided',
      category: q.category || 'technical',
      difficulty: q.difficulty || 'medium',
      points: q.points || 10,
      timeLimit: q.timeLimit || 5,
      followUpQuestions: q.followUpQuestions || [],
      evaluationCriteria: q.evaluationCriteria || ['Accuracy', 'Clarity', 'Completeness'],
      companyRelevance: q.companyRelevance || 7,
      tags: q.tags || [params.jobTitle, params.companyName],
      hints: q.hints || []
    }));
  }

  // Mock data generators for fallback
  private generateMockQuestions(params: QuestionGenerationParams): EnhancedQuestion[] {
    const mockQuestions: EnhancedQuestion[] = [];
    
    for (let i = 0; i < params.numberOfQuestions; i++) {
      mockQuestions.push({
        id: `mock-q-${i}`,
        question: `Tell me about your experience with ${params.skills[i % params.skills.length]} in the context of ${params.jobTitle} role.`,
        expectedAnswer: `A comprehensive answer covering experience, challenges, and achievements with ${params.skills[i % params.skills.length]}.`,
        category: i % 2 === 0 ? 'technical' : 'behavioral',
        difficulty: ['easy', 'medium', 'hard'][i % 3] as 'easy' | 'medium' | 'hard',
        points: 10,
        timeLimit: 5,
        followUpQuestions: [`Can you provide a specific example?`],
        evaluationCriteria: ['Technical accuracy', 'Communication clarity', 'Real-world application'],
        companyRelevance: 8,
        tags: [params.jobTitle, params.companyName, params.skills[i % params.skills.length]],
        hints: ['Think about specific projects and outcomes']
      });
    }
    
    return mockQuestions;
  }

  private generateMockDSAProblems(difficulty: string, count: number): DSAProblem[] {
    const mockProblems: DSAProblem[] = [];
    
    for (let i = 0; i < count; i++) {
      mockProblems.push({
        id: `mock-dsa-${i}`,
        title: `${difficulty.charAt(0).toUpperCase() + difficulty.slice(1)} Problem ${i + 1}`,
        difficulty: difficulty as 'easy' | 'medium' | 'hard',
        description: `Solve this ${difficulty} level data structures and algorithms problem.`,
        examples: [
          {
            input: '[1,2,3]',
            output: '6',
            explanation: 'Sum of all elements'
          }
        ],
        testCases: [
          {
            id: `test-${i}-1`,
            input: '[1,2,3]',
            expectedOutput: '6'
          }
        ],
        constraints: ['1 <= n <= 1000', 'Time limit: 2 seconds'],
        topics: ['Array', 'Mathematics'],
        hints: ['Consider the mathematical approach', 'Think about edge cases'],
        timeComplexity: 'O(n)',
        spaceComplexity: 'O(1)',
        companies: ['TechCorp']
      });
    }
    
    return mockProblems;
  }

  private generateMockAptitudeQuestions(
    types: string[], 
    difficulty: string, 
    count: number
  ): AptitudeQuestion[] {
    const mockQuestions: AptitudeQuestion[] = [];
    
    for (let i = 0; i < count; i++) {
      const type = types[i % types.length] as 'verbal' | 'numerical' | 'logical' | 'spatial';
      
      mockQuestions.push({
        id: `mock-apt-${i}`,
        type,
        question: `This is a ${difficulty} level ${type} reasoning question ${i + 1}.`,
        options: ['Option A', 'Option B', 'Option C', 'Option D'],
        correctAnswer: i % 4,
        explanation: 'This is the correct answer because of logical reasoning.',
        difficulty: difficulty as 'easy' | 'medium' | 'hard',
        timeLimit: difficulty === 'easy' ? 60 : difficulty === 'medium' ? 90 : 120
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

export default EnhancedAIService;