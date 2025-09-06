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

'use server'
import { auth } from "../auth"
import axios from 'axios'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

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
    // Get session with proper error handling
    const session = await auth()
    
    if (!session?.user?.id) {
      console.log("❌ No valid session found")
      return { success: false, error: "Authentication required. Please sign in again.", redirect: '/login' }
    }

    console.log("✅ Session verified for user:", session.user.id)
    console.log("🚀 Creating interview with one-click generation...")
    
    // Prepare the request with proper headers
    const requestData = {
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
    }

    console.log("📤 Sending request to API:", baseURL + '/api/create-interview')
    
    const res = await axios.post(`${baseURL}/api/create-interview`, requestData, {
      headers: {
        'Content-Type': 'application/json',
        // Don't add session cookies here as they should be handled automatically
      },
      timeout: 60000, // 60 second timeout
      validateStatus: (status) => status < 500 // Don't throw on 4xx errors
    })
    
    if (res.status === 401) {
      console.log("❌ Authentication failed at API level")
      return { success: false, error: "Session expired. Please sign in again.", redirect: '/login' }
    }
    
    if (res.status >= 400) {
      console.log("❌ API error:", res.status, res.data)
      return { success: false, error: res.data?.error || `Server error: ${res.status}` }
    }
    
    console.log('✅ Interview created successfully:', res.data?.id)
    
    // Revalidate the dashboard path to refresh data
    revalidatePath('/dashboard')
    
    return { 
      success: true, 
      data: res.data,
      message: "Interview created successfully!"
    }

  } catch (error: any) {
    console.error('❌ Interview creation failed:', error)
    
    // Handle different types of errors
    if (error.code === 'ECONNREFUSED') {
      return { success: false, error: "Server is not responding. Please try again later." }
    }
    
    if (error.response?.status === 401) {
      return { success: false, error: "Authentication failed. Please sign in again.", redirect: '/login' }
    }
    
    if (error.response?.status === 403) {
      return { success: false, error: "Access denied. Please check your permissions." }
    }
    
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


