import { GoogleGenerativeAI } from '@google/generative-ai'

// Types for interview questions and analysis
export interface InterviewQuestion {
  id: string
  question: string
  expectedAnswer: string
  difficulty: 'easy' | 'medium' | 'hard'
  category: 'technical' | 'behavioral' | 'aptitude' | 'dsa'
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
  interviewType: 'technical' | 'behavioral' | 'aptitude' | 'dsa' | 'mixed'
  resumeContent?: string
  numberOfQuestions?: number
}

class AIInterviewModel {
  private genAI: GoogleGenerativeAI
  private model: any

  constructor() {
    if (!process.env.GEMINI_API_KEY) {
      throw new Error('GEMINI_API_KEY is not configured')
    }
    this.genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY)
    this.model = this.genAI.getGenerativeModel({ model: 'gemini-1.5-flash' })
  }

  async generateInterviewQuestions(params: QuestionGenerationParams): Promise<InterviewQuestion[]> {
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
        prompt = this.generateBehavioralPrompt(jobTitle, companyName, jobDescription, experienceLevel, numberOfQuestions)
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
    }

    try {
      const result = await this.model.generateContent(prompt)
      const response = await result.response
      const text = response.text()
      
      // Parse the JSON response
      const questions = JSON.parse(text.replace(/```json\n?|\n?```/g, ''))
      
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

  private generateBehavioralPrompt(jobTitle: string, companyName: string, jobDescription: string, experienceLevel: string, numberOfQuestions: number = 8): string {
    return `You are an experienced HR interviewer at ${companyName}. Generate ${numberOfQuestions} behavioral interview questions for a ${experienceLevel} level ${jobTitle} position.

Job Description: ${jobDescription}

Generate questions that assess:
1. Leadership and teamwork abilities
2. Problem-solving approach
3. Communication skills
4. Adaptability and learning
5. Conflict resolution
6. Time management and prioritization
7. Company culture fit for ${companyName}

Use STAR method framework (Situation, Task, Action, Result) where applicable.

Return ONLY a JSON array with this exact structure:
[
  {
    "question": "Behavioral question using STAR framework",
    "expectedAnswer": "What a good answer should include (key elements)",
    "difficulty": "easy|medium|hard"
  }
]

Make questions relevant to ${companyName}'s work environment and values.`
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

  private generateMixedPrompt(jobTitle: string, companyName: string, skills: string[], jobDescription: string, experienceLevel: string, resumeContent?: string, numberOfQuestions: number = 12): string {
    return `Create a comprehensive interview question set of ${numberOfQuestions} questions for a ${experienceLevel} level ${jobTitle} at ${companyName}.

Mix the questions as follows:
- 40% Technical questions (based on: ${skills.join(', ')})
- 30% Behavioral questions
- 20% Problem-solving/Aptitude
- 10% DSA/Coding concepts

Job Description: ${jobDescription}
${resumeContent ? `Candidate's Background: ${resumeContent}` : ''}

Ensure questions are:
1. Relevant to the role and company
2. Appropriate for experience level
3. Well-balanced across categories
4. Progressive in difficulty
5. Realistic interview scenarios

Return ONLY a JSON array with this exact structure:
[
  {
    "question": "Interview question",
    "expectedAnswer": "Comprehensive expected answer",
    "difficulty": "easy|medium|hard"
  }
]`
  }

  async analyzeInterviewPerformance(
    questions: InterviewQuestion[], 
    answers: string[], 
    jobTitle: string,
    skills: string[]
  ): Promise<InterviewAnalysis> {
    const prompt = `Analyze this interview performance for a ${jobTitle} position requiring skills: ${skills.join(', ')}.

Questions and Answers:
${questions.map((q, index) => `
Q${index + 1}: ${q.question}
Expected: ${q.expectedAnswer}
Candidate Answer: ${answers[index] || 'No answer provided'}
Difficulty: ${q.difficulty}
Points: ${q.points}
`).join('\n')}

Provide detailed analysis including:
1. Overall score (0-100)
2. Comprehensive feedback
3. Key strengths identified
4. Areas for improvement
5. Specific recommendations

Return ONLY a JSON object with this exact structure:
{
  "score": number,
  "feedback": "Detailed overall assessment",
  "strengths": ["strength1", "strength2", ...],
  "improvements": ["area1", "area2", ...],
  "recommendations": ["recommendation1", "recommendation2", ...]
}`

    try {
      const result = await this.model.generateContent(prompt)
      const response = await result.response
      const text = response.text()
      
      return JSON.parse(text.replace(/```json\n?|\n?```/g, ''))
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