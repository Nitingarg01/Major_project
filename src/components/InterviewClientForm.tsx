'use client'
// import { questions } from '@/constants/constants'
import { zodResolver } from '@hookform/resolvers/zod'
import React, { useEffect,useState } from 'react'
import { FieldErrors, useForm } from 'react-hook-form'
import z from 'zod'
import { Form } from './ui/form'
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs'
import QuestionAns from './QuestionAns'
import { Button } from './ui/button'
import { getQuestions, setAnswers } from '@/app/interview/[id]/perform/actions'
import { Question } from '@/types/interview'
import axios from 'axios'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'

const schema = z.object({
    submitted: z.array(z.record(z.string(), z.string().min(20, 'Please Provide a detailed Answer')))
})



const InterviewClientForm = ({ 
    questions, 
    id, 
    roundId,
    onRoundComplete 
}: { 
    questions: Question[], 
    id: string,
    roundId?: string,
    onRoundComplete?: () => void 
}) => {

    const TOTAL_TIME = 30*60 // 30 minutes in seconds

    const [timeLeft, setTimeLeft] = useState(TOTAL_TIME)

    const form = useForm({
        resolver: zodResolver(schema),
        defaultValues: {
            submitted: Array(questions.length).fill({ 'answer': "" })
        }
    })

    const router = useRouter()

    const onSubmit = async (data: z.infer<typeof schema>) => {
        try {
            toast("Submitting Answers...")
            await setAnswers(data.submitted, id)
            toast.success("Answers Submitted Successfully!")
            
            // If this is part of a multi-round interview, trigger round completion
            if (onRoundComplete) {
                onRoundComplete()
            } else {
                // If it's a single round or final round, redirect to home
                setTimeout(() => {
                    router.push('/')
                }, 1500)
            }
        } catch (error) {
            console.error('Submission error:', error)
            toast.error("Answer Submission Failed. Please try again.")
        }
    }

    useEffect(() => {
        const timer = setInterval(() => {
            setTimeLeft((prev: number) => {
                if (prev <= 1) {
                    clearInterval(timer)
                    // Auto-submit when time runs out
                    const formData = form.getValues()
                    onSubmit(formData)
                    return 0
                }
                return prev - 1
            })
        }, 1000)

        // Cleanup function to clear timer when component unmounts
        return () => clearInterval(timer)
    }, [form, onSubmit]) // Add dependencies

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60)
        const secs = seconds % 60
        return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className='flex flex-col items-center gap-6 w-full'>
                <div className='text-sm font-bold'>
                    Time Left : {formatTime(timeLeft)}
                </div>
                
                <Tabs defaultValue='0'>
                    <TabsList>
                        {questions?.map((question, index) => {

                            return (
                                <TabsTrigger value={index.toString()} key={index}>
                                    Question {index + 1}
                                </TabsTrigger>
                            )
                        })}
                    </TabsList>

                    {questions?.map((question, index) => (
                        <TabsContent value={index.toString()} key={index}>
                            <QuestionAns question={question} key={index} form={form} index={index} />
                        </TabsContent>
                    ))}

                </Tabs>
                <Button variant='default' type='submit'>Submit</Button>
            </form>

        </Form>
    )
}

export default InterviewClientForm

