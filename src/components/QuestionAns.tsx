'use client'
import { useState, useRef, useEffect } from 'react';
import React from 'react';
import { Tabs, TabsList, TabsContent, TabsTrigger } from './ui/tabs';
// import { questions } from '@/constants/constants';
import { Textarea } from "@/components/ui/textarea";
import { Tooltip, TooltipTrigger, TooltipContent } from './ui/tooltip';
import { Mic } from 'lucide-react';
import { MicOff } from 'lucide-react';
import z from 'zod';
import { useForm, useFormContext, UseFormReturn, useWatch,useFormState } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form, FormControl, FormField, FormItem } from './ui/form';
import { Button } from './ui/button';
import StreamingFeedback from './StreamingFeedback';

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
    const [showFeedback, setShowFeedback] = useState(false);
    const fieldName = `submitted.${index}.answer`; // Dynamic field name for form;

    const {control,setValue,getValues} = useFormContext();
    const value = useWatch({
        control,
        name:fieldName
    })
    const { errors } = useFormState({ control });
    const submittedErrors = errors?.submitted as Array<any> | undefined;
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
            const currentVal = getValues(fieldName) || '';
            setValue(fieldName,currentVal+final);
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
            <div className='flex flex-row justify-between items-center mb-4'>
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
                
                {/* Toggle Feedback Button */}
                {value && value.length > 20 && (
                    <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => setShowFeedback(!showFeedback)}
                    >
                        {showFeedback ? 'Hide Feedback' : 'Get AI Feedback'}
                    </Button>
                )}
            </div>
            
            <div className='flex flex-col gap-4 w-full'>
                <div className='bg-blue-50 p-4 rounded-lg border-l-4 border-blue-500'>
                    <h3 className="font-semibold text-blue-800 mb-2">Question {index + 1}:</h3>
                    <p className="text-gray-700">{question.question}</p>
                </div>
                
                <div className='w-full'>
                    <Textarea 
                        placeholder='Type your answer here or use the microphone...' 
                        value={value || ''} 
                        onChange={(e) => {
                            setValue(fieldName, e.target.value);
                        }} 
                        className='min-h-[120px] text-base' 
                    />      
                    {errorMessage && <span className='text-sm text-red-500 mt-1 block'>{errorMessage}</span>}                   
                </div>

                {/* Streaming Feedback Section */}
                {showFeedback && value && value.length > 20 && (
                    <div className="mt-6 border-t pt-6">
                        <StreamingFeedback
                            question={question.question}
                            userAnswer={value}
                            expectedAnswer={question.expectedAnswer}
                            difficulty="medium"
                        />
                    </div>
                )}
            </div>
        </>
    )
}

export default QuestionAns;
