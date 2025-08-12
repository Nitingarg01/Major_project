import client from "@/lib/db";
import { NextRequest,NextResponse } from "next/server";

export async function POST(request:NextRequest){
    const body = request.json()
    const {userId} = await body
    
      const db = client.db();

        const user = await db.collection('users').findOne({_id:userId})
        const credit = user?.credits
        let newCred = 0;
        if(credit>0){
            newCred = credit-1
        }else{
            return {message:'Already Minimum',newCredits:credit}
        }

        const response = await db.collection('users').findOneAndUpdate(
            {_id:userId},
            {
                $set:{
                    credit:newCred
                }
            }
        )

        return {message:"Count updated",newCredits:response?.credits}
}