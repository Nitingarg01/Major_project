'use client'
import React, { useEffect, useState } from 'react';
import IntroModal from './IntroModal';
import InterviewClientForm from './InterviewClientForm';
import { Question } from '@/types/interview';
import CameraFeed from './CameraFeed';

const InterviewWrapper = ({questions,id}:{questions:Question[],id:string}) => {

    const [started,setStarted] = useState<boolean>(false);
     const [cameraOn, setCameraOn] = useState(true);

       useEffect(() => {

    window.history.pushState(null, '', window.location.href);

    const onBackButtonEvent = (e:any) => {
      e.preventDefault();
      
      // Show warning popup
      const confirmationMessage = "The interview has started. Are you sure you want to leave? Your progress might be lost.";
      

      if (window.confirm(confirmationMessage)) {

        window.history.back();
      } else {
        
        window.history.pushState(null, '', window.location.href);
      }
    };

    window.addEventListener('popstate', onBackButtonEvent);

    return () => {
      window.removeEventListener('popstate', onBackButtonEvent);
    };
  }, []);

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

export default InterviewWrapper;
