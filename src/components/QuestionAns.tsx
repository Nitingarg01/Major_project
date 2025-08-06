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
import { useForm, useFormContext, UseFormReturn, useWatch,useFormState } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form, FormControl, FormField, FormItem } from './ui/form';
import { Button } from './ui/button';

type Question = {
    question: string,
    expectedAnswer: string
}

const qnaschema = z.object({
    submittedAns: z.string().min(10, "Please give longer answer")
})

const QuestionAns = ({ question,form,index}: { question: Question,form:UseFormReturn<any>,index:number}) => {
    const recognitionRef = useRef(null);


    const [micOn, setMicOn] = useState(false);
    const [transcript, setTranscript] = useState('');
     const fieldName = `submitted.${index}.answer`; // Dynamic field name for form

    const {control,setValue,getValues} = useFormContext()
    const value = useWatch({
        control,
        name:fieldName
    })
    const { errors } = useFormState({ control });
    const submittedErrors = errors?.submitted as Array<any> | undefined
    const errorMessage = submittedErrors?.[index]?.answer?.message;


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
            // setTranscript(prev => prev + final);
            const currentVal = getValues(fieldName) || ''
            setValue(fieldName,currentVal+final)
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
                    <Textarea placeholder='You Answer here' value={value || ''} onChange={(e) => {
                        // setTranscript(e.target.value)
                        console.log(e.target.value)
                        setValue(fieldName,e.target.value)
                        }} className='h-[13vh] overflow-scroll' />      
                        {errorMessage && <span className='text-sm text-red-500'>{errorMessage}</span>}
                                   
                </div>
            </div>
        </>

    )
}

export default QuestionAns
