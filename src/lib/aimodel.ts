import { GoogleGenerativeAI } from '@google/generative-ai';
import { extractJSON } from './jsonExtractor';

// Types for interview questions and analysis
export interface InterviewQuestion {
  id: string
  question: string
  expectedAnswer: string
  difficulty: 'easy' | 'medium' | 'hard'
  category: 'technical' | 'behavioral' | 'aptitude' | 'dsa' | 'system_design'
  points: number
}

export interface InterviewAnalysis {
  score: number
  feedback: string
  strengths: string[]
  improvements: string[]
  recommendations: string[]
}

export interface QuestionGenerationParams {
  jobTitle: string
  companyName: string
  skills: string[]
  jobDescription: string
  experienceLevel: 'entry' | 'mid' | 'senior'
  interviewType: 'technical' | 'behavioral' | 'aptitude' | 'dsa' | 'mixed' | 'system_design'
  resumeContent?: string
  numberOfQuestions?: number
}

class AIInterviewModel {
  private genAI: GoogleGenerativeAI | null = null
  private model: any = null

  constructor() {
    if (!process.env.GEMINI_API_KEY) {
      console.warn('GEMINI_API_KEY is not configured - Gemini features will be disabled')
      return
    }
    this.genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY)
    this.model = this.genAI.getGenerativeModel({ model: 'gemini-1.5-flash' })
  }

  async generateInterviewQuestions(params: QuestionGenerationParams): Promise<InterviewQuestion[]> {
    if (!this.model) {
      throw new Error('Gemini API is not configured - please set GEMINI_API_KEY')
    }
    const { 
      jobTitle, 
      companyName, 
      skills, 
      jobDescription, 
      experienceLevel, 
      interviewType,
      resumeContent,
      numberOfQuestions = 10
    } = params

    let prompt = ''
    
    // Different prompts based on interview type
    switch (interviewType) {
      case 'technical':
        prompt = this.generateTechnicalPrompt(jobTitle, companyName, skills, jobDescription, experienceLevel, resumeContent, numberOfQuestions)
        break
      case 'behavioral':
        prompt = this.generateBehavioralPrompt(jobTitle, companyName, jobDescription, experienceLevel, numberOfQuestions, resumeContent)
        break
      case 'aptitude':
        prompt = this.generateAptitudePrompt(jobTitle, companyName, numberOfQuestions)
        break
      case 'dsa':
        prompt = this.generateDSAPrompt(skills, experienceLevel, numberOfQuestions)
        break
      case 'mixed':
        prompt = this.generateMixedPrompt(jobTitle, companyName, skills, jobDescription, experienceLevel, resumeContent, numberOfQuestions)
        break
      case 'system_design':
        prompt = this.generateSystemDesignPrompt(jobTitle, companyName, skills, experienceLevel, numberOfQuestions)
        break
    }

    try {
      const result = await this.model.generateContent(prompt)
      const response = await result.response
      const text = response.text()
      
      // Parse the JSON response
      const questions = extractJSON(text)
      
      return questions.map((q: any, index: number) => ({
        id: `${interviewType}_${index + 1}`,
        question: q.question,
        expectedAnswer: q.expectedAnswer,
        difficulty: q.difficulty || 'medium',
        category: interviewType,
        points: this.calculatePoints(q.difficulty || 'medium')
      }))
    } catch (error) {
      console.error('Error generating questions:', error)
      throw new Error('Failed to generate interview questions')
    }
  }

  private generateTechnicalPrompt(jobTitle: string, companyName: string, skills: string[], jobDescription: string, experienceLevel: string, resumeContent?: string, numberOfQuestions: number = 10): string {
    const skillCategories = this.categorizeSkills(skills);
    
    return `You are an expert technical interviewer for ${companyName}. Generate ${numberOfQuestions} diverse technical interview questions for a ${experienceLevel} level ${jobTitle} position.

Skills required: ${skills.join(', ')}
Job Description: ${jobDescription}
${resumeContent ? `Candidate's Resume Context: ${resumeContent}` : ''}

Generate a well-balanced mix of questions covering:
1. **Core Technical Skills** (40%): Deep dive into ${skillCategories.primary.join(', ')}
2. **System Design** (20%): Architecture, scalability, database design
3. **Problem Solving** (20%): Algorithm optimization, debugging scenarios
4. **Best Practices** (10%): Code quality, testing, security
5. **Company-specific** (10%): ${companyName}'s tech stack and domain challenges

Question Distribution by Difficulty:
- Easy: ${Math.ceil(numberOfQuestions * 0.3)} questions (fundamentals, basic concepts)
- Medium: ${Math.ceil(numberOfQuestions * 0.5)} questions (practical application, mid-level concepts)  
- Hard: ${Math.floor(numberOfQuestions * 0.2)} questions (complex scenarios, advanced topics)

For ${experienceLevel} level candidates, focus on:
${this.getExperienceFocus(experienceLevel)}

Return ONLY a JSON array with this exact structure:
[
  {
    "question": "Detailed technical question with context and specific requirements",
    "expectedAnswer": "Comprehensive expected answer with key technical concepts, code examples where relevant, and evaluation criteria",
    "difficulty": "easy|medium|hard"
  }
]

Ensure questions are:
- Technology-specific and practical
- Include real-world scenarios from ${companyName}'s domain
- Test both theoretical knowledge and hands-on problem-solving
- Progressive in complexity within each difficulty level`
  }

  private generateBehavioralPrompt(jobTitle: string, companyName: string, jobDescription: string, experienceLevel: string, numberOfQuestions: number = 8, resumeContent?: string): string {
    const resumeBasedQuestions = resumeContent ? `

CANDIDATE'S BACKGROUND:
${resumeContent}

PERSONALIZATION INSTRUCTIONS:
- Include 2-3 questions directly referencing their specific work experiences, projects, or achievements mentioned in their resume
- Ask about challenges they faced in projects they've listed
- Explore their role in team projects they've described
- Reference specific companies, technologies, or accomplishments from their background
- Ask about lessons learned from their career progression as shown in their resume` : '';

    return `You are an experienced HR interviewer at ${companyName}. Generate ${numberOfQuestions} behavioral interview questions for a ${experienceLevel} level ${jobTitle} position.

Job Description: ${jobDescription}${resumeBasedQuestions}

Generate questions that assess:
1. Leadership and teamwork abilities
2. Problem-solving approach
3. Communication skills
4. Adaptability and learning
5. Conflict resolution
6. Time management and prioritization
7. Company culture fit for ${companyName}
${resumeContent ? '8. Specific experiences and achievements from their background' : ''}

Use STAR method framework (Situation, Task, Action, Result) where applicable.
${resumeContent ? 'Make at least 3 questions specific to their resume experiences.' : ''}

Return ONLY a JSON array with this exact structure:
[
  {
    "question": "Behavioral question using STAR framework${resumeContent ? ' (some should reference their specific experiences)' : ''}",
    "expectedAnswer": "What a good answer should include (key elements)",
    "difficulty": "easy|medium|hard"
  }
]

Make questions relevant to ${companyName}'s work environment and values${resumeContent ? ' while incorporating their personal career journey' : ''}.`
  }

  private generateAptitudePrompt(jobTitle: string, companyName: string, numberOfQuestions: number = 10): string {
    return `Generate ${numberOfQuestions} aptitude and logical reasoning questions suitable for a ${jobTitle} interview at ${companyName}.

Include mix of:
1. Logical reasoning puzzles
2. Mathematical problem-solving
3. Pattern recognition
4. Critical thinking scenarios
5. Analytical reasoning
6. Quantitative aptitude

Questions should be:
- Professional and appropriate for corporate interviews
- Test analytical and problem-solving skills
- Progressive difficulty levels
- Time-efficient to answer (2-3 minutes each)

Return ONLY a JSON array with this exact structure:
[
  {
    "question": "Clear aptitude/logical reasoning question",
    "expectedAnswer": "Step-by-step solution with reasoning",
    "difficulty": "easy|medium|hard"
  }
]`
  }

  private generateDSAPrompt(skills: string[], experienceLevel: string, numberOfQuestions: number = 8): string {
    return `Generate ${numberOfQuestions} Data Structures and Algorithms questions for a ${experienceLevel} level developer.

Skills context: ${skills.join(', ')}

Include questions on:
1. Arrays and Strings
2. Linked Lists
3. Trees and Binary Search Trees
4. Graphs and Graph Algorithms
5. Dynamic Programming
6. Sorting and Searching
7. Hash Maps and Sets
8. System Design (for senior levels)

Questions should:
- Be coding problems that can be discussed conceptually
- Include time/space complexity analysis
- Range from easy to hard difficulty
- Be practical and commonly asked in interviews

Return ONLY a JSON array with this exact structure:
[
  {
    "question": "DSA problem statement with input/output examples",
    "expectedAnswer": "Algorithm approach, complexity analysis, and key implementation points",
    "difficulty": "easy|medium|hard"
  }
]`
  }

  private generateSystemDesignPrompt(jobTitle: string, companyName: string, skills: string[], experienceLevel: string, numberOfQuestions: number = 8): string {
    return `Generate ${numberOfQuestions} system design interview questions for a ${experienceLevel} level ${jobTitle} at ${companyName}.

Skills context: ${skills.join(', ')}

Include questions on:
1. Scalable System Architecture
2. Database Design and Selection
3. Load Balancing and Caching
4. Microservices vs Monolith
5. API Design and Rate Limiting
6. Real-time Systems and Message Queues
7. Cloud Infrastructure and DevOps
8. Security and Performance Optimization

Questions should:
- Be realistic system design scenarios relevant to ${companyName}
- Test architectural thinking and trade-off analysis
- Include scalability, reliability, and performance considerations
- Be appropriate for ${experienceLevel} level candidates

For ${experienceLevel} level:
${this.getSystemDesignFocus(experienceLevel)}

Return ONLY a JSON array with this exact structure:
[
  {
    "question": "System design problem with context and requirements",
    "expectedAnswer": "Key architectural components, design decisions, and trade-offs to discuss",
    "difficulty": "easy|medium|hard"
  }
]

Focus on practical scenarios that test system thinking and architectural decision-making skills.`
  }

  private generateMixedPrompt(jobTitle: string, companyName: string, skills: string[], jobDescription: string, experienceLevel: string, resumeContent?: string, numberOfQuestions: number = 12): string {
    const technicalCount = Math.ceil(numberOfQuestions * 0.4);
    const behavioralCount = Math.ceil(numberOfQuestions * 0.3);
    const problemSolvingCount = Math.ceil(numberOfQuestions * 0.2);
    const dsaCount = numberOfQuestions - technicalCount - behavioralCount - problemSolvingCount;

    return `Create a comprehensive ${numberOfQuestions}-question interview for a ${experienceLevel} level ${jobTitle} at ${companyName}.

EXACT QUESTION BREAKDOWN:
- Technical Questions: ${technicalCount} (Skills: ${skills.join(', ')})
- Behavioral Questions: ${behavioralCount} (Leadership, teamwork, problem-solving approach)
- Problem-solving/Aptitude: ${problemSolvingCount} (Logic puzzles, analytical thinking)
- DSA/Coding Concepts: ${dsaCount} (Data structures, algorithms, complexity)

Job Description: ${jobDescription}
${resumeContent ? `Candidate's Background: ${resumeContent}` : ''}

TECHNICAL QUESTIONS should cover:
- Core technology stack implementation
- System design principles
- Best practices and code quality
- Real-world debugging scenarios
- ${companyName}-specific technology challenges

BEHAVIORAL QUESTIONS should assess:
- Leadership and team collaboration
- Conflict resolution and communication
- Learning agility and adaptability
- Cultural fit for ${companyName}
- Career motivation and goals

PROBLEM-SOLVING should include:
- Logical reasoning puzzles
- Mathematical problem-solving
- Pattern recognition challenges
- Critical thinking scenarios

DSA QUESTIONS should focus on:
- Common data structures (arrays, trees, graphs)
- Algorithm optimization techniques
- Time/space complexity analysis
- Practical coding scenarios

Difficulty Distribution:
- Easy: ${Math.ceil(numberOfQuestions * 0.25)} questions
- Medium: ${Math.ceil(numberOfQuestions * 0.5)} questions  
- Hard: ${Math.floor(numberOfQuestions * 0.25)} questions

Return ONLY a JSON array with this exact structure:
[
  {
    "question": "Detailed question with clear context and requirements",
    "expectedAnswer": "Comprehensive answer including key concepts, evaluation criteria, and follow-up points",
    "difficulty": "easy|medium|hard"
  }
]

Ensure questions are progressive, realistic, and thoroughly test the candidate's fit for the ${jobTitle} role at ${companyName}.`
  }

  async analyzeInterviewPerformance(
    questions: InterviewQuestion[], 
    answers: string[], 
    jobTitle: string,
    skills: string[]
  ): Promise<any> {
    if (!this.model) {
      throw new Error('Gemini API is not configured - please set GEMINI_API_KEY')
    }
    const prompt = `You are an expert interview assessor. Analyze this interview performance for a ${jobTitle} position requiring skills: ${skills.join(', ')}.

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
4. **Question-wise Detailed Feedback**
5. **Strengths and Improvements**

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

Evaluation Criteria:
- Score 8-10: Excellent answers with depth and clarity
- Score 6-7: Good understanding with minor gaps
- Score 4-5: Basic understanding, needs improvement
- Score 0-3: Poor understanding or no answer

Focus on constructive feedback that helps the candidate improve while highlighting their strengths.`

    try {
      const result = await this.model.generateContent(prompt)
      const response = await result.response
      const text = response.text()
      
      return extractJSON(text)
    } catch (error) {
      console.error('Error analyzing performance:', error)
      throw new Error('Failed to analyze interview performance')
    }
  }

  private calculatePoints(difficulty: string): number {
    switch (difficulty) {
      case 'easy': return 5
      case 'medium': return 8
      case 'hard': return 12
      default: return 8
    }
  }

  private categorizeSkills(skills: string[]): { primary: string[], secondary: string[] } {
    const frontendSkills = ['React', 'Angular', 'Vue.js', 'JavaScript', 'TypeScript', 'HTML', 'CSS', 'Tailwind'];
    const backendSkills = ['Node.js', 'Python', 'Java', 'C++', 'Go', 'Ruby', 'PHP', 'C#'];
    const databaseSkills = ['MySQL', 'PostgreSQL', 'MongoDB', 'Redis', 'Elasticsearch'];
    const cloudSkills = ['AWS', 'Azure', 'GCP', 'Docker', 'Kubernetes'];

    const primary = skills.filter(skill => 
      frontendSkills.includes(skill) || backendSkills.includes(skill)
    );
    const secondary = skills.filter(skill => 
      databaseSkills.includes(skill) || cloudSkills.includes(skill)
    );

    return { primary: primary.length > 0 ? primary : skills.slice(0, 3), secondary };
  }

  private getExperienceFocus(experienceLevel: string): string {
    switch (experienceLevel) {
      case 'entry':
        return '- Fundamental concepts and basic implementations\n- Code readability and simple problem-solving\n- Learning ability and growth mindset';
      case 'mid':
        return '- Practical application of concepts\n- System design understanding\n- Code optimization and debugging skills';
      case 'senior':
        return '- Advanced architecture decisions\n- Leadership and mentoring scenarios\n- Complex system trade-offs and scalability';
      default:
        return '- Balanced mix of theory and practice\n- Problem-solving approach\n- Technical communication skills';
    }
  }

  private getSystemDesignFocus(experienceLevel: string): string {
    switch (experienceLevel) {
      case 'entry':
        return '- Basic system components and simple architectures\n- Database basics and simple scaling\n- Understanding of common patterns';
      case 'mid':
        return '- Intermediate system design with trade-offs\n- Caching strategies and database optimization\n- API design and microservices basics';
      case 'senior':
        return '- Complex distributed systems design\n- Advanced scaling and performance optimization\n- Leadership in architectural decisions';
      default:
        return '- Core system design principles\n- Scalability and reliability concepts\n- Practical architectural trade-offs';
    }
  }

  // Public method to generate content
  async generateContent(prompt: string): Promise<any> {
    if (!this.model) {
      throw new Error('Gemini API is not configured - please set GEMINI_API_KEY')
    }
    try {
      const result = await this.model.generateContent(prompt)
      return result
    } catch (error) {
      console.error('Error generating content:', error)
      throw new Error('Failed to generate content')
    }
  }

  // Method to detect unusual behavior patterns
  async detectAnomalousActivity(activityLog: any[]): Promise<{
    isAnomalous: boolean
    concerns: string[]
    riskLevel: 'low' | 'medium' | 'high'
  }> {
    // This would integrate with camera monitoring and activity detection
    // For now, returning a basic structure
    return {
      isAnomalous: false,
      concerns: [],
      riskLevel: 'low'
    }
  }
}

export const aiInterviewModel = new AIInterviewModel()
export default AIInterviewModel