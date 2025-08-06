import { extractTextFromPDF } from "@/lib/pdfParse";
import { NextRequest,NextResponse } from "next/server";

export async function POST(request:NextRequest){
    const formData = request.formData()
    const file = (await formData).get("resume") as File

    if(!file){
        return NextResponse.json({error:"No file Found"},{status:400})
    }
    console.log("File received:", file.name, file.type, file.size);

    try {
        const buffer = Buffer.from(await file.arrayBuffer())
        console.log("Buffer length:", buffer.length);
        const textContent  =  await extractTextFromPDF(buffer)
        console.log(textContent)
        return NextResponse.json({"messge":"resume parsed"},{status:200})
    } catch (error) {
        console.log("error wala error",error)
        return NextResponse.json({error:"Resume Parsing Failed"},{status:500})
    }
}