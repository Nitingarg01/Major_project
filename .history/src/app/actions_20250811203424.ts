import axios from "axios"
import { auth } from "./auth";
import client from "@/lib/db";
import { ObjectId } from "mongodb";
import { Interview, InterviewCardProps } from "@/types/interview";
import { inngest } from "@/inngest/client";
import { P } from "node_modules/framer-motion/dist/types.d-Cjd591yU";



export const getUserInterviews = async () => {
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

export const updateCreds = async (id: string) => {
       if(!id){
        return ;
       }
       const db = client.db()

       const user = await db.collection('users').findOne({_id:new ObjectId(id)})
       return user?.credits;
}