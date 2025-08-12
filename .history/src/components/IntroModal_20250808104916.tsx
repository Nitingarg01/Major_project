'use client'
import React, { useState } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogHeader } from './ui/dialog'
import { Button } from './ui/button'
import { DialogTitle } from '@radix-ui/react-dialog'
import InfoDivs from './InfoDivs'
import { instructions } from '@/constants/constants'
import { Mic, MicOff } from 'lucide-react'
import { ArrowRight } from 'lucide-react';

type Props = {
    onStart: () => void
}

const IntroModal = ({ onStart }: Props) => {

    const [open, setOpen] = useState<boolean>(true)

    const handleStart = () => {
        setOpen(false)
        onStart();
    }

    return (
        <Dialog open={open}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle className='text-lg font-bold'>Important Instructions before Starting your Interview</DialogTitle>

                    <div className='flex flex-col gap-5'>
                        <div className='flex flex-col gap-3'>
                            <span className='text-md'> Interview duration will be: <span className='font-bold'>20 minutes</span></span>
                            <div className='flex flex-row justify-center '>
                                <div className='flex flex-row gap-3'>
                                     <MicOff/>
                                <ArrowRight/>
                                <Mic/>
                                <ArrowRight/>
                                <MicOff/>
                                </div>
                            </div>
                            <span className='text-sm'>Click On Mic Button to Record and then after completing your answer click again to save.</span>

                        </div>
                        <div className='flex flex-col gap-2'>
                            {instructions.map((inst, index) => <InfoDivs message={inst.message} type={inst.type} key={index} />)}
                        </div>
                    </div>

                </DialogHeader>

                <Button variant='default' className='' onClick={handleStart}>Start Interview</Button>
            </DialogContent>
        </Dialog>
    )
}

export default IntroModal
