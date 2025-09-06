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
    console.log("🎯 SERVER ACTION - Starting BULLETPROOF interview creation");
    
    // SUPER AGGRESSIVE session validation with multiple strategies
    let session;
    let sessionAttempts = 0;
    const maxSessionAttempts = 5;
    
    while (sessionAttempts < maxSessionAttempts) {
      try {
        console.log(`🔄 Session attempt ${sessionAttempts + 1}/${maxSessionAttempts}`);
        session = await validateSession();
        
        if (session?.user?.id) {
          console.log("✅ Session validated successfully:", session.user.id);
          break;
        }
        
      } catch (error) {
        console.log(`⚠️ Session validation ${sessionAttempts + 1} failed:`, error);
        sessionAttempts++;
        
        if (sessionAttempts < maxSessionAttempts) {
          // Progressive delay: 500ms, 1s, 1.5s, 2s, 2.5s
          const delay = 500 * sessionAttempts;
          console.log(`🔄 Retrying session validation in ${delay}ms...`);
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
    }

    if (!session?.user?.id) {
      console.log("❌ All session validation attempts failed - this should be rare!");
      return { 
        success: false, 
        error: "Please refresh the page and try again",
        retry: true // Signal that user can retry
      };
    }

    console.log("✅ SESSION CONFIRMED - User:", session.user.id);
    console.log("🚀 Creating interview with MAXIMUM persistence...");
    
    // Prepare bulletproof request data
    const requestData = {
      id: session.user.id, // Always use authenticated session user ID
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

    console.log("📤 Sending bulletproof request to API:", baseURL + '/api/create-interview');
    
    // MEGA RETRY mechanism for API calls
    let res;
    let retryCount = 0;
    const maxRetries = 4; // Increased retries
    
    while (retryCount <= maxRetries) {
      try {
        console.log(`🔥 API attempt ${retryCount + 1}/${maxRetries + 1}`);
        
        res = await axios.post(`${baseURL}/api/create-interview`, requestData, {
          headers: {
            'Content-Type': 'application/json',
          },
          timeout: 180000, // Increased to 3 minutes
          validateStatus: (status) => status < 500 // Don't throw on 4xx errors
        });
        
        console.log(`✅ API call successful with status: ${res.status}`);
        break; // Success, exit retry loop
        
      } catch (error: any) {
        retryCount++;
        console.log(`❌ API attempt ${retryCount} failed:`, error.message);
        
        if (retryCount > maxRetries) {
          throw error; // Re-throw if max retries exceeded
        }
        
        // Don't retry immediately on auth errors - but do try once more after delay
        if (error.response?.status === 401 && retryCount < maxRetries) {
          console.log(`🔄 Auth error - trying to recover session...`);
          await new Promise(resolve => setTimeout(resolve, 3000));
          continue;
        }
        
        const delay = 1000 * retryCount; // Progressive delay
        console.log(`⚠️ Retrying API call in ${delay}ms... (${retryCount}/${maxRetries})`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
    
    // Handle response with maximum user-friendliness
    if (res.status === 401) {
      console.log("❌ Authentication failed at API level - but don't give up!");
      return { 
        success: false, 
        error: "Please refresh the page and try again",
        retry: true
      };
    }
    
    if (res.status >= 400) {
      console.log("❌ API error:", res.status, res.data);
      const errorMsg = res.data?.error || `Server error: ${res.status}`;
      return { 
        success: false, 
        error: errorMsg.includes("Session") ? "Please try again" : errorMsg,
        retry: true
      };
    }
    
    console.log('🎉 SUCCESS! Interview created:', res.data?.id);
    
    // Revalidate the dashboard path to refresh data
    revalidatePath('/dashboard');
    revalidatePath('/');
    
    return { 
      success: true, 
      data: res.data,
      message: "Interview created successfully!"
    };

  } catch (error: any) {
    console.error('🚨 CRITICAL: Interview creation failed:', error);
    
    // Handle different types of errors gracefully
    if (error.code === 'ECONNREFUSED') {
      return { 
        success: false, 
        error: "Server is not responding. Please try again.",
        retry: true
      };
    }
    
    if (error.code === 'ECONNABORTED') {
      return { 
        success: false, 
        error: "Request timed out. Please try again.",
        retry: true
      };
    }
    
    if (error.response?.status === 401) {
      return { 
        success: false, 
        error: "Please refresh the page and try again",
        retry: true
      };
    }
    
    const errorMessage = error.response?.data?.error || error.message || "Failed to create interview";
    
    // Make all error messages user-friendly and never suggest logout
    const friendlyMessage = errorMessage.includes("Session") || errorMessage.includes("Authentication")
      ? "Please try again"
      : errorMessage;
    
    return { 
      success: false, 
      error: friendlyMessage,
      retry: true
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


