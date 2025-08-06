import { NextRequest,NextResponse } from "next/server";

export async function POST(request:NextRequest){
    const formData = request.formData()
    const file = (await formData).get("resume") as File

    if(!file){
        return NextResponse.json({error:"No file Found"},{status:400})
    }

    try {
        
    } catch (error) {
        console.log(error)
        return NextResponse.json({error:"Resume Parsing Failed"},{status:500})
    }
}