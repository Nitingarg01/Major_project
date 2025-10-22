'use client'

import { Dispatch, SetStateAction, useEffect, useRef, useState, useCallback } from 'react';
import { VideoOff, Camera, CameraOff, AlertTriangle, Eye, EyeOff } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipTrigger } from './ui/tooltip';
import { Badge } from './ui/badge';

type Props = {
  cameraOn: boolean;
  setCameraOn: Dispatch<SetStateAction<boolean>>;
  onActivityDetected?: (activity: ActivityAlert) => void;
  isInterviewActive?: boolean;
}

interface ActivityAlert {
  type: 'multiple_faces' | 'no_face' | 'looking_away' | 'tab_switch' | 'window_focus_lost';
  message: string;
  severity: 'low' | 'medium' | 'high';
  timestamp: Date;
}

const EnhancedCameraFeed = ({ cameraOn, setCameraOn, onActivityDetected, isInterviewActive = false }: Props) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  const [activityAlerts, setActivityAlerts] = useState<ActivityAlert[]>([]);
  const [isMonitoring, setIsMonitoring] = useState(false);
  const [faceDetectionStatus, setFaceDetectionStatus] = useState<'detecting' | 'face_found' | 'no_face' | 'multiple_faces'>('detecting');
  
  // Activity monitoring states
  const [tabSwitchCount, setTabSwitchCount] = useState(0);
  const [focusLostCount, setFocusLostCount] = useState(0);
  const [lastActivityCheck, setLastActivityCheck] = useState<Date>(new Date());

  const addActivityAlert = useCallback((alert: ActivityAlert) => {
    setActivityAlerts(prev => [...prev.slice(-4), alert]); // Keep last 5 alerts
    onActivityDetected?.(alert);
  }, [onActivityDetected]);

  // Tab switch and focus detection
  useEffect(() => {
    if (!isInterviewActive) return;

    const handleVisibilityChange = () => {
      if (document.hidden) {
        setTabSwitchCount(prev => prev + 1);
        addActivityAlert({
          type: 'tab_switch',
          message: 'Tab switched or browser minimized',
          severity: 'high',
          timestamp: new Date()
        });
      }
    };

    const handleFocusLost = () => {
      setFocusLostCount(prev => prev + 1);
      addActivityAlert({
        type: 'window_focus_lost',
        message: 'Window focus lost',
        severity: 'medium',
        timestamp: new Date()
      });
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('blur', handleFocusLost);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('blur', handleFocusLost);
    };
  }, [isInterviewActive, addActivityAlert]);

  // Simple face monitoring - just check if video is active and provide alerts
  const performFaceMonitoring = useCallback(async () => {
    if (!videoRef.current || !cameraOn) {
      setFaceDetectionStatus('no_face');
      addActivityAlert({
        type: 'no_face',
        message: 'No face detected - Camera not active',
        severity: 'high',
        timestamp: new Date()
      });
      return;
    }

    const video = videoRef.current;
    
    // Simple check - if video is playing and has data, assume face is present
    if (video.readyState >= 2 && !video.paused) {
      setFaceDetectionStatus('face_found');
    } else {
      setFaceDetectionStatus('no_face');
      addActivityAlert({
        type: 'no_face',
        message: 'Please ensure your face is visible in the camera',
        severity: 'medium',
        timestamp: new Date()
      });
    }
  }, [cameraOn, addActivityAlert]);

  // Start camera
  useEffect(() => {
    const startCamera = async () => {
      try {
        // Stop any existing stream first
        if (streamRef.current) {
          streamRef.current.getTracks().forEach(track => track.stop());
          streamRef.current = null;
        }
        
        const stream = await navigator.mediaDevices.getUserMedia({ 
          video: { 
            width: 640, 
            height: 480,
            facingMode: 'user'
          } 
        });
        streamRef.current = stream;
        
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          
<<<<<<< HEAD
          // Handle video play with improved error handling
          const playPromise = videoRef.current.play();
          
          if (playPromise !== undefined) {
            playPromise
              .then(() => {
                setIsMonitoring(true);
              })
              .catch((playError) => {
                // Handle AbortError specifically - this is expected when switching rapidly
                if (playError.name === 'AbortError') {
                  console.log('Video play was interrupted (normal during camera toggle)');
                } else {
                  console.error('Video play failed:', playError);
                  addActivityAlert({
                    type: 'no_face',
                    message: 'Video playback failed. Please check your browser settings.',
                    severity: 'high',
                    timestamp: new Date()
                  });
                  // Only retry for non-AbortError cases
                  setTimeout(async () => {
                    if (videoRef.current && streamRef.current && cameraOn) {
                      try {
                        await videoRef.current.play();
                        setIsMonitoring(true);
                      } catch (retryError) {
                        console.error('Video play retry failed:', retryError);
                        addActivityAlert({
                          type: 'no_face',
                          message: 'Video playback failed. Please refresh the page.',
                          severity: 'high',
                          timestamp: new Date()
                        });
                      }
                    }
                  }, 100);
                }
              });
=======
          // Handle video play with proper error handling
          try {
            await videoRef.current.play();
            setIsMonitoring(true);
          } catch (playError: any) {
            // Handle AbortError specifically
            if (playError.name === 'AbortError') {
              console.warn('Video play was interrupted, retrying...');
              // Wait a bit and try again
              setTimeout(async () => {
                if (videoRef.current && streamRef.current) {
                  try {
                    await videoRef.current.play();
                    setIsMonitoring(true);
                  } catch (retryError) {
                    console.error('Video play retry failed:', retryError);
                    addActivityAlert({
                      type: 'no_face',
                      message: 'Video playback failed. Please refresh the page.',
                      severity: 'high',
                      timestamp: new Date()
                    });
                  }
                }
              }, 100);
            } else {
              console.error('Video play failed:', playError);
              addActivityAlert({
                type: 'no_face',
                message: 'Video playback failed. Please check your browser settings.',
                severity: 'high',
                timestamp: new Date()
              });
            }
>>>>>>> e191508 (Initial commit)
          }
        }
      } catch (err) {
        console.error("Camera access error:", err);
        addActivityAlert({
          type: 'no_face',
          message: 'Camera access denied or unavailable',
          severity: 'high',
          timestamp: new Date()
        });
      }
    };

    const stopCamera = () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
        streamRef.current = null;
      }
      if (videoRef.current) {
<<<<<<< HEAD
        // Pause video before removing srcObject to prevent AbortError
        videoRef.current.pause();
=======
>>>>>>> e191508 (Initial commit)
        videoRef.current.srcObject = null;
      }
      setIsMonitoring(false);
    };

    if (cameraOn) {
      startCamera();
    } else {
      stopCamera();
    }

    return () => stopCamera();
  }, [cameraOn, addActivityAlert]);

  // Simple face monitoring interval
  useEffect(() => {
    if (!isMonitoring || !isInterviewActive) return;

    const interval = setInterval(performFaceMonitoring, 15000); // Check every 15 seconds
    return () => clearInterval(interval);
  }, [isMonitoring, isInterviewActive, performFaceMonitoring]);

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high': return 'bg-red-500';
      case 'medium': return 'bg-yellow-500';
      case 'low': return 'bg-blue-500';
      default: return 'bg-gray-500';
    }
  };

  const getFaceStatusColor = () => {
    switch (faceDetectionStatus) {
      case 'face_found': return 'text-green-500';
      case 'no_face': return 'text-red-500';
      case 'multiple_faces': return 'text-red-500';
      case 'detecting': return 'text-yellow-500';
      default: return 'text-gray-500';
    }
  };

  return (
    <div className="flex flex-col items-center gap-4 w-full">
      {/* Camera Feed */}
      <div className="relative">
        <div className="h-[280px] w-[280px] border-2 border-black rounded-lg flex items-center justify-center mb-3 bg-gray-100">
          {!cameraOn ? (
            <div className="flex flex-col items-center text-gray-600">
              <VideoOff className="w-16 h-16 mb-2" />
              <span className="text-sm font-medium">Camera is Off</span>
              <span className="text-xs text-gray-500 mt-1">Turn on camera for monitoring</span>
            </div>
          ) : (
            <>
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover rounded-lg"
              />
              
              {/* Simple monitoring overlay - no complex canvas needed */}
              
              {/* Monitoring Status Overlay */}
              {isInterviewActive && (
                <div className="absolute top-2 right-2 flex flex-col gap-1">
                  <div className={`flex items-center gap-1 px-2 py-1 bg-black/70 rounded text-white text-xs ${getFaceStatusColor()}`}>
                    <Eye className="w-3 h-3" />
                    <span>{faceDetectionStatus.replace('_', ' ')}</span>
                  </div>
                  {isMonitoring && (
                    <div className="flex items-center gap-1 px-2 py-1 bg-green-600/80 rounded text-white text-xs">
                      <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                      <span>Monitoring</span>
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>

        {/* Camera Controls */}
        <div className="flex justify-center gap-3">
          <Tooltip>
            <TooltipTrigger asChild>
              <div
                onClick={() => setCameraOn(prev => !prev)}
                className={`p-2 rounded-full cursor-pointer ${cameraOn ? 'bg-green-500 hover:bg-green-600' : 'bg-red-500 hover:bg-red-600'} text-white transition-colors`}
              >
                {cameraOn ? <Camera className="w-5 h-5" /> : <CameraOff className="w-5 h-5" />}
              </div>
            </TooltipTrigger>
            <TooltipContent>
              {cameraOn ? 'Turn Off Camera' : 'Turn On Camera'}
            </TooltipContent>
          </Tooltip>
        </div>
      </div>

      {/* Activity Monitoring Stats */}
      {isInterviewActive && (
        <div className="w-full max-w-sm">
          <div className="flex justify-between text-xs text-gray-600 mb-2">
            <span>Tab Switches: {tabSwitchCount}</span>
            <span>Focus Lost: {focusLostCount}</span>
          </div>
          
          {/* Recent Activity Alerts */}
          {activityAlerts.length > 0 && (
            <div className="space-y-1">
              <h4 className="text-xs font-medium text-gray-700 flex items-center gap-1">
                <AlertTriangle className="w-3 h-3" />
                Recent Activity
              </h4>
              <div className="max-h-20 overflow-y-auto space-y-1">
                {activityAlerts.slice(-3).map((alert, index) => (
                  <div key={index} className="flex items-center gap-2 text-xs">
                    <Badge variant="outline" className={`${getSeverityColor(alert.severity)} text-white text-xs`}>
                      {alert.severity}
                    </Badge>
                    <span className="text-gray-600 truncate flex-1">{alert.message}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default EnhancedCameraFeed;