'use client'

import { useEffect, useRef, useState } from 'react';

const CameraFeed = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [error, setError] = useState<string | null>(null);

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
    <div className="w-full max-w-md aspect-video bg-black border rounded-lg overflow-hidden">
      {error ? (
        <p className="text-red-600 p-4">{error}</p>
      ) : (
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="object-cover"
        />
      )}
    </div>
  );
};

export default CameraFeed;
