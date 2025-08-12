import client from "@/lib/db";

import { ObjectId } from "mongodb";
import { NextRequest,NextResponse } from "next/server";

export async function POST(request:NextRequest){
    const body = request.json()
    const {userId} = await body

    if(!userId){
        return NextResponse.json({
            error:'Invalid User ID'
        },
    {status:400})
    }
    
    const db = client.db();
    const user = await db.collection('users').findOne({_id:new ObjectId(userId)})

    if(!user){
        return NextResponse.json({
            error:"User Not found"
        },
    {status:400})
    }
    return NextResponse.json({
        credits:user.credits
    },
{status:200})
}