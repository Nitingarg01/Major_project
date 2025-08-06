import { extractTextFromPDF } from "@/lib/pdfParse";
import { NextRequest, NextResponse } from "next/server";
import {GoogleGenerativeAI} from '@google/generative-ai'

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY ?? '')

export async function POST(request: NextRequest) {
    const formData = request.formData()
    const file = (await formData).get("resume") as File

    if (!file) {
        return NextResponse.json({ error: "No file Found" }, { status: 400 })
    }


    try {
        const buffer = Buffer.from(await file.arrayBuffer())
        console.log("Buffer length:", buffer.length);
        const textContent = await extractTextFromPDF(buffer)

        const promptForDetails = `
You are a resume parser for candidates applying to tech jobs.

Your task is to extract structured information from resumes (in PDF/DOC/DOCX format after parsing to text). Based on the input text, extract and return ONLY the following three fields in **pure JSON format**:

{
  "skills": ["<List technical skills like React, Python, etc.>"],
  "projects": ["<Short summaries of individual projects mentioned>"],
  "workex": ["<Short descriptions of each work experience>"]
}

Only return JSON — no explanations, comments, or extra text.

Extract the data from the following resume content:
${textContent}
`;
       const model = genAI.getGenerativeModel({
        model:"gemini-1.5-pro",
        generationConfig:{
            temperature:0.9
        }
       }
    )
       const result = model.generateContent(promptForDetails)
       const text = (await result).response.text()

       let extracted
       try {
        extracted = JSON.parse(text)
       } catch (error) {
        console.log(error)
        return NextResponse.json({error:"Error parsing LLM Response!"})
       }
        
        return NextResponse.json({ message: "resume parsed",data:extracted }, { status: 200 })
    } catch (error) {
        console.log("error wala error", error)
        return NextResponse.json({ error: "Resume Parsing Failed" }, { status: 500 })
    }
}