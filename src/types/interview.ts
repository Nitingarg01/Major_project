export interface Interview  {
  _id: Object;
  userId: string;
  jobDesc: string;
  skills: string[];
  companyName: string;
  projectContext: string[];
  workExDetails: string[];
  jobTitle:string;
  createdAt:Date;
  status:string;
  experienceLevel?: 'entry' | 'mid' | 'senior';
  interviewType?: 'technical' | 'behavioral' | 'aptitude' | 'dsa' | 'mixed';
  rounds?: InterviewRound[];
}

export interface InterviewRound {
  id: string;
  type: 'technical' | 'behavioral' | 'aptitude' | 'dsa';
  status: 'pending' | 'completed' | 'in-progress';
  questions: Question[];
  answers?: string[];
  score?: number;
  feedback?: string;
  duration: number; // in minutes
}

export interface InterviewCardProps {
  interview: Interview;
}

export type Question = {
    id?: string;
    question: string;
    expectedAnswer: string;
    difficulty?: 'easy' | 'medium' | 'hard';
    category?: 'technical' | 'behavioral' | 'aptitude' | 'dsa';
    points?: number;
}

export interface InterviewPerformance {
  totalScore: number;
  roundScores: { [roundId: string]: number };
  overallFeedback: string;
  strengths: string[];
  improvements: string[];
  recommendations: string[];
  anomalousActivity?: {
    detected: boolean;
    concerns: string[];
    riskLevel: 'low' | 'medium' | 'high';
  };
}