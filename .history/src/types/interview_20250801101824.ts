export interface Interview  {
  _id: Object;
  userId: string;
  jobDesc: string;
  skills: string[];
  companyName: string;
  projectContext: string[];
  workExDetails: string[];
  jobTitle:string
}
export interface InterviewCardProps {
  interview: Interview;
}