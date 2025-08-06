'use client'

import { useEffect, useRef, useState } from 'react';
import { VideoOff } from 'lucide-react';
import { Mic } from 'lucide-react';
import { MicOff } from 'lucide-react';
import { Camera } from 'lucide-react';
import { CameraOff } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipTrigger } from './ui/tooltip';



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

 

  return (
    <div className="flex flex-col items-center gap-2 w-full">
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
      {/* <div className='flex flex-row gap-3'>
        <div onClick={() => setCameraOn(prev => !prev)}>
          {!cameraOn ? <Tooltip>
            <TooltipTrigger>
              <CameraOff />
            </TooltipTrigger>
            <TooltipContent>
              Turn On Camera
            </TooltipContent>
          </Tooltip> : <Camera />}
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
      </div> */}
     
    
    </div>
  );
};

export default CameraFeed;
