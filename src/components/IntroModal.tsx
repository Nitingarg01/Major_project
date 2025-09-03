'use client'
import React, { useEffect, useState } from 'react'
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogHeader } from './ui/dialog'
import { Button } from './ui/button'
import { DialogTitle } from '@radix-ui/react-dialog'
import InfoDivs from './InfoDivs'
import { instructions } from '@/constants/constants'
import { Mic, MicOff } from 'lucide-react'
import { ArrowRight } from 'lucide-react';
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft } from 'lucide-react';

type Props = {
    onStart: () => void;
    companyName?: string;
    jobTitle?: string;
    interviewType?: string;
    estimatedDuration?: number;
    rounds?: Array<{
        type: string;
        duration: number;
    }>;
}

const IntroModal = ({ onStart }: Props) => {

    const [open, setOpen] = useState<boolean>(true)

    const handleStart = () => {
        setOpen(false)
        onStart();
    }

    const [startBut,setStartBut] = useState<boolean>(false)
    const [timeValue,setTimeValue] = useState<number>(0)

    useEffect(()=>{
        const timer = setInterval(()=>{
            setTimeValue((prev:any)=>{
                if(prev>=100){
                    clearInterval(timer)
                    setStartBut(true)
                    return 100
                }
                return prev+10
            })
        },600)

        return ()=>clearInterval(timer)
    },[])

    return (
        <Dialog open={open}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle className='text-lg font-bold'>Important Instructions before Starting your Interview</DialogTitle>

                    <div className='flex flex-col gap-5'>
                        <div className='flex flex-col gap-3'>
                            <span className='text-md'> Interview duration will be: <span className='font-bold'>15 minutes</span></span>
                            <div className='flex flex-col gap-2 bg-gray-100 p-2'>
                                 <div className='flex flex-row justify-center '>
                                <div className='flex flex-row gap-3'>
                                     <MicOff/>
                                <ArrowRight/>
                                <Mic/>
                                <ArrowRight/>
                                <MicOff/>
                                </div>
                            </div>
                            <span className='text-xs'><span className='text-xs font-bold'>IMPORTANT : </span>Click On Mic Button to Record and then after completing your answer click again to save.</span>
                            </div>
                           
                            <div className='flex flex-col text-sm gap-2 bg-gray-100 '>
                                
                                <span className='flex flex-row gap-1'><span className='flex flex-row gap-2'><Badge variant='default'>Submit</Badge><ArrowLeft size={20}/></span><span className=''>Press Submit only after you have attempted all questions.</span></span>
                                <span className='p-1'>Your answers will be saved automatically as you move to another question</span>
                                
                            </div>

                        </div>
                        <div className='flex flex-col gap-2'>
                            {instructions.map((inst, index) => <InfoDivs message={inst.message} type={inst.type} key={index} />)}
                        </div>
                    </div>

                </DialogHeader>
{startBut ? <Button variant='default' className='' onClick={handleStart}>Start Interview</Button> : <Progress value={timeValue}/>}                
            </DialogContent>
          
        </Dialog>
    )
}

export default IntroModal
