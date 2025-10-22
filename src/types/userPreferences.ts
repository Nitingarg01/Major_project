// User Preferences Types for Enhanced Interview Question Generation

export interface UserInterviewPreferences {
  _id?: string,
  userId: string,
  
  // General Preferences
  defaultDifficulty: 'easy' | 'medium' | 'hard' | 'adaptive',
  preferredInterviewTypes: ('technical' | 'behavioral' | 'dsa' | 'aptitude' | 'mixed' | 'system_design')[],
  
  // Question Distribution (percentages that sum to 100)
  questionDistribution: {
    technical: number,
    behavioral: number,
    dsa: number,
    aptitude: number,
    system_design: number
  };
  
  // DSA Preferences - Focus on company uniqueness
  dsaPreferences: {
    preferredTopics: string[],
    avoidTopics: string[],
    companySpecificFocus: boolean; // Generate unique problems per company
    difficultyProgression: boolean; // Start easy, progress to harder
    realWorldScenarios: boolean; // Focus on practical applications
    interviewStylePreference: 'google' | 'meta' | 'amazon' | 'microsoft' | 'generic' | 'company_specific'
  };
  
  // Technical Preferences
  technicalPreferences: {
    focusAreas: string[]; // e.g., ['algorithms', 'system_design', 'databases', 'architecture']
    industrySpecific: boolean,
    modernTechStack: boolean,
    legacySystemExperience: boolean
  };
  
  // Behavioral Preferences
  behavioralPreferences: {
    leadershipQuestions: boolean,
    conflictResolution: boolean,
    teamCollaboration: boolean,
    problemSolving: boolean,
    cultureFit: boolean,
    situationalJudgment: boolean
  };
  
  // Company-Specific Preferences
  companyPreferences: {
    focusOnCompanyCulture: boolean,
    includeCompanyNews: boolean,
    techStackAlignment: boolean,
    industryTrends: boolean
  };
  
  // Advanced Preferences
  advancedSettings: {
    questionDepth: 'surface' | 'moderate' | 'deep',
    includeFollowUps: boolean,
    adaptiveDifficulty: boolean,
    timeConstraints: boolean,
    realTimeHints: boolean
  };
  
  // Metadata
  createdAt: Date,
  updatedAt: Date,
  version: string
}

export interface CompanySpecificDSAProfile {
  companyName: string,
  uniqueProblems: DSACompanyProblem[],
  difficultyCurve: 'linear' | 'exponential' | 'plateau',
  focusAreas: string[],
  interviewStyle: string,
  averageDifficulty: number,
  problemsGenerated: number,
  lastUpdated: Date
}

export interface DSACompanyProblem {
  id: string,
  companyName: string,
  title: string,
  description: string,
  difficulty: 'easy' | 'medium' | 'hard',
  topics: string[],
  uniquenessScore: number; // How unique this problem is to this company (0-10)
  companyContext: string; // Real business context from the company
  realWorldApplication: string,
  expectedComplexity: {
    time: string,
    space: string
  };
  variations: string[]; // Different ways the problem can be asked
  hints: string[],
  testCases: Array<{
    id: string,
    input: string,
    expectedOutput: string,
    hidden?: boolean,
    description?: string
  }>;
  followUpQuestions: string[],
  companySpecificContext: {
    businessUseCase: string,
    industryRelevance: string,
    scaleRequirements: string
  };
  generatedAt: Date
}

export interface QuestionGenerationRequest {
  userPreferences: UserInterviewPreferences,
  jobTitle: string,
  companyName: string,
  skills: string[],
  experienceLevel: 'entry' | 'mid' | 'senior',
  interviewType: 'technical' | 'behavioral' | 'aptitude' | 'dsa' | 'mixed' | 'system_design',
  numberOfQuestions: number,
  companyIntelligence?: any,
  forceUniqueGeneration?: boolean
}

export interface EnhancedQuestion {
  id: string,
  question: string,
  expectedAnswer: string,
  category: 'technical' | 'behavioral' | 'dsa' | 'aptitude' | 'system_design',
  difficulty: 'easy' | 'medium' | 'hard',
  points: number,
  timeLimit?: number,
  evaluationCriteria: string[],
  tags: string[],
  hints?: string[],
  companyRelevance: number,
  uniquenessScore?: number; // For DSA questions
  companyContext?: string,
  preferences?: {
    alignsWithUserPrefs: boolean,
    preferenceFactors: string[];
  };
  metadata: {
    generatedBy: string,
    model: string,
    provider: string,
    generatedAt: Date,
    userPreferenceVersion: string
  };
}

// Default user preferences
export const DEFAULT_USER_PREFERENCES: Omit<UserInterviewPreferences, '_id' | 'userId' | 'createdAt' | 'updatedAt'> = {
  defaultDifficulty: 'adaptive',
  preferredInterviewTypes: ['mixed', 'technical', 'behavioral'],
  
  questionDistribution: {
    technical: 40,
    behavioral: 25,
    dsa: 25,
    aptitude: 5,
    system_design: 5
  },
  
  dsaPreferences: {
    preferredTopics: ['arrays', 'strings', 'trees', 'graphs', 'dynamic_programming'],
    avoidTopics: [],
    companySpecificFocus: true,
    difficultyProgression: true,
    realWorldScenarios: true,
    interviewStylePreference: 'company_specific'
  },
  
  technicalPreferences: {
    focusAreas: ['algorithms', 'system_design', 'databases'],
    industrySpecific: true,
    modernTechStack: true,
    legacySystemExperience: false
  },
  
  behavioralPreferences: {
    leadershipQuestions: true,
    conflictResolution: true,
    teamCollaboration: true,
    problemSolving: true,
    cultureFit: true,
    situationalJudgment: true
  },
  
  companyPreferences: {
    focusOnCompanyCulture: true,
    includeCompanyNews: true,
    techStackAlignment: true,
    industryTrends: true
  },
  
  advancedSettings: {
    questionDepth: 'moderate',
    includeFollowUps: true,
    adaptiveDifficulty: true,
    timeConstraints: true,
    realTimeHints: true
  },
  
  version: '1.0'
};