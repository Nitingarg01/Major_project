'use client'

import { useEffect, useRef, useState } from 'react';
import { VideoOff } from 'lucide-react';
import { Mic } from 'lucide-react';
import { MicOff } from 'lucide-react';
import { Camera } from 'lucide-react';
import { CameraOff } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipTrigger } from './ui/tooltip';
import { Textarea } from "@/components/ui/textarea"


const CameraFeed = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
   const recognitionRef = useRef(null);


  const [cameraOn, setCameraOn] = useState(false);
    const [micOn, setMicOn] = useState(false);
  const [transcript, setTranscript] = useState('');

  useEffect(() => {
    const startCamera = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (err) {
        console.error("Camera access error:", err);
      }
    };

    const stopCamera = () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
        streamRef.current = null;
      }
      if (videoRef.current) {
        videoRef.current.srcObject = null;
      }
    };

    if (cameraOn) {
      startCamera();
    } else {
      stopCamera();
    }

    return () => stopCamera();
  }, [cameraOn]);

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

    recognition.onerror = (e:any) => {
      console.error('Speech Recognition Error:', e);
    };

    recognitionRef.current = recognition;

    if (micOn) recognition.start();
    else recognition.stop();

    return () => recognition.stop();
  }, [micOn]);

  return (
    <div className="flex flex-col items-center gap-2">
      <div className='h-[250px] w-[250px] border-2 border-black flex items-center justify-center'>
  {!cameraOn ? (
    <div className="flex flex-col items-center text-gray-600">
      <VideoOff className="w-12 h-12 mb-2" />
      <span>Camera is Off</span>
    </div>
  ) : (
    <video
      ref={videoRef}
      autoPlay
      playsInline
      muted
      className="w-full h-full object-cover"
    />
  )}
</div>
<div className='flex flex-row gap-3'>
  <div onClick={()=>setCameraOn(prev=>!prev)}>
    {!cameraOn ? <Tooltip>
      <TooltipTrigger>
        <CameraOff/>
      </TooltipTrigger>
      <TooltipContent>
        Turn On Camera
      </TooltipContent>
    </Tooltip> : <Camera/>}
  </div>
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
 <div className="mt-3 w-[250px] min-h-[80px] border border-gray-400 p-2 text-sm rounded overflow-y-auto">
        <strong className="text-gray-700">Transcript:</strong>
        <div>{transcript || <span className="text-gray-400">No speech detected...</span>}</div>
      </div>
        <div className='w-full mt-2 flex flex-row justify-center items-center '>
                 <Textarea className='h-[12vh]' placeholder='Your answer here!'/>
              </div>
      {/* <button
        className={`px-4 py-2 text-white rounded ${
          cameraOn ? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-green-700'
        }`}
        onClick={() => setCameraOn(prev => !prev)}
      >
        {cameraOn ? 'Turn Camera OFF' : 'Turn Camera ON'}
      </button> */}
    </div>
  );
};

export default CameraFeed;
