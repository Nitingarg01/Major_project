'use client'

import { useEffect, useRef, useState } from 'react';
import { VideoOff } from 'lucide-react';

const CameraFeed = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [cameraOn,setCameraOn] = useState<boolean>(false)

  useEffect(() => {
    const startCamera = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (err: any) {
        console.error("Camera error:", err);
        setError('Camera access denied or not available.');
      }
    };

    startCamera();

    return () => {
      // Cleanup: stop the camera when component unmounts
      if (videoRef.current && videoRef.current.srcObject) {
        const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
        tracks.forEach(track => track.stop());
      }
    };
  }, []);

  return (
    <div className="h-[300px] w-[300px] aspect-video bg-black border overflow-hidden">
      {error ? (
        <div className='h-[300px] w-[300px] border-2 border-black'>
                <VideoOff/>
              </div>
      ) : (
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="h-full w-full object-cover"
        />
      )}
    </div>
  );
};

export default CameraFeed;
