'use client'
import { useState, useRef, useEffect } from 'react';
import React from 'react'
import { Tabs, TabsList, TabsContent, TabsTrigger } from './ui/tabs';
// import { questions } from '@/constants/constants';
import { Textarea } from "@/components/ui/textarea"
import { Tooltip, TooltipTrigger, TooltipContent } from './ui/tooltip';
import { Mic } from 'lucide-react';
import { MicOff } from 'lucide-react';
import z from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form, FormField, FormItem } from './ui/form';
import { Button } from './ui/button';

type Question = {
    question: string,
    expectedAnswer: string
}

const qnaschema = z.object({
    submittedAns: z.string().min(10, "Please give longer answer")
})

const QuestionAns = ({ question, index }: { question: Question, index: number }) => {
    const recognitionRef = useRef(null);


    const [cameraOn, setCameraOn] = useState(false);
    const [micOn, setMicOn] = useState(false);
    const [transcript, setTranscript] = useState('');

    const form = useForm<z.infer<typeof qnaschema>>({
        resolver: zodResolver(qnaschema),
        defaultValues: {
            submittedAns: ''
        }
    })

    const onSubmit = async (data: z.infer<typeof qnaschema>) => {
        console.log(data)
        console.log('hi')
    }

    useEffect(() => {
        const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

        if (!SpeechRecognition) {
            console.warn('Web Speech API is not supported in this browser.');
            return;
        }

        const recognition = new SpeechRecognition();
        recognition.lang = 'en-US';
        recognition.continuous = true;
        recognition.interimResults = true;

        recognition.onresult = (event: any) => {
            let final = '';
            for (let i = event.resultIndex; i < event.results.length; ++i) {
                const transcript = event.results[i][0].transcript;
                if (event.results[i].isFinal) final += transcript + ' ';
            }
            setTranscript(prev => prev + final);
        };

        recognition.onerror = (e: any) => {
            console.error('Speech Recognition Error:', e);
        };

        recognitionRef.current = recognition;

        if (micOn) recognition.start();
        else recognition.stop();

        return () => recognition.stop();
    }, [micOn]);


    return (
        <>
            <div className='flex flex-row justify-center'>
                <div onClick={() => setMicOn(prev => !prev)} className="cursor-pointer">
                    {micOn ? (
                        <Tooltip>
                            <TooltipTrigger><Mic /></TooltipTrigger>
                            <TooltipContent>Turn Off Mic</TooltipContent>
                        </Tooltip>
                    ) : (
                        <Tooltip>
                            <TooltipTrigger><MicOff /></TooltipTrigger>
                            <TooltipContent>Turn On Mic</TooltipContent>
                        </Tooltip>
                    )}
                </div>
            </div>
            <div className='flex flex-col gap-2 w-full'>
                <div className='h-[12vh]'>
                    {question.question}
                </div>
                <div className=' w-full'>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className='flex flex-col w-full '>
                            <FormField
                                control={form.control}
                                name='submittedAns'
                                render={({ field }) => {
                                    return (
                                        <FormItem>
                                            <Textarea placeholder='You Answer here' value={transcript} onChange={(e) => setTranscript(e.target.value)} className='h-full overflow-scroll' />
                                        </FormItem>
                                    )
                                }}
                            />
                            <div className='flex flex-row justify-center'>
                                <Button variant='default' className='mt-2 w-[10vw]' type='submit'>Submit Answer</Button>
                            </div>

                        </form>

                    </Form>

                </div>
            </div>
        </>

    )
}

export default QuestionAns
