'use client'

import { Dispatch, SetStateAction, useEffect, useRef, useState } from 'react';
import { VideoOff } from 'lucide-react';
import { Mic } from 'lucide-react';
import { MicOff } from 'lucide-react';
import { Camera } from 'lucide-react';
import { CameraOff } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipTrigger } from './ui/tooltip';

type Props= {
  cameraOn:boolean,
  setCameraOn:Dispatch<SetStateAction<boolean>>
}



const CameraFeed = ({cameraOn,setCameraOn}:Props) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const recognitionRef = useRef(null);


  // const [cameraOn, setCameraOn] = useState(true);
  const [micOn, setMicOn] = useState(false);
  const [transcript, setTranscript] = useState('');

  useEffect(() => {
    const startCamera = async () => {
      try {
        // Stop any existing stream first
        if (streamRef.current) {
          streamRef.current.getTracks().forEach(track => track.stop());
          streamRef.current = null;
        }
        
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        streamRef.current = stream;
        
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          
          // Handle video play with improved error handling
          const playPromise = videoRef.current.play();
          
          if (playPromise !== undefined) {
            playPromise
              .then(() => {
                // Video started successfully
              })
              .catch((playError) => {
                // Handle AbortError specifically - this is expected when switching rapidly
                if (playError.name === 'AbortError') {
                  console.log('Video play was interrupted (normal during camera toggle)');
                } else {
                  console.error('Video play failed:', playError);
                  // Only retry for non-AbortError cases
                  setTimeout(async () => {
                    if (videoRef.current && streamRef.current && cameraOn) {
                      try {
                        await videoRef.current.play();
                      } catch (retryError) {
                        console.error('Video play retry failed:', retryError);
                      }
                    }
                  }, 100);
                }
              });
          // Handle video play with proper error handling
          try {
            await videoRef.current.play();
          } catch (playError: any) {
            // Handle AbortError specifically
            if (playError.name === 'AbortError') {
              console.warn('Video play was interrupted, retrying...');
              // Wait a bit and try again
              setTimeout(async () => {
                if (videoRef.current && streamRef.current) {
                  try {
                    await videoRef.current.play();
                  } catch (retryError) {
                    console.error('Video play retry failed:', retryError);
                  }
                }
              }, 100);
            } else {
              console.error('Video play failed:', playError);
            }
          }
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
        // Pause video before removing srcObject to prevent AbortError
        videoRef.current.pause();
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
      <div className='h-[220px] w-[220px] border-2 border-black flex items-center justify-center mb-3'>
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
