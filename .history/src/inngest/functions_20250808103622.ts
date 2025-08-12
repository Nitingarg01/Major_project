import client from '@/lib/db'
import { inngest } from './client'
import { ObjectId } from 'mongodb'

import { GoogleGenerativeAI } from '@google/generative-ai'

import { modelUsed } from '@/constants/constants'

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY ?? '')

export const helloWorld = inngest.createFunction(
    {
        id: 'hello-world'
    },
    {
        event: 'text/hello-world'
    },
    async ({ event, step }) => {
        await step.sleep('wait-a-moment', '1s')
        return { message: `Hello ${event.data.email}` }
    }
)

export const createQuestions = inngest.createFunction(
    {
        id: 'create-questions'
    },
    {
        event: 'app/create-questions'
    },
    async ({ event, step }) => {
        const { id } = event.data
        console.log("create inngest",id)
        

        const db = client.db()
        
        const interview = await db.collection("interviews").findOne({ _id: new ObjectId(id) })
        

        const prompt = `Suppose you are an interviewer from the company : ${interview?.jobTitle} and you have to take an interview for the role of : ${interview?.jobDesc} which has the job Decription about the role as :${interview?.jobDesc}. The candidate has the following skills : ${interview?.skills?.map((skill: string) => skill).join(", ")} . The candidate has same projects whose description are : ${interview?.projectContext?.map((project: string) => project).join(", ")}. and the candidate also has a Work experience which is : ${interview?.workExDetails?.map((work: string) => work).join(", ")}. Now based of this information you have to generate 5 questions that are not more than 200 words to test the candidate around the given company and the given role. And also give the answer which is most apt answer according to you for that question. give it the format or an array of object of type: 

        {

            question:"",
            expectedAnswer:""
        }
            ONLY JSON CONTENT NO EXTRA CONTENT IS TO BE PRODUCED.

            IF THERE IS ANY ISSUE FOR YOU TO GENERATE THE ANSWERS JUST RETURN AN EMPTY ARRAY JSON BUT NEVER RETURN ANY TEXT.
            
        `


        const model = await genAI.getGenerativeModel({
            model: modelUsed,
            generationConfig: {
                temperature: 0.9
            }
        })

        

        let extracted;
        console.log('LLM Generated text!')

        try {
            const result = await model.generateContent(prompt)
        const text = (await result).response.text()
            const cleaned = text.replace(/```json\s*([\s\S]*?)\s*```/, '$1').trim();
            extracted = JSON.parse(cleaned)
        } catch (error) {
            console.error('Caught error:', error);
            return { message: 'Error Occured',error:error }
        }
        console.log('Text Converted to JSON!')

        const queDb = await db.collection("questions").insertOne({
            questions: extracted,
            answers: [],
            interviewId: id,
        })

        const inte = await db.collection("interviews").findOneAndUpdate(
            { _id: new ObjectId(id) },
            {
                $set: {
                    questions: queDb.insertedId
                }
            }
        );

        // console.log(prompt)
        await step.sleep('wait', '4s')
        return { questions: extracted, queDBId: queDb }
    }
)

