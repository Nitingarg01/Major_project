interface Interview  {
  _id: Object;
  userId: string;
  jobDesc: string;
  skills: string[];
  companyName: string;
  projectContext: string[];
  workExDetails: string[];
}
export interface InterviewCardProps {
  interview: Interview;
}