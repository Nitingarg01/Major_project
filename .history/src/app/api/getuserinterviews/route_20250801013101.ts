import { auth } from "@/app/auth";
import client from "@/lib/db";
import { type NextRequest, NextResponse } from "next/server";

export async function GET(request:NextRequest) {
    const session = await auth()
    const userId = session?.user?.id

    if(!userId){
        return NextResponse.json({error:"Unauthorized"},{status:401})
    }

    const dbClient = client;
    const db = dbClient.db();

    const interviews = await db.collection("interviews").find({userId:userId}).toArray();
    return NextResponse.json({"message":"Interviews fetched for the user","data":interviews},{status:201})
}