import client from "@/lib/db";
import { ObjectId } from "mongodb";
import { type NextRequest, NextResponse } from "next/server";
import { c } from "node_modules/framer-motion/dist/types.d-Cjd591yU";

export async function POST(request: NextRequest) {
    try {
        const body = await request.json()
        const { id, jobDesc, skills, companyName, projectContext, workExDetails, jobTitle, experienceLevel, interviewType } = body

        if (!jobDesc || !companyName || !skills || skills.length === 0) {
            return NextResponse.json(
                { error: "Missing required fields" },
                { status: 400 }
            );
        }

        const dbClient = client;
        const db = dbClient.db();

        const result = await db.collection("interviews").insertOne({
            userId: id,
            jobDesc,
            skills,
            jobTitle,
            companyName,
            projectContext: projectContext ?? [],
            workExDetails: workExDetails ?? [],
            createdAt:Date.now(),
            status:'ready'
        })

        //ye user ke credits update krne ka logic
        const user = await db.collection('users').findOne({_id:new ObjectId(id)})
        console.log('user finding',id)
        console.log('user found',user)

        if(user?.credits){
            const updatedUser =  await db.collection('users').findOneAndUpdate(
            {_id:new ObjectId(id)},
            {
                $set:{
                    credits:user.credits-1
                }
            },
            {returnDocument:"after"}
        )

         return NextResponse.json(
            { message: "Form saved successfully", id: result.insertedId,newCredits:updatedUser?.credits, },
            { status: 201 }
        );
        }else{
            return NextResponse.json({message:'Already Minimum',newCredits:user?.credits,id:result.insertedId})
        }
      
    } catch (error) {
        console.error("Error saving form:", error);
        return NextResponse.json(
            {
                error: "Something went wrong."
            },
            { status: 500 }
        )
    }
}