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
  status:string
}
export interface InterviewCardProps {
  interview: Interview;
}

export type Question = {
    question: string,
    expectedAnswer: string
}