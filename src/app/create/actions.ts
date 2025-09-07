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

// Helper function to validate and refresh session if needed
async function validateSession() {
  let session;
  let attempts = 0;
  const maxAttempts = 3;
  
  while (attempts < maxAttempts) {
    try {
      session = await auth()
      if (session?.user?.id) {
        return session;
      }
      attempts++;
      if (attempts < maxAttempts) {
        console.log(`⚠️ Session validation attempt ${attempts}/${maxAttempts} failed, retrying...`);
        await new Promise(resolve => setTimeout(resolve, 500));
      }
    } catch (error) {
      console.error("❌ Session validation error:", error);
      attempts++;
      if (attempts < maxAttempts) {
        await new Promise(resolve => setTimeout(resolve, 500));
      }
    }
  }
  
  throw new Error("No valid session found after multiple attempts")
}

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
    
    // Make API call with timeout
    const res = await axios.post(`${baseURL}/api/create-interview`, requestData, {
      headers: {
        'Content-Type': 'application/json',
      },
      timeout: 60000, // 1 minute timeout
    });
    
    if (res.status >= 400) {
      console.log("❌ API error:", res.status, res.data);
      return { 
        success: false, 
        error: res.data?.error || `Server error: ${res.status}`
      };
    }
    
    console.log('🎉 SUCCESS! Interview created:', res.data?.id);
    
    // Revalidate paths
    revalidatePath('/dashboard');
    revalidatePath('/');
    
    return { 
      success: true, 
      data: res.data,
      message: "Interview created successfully!"
    };

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


