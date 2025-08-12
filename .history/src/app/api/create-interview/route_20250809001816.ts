import client from "@/lib/db";
import { type NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
    try {
        const body = await request.json()
        const { id, jobDesc, skills, companyName, projectContext, workExDetails,jobTitle } = body

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

         const user = await db.collection('users').findOne({_id:id})
         const credit = user?.credits
        let newCred = 0;
        if(credit>0){
            newCred = credit-1
        }else{
            return NextResponse.json({message:'Already Minimum',newCredits:credit})
        }
         const response = await db.collection('users').findOneAndUpdate(
            {_id:id},
            {
                $set:{
                    credit:newCred
                }
            }
        )

        return NextResponse.json(
            { message: "Form saved successfully", id: result.insertedId,newCredits:response?.credits },
            { status: 201 }
        );

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