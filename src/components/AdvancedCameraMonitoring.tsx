'use client'

import { Dispatch, SetStateAction, useEffect, useRef, useState, useCallback } from 'react';
import { VideoOff, Camera, CameraOff, AlertTriangle, Eye, EyeOff, Users, Monitor, AlertCircle } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipTrigger } from './ui/tooltip';
import { Badge } from './ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { motion, AnimatePresence } from 'framer-motion';

type Props = {
  cameraOn: boolean,
  setCameraOn: Dispatch<SetStateAction<boolean>>;
  onActivityDetected?: (activity: ActivityAlert) => void;
  isInterviewActive?: boolean;
  monitoringLevel?: 'basic' | 'moderate' | 'strict'
}

interface ActivityAlert {
  type: 'multiple_faces' | 'no_face' | 'looking_away' | 'tab_switch' | 'window_focus_lost' | 'camera_blocked' | 'suspicious_movement',
  message: string,
  severity: 'low' | 'medium' | 'high',
  timestamp: Date;
  count?: number
}

interface MonitoringStats {
  totalAlerts: number,
  tabSwitches: number,
  focusLost: number,
  cameraIssues: number,
  suspiciousActivity: number,
  monitoringDuration: number
}

const AdvancedCameraMonitoring = ({ 
  cameraOn, 
  setCameraOn, 
  onActivityDetected, 
  isInterviewActive = false,
  monitoringLevel = 'moderate';
}: Props) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const monitoringIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const lastFrameRef = useRef<ImageData | null>(null);
  
  const [activityAlerts, setActivityAlerts] = useState<ActivityAlert[]>([]);
  const [isMonitoring, setIsMonitoring] = useState(false);
  const [faceDetectionStatus, setFaceDetectionStatus] = useState<'detecting' | 'face_found' | 'no_face' | 'multiple_faces' | 'error'>('detecting');
  const [monitoringStats, setMonitoringStats] = useState<MonitoringStats>({
    totalAlerts: 0,
    tabSwitches: 0,
    focusLost: 0,
    cameraIssues: 0,
    suspiciousActivity: 0,
    monitoringDuration: 0
  });
  
  // Enhanced tracking states
  const [tabSwitchCount, setTabSwitchCount] = useState(0);
  const [focusLostCount, setFocusLostCount] = useState(0);
  const [cameraBlockedCount, setCameraBlockedCount] = useState(0);
  const [suspiciousMovementCount, setSuspiciousMovementCount] = useState(0);
  const [lastActivityTime, setLastActivityTime] = useState<Date>(new Date());
  const [isLookingAway, setIsLookingAway] = useState(false);
  const [multipleFacesDetected, setMultipleFacesDetected] = useState(false);

  const addActivityAlert = useCallback((alert: ActivityAlert) => {
    setActivityAlerts(prev => {
      const newAlerts = [...prev.slice(-9), alert]; // Keep last 10 alerts
      return newAlerts;
    });
    
    // Update stats
    setMonitoringStats(prev => ({
      ...prev,
      totalAlerts: prev.totalAlerts + 1,
      tabSwitches: alert.type === 'tab_switch' ? prev.tabSwitches + 1 : prev.tabSwitches,
      focusLost: alert.type === 'window_focus_lost' ? prev.focusLost + 1 : prev.focusLost,
      cameraIssues: alert.type === 'camera_blocked' || alert.type === 'no_face' ? prev.cameraIssues + 1 : prev.cameraIssues,
      suspiciousActivity: alert.type === 'suspicious_movement' || alert.type === 'multiple_faces' ? prev.suspiciousActivity + 1 : prev.suspiciousActivity
    }));

    onActivityDetected?.(alert);
    setLastActivityTime(new Date());
  }, [onActivityDetected]);

  // Enhanced browser activity monitoring
  useEffect(() => {
    if (!isInterviewActive) return;

    const handleVisibilityChange = () => {
      if (document.hidden) {
        setTabSwitchCount(prev => prev + 1);
        addActivityAlert({
          type: 'tab_switch',
          message: 'Tab switched or browser minimized during interview',
          severity: monitoringLevel === 'strict' ? 'high' : 'medium',
          timestamp: new Date(),
          count: tabSwitchCount + 1
        });
      }
    };

    const handleFocusLost = () => {
      setFocusLostCount(prev => prev + 1);
      addActivityAlert({
        type: 'window_focus_lost',
        message: 'Browser window lost focus',
        severity: 'medium',
        timestamp: new Date(),
        count: focusLostCount + 1
      });
    };

    const handleKeyboardShortcuts = (e: KeyboardEvent) => {
      // Detect common cheating shortcuts
      const suspiciousShortcuts = [
        { key: 'F12', desc: 'Developer tools' },
        { key: 'F5', desc: 'Page refresh' },
        { key: 'Alt+Tab', desc: 'Application switching' }
      ];

      const isDevTools = e.key === 'F12' || (e.ctrlKey && e.shiftKey && e.key === 'I');
      const isRefresh = e.key === 'F5' || (e.ctrlKey && e.key === 'r');
      const isAltTab = e.altKey && e.key === 'Tab';

      if (isDevTools || isRefresh || isAltTab) {
        setSuspiciousMovementCount(prev => prev + 1);
        addActivityAlert({
          type: 'suspicious_movement',
          message: `Suspicious keyboard shortcut detected: ${e.key}`,
          severity: 'high',
          timestamp: new Date()
        });
      }
    };

    // Enhanced monitoring based on level
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('blur', handleFocusLost);
    
    if (monitoringLevel === 'moderate' || monitoringLevel === 'strict') {
      document.addEventListener('keydown', handleKeyboardShortcuts);
    }

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('blur', handleFocusLost);
      document.removeEventListener('keydown', handleKeyboardShortcuts);
    };
  }, [isInterviewActive, monitoringLevel, addActivityAlert, tabSwitchCount, focusLostCount]);

  // Enhanced face detection and monitoring
  const performAdvancedMonitoring = useCallback(async () => {
    if (!videoRef.current || !cameraOn || !canvasRef.current) {
      setFaceDetectionStatus('no_face');
      if (cameraOn) {
        setCameraBlockedCount(prev => prev + 1);
        addActivityAlert({
          type: 'camera_blocked',
          message: 'Camera appears to be blocked or not functioning',
          severity: 'high',
          timestamp: new Date()
        });
      }
      return;
    }

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    
    if (!ctx || video.readyState < 2) {
      setFaceDetectionStatus('detecting');
      return;
    }

    try {
      // Set canvas size to match video
      canvas.width = video.videoWidth || 640;
      canvas.height = video.videoHeight || 480;
      
      // Draw current frame
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const currentFrame = ctx.getImageData(0, 0, canvas.width, canvas.height);
      
      // Basic motion detection
      if (lastFrameRef.current) {
        const motionLevel = detectMotion(lastFrameRef.current, currentFrame);
        
        if (motionLevel > 0.8) {
          setSuspiciousMovementCount(prev => prev + 1);
          addActivityAlert({
            type: 'suspicious_movement',
            message: 'High level of movement detected',
            severity: 'medium',
            timestamp: new Date()
          });
        }
      }
      
      lastFrameRef.current = currentFrame;
      
      // Simple face detection (using video dimensions and motion)
      const hasMovement = video.readyState >= 2 && !video.paused;
      
      if (hasMovement) {
        setFaceDetectionStatus('face_found');
        setIsLookingAway(false);
      } else {
        setFaceDetectionStatus('no_face');
        addActivityAlert({
          type: 'no_face',
          message: 'No face detected in camera feed',
          severity: 'medium',
          timestamp: new Date()
        });
      }

    } catch (error) {
      console.error('Monitoring error:', error);
      setFaceDetectionStatus('error');
    }
  }, [cameraOn, addActivityAlert]);

  // Simple motion detection algorithm
  const detectMotion = (frame1: ImageData, frame2: ImageData): number => {
    if (frame1.data.length !== frame2.data.length) return 0;
    
    let diff = 0;
    const threshold = 30;
    
    for (let i = 0; i < frame1.data.length; i += 4) {
      const r1 = frame1.data[i], g1 = frame1.data[i + 1], b1 = frame1.data[i + 2];
      const r2 = frame2.data[i], g2 = frame2.data[i + 1], b2 = frame2.data[i + 2];
      
      const pixelDiff = Math.abs(r1 - r2) + Math.abs(g1 - g2) + Math.abs(b1 - b2);
      if (pixelDiff > threshold) diff++;
    }
    
    return diff / (frame1.data.length / 4);
  };

  // Camera management with improved error handling
  useEffect(() => {
    const startCamera = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ 
          video: { 
            width: { ideal: 640 }, 
            height: { ideal: 480 },
            facingMode: 'user',
            frameRate: { ideal: 30 }
          } 
        });
        
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          
          // Enhanced play() handling to prevent AbortError
          // Improved play() handling to fix the play() request error
          const playPromise = videoRef.current.play();
          
          if (playPromise !== undefined) {
            playPromise
              .then(() => {
                // Video started successfully
                setIsMonitoring(true);
                setFaceDetectionStatus('detecting');
              })
              .catch((error) => {
                // Handle the play() request interruption error
                if (error.name === 'AbortError') {
                  console.log('Video play was interrupted (normal during rapid toggling)');
                  // Don't add alert for AbortError as it's expected behavior
                } else {
                  console.error("Video play error:", error);
                  addActivityAlert({
                    type: 'camera_blocked',
                    message: 'Camera playback failed',
                console.error("Video play error:", error);
                // Handle the play() request interruption error
                if (error.name !== 'AbortError') {
                  addActivityAlert({
                    type: 'camera_blocked',
                    message: 'Camera playback interrupted',
                    severity: 'medium',
                    timestamp: new Date()
                  });
                }
              });
          }
        }
      } catch (err) {
        console.error("Camera access error:", err);
        setCameraBlockedCount(prev => prev + 1);
        addActivityAlert({
          type: 'camera_blocked',
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
        // Pause before removing srcObject to prevent play() request errors
        videoRef.current.pause();
        videoRef.current.srcObject = null;
      }
      setIsMonitoring(false);
      setFaceDetectionStatus('detecting');
    };

    if (cameraOn) {
      startCamera();
    } else {
      stopCamera();
    }

    return () => stopCamera();
  }, [cameraOn, addActivityAlert]);

  // Monitoring interval
  useEffect(() => {
    if (!isMonitoring || !isInterviewActive) {
      if (monitoringIntervalRef.current) {
        clearInterval(monitoringIntervalRef.current);
        monitoringIntervalRef.current = null;
      }
      return;
    }

    const intervalTime = monitoringLevel === 'strict' ? 5000 :;
                        monitoringLevel === 'moderate' ? 10000 : 15000;

    monitoringIntervalRef.current = setInterval(performAdvancedMonitoring, intervalTime);

    return () => {
      if (monitoringIntervalRef.current) {
        clearInterval(monitoringIntervalRef.current);
      }
    };
  }, [isMonitoring, isInterviewActive, monitoringLevel, performAdvancedMonitoring]);

  // Update monitoring duration
  useEffect(() => {
    if (!isInterviewActive) return;

    const interval = setInterval(() => {
      setMonitoringStats(prev => ({
        ...prev,
        monitoringDuration: prev.monitoringDuration + 1
      }));
    }, 1000);

    return () => clearInterval(interval);
  }, [isInterviewActive]);

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high': return 'bg-red-500 border-red-600';
      case 'medium': return 'bg-yellow-500 border-yellow-600';
      case 'low': return 'bg-blue-500 border-blue-600';
      default: return 'bg-gray-500 border-gray-600';
    }
  };

  const getFaceStatusColor = () => {
    switch (faceDetectionStatus) {
      case 'face_found': return 'text-green-500';
      case 'no_face': return 'text-red-500';
      case 'multiple_faces': return 'text-red-500';
      case 'detecting': return 'text-yellow-500';
      case 'error': return 'text-red-500';
      default: return 'text-gray-500';
    }
  };

  const getMonitoringLevelBadge = () => {
    const colors = {
      basic: 'bg-blue-100 text-blue-800',
      moderate: 'bg-yellow-100 text-yellow-800',
      strict: 'bg-red-100 text-red-800'
    };
    
    return colors[monitoringLevel];
  };

  return (
    <div className="flex flex-col items-center gap-4 w-full">
      {/* Camera Feed */}
      <Card className="w-full">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm flex items-center gap-2">
              <Monitor className="w-4 h-4" />
              Camera Monitor
            </CardTitle>
            <Badge className={getMonitoringLevelBadge()}>
              {monitoringLevel} monitoring
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="relative">
            <div className="h-[280px] w-full border-2 border-gray-300 rounded-lg flex items-center justify-center bg-gray-100 overflow-hidden">
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
                  
                  {/* Hidden canvas for processing */}
                  <canvas
                    ref={canvasRef}
                    className="hidden"
                  />
                  
                  {/* Status Overlays */}
                  {isInterviewActive && (
                    <div className="absolute top-2 right-2 flex flex-col gap-1">
                      <motion.div 
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className={`flex items-center gap-1 px-2 py-1 bg-black/70 rounded text-white text-xs ${getFaceStatusColor()}`}
                      >
                        <Eye className="w-3 h-3" />
                        <span>{faceDetectionStatus.replace('_', ' ')}</span>
                      </motion.div>
                      
                      {isMonitoring && (
                        <motion.div
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          className="flex items-center gap-1 px-2 py-1 bg-green-600/80 rounded text-white text-xs"
                        >
                          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                          <span>Active</span>
                        </motion.div>
                      )}
                      
                      {multipleFacesDetected && (
                        <motion.div
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          className="flex items-center gap-1 px-2 py-1 bg-red-600/80 rounded text-white text-xs"
                        >
                          <Users className="w-3 h-3" />
                          <span>Multiple faces</span>
                        </motion.div>
                      )}
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Camera Controls */}
            <div className="flex justify-center gap-3 mt-3">
              <Tooltip>
                <TooltipTrigger asChild>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setCameraOn(prev => !prev)}
                    className={`p-3 rounded-full cursor-pointer ${
                      cameraOn 
                        ? 'bg-green-500 hover:bg-green-600' 
                        : 'bg-red-500 hover:bg-red-600'
                    } text-white transition-colors shadow-lg`}
                  >
                    {cameraOn ? <Camera className="w-5 h-5" /> : <CameraOff className="w-5 h-5" />}
                  </motion.button>
                </TooltipTrigger>
                <TooltipContent>
                  {cameraOn ? 'Turn Off Camera' : 'Turn On Camera'}
                </TooltipContent>
              </Tooltip>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Monitoring Statistics */}
      {isInterviewActive && (
        <Card className="w-full">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <AlertCircle className="w-4 h-4" />
              Monitoring Stats
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="flex justify-between">
                <span className="text-gray-600">Tab Switches:</span>
                <span className="font-medium">{monitoringStats.tabSwitches}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Focus Lost:</span>
                <span className="font-medium">{monitoringStats.focusLost}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Camera Issues:</span>
                <span className="font-medium">{monitoringStats.cameraIssues}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Suspicious:</span>
                <span className="font-medium">{monitoringStats.suspiciousActivity}</span>
              </div>
            </div>
            
            <div className="mt-3 pt-3 border-t border-gray-200 flex justify-between text-xs">
              <span className="text-gray-600">Total Alerts:</span>
              <span className="font-medium">{monitoringStats.totalAlerts}</span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recent Activity Alerts */}
      {isInterviewActive && activityAlerts.length > 0 && (
        <Card className="w-full">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <AlertTriangle className="w-4 h-4" />
              Recent Activity ({activityAlerts.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="max-h-32 overflow-y-auto space-y-2">
              <AnimatePresence>
                {activityAlerts.slice(-5).map((alert, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="flex items-center gap-2 text-xs p-2 bg-gray-50 rounded"
                  >
                    <Badge 
                      variant="outline" 
                      className={`${getSeverityColor(alert.severity)} text-white text-xs px-1 py-0`}
                    >
                      {alert.severity}
                    </Badge>
                    <span className="text-gray-700 truncate flex-1">{alert.message}</span>
                    <span className="text-gray-500 text-xs">
                      {alert.timestamp.toLocaleTimeString()}
                    </span>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default AdvancedCameraMonitoring;