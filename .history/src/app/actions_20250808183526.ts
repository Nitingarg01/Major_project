import axios from "axios"
import { auth } from "./auth";
import client from "@/lib/db";
import { ObjectId } from "mongodb";
import { Interview, InterviewCardProps } from "@/types/interview";
import { inngest } from "@/inngest/client";

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

const updateCreds = async (id:string)=>{
            inngest.send({
            name:'app/updateCredits',
            data:{
                userId:id
            }
        }).then((data)=>{
                return data
        }).catch((err)=>{
                console.log(err)
        })
}
