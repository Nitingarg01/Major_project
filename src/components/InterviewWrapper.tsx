'use client'
import React, { useState } from 'react'
import IntroModal from './IntroModal'
import InterviewClientForm from './InterviewClientForm'
import { Question } from '@/types/interview'
import CameraFeed from './CameraFeed'

const InterviewWrapper = ({questions,id}:{questions:Question[],id:string}) => {

    const [started,setStarted] = useState<boolean>(false)
     const [cameraOn, setCameraOn] = useState(true);

  return (
    <>
    {!started && (
        <IntroModal onStart={()=>setStarted(true)}/>
    )}
    {started && (
        <>
        <CameraFeed cameraOn={cameraOn} setCameraOn={setCameraOn}/>
        <InterviewClientForm questions={questions} id={id}/>
        </>
    )}
      
    </>
  )
}

export default InterviewWrapper
