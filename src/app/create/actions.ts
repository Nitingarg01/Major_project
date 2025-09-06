'use server'
import { auth } from "../auth"
import axios from 'axios'

type formD = {
  jobDesc: string,
  skills: string[],
  companyName: string,
  jobTitle: string,
  experienceLevel: 'entry' | 'mid' | 'senior',
  interviewType: 'technical' | 'behavioral' | 'aptitude' | 'dsa' | 'mixed',
  selectedRounds?: string[],
  estimatedDuration?: number,
  difficultyPreference?: 'adaptive' | 'fixed',
  companyIntelligence?: any,
  roundConfigs?: any[]
}

const baseURL = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';

export const createInterview = async (data: formD, projectContext: string[], workExDetails: string[]) => {
  try {
    const session = await auth()
    
    if (!session?.user?.id) {
      return { success: false, error: "User not authenticated" }
    }

    console.log("Creating interview with one-click generation...")
    
    const res = await axios.post(`${baseURL}/api/create-interview`, {
      id: session.user.id,
      jobDesc: data.jobDesc,
      skills: data.skills,
      companyName: data.companyName,
      projectContext: projectContext,
      workExDetails: workExDetails,
      jobTitle: data.jobTitle,
      experienceLevel: data.experienceLevel,
      interviewType: data.interviewType,
      selectedRounds: data.selectedRounds || ['technical', 'behavioral'],
      estimatedDuration: data.estimatedDuration || 60,
      difficultyPreference: data.difficultyPreference || 'adaptive',
      companyIntelligence: data.companyIntelligence,
      roundConfigs: data.roundConfigs,
      createdAt: new Date()
    })
    
    console.log('✅ Interview created successfully with questions:', res.data)
    return { success: true, data: res.data }

  } catch (error: any) {
    console.error('❌ Interview creation failed:', error)
    const errorMessage = error.response?.data?.error || error.message || "Failed to create interview"
    return { success: false, error: errorMessage }
  }
}

export const parsingResume = async (file: File) => {
  const formData = new FormData()
  formData.append("resume", file)

  for (const [key, value] of formData.entries()) {
    if (value instanceof File) {
      console.log(`📁 Field: ${key}`);
      console.log(`→ name: ${value.name}`);
      console.log(`→ type: ${value.type}`);
      console.log(`→ size: ${value.size}`);
    } else {
      console.log(`📝 Field: ${key} = ${value}`);
    }
  }
  try {
    // const res = await axios.post(`${baseURL}/api/parse-resume`,formData,{
    //   headers:{
    //     'Content-Type':'multipart/form-data'
    //   }
    // })
    const res = await axios.post(`${baseURL}/api/parse-resume`, formData, {
      // headers:{
      //   'Content-Type':'multipart/form-data'
      // }
    })
    // console.log("reasponse aagya",res.data)
    return res.data
  } catch (error: any) {
    console.log(error.message)
    return { error: error.message }
  }
}


