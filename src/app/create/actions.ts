'use server'

import { auth } from "../auth"
import axios from 'axios'
import { cookies } from 'next/headers'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

type formD = {
  jobDesc: string,
  skills: string[],
  companyName: string,
  jobTitle: string,
  experienceLevel: 'entry' | 'mid' | 'senior',
  interviewType: 'technical' | 'behavioral' | 'aptitude' | 'dsa' | 'mixed' | 'system_design',
  selectedRounds?: string[],
  estimatedDuration?: number,
  difficultyPreference?: 'adaptive' | 'fixed',
  companyIntelligence?: any,
  roundConfigs?: any[]
}

const baseURL = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';

export const createInterview = async (data: formD, projectContext: string[], workExDetails: string[]) => {
  try {
    console.log("🎯 SERVER ACTION - Creating interview");
    
    // Simple session validation
    const session = await auth();
    
    if (!session?.user?.id) {
      console.log("❌ No valid session found");
      return { 
        success: false, 
        error: "Please sign in to create an interview"
      };
    }

    console.log("✅ SESSION CONFIRMED - User:", session.user.id);
    
    // Prepare request data
    const requestData = {
      id: session.user.id,
      jobDesc: data.jobDesc,
      skills: data.skills,
      companyName: data.companyName,
      projectContext: projectContext || [],
      workExDetails: workExDetails || [],
      jobTitle: data.jobTitle,
      experienceLevel: data.experienceLevel,
      interviewType: data.interviewType,
      selectedRounds: data.selectedRounds || ['technical', 'behavioral'],
      estimatedDuration: data.estimatedDuration || 60,
      difficultyPreference: data.difficultyPreference || 'adaptive',
      companyIntelligence: data.companyIntelligence,
      roundConfigs: data.roundConfigs,
      createdAt: new Date()
    };

    console.log("📤 Sending request to API:", baseURL + '/api/create-interview');
    
    // Absolute URL required in server action; forward cookies for auth
    const cookieStore = await cookies();
    const cookieHeader = Array.from(cookieStore.getAll())
      .map((c) => `${c.name}=${c.value}`)
      .join('; ')

    const fetchRes = await fetch(`${baseURL}/api/create-interview`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        cookie: cookieHeader,
      },
      body: JSON.stringify(requestData),
      cache: 'no-store',
    })

    if (!fetchRes.ok) {
      const errJson = await fetchRes.json().catch(() => ({}))
      console.log("❌ API error:", fetchRes.status, errJson)
      return {
        success: false,
        error: errJson?.error || `Server error: ${fetchRes.status}`,
      }
    }
    // Robust body parsing (avoid "<!DOCTYPE" HTML redirect errors)
    let resData: any = null
    try {
      resData = await fetchRes.clone().json()
    } catch (_err) {
      const raw = await fetchRes.text()
      const msg = fetchRes.ok
        ? 'Unexpected non-JSON response from server'
        : `Server error ${fetchRes.status}`
      return {
        success: false,
        error: resData?.error || msg,
      }
    }
    
    console.log('🎉 SUCCESS! Interview created:', resData?.id);
    
    // Revalidate paths
    revalidatePath('/dashboard');
    revalidatePath('/');
    
    return {
      success: true,
      data: resData,
      message: "Interview created successfully!",
    }

  } catch (error: any) {
    console.error('🚨 Interview creation failed:', error);
    
    if (error.code === 'ECONNREFUSED') {
      return { 
        success: false, 
        error: "Server is not responding. Please try again."
      };
    }
    
    if (error.code === 'ECONNABORTED') {
      return { 
        success: false, 
        error: "Request timed out. Please try again."
      };
    }
    
    if (error.response?.status === 401) {
      return { 
        success: false, 
        error: "Please sign in again"
      };
    }
    
    const errorMessage = error.response?.data?.error || error.message || "Failed to create interview";
    
    return { 
      success: false, 
      error: errorMessage
    };
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


