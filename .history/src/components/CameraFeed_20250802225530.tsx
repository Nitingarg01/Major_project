'use client'

import { useEffect, useRef, useState } from 'react';
import { VideoOff } from 'lucide-react';
import { Mic } from 'lucide-react';
import { MicOff } from 'lucide-react';
import { Camera } from 'lucide-react';
import { CameraOff } from 'lucide-react';

const CameraFeed = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [cameraOn, setCameraOn] = useState(false);

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
    {cameraOn ? <CameraOff/> : <Camera/>}
  </div>
    <div>
    {/* {cameraOn ? <MicOff/> : <Mic/>} */}
    <MicOff/>
  </div>

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
