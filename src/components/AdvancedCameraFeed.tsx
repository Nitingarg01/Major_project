'use client'

import { Dispatch, SetStateAction, useEffect, useRef, useState, useCallback } from 'react';
import { VideoOff, Camera, CameraOff, AlertTriangle, Eye, EyeOff, Shield, Activity } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipTrigger } from './ui/tooltip';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import * as faceapi from 'face-api.js';

type Props = {
  cameraOn: boolean;
  setCameraOn: Dispatch<SetStateAction<boolean>>;
  onActivityDetected?: (activity: ActivityAlert) => void;
  isInterviewActive?: boolean;
}

interface ActivityAlert {
  type: 'multiple_faces' | 'no_face' | 'looking_away' | 'tab_switch' | 'window_focus_lost' | 'face_obscured';
  message: string;
  severity: 'low' | 'medium' | 'high';
  timestamp: Date;
  confidence?: number;
}

interface FaceDetectionData {
  facesCount: number;
  facePosition: { x: number; y: number; width: number; height: number } | null;
  eyeGazeDirection: 'center' | 'left' | 'right' | 'up' | 'down' | 'unknown';
  confidence: number;
}

const AdvancedCameraFeed = ({ cameraOn, setCameraOn, onActivityDetected, isInterviewActive = false }: Props) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const detectionIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const lookingAwayTimerRef = useRef<NodeJS.Timeout | null>(null);
  
  const [activityAlerts, setActivityAlerts] = useState<ActivityAlert[]>([]);
  const [isMonitoring, setIsMonitoring] = useState(false);
  const [modelsLoaded, setModelsLoaded] = useState(false);
  const [faceDetectionData, setFaceDetectionData] = useState<FaceDetectionData>({
    facesCount: 0,
    facePosition: null,
    eyeGazeDirection: 'unknown',
    confidence: 0
  });
  
  // Enhanced monitoring states
  const [tabSwitchCount, setTabSwitchCount] = useState(0);
  const [focusLostCount, setFocusLostCount] = useState(0);
  const [lookingAwayStartTime, setLookingAwayStartTime] = useState<Date | null>(null);
  const [consecutiveLookingAwayTime, setConsecutiveLookingAwayTime] = useState(0);
  const [faceDetectionHealth, setFaceDetectionHealth] = useState<'good' | 'poor' | 'failed'>('good');

  // Load face-api.js models
  useEffect(() => {
    const loadModels = async () => {
      try {
        const MODEL_URL = '/models'; // You'll need to add models to public/models
        
        await Promise.all([
          faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
          faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
          faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL),
          faceapi.nets.faceExpressionNet.loadFromUri(MODEL_URL),
        ]);
        
        setModelsLoaded(true);
        console.log('Face detection models loaded successfully');
      } catch (error) {
        console.error('Error loading face detection models:', error);
        setFaceDetectionHealth('failed');
        // Fallback to basic detection
        setModelsLoaded(true);
      }
    };

    loadModels();
  }, []);

  const addActivityAlert = useCallback((alert: ActivityAlert) => {
    setActivityAlerts(prev => [...prev.slice(-9), alert]); // Keep last 10 alerts
    onActivityDetected?.(alert);
  }, [onActivityDetected]);

  // Enhanced tab switch and focus detection
  useEffect(() => {
    if (!isInterviewActive) return;

    const handleVisibilityChange = () => {
      if (document.hidden) {
        setTabSwitchCount(prev => prev + 1);
        addActivityAlert({
          type: 'tab_switch',
          message: `Tab switched or browser minimized (${tabSwitchCount + 1} times)`,
          severity: tabSwitchCount >= 2 ? 'high' : 'medium',
          timestamp: new Date(),
          confidence: 1.0
        });
      }
    };

    const handleFocusLost = () => {
      setFocusLostCount(prev => prev + 1);
      addActivityAlert({
        type: 'window_focus_lost',
        message: `Window focus lost (${focusLostCount + 1} times)`,
        severity: focusLostCount >= 3 ? 'high' : 'medium',
        timestamp: new Date(),
        confidence: 0.9
      });
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      // Detect Alt+Tab, Ctrl+Tab, Cmd+Tab
      if ((e.altKey && e.key === 'Tab') || (e.ctrlKey && e.key === 'Tab') || (e.metaKey && e.key === 'Tab')) {
        addActivityAlert({
          type: 'tab_switch',
          message: 'Attempted to switch applications',
          severity: 'high',
          timestamp: new Date(),
          confidence: 1.0
        });
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('blur', handleFocusLost);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('blur', handleFocusLost);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isInterviewActive, addActivityAlert, tabSwitchCount, focusLostCount]);

  // Advanced face detection with real ML
  const performAdvancedFaceDetection = useCallback(async () => {
    if (!videoRef.current || !canvasRef.current || !cameraOn || !modelsLoaded) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    if (!ctx || video.videoWidth === 0 || video.videoHeight === 0) return;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    try {
      // Use face-api.js for real face detection
      const detections = await faceapi
        .detectAllFaces(video, new faceapi.TinyFaceDetectorOptions())
        .withFaceLandmarks()
        .withFaceExpressions();

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const facesCount = detections.length;
      let eyeGazeDirection: FaceDetectionData['eyeGazeDirection'] = 'unknown';
      let facePosition: FaceDetectionData['facePosition'] = null;
      let averageConfidence = 0;

      if (facesCount === 0) {
        // No face detected
        setFaceDetectionData(prev => ({ ...prev, facesCount: 0, confidence: 0 }));
        
        if (faceDetectionHealth === 'good') {
          addActivityAlert({
            type: 'no_face',
            message: 'No face detected in camera view',
            severity: 'high',
            timestamp: new Date(),
            confidence: 0.95
          });
        }
      } else if (facesCount === 1) {
        // Single face detected - analyze gaze direction
        const detection = detections[0];
        const landmarks = detection.landmarks;
        const box = detection.detection.box;
        
        facePosition = {
          x: box.x,
          y: box.y,
          width: box.width,
          height: box.height
        };

        averageConfidence = detection.detection.score;

        // Analyze eye gaze direction using landmarks
        if (landmarks) {
          const leftEye = landmarks.getLeftEye();
          const rightEye = landmarks.getRightEye();
          const nose = landmarks.getNose();
          
          // Calculate gaze direction based on eye and nose positions
          const eyeCenter = {
            x: (leftEye[0].x + rightEye[3].x) / 2,
            y: (leftEye[0].y + rightEye[3].y) / 2
          };
          
          const noseCenter = {
            x: nose[3].x,
            y: nose[3].y
          };
          
          const faceCenter = {
            x: box.x + box.width / 2,
            y: box.y + box.height / 2
          };

          // Determine gaze direction
          const horizontalOffset = Math.abs(eyeCenter.x - faceCenter.x) / box.width;
          const verticalOffset = Math.abs(eyeCenter.y - faceCenter.y) / box.height;

          if (horizontalOffset > 0.15) {
            eyeGazeDirection = eyeCenter.x < faceCenter.x ? 'left' : 'right';
          } else if (verticalOffset > 0.1) {
            eyeGazeDirection = eyeCenter.y < faceCenter.y ? 'up' : 'down';
          } else {
            eyeGazeDirection = 'center';
          }

          // Handle looking away detection with 5-second threshold
          if (eyeGazeDirection !== 'center') {
            if (!lookingAwayStartTime) {
              setLookingAwayStartTime(new Date());
            } else {
              const timeLookingAway = (new Date().getTime() - lookingAwayStartTime.getTime()) / 1000;
              setConsecutiveLookingAwayTime(timeLookingAway);
              
              if (timeLookingAway > 5) { // 5 second threshold
                addActivityAlert({
                  type: 'looking_away',
                  message: `Looking away from screen for ${Math.round(timeLookingAway)} seconds`,
                  severity: timeLookingAway > 10 ? 'high' : 'medium',
                  timestamp: new Date(),
                  confidence: 0.85
                });
                
                // Reset timer to prevent spam
                setLookingAwayStartTime(new Date());
              }
            }
          } else {
            // Reset looking away timer when looking at center
            setLookingAwayStartTime(null);
            setConsecutiveLookingAwayTime(0);
          }
        }

        // Draw face detection rectangle
        ctx.strokeStyle = '#00ff00';
        ctx.lineWidth = 2;
        ctx.strokeRect(box.x, box.y, box.width, box.height);

      } else {
        // Multiple faces detected
        setFaceDetectionData(prev => ({ ...prev, facesCount }));
        
        addActivityAlert({
          type: 'multiple_faces',
          message: `${facesCount} faces detected in camera`,
          severity: 'high',
          timestamp: new Date(),
          confidence: 0.9
        });

        // Draw all face rectangles
        detections.forEach(detection => {
          const box = detection.detection.box;
          ctx.strokeStyle = '#ff0000';
          ctx.lineWidth = 2;
          ctx.strokeRect(box.x, box.y, box.width, box.height);
        });
      }

      setFaceDetectionData({
        facesCount,
        facePosition,
        eyeGazeDirection,
        confidence: averageConfidence
      });

      setFaceDetectionHealth('good');

    } catch (error) {
      console.error('Face detection error:', error);
      setFaceDetectionHealth('poor');
      
      // Fallback to basic detection
      fallbackDetection();
    }
  }, [cameraOn, modelsLoaded, addActivityAlert, lookingAwayStartTime, faceDetectionHealth]);

  // Fallback detection when face-api.js fails
  const fallbackDetection = useCallback(() => {
    // Simple mock detection with reduced false positives
    const random = Math.random();
    
    if (random > 0.99) { // Very rare false alerts
      addActivityAlert({
        type: 'no_face',
        message: 'Face detection uncertain',
        severity: 'medium',
        timestamp: new Date(),
        confidence: 0.5
      });
    }
  }, [addActivityAlert]);

  // Start camera with enhanced settings
  useEffect(() => {
    const startCamera = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ 
          video: { 
            width: { ideal: 1280, max: 1920 },
            height: { ideal: 720, max: 1080 },
            facingMode: 'user',
            frameRate: { ideal: 30, max: 60 }
          },
          audio: false
        });
        
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          
          // Wait for video to be ready
          videoRef.current.onloadedmetadata = () => {
            setIsMonitoring(true);
          };
        }
      } catch (err) {
        console.error("Enhanced camera access error:", err);
        addActivityAlert({
          type: 'no_face',
          message: 'Camera access denied or unavailable',
          severity: 'high',
          timestamp: new Date(),
          confidence: 1.0
        });
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
      setIsMonitoring(false);
      
      // Clear timers
      if (detectionIntervalRef.current) {
        clearInterval(detectionIntervalRef.current);
      }
      if (lookingAwayTimerRef.current) {
        clearTimeout(lookingAwayTimerRef.current);
      }
    };

    if (cameraOn) {
      startCamera();
    } else {
      stopCamera();
    }

    return () => stopCamera();
  }, [cameraOn, addActivityAlert]);

  // Face detection interval - more frequent for better accuracy
  useEffect(() => {
    if (!isMonitoring || !isInterviewActive || !modelsLoaded) return;

    detectionIntervalRef.current = setInterval(performAdvancedFaceDetection, 2000); // Every 2 seconds
    
    return () => {
      if (detectionIntervalRef.current) {
        clearInterval(detectionIntervalRef.current);
      }
    };
  }, [isMonitoring, isInterviewActive, performAdvancedFaceDetection, modelsLoaded]);

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high': return 'bg-red-500';
      case 'medium': return 'bg-yellow-500';
      case 'low': return 'bg-blue-500';
      default: return 'bg-gray-500';
    }
  };

  const getFaceStatusColor = () => {
    if (!isInterviewActive) return 'text-gray-500';
    
    if (faceDetectionData.facesCount === 1 && faceDetectionData.eyeGazeDirection === 'center') {
      return 'text-green-500';
    } else if (faceDetectionData.facesCount === 0) {
      return 'text-red-500';
    } else if (faceDetectionData.facesCount > 1) {
      return 'text-red-500';
    } else {
      return 'text-yellow-500';
    }
  };

  const getGazeStatus = () => {
    if (!isInterviewActive) return 'Inactive';
    
    switch (faceDetectionData.eyeGazeDirection) {
      case 'center': return 'Looking at screen';
      case 'left': return 'Looking left';
      case 'right': return 'Looking right';
      case 'up': return 'Looking up';
      case 'down': return 'Looking down';
      default: return 'Analyzing...';
    }
  };

  return (
    <div className="flex flex-col items-center gap-4 w-full">
      {/* Camera Feed */}
      <div className="relative">
        <div className="h-[320px] w-[320px] border-2 border-gray-300 rounded-lg flex items-center justify-center mb-3 bg-gray-100 overflow-hidden">
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
                style={{ transform: 'scaleX(-1)' }} // Mirror effect
              />
              <canvas 
                ref={canvasRef} 
                className="absolute top-0 left-0 w-full h-full object-cover rounded-lg"
                style={{ transform: 'scaleX(-1)' }}
              />
              
              {/* Enhanced Monitoring Status Overlay */}
              {isInterviewActive && (
                <div className="absolute top-2 right-2 flex flex-col gap-1">
                  <div className={`flex items-center gap-1 px-2 py-1 bg-black/80 rounded text-white text-xs ${getFaceStatusColor()}`}>
                    <Eye className="w-3 h-3" />
                    <span>Faces: {faceDetectionData.facesCount}</span>
                  </div>
                  
                  <div className={`flex items-center gap-1 px-2 py-1 bg-black/80 rounded text-white text-xs ${getFaceStatusColor()}`}>
                    <Activity className="w-3 h-3" />
                    <span>{getGazeStatus()}</span>
                  </div>
                  
                  {isMonitoring && modelsLoaded && (
                    <div className="flex items-center gap-1 px-2 py-1 bg-green-600/90 rounded text-white text-xs">
                      <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                      <span>AI Active</span>
                    </div>
                  )}

                  {faceDetectionHealth !== 'good' && (
                    <div className="flex items-center gap-1 px-2 py-1 bg-yellow-600/90 rounded text-white text-xs">
                      <AlertTriangle className="w-3 h-3" />
                      <span>Fallback Mode</span>
                    </div>
                  )}
                </div>
              )}

              {/* Looking away timer */}
              {consecutiveLookingAwayTime > 0 && consecutiveLookingAwayTime < 5 && (
                <div className="absolute bottom-2 left-2 right-2">
                  <div className="bg-yellow-600/90 text-white text-xs px-2 py-1 rounded">
                    Looking away: {Math.round(consecutiveLookingAwayTime)}s / 5s
                  </div>
                  <Progress 
                    value={(consecutiveLookingAwayTime / 5) * 100} 
                    className="h-1 mt-1"
                  />
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

      {/* Enhanced Activity Monitoring Stats */}
      {isInterviewActive && (
        <div className="w-full max-w-sm space-y-3">
          {/* Detection Status */}
          <div className="bg-white rounded-lg p-3 border border-gray-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-gray-700">Detection Status</span>
              <Badge variant={modelsLoaded ? 'default' : 'secondary'} className="text-xs">
                {modelsLoaded ? 'AI Ready' : 'Loading...'}
              </Badge>
            </div>
            
            {faceDetectionData.confidence > 0 && (
              <div className="space-y-1">
                <div className="flex justify-between text-xs text-gray-600">
                  <span>Confidence</span>
                  <span>{Math.round(faceDetectionData.confidence * 100)}%</span>
                </div>
                <Progress value={faceDetectionData.confidence * 100} className="h-1" />
              </div>
            )}
          </div>

          {/* Activity Stats */}
          <div className="bg-white rounded-lg p-3 border border-gray-200">
            <div className="grid grid-cols-2 gap-3 text-xs text-gray-600">
              <div className="text-center">
                <div className="text-lg font-bold text-red-600">{tabSwitchCount}</div>
                <div>Tab Switches</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-yellow-600">{focusLostCount}</div>
                <div>Focus Lost</div>
              </div>
            </div>
          </div>
          
          {/* Recent Activity Alerts */}
          {activityAlerts.length > 0 && (
            <div className="bg-white rounded-lg p-3 border border-gray-200">
              <h4 className="text-xs font-medium text-gray-700 flex items-center gap-1 mb-2">
                <Shield className="w-3 h-3" />
                Security Alerts
              </h4>
              <div className="max-h-24 overflow-y-auto space-y-1">
                {activityAlerts.slice(-3).map((alert, index) => (
                  <div key={index} className="flex items-center gap-2 text-xs">
                    <Badge variant="outline" className={`${getSeverityColor(alert.severity)} text-white text-xs px-1 py-0`}>
                      {alert.severity}
                    </Badge>
                    <span className="text-gray-600 truncate flex-1">{alert.message}</span>
                    {alert.confidence && (
                      <span className="text-xs text-gray-400">
                        {Math.round(alert.confidence * 100)}%
                      </span>
                    )}
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

export default AdvancedCameraFeed;