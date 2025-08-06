import client from "@/lib/db";
import { ObjectId } from "mongodb";

export const getInterviewDetails = async (id:string)=>{
    if(!id){
        return 
    }
     const dbClient = client;
    const db = dbClient.db();

    const interview = await db.collection("interviews").findOne({_id:new ObjectId(id)})
    return interview
    
}