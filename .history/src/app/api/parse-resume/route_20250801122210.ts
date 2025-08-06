import { extractTextFromPDF } from "@/lib/pdfParse";
import { NextRequest,NextResponse } from "next/server";

export async function POST(request:NextRequest){
    const formData = request.formData()
    const file = (await formData).get("resume") as File

    if(!file){
        return NextResponse.json({error:"No file Found"},{status:400})
    }

    try {
        const buffer = Buffer.from(await file.arrayBuffer())

        const textContent  =  await extractTextFromPDF(buffer)
        console.log(textContent)
        return NextResponse.json({"messge":"resume parsed"},{status:200})
    } catch (error) {
        console.log(error)
        return NextResponse.json({error:"Resume Parsing Failed"},{status:500})
    }
}