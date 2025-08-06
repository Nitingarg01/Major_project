'use client'
import { useState, useRef, useEffect } from 'react';
import React from 'react'
import { Tabs, TabsList, TabsContent, TabsTrigger } from './ui/tabs';
// import { questions } from '@/constants/constants';
import { Textarea } from "@/components/ui/textarea"

type Question = {
    question: string,
    expectedAnswer: string
}

const QuestionAns = ({ questions }: { questions: Question[] }) => {
    const recognitionRef = useRef(null);


    const [cameraOn, setCameraOn] = useState(false);
    const [micOn, setMicOn] = useState(false);
    const [transcript, setTranscript] = useState('');

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
            <div className='flex w-full flex-col gap-6'>
                <Tabs defaultValue='0'>
                    <TabsList className='flex flex-row gap-3'>
                        {questions.map((ques, index) => <TabsTrigger value={index.toString()} key={index}>Question {index + 1}</TabsTrigger>)}
                    </TabsList>

                    <div className='h-[11vh]'>
                        {questions.map((ques, index) => {
                            return (
                                <TabsContent value={index.toString()} className='flex flex-col gap-2' key={index}>
                                    <span>
                                        {ques.question}
                                    </span>

                                </TabsContent>

                            )
                        })}
                    </div>



                </Tabs>
            </div>
            {/* <CameraFeed /> */}
            <div className='w-full mt-2 flex flex-row justify-center items-center '>
                <Textarea className='h-[12vh]' placeholder='Your answer here!' />
            </div>
        </>

    )
}

export default QuestionAns