export const generateInsights = inngest.createFunction(
    {id:'genrate-insights'},
    {event:'app/generateInsights'},
   async ({event,step})=>{

    const {interviewId} = event.data
    const objId = new ObjectId(interviewId)
    console.log("iske liye",interviewId)

    const db = client.db();
    // await step.sleep('wait', '2s')

    const questionsDoc = await db.collection("questions").findOne({interviewId:interviewId})

    const length = questionsDoc?.answers.length
    let qnaArr = []

    for(let i=0;i<length;i++){
        const obj = {
            question:questionsDoc?.questions[i]?.question,
            expectedAnswer:questionsDoc?.questions[i]?.expectedAnswer,
            answer:questionsDoc?.answers[i]?.answer
        }
        qnaArr.push(obj)
    }

    // console.log(questionsDoc)

    
    const prompt = `Suppose you are an STRICT scrorer who has to score a candidate and generate a report on following parameters given as :
    
    1. Depth of Knowledge

    This insight assesses a candidate's ability to move beyond theoretical knowledge. A high score shows they can discuss specific implementation details, trade-offs, and how to design solutions around a technology's limitations, demonstrating practical, real-world experience rather than just a textbook understanding. 

    2. Impact-Oriented Mindset

    This insight evaluates a candidate's focus on the business value of their work. A strong candidate quantifies their achievements using specific metrics (like Lighthouse scores) and clearly explains how their technical decisions translated into tangible benefits for the user experience, company, or team.

    3. Architectural Flexibility

    This insight measures a candidate's adaptability to complex, modern system designs. It tests their understanding of advanced patterns like micro-frontends and microservices, and their ability to apply core software engineering principles to new and challenging distributed environments.

    4. Problem-Solving and Debugging Skills

    This insight assesses a candidate's methodical approach to resolving technical issues. A high score indicates a systematic, logical process for debugging, including the ability to use specific tools, form hypotheses, and test them, rather than relying on a vague, unstructured approach.

    5. Collaboration and Communication

    This insight evaluates a candidate's effectiveness in a team. It focuses on their understanding of collaborative practices like writing clean, testable code, documenting APIs, and making technical decisions that benefit the long-term maintainability and success of a project for all team members.


    You will be given the questions that were asked, what would have been the expectedAnswer and what are the actual answers. 

    The array of objects of which you have you judge would be consisting of objects which has is like 
    {
    question:",
    expectedAnswer:"",
    answer:""
    }

    

    The QUESTIONS GIVEN TO YOU ARE  : [
    ${qnaArr.map((qna)=>JSON.stringify(qna)).join(", ")}
    ]

    NOW FOR THIS ARRAY OF QUESTIONS, EXPECTED ANSWERS AND ANSWERS GENERATE THE FOLLOWING : 



    1. Overall Score out of 10 for the candidate for this answers

    2. Scores of the above 5 parameters out of 10

    3. Brief advice of what could have been improved in each question in 100 words only(THE QUESTION WOULD BE FROM THE GIVEN QUESTIONS ARRAY ONLY!!)

    4. And an overall verdict for the candidate in 50 words.

    Output json should be THIS AND ONLY THIS FOMAT IN JSON
    extracted:{
    overallScore:number,
    parameterScores:{
    depthOfKnowledge:number,
    impactOrientedMindset:number,
    architecturalFlexibility:number,
    problemSolvingAndDebuggingSkills:number,
    collaborationAndCommunication:number
    },
    adviceForImprovement:[
    {
    question:string,
    advice:string
    }
    ],
    overallVerdict
    }
Object
overallScore
7.5

parameterScores
Object
depthOfKnowledge
7
impactOrientedMindset
6.5
architecturalFlexibility
8
problemSolvingAndDebuggingSkills
8
collaborationAndCommunication
8

adviceForImprovement
Array (5)
overallVerdict


    

    RETURN ONLY JSON CONTENT NO EXTRA CONTENT IS TO BE GIVEN BACK.

    ONLY JSON CONTENT NO EXTRA CONTENT IS TO BE PRODUCED.
    `
     const model = genAI.getGenerativeModel({
            model: modelUsed,
            generationConfig: {
                temperature: 0.9
            }
        })

        const result = model.generateContent(prompt)
        const text = (await result).response.text()

        // console.log(prompt)

        let extracted;

        try {
            const cleaned = text.replace(/```json\s*([\s\S]*?)\s*```/, '$1').trim();
            extracted = JSON.parse(cleaned)
        } catch (error) {
            console.log(error)
            return { message: 'Error Occured' }
        }

        // console.log("extr",extracted)

        const qid = await db.collection("questions").findOneAndUpdate(
            {interviewId:interviewId},
            {
                $set:{
                   extracted
                }
            }
        )
        // console.log("qis",qid)

        await step.sleep('wait', '4s')
        return {message:'Statistics Generated',queDB:qid?._id}

   }
)