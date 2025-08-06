'use client'

import { useEffect, useRef, useState } from 'react';

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
    <div className="flex flex-col items-center gap-4">
      <div className="w-full max-w-md aspect-video bg-black border rounded-lg overflow-hidden">
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="w-full h-full object-cover"
        />
      </div>

      <button
        className={`px-4 py-2 text-white rounded ${
          cameraOn ? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-green-700'
        }`}
        onClick={() => setCameraOn(prev => !prev)}
      >
        {cameraOn ? 'Turn Camera OFF' : 'Turn Camera ON'}
      </button>
    </div>
  );
};

export default CameraFeed;
