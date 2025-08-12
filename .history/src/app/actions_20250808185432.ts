import axios from "axios"
import { auth } from "./auth";
import client from "@/lib/db";
import { ObjectId } from "mongodb";
import { Interview, InterviewCardProps } from "@/types/interview";
import { inngest } from "@/inngest/client";

// const baseURL = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
const baseURL = process.env.NODE_ENV === 'development'
  ? 'http://localhost:3000'
  : 'https://ai-interview-iota-ten.vercel.app';

export const getUserInterviews = async ()=>{
   const session = await auth()
        const userId = session?.user?.id

        if (!userId) {
            return []
        }

        

        const dbClient = client;
        const db = dbClient.db();

        // const interviews = await db.collection("interviews").find({ userId: userId }).toArray();
                const interviews = await db.collection("interviews").find({ userId: userId }).toArray() as unknown as Interview[];

        return interviews
    
}

export const updateCreds = async (id:string)=>{
        const response = await axios.post(`${baseURL}/api/create-interview`,{
                userId:id
        })
        return response.data
}