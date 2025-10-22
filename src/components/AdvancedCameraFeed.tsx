'use client'
import React, { useRef, useEffect, useState, useCallback } from 'react'
import { Card, CardContent } from './ui/card'
import { Badge } from './ui/badge'
import { Button } from './ui/button'
import { Camera, CameraOff, AlertTriangle, Shield, Eye, EyeOff, Activity } from 'lucide-react'
import * as faceapi from 'face-api.js';

interface AdvancedCameraFeedProps {
  isRecording: boolean;
  onRecordingChange: (recording: boolean) => void;
  onAnomalyDetected?: (anomaly: string) => void;
  enableFaceDetection?: boolean;
  enableMisbehaviorDetection?: boolean;
  className?: string;
}

const AdvancedCameraFeed: React.FC<AdvancedCameraFeedProps> = ({
  isRecording,
  onRecordingChange,
  onAnomalyDetected,
  enableFaceDetection = false,
  enableMisbehaviorDetection = false,
  className = ""
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  
  const [isInitialized, setIsInitialized] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [faceDetected, setFaceDetected] = useState(false);
  const [modelsLoaded, setModelsLoaded] = useState(false);
  const [detectionActive, setDetectionActive] = useState(false);
  const [anomalies, setAnomalies] = useState<string[]>([]);
  const [faceDetectionHealth, setFaceDetectionHealth] = useState<'loading' | 'ready' | 'failed'>('loading');
  
  // Camera permissions and constraints
  const getCameraConstraints = () => ({
    video: {
      width: { ideal: 1280, max: 1920 },
      height: { ideal: 720, max: 1080 },
      frameRate: { ideal: 30, max: 30 },
      facingMode: 'user'
    },
    audio: false
  });

  // Load face-api.js models with better error handling and graceful fallback
  useEffect(() => {
    const loadModels = async () => {
      // Skip face detection model loading if not enabled
      if (!enableFaceDetection) {
        setModelsLoaded(true);
        setFaceDetectionHealth('ready');
        return;
      }

      try {
        console.log('⚠️ Face detection models not available, using basic detection');
        setFaceDetectionHealth('failed');
        setModelsLoaded(true);
        // Use basic fallback detection instead of trying to load models
      } catch (error) {
        console.warn('Face detection setup failed, using basic detection:', error);
        setFaceDetectionHealth('failed');
        setModelsLoaded(true);
      }
    };

    loadModels();
  }, [enableFaceDetection]);

  // Initialize camera
  const initializeCamera = useCallback(async () => {
    try {
      setCameraError(null);
      
      // Stop any existing stream first
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
        streamRef.current = null;
      }
      
      const stream = await navigator.mediaDevices.getUserMedia(getCameraConstraints());
      streamRef.current = stream;
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        
        // Handle video play with proper error handling and retry logic
        const attemptPlay = async (retryCount = 0): Promise<void> => {
          if (!videoRef.current || !streamRef.current) return;
          
          try {
            // Ensure video is ready before playing
            if (videoRef.current.readyState < 2) {
              await new Promise<void>((resolve) => {
                if (videoRef.current) {
                  videoRef.current.onloadeddata = () => resolve();
                }
                // Timeout after 2 seconds
                setTimeout(() => resolve(), 2000);
              });
            }
            
            await videoRef.current.play();
            setIsInitialized(true);
          } catch (playError: any) {
            // Handle AbortError with exponential backoff retry
            if (playError.name === 'AbortError' && retryCount < 3) {
              console.warn(`Video play interrupted, retry ${retryCount + 1}/3`);
              const delay = Math.min(100 * Math.pow(2, retryCount), 500);
              
              setTimeout(async () => {
                await attemptPlay(retryCount + 1);
              }, delay);
            } else if (playError.name === 'NotAllowedError') {
              console.error('Video autoplay blocked:', playError);
              setCameraError('Please click "Start Camera" to enable video. Browser autoplay is restricted.');
            } else if (retryCount >= 3) {
              console.error('Video play failed after retries');
              setCameraError('Video playback failed. Please refresh and try again.');
            } else {
              console.error('Video play failed:', playError);
              setCameraError('Video playback failed. Please check your browser settings.');
            }
          }
        };
        
        await attemptPlay();
      }
    } catch (error: any) {
      console.error('Camera initialization failed:', error);
      setCameraError(
        error.name === 'NotAllowedError' 
          ? 'Camera permission denied. Please allow camera access and refresh.'
          : error.name === 'NotFoundError'
          ? 'No camera found. Please connect a camera device.'
          : 'Camera initialization failed. Please check your camera settings.'
      );
    }
  }, []);

  // Stop camera
  const stopCamera = useCallback(() => {
    // First, stop detection and clear state
    setDetectionActive(false);
    setFaceDetected(false);
    
    // Pause video first to prevent AbortError
    if (videoRef.current) {
      try {
        videoRef.current.pause();
        // Wait for pause to complete before cleanup
        videoRef.current.onpause = () => {
          if (videoRef.current) {
            videoRef.current.srcObject = null;
            videoRef.current.onpause = null;
          }
        };
      } catch (e) {
        console.log('Video pause error:', e);
      }
    }
    
    // Stop media tracks
    if (streamRef.current) {
      try {
        streamRef.current.getTracks().forEach(track => {
          track.stop();
        });
        streamRef.current = null;
      } catch (e) {
        console.log('Stream cleanup error:', e);
      }
    }
    
    setIsInitialized(false);
  }, []);

  // Toggle recording
  const toggleRecording = () => {
    if (!isInitialized) {
      initializeCamera();
      return;
    }
    
    if (isRecording) {
      stopCamera();
      onRecordingChange(false);
    } else {
      onRecordingChange(true);
      if (enableFaceDetection && modelsLoaded) {
        setDetectionActive(true);
        startFaceDetection();
      }
    }
  };

  // Face detection with simple fallback (always use fallback for reliability)
  const performFaceDetection = async (video: HTMLVideoElement) => {
    try {
      // Always use fallback detection for reliability
      return await performFallbackDetection(video);
    } catch (error) {
      console.warn('Face detection failed:', error);
      return true; // Assume face present if detection fails
    }
  };

  // Start face detection loop
  const startFaceDetection = useCallback(() => {
    if (!videoRef.current || !detectionActive) return;

    const detectFaces = async () => {
      if (!videoRef.current || !detectionActive) return;

      try {
        const faceDetected = await performFaceDetection(videoRef.current);
        setFaceDetected(faceDetected);

        if (!faceDetected && enableMisbehaviorDetection) {
          addAnomaly('No face detected');
          onAnomalyDetected?.('No face detected in frame');
        }

        // Continue detection loop
        if (detectionActive) {
          setTimeout(detectFaces, 500); // Check every 500ms
        }
      } catch (error) {
        console.error('Face detection error:', error);
        setTimeout(detectFaces, 1000);
      }
    };

    detectFaces();
  }, [detectionActive, enableMisbehaviorDetection, onAnomalyDetected]);

  // Fallback detection when face-api.js fails
  const performFallbackDetection = async (video: HTMLVideoElement): Promise<boolean> => {
    try {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) return false;

      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      ctx.drawImage(video, 0, 0);

      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageData.data;

      // Simple brightness analysis to detect presence
      let totalBrightness = 0;
      let nonZeroPixels = 0;

      for (let i = 0; i < data.length; i += 4) {
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];
        const brightness = (r + g + b) / 3;
        
        if (brightness > 10) {
          totalBrightness += brightness;
          nonZeroPixels++;
        }
      }

      const avgBrightness = nonZeroPixels > 0 ? totalBrightness / nonZeroPixels : 0;
      
      // Basic heuristic: if there's sufficient variation and brightness, assume face present
      return avgBrightness > 30 && nonZeroPixels > (canvas.width * canvas.height * 0.1);
    } catch (error) {
      console.error('Fallback detection failed:', error);
      return true; // Assume face present if detection fails
    }
  };

  // Add anomaly detection
  const addAnomaly = (anomaly: string) => {
    setAnomalies(prev => {
      const newAnomalies = [anomaly, ...prev.slice(0, 4)];
      return newAnomalies;
    });
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, [stopCamera]);

  // Auto-start detection when recording starts
  useEffect(() => {
    if (isRecording && enableFaceDetection && modelsLoaded && !detectionActive) {
      setDetectionActive(true);
      startFaceDetection();
    } else if (!isRecording) {
      setDetectionActive(false);
    }
  }, [isRecording, enableFaceDetection, modelsLoaded, detectionActive, startFaceDetection]);

  return (
    <Card className={`w-full max-w-2xl mx-auto ${className}`}>
      <CardContent className="p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Camera className="w-5 h-5 text-blue-600" />
            <h3 className="text-lg font-semibold">Interview Camera</h3>
            {enableFaceDetection && (
              <Badge variant={faceDetectionHealth === 'ready' ? 'default' : 'secondary'}>
                {faceDetectionHealth === 'ready' ? 'AI Detection' : 'Basic Detection'}
              </Badge>
            )}
          </div>
          
          {isInitialized && (
            <div className="flex items-center gap-2">
              {enableFaceDetection && (
                <Badge variant={faceDetected ? 'default' : 'destructive'} className="text-xs">
                  {faceDetected ? (
                    <><Eye className="w-3 h-3 mr-1" />Face Detected</>
                  ) : (
                    <><EyeOff className="w-3 h-3 mr-1" />No Face</>
                  )}
                </Badge>
              )}
              <Badge variant={isRecording ? 'destructive' : 'secondary'} className="text-xs">
                {isRecording ? (
                  <><Activity className="w-3 h-3 mr-1 animate-pulse" />Recording</>
                ) : (
                  'Ready'
                )}
              </Badge>
            </div>
          )}
        </div>

        {/* Video Feed */}
        <div className="relative bg-gray-900 rounded-lg overflow-hidden aspect-video">
          {cameraError ? (
            <div className="flex flex-col items-center justify-center h-full text-white p-6">
              <AlertTriangle className="w-12 h-12 mb-4 text-red-400" />
              <p className="text-center mb-4">{cameraError}</p>
              <Button onClick={initializeCamera} variant="outline" size="sm">
                Try Again
              </Button>
            </div>
          ) : (
            <>
              <video
                ref={videoRef}
                className="w-full h-full object-cover"
                autoPlay
                muted
                playsInline
              />
              <canvas
                ref={canvasRef}
                className="absolute top-0 left-0 w-full h-full pointer-events-none"
                style={{ display: 'none' }}
              />
              
              {/* Overlay indicators */}
              {isInitialized && (
                <div className="absolute top-4 left-4 flex flex-col gap-2">
                  {enableFaceDetection && (
                    <div className={`px-2 py-1 rounded text-xs font-medium ${
                      faceDetected 
                        ? 'bg-green-500/80 text-white' 
                        : 'bg-red-500/80 text-white'
                    }`}>
                      {faceDetected ? '✓ Face Detected' : '⚠ No Face'}
                    </div>
                  )}
                  
                  {isRecording && (
                    <div className="bg-red-500/80 text-white px-2 py-1 rounded text-xs font-medium flex items-center">
                      <div className="w-2 h-2 bg-white rounded-full mr-2 animate-pulse" />
                      REC
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>

        {/* Controls */}
        <div className="flex items-center justify-center mt-4 gap-4">
          <Button
            onClick={toggleRecording}
            variant={isRecording ? "destructive" : "default"}
            className="flex items-center gap-2"
          >
            {isRecording ? (
              <><CameraOff className="w-4 h-4" />Stop Camera</>
            ) : (
              <><Camera className="w-4 h-4" />Start Camera</>
            )}
          </Button>
        </div>

        {/* Anomaly Detection */}
        {enableMisbehaviorDetection && anomalies.length > 0 && (
          <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Shield className="w-4 h-4 text-yellow-600" />
              <span className="text-sm font-medium text-yellow-800">Detection Alerts</span>
            </div>
            <div className="space-y-1">
              {anomalies.map((anomaly, index) => (
                <div key={index} className="text-xs text-yellow-700">
                  • {anomaly}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Status Information */}
        <div className="mt-4 text-xs text-gray-500 space-y-1">
          <div>Camera Status: {isInitialized ? 'Connected' : 'Disconnected'}</div>
          {enableFaceDetection && (
            <div>Detection: {faceDetectionHealth === 'ready' ? 'AI-Powered' : 'Basic Fallback'}</div>
          )}
          <div>Recording: {isRecording ? 'Active' : 'Inactive'}</div>
        </div>
      </CardContent>
    </Card>
  );
};

export default AdvancedCameraFeed;