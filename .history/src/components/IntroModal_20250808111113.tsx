'use client'
import React, { useEffect, useState } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogHeader } from './ui/dialog'
import { Button } from './ui/button'
import { DialogTitle } from '@radix-ui/react-dialog'
import InfoDivs from './InfoDivs'
import { instructions } from '@/constants/constants'
import { Mic, MicOff } from 'lucide-react'
import { ArrowRight } from 'lucide-react';
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"

type Props = {
    onStart: () => void
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
                            <div className='flex flex-col'>
                                <span>Your answers will be saved automatically as you move to another question</span>
                                <span><Badge variant='default'>Submit</Badge>Press Submit only after you have attempted all questions.</span>
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
