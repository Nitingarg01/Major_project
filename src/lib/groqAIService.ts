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

  // Fast performance analysis with Groq AI (optimized for speed and accuracy)
  public async analyzeOverallPerformance(
    questions: any[],
    answers: string[],
    jobTitle: string,
    skills: string[]
  ): Promise<any> {
    const systemMessage = `You are an expert interview evaluator for ${jobTitle} positions. Provide detailed, fair, and constructive performance analysis based on actual candidate responses. Focus on providing specific, actionable feedback that helps candidates improve.`;
    
    // Enhanced prompt with better structure and examples
    const prompt = `
      Analyze this ${jobTitle} interview performance:

      Interview Context:
      - Position: ${jobTitle}
      - Required Skills: ${skills.join(', ')}
      - Questions Analyzed: ${questions.length}
      - Answers Provided: ${answers.filter(a => a && a.trim() && a !== 'No answer provided').length}

      Question-Answer Analysis:
      ${questions.slice(0, Math.min(questions.length, 6)).map((q, index) => {
        const answer = answers[index] || 'No answer provided';
        const wordCount = answer.split(' ').length;
        return `
      Q${index + 1} [${q.category || 'general'}]: ${q.question}
      Answer (${wordCount} words): ${answer}
      Expected: ${q.expectedAnswer || 'Comprehensive technical response'}
      `;
      }).join('\n')}

      Provide comprehensive analysis in this JSON format:
      {
        "overallScore": (number 1-10, be fair and realistic based on actual answer quality),
        "parameterScores": {
          "Technical Knowledge": (1-10, based on technical accuracy and depth),
          "Problem Solving": (1-10, based on logical approach and methodology), 
          "Communication Skills": (1-10, based on clarity and structure),
          "Practical Application": (1-10, based on real-world relevance),
          "Company Fit": (1-10, based on professionalism and alignment)
        },
        "overallVerdict": "2-3 sentence summary of performance highlighting specific strengths and areas for improvement",
        "adviceForImprovement": [
          {"question": "Brief question summary", "advice": "Specific improvement advice based on actual answer quality"},
          {"question": "Brief question summary", "advice": "Specific improvement advice based on actual answer quality"}
        ],
        "strengths": ["specific strength 1 based on actual responses", "specific strength 2", "specific strength 3"],
        "improvements": ["specific improvement area 1 based on gaps identified", "specific improvement area 2", "specific improvement area 3"],
        "recommendations": ["actionable recommendation 1 for ${jobTitle} role", "actionable recommendation 2", "actionable recommendation 3"]
      }
      
      IMPORTANT: Base scores on actual answer quality, not just word count. Consider:
      - Technical accuracy and understanding
      - Completeness of response
      - Real-world application and examples
      - Communication clarity and structure
      - Relevance to ${jobTitle} role requirements
    `;

    try {
      const response = await this.callGroqAPI({
        messages: [
          { role: 'system', content: systemMessage },
          { role: 'user', content: prompt }
        ],
        max_tokens: 3000, // Increased for more detailed analysis
        temperature: 0.2  // Lower temperature for more consistent scoring
      });

      const analysis = extractJSON(response);
      
      // Validate and enhance the analysis
      const validatedAnalysis = {
        overallScore: Math.max(1, Math.min(10, analysis.overallScore || 5.0)),
        parameterScores: {
          "Technical Knowledge": Math.max(1, Math.min(10, analysis.parameterScores?.["Technical Knowledge"] || 5.0)),
          "Problem Solving": Math.max(1, Math.min(10, analysis.parameterScores?.["Problem Solving"] || 5.0)),
          "Communication Skills": Math.max(1, Math.min(10, analysis.parameterScores?.["Communication Skills"] || 5.0)),
          "Practical Application": Math.max(1, Math.min(10, analysis.parameterScores?.["Practical Application"] || 5.0)),
          "Company Fit": Math.max(1, Math.min(10, analysis.parameterScores?.["Company Fit"] || 5.0))
        },
        overallVerdict: analysis.overallVerdict || `The candidate demonstrated ${analysis.overallScore >= 7 ? 'strong' : analysis.overallScore >= 5 ? 'adequate' : 'developing'} performance in the ${jobTitle} interview with good potential for growth.`,
        adviceForImprovement: analysis.adviceForImprovement || [
          { question: "General feedback", advice: "Continue practicing technical concepts and communication skills relevant to the role." }
        ],
        strengths: analysis.strengths || ["Completed interview questions", "Showed engagement with the process", "Demonstrated basic understanding"],
        improvements: analysis.improvements || ["Provide more detailed technical explanations", "Include specific examples from experience", "Better structure in responses"],
        recommendations: analysis.recommendations || [`Practice ${jobTitle}-specific interview questions`, "Study relevant technologies and best practices", "Prepare concrete examples from professional experience"]
      };
      
      console.log(`✅ Groq AI analysis completed - Overall Score: ${validatedAnalysis.overallScore}/10`);
      return validatedAnalysis;
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
    // Filter out empty or invalid answers
    const meaningfulAnswers = answers.filter(ans => 
      ans && 
      ans.trim() !== '' && 
      ans !== 'No answer provided' && 
      ans.trim().length > 5
    );
    
    const totalQuestions = questions.length;
    const answeredQuestions = meaningfulAnswers.length;
    const completionRate = answeredQuestions / totalQuestions;
    
    // Calculate quality metrics
    const avgWordCount = meaningfulAnswers.length > 0 ?
      meaningfulAnswers.reduce((sum, ans) => sum + ans.split(' ').length, 0) / meaningfulAnswers.length : 0;
    const avgCharLength = meaningfulAnswers.length > 0 ?
      meaningfulAnswers.reduce((sum, ans) => sum + ans.length, 0) / meaningfulAnswers.length : 0;
    
    // Improved scoring algorithm
    const completionScore = Math.max(1, Math.min(10, completionRate * 8 + 2));
    const lengthScore = Math.max(1, Math.min(10, (avgWordCount / 25) * 6 + 2));
    const detailScore = Math.max(1, Math.min(10, (avgCharLength / 200) * 6 + 2));
    
    // Calculate parameter scores with more realistic distribution
    const technicalScore = Math.round(((lengthScore + detailScore) / 2) * 10) / 10;
    const problemSolvingScore = Math.round(((completionScore + lengthScore) / 2) * 10) / 10;
    const communicationScore = Math.round(((lengthScore + completionScore) / 2) * 10) / 10;
    const practicalScore = Math.round(((technicalScore + problemSolvingScore) / 2) * 10) / 10;
    const companyFitScore = Math.round(communicationScore * 10) / 10;
    
    const overallScore = Math.round(((technicalScore + problemSolvingScore + communicationScore + practicalScore + companyFitScore) / 5) * 10) / 10;
    
    // Generate dynamic feedback based on performance
    const performanceLevel = overallScore >= 8 ? 'excellent' : overallScore >= 6.5 ? 'strong' : overallScore >= 5 ? 'good' : overallScore >= 3.5 ? 'adequate' : 'developing';
    
    const strengths = [];
    const improvements = [];
    const recommendations = [];
    
    // Dynamic content based on actual performance
    if (completionRate === 1) {
      strengths.push("Completed all interview questions thoroughly");
    } else if (completionRate >= 0.8) {
      strengths.push("Answered most interview questions effectively");
    } else if (completionRate >= 0.5) {
      strengths.push("Attempted majority of the interview questions");
    }
    
    if (avgWordCount > 30) {
      strengths.push("Provided detailed and comprehensive responses");
    } else if (avgWordCount > 15) {
      strengths.push("Gave well-structured answers to questions");
    }
    
    if (overallScore >= 6) {
      strengths.push("Demonstrated solid understanding of key concepts");
    } else if (overallScore >= 4) {
      strengths.push("Showed basic grasp of fundamental topics");
    }
    
    // Targeted improvements
    if (avgWordCount < 20) {
      improvements.push("Provide more detailed explanations with specific examples");
    }
    if (completionRate < 1) {
      improvements.push("Attempt to answer all interview questions completely");
    }
    if (overallScore < 7) {
      improvements.push("Deepen technical knowledge and communication clarity");
    }
    if (avgCharLength < 150) {
      improvements.push("Expand on answers with more comprehensive explanations");
    }
    
    // Smart recommendations
    recommendations.push("Practice interview questions specific to your target role");
    recommendations.push("Prepare concrete examples from your professional experience");
    if (overallScore < 6) {
      recommendations.push("Review fundamental concepts and technologies for your field");
    }
    recommendations.push("Focus on clear, structured communication during interviews");
    
    return {
      overallScore,
      parameterScores: {
        "Technical Knowledge": technicalScore,
        "Problem Solving": problemSolvingScore,
        "Communication Skills": communicationScore,
        "Practical Application": practicalScore,
        "Company Fit": companyFitScore
      },
      overallVerdict: `The candidate demonstrated ${performanceLevel} performance in the interview, completing ${answeredQuestions}/${totalQuestions} questions with an average response length of ${Math.round(avgWordCount)} words. ${overallScore >= 7 ? 'Strong technical communication skills were evident.' : overallScore >= 5 ? 'Good foundation with room for improvement in detail and depth.' : 'Basic understanding shown, focus on expanding technical knowledge and communication.'} ${performanceLevel === 'excellent' ? 'Outstanding preparation and knowledge.' : 'Continued practice will enhance interview performance.'}`,
      adviceForImprovement: questions.slice(0, Math.min(3, questions.length)).map((q: any, index: number) => {
        const answer = answers[index] || 'No answer provided';
        const wordCount = answer.split(' ').length;
        return {
          question: q.question || `Question ${index + 1}`,
          advice: wordCount > 15 ? 
            "Good response foundation - enhance with more specific technical details and real-world examples" :
            "Provide a more comprehensive answer with detailed explanations, examples, and technical depth"
        };
      }),
      strengths: strengths.length > 0 ? strengths : ["Participated actively in the interview process", "Showed engagement with the questions"],
      improvements: improvements.length > 0 ? improvements : ["Continue developing technical expertise", "Practice interview communication skills"],
      recommendations
    };
  }
}

export default GroqAIService;