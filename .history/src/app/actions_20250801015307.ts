import axios from "axios"
import { auth } from "./auth";
import client from "@/lib/db";

export const getUserInterviews = async ()=>{
   const session = await auth()
        const userId = session?.user?.id

        if (!userId) {
            return []
        }

        const dbClient = client;
        const db = dbClient.db();

        const interviews = await db.collection("interviews").find({ userId: userId }).toArray();
        console.log(interviews)
        return interviews
    
}