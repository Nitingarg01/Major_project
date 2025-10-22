'use client'
import React, { useState } from 'react';
import AdvancedCameraMonitoring from '@/components/AdvancedCameraMonitoring';

const TestCameraPage = () => {
  const [cameraOn, setCameraOn] = useState(false);
  const [alerts, setAlerts] = useState<any[]>([]);

  const handleActivityDetected = (activity: any) => {
    console.log('Activity detected:', activity)
    setAlerts(prev => [...prev.slice(-4), activity]) // Keep last 5 alerts;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto py-8">
        <h1 className="text-3xl font-bold text-center mb-8">Camera Monitoring Test Page</h1>
        <p className="text-center mb-8 text-gray-600">
          This page tests the AdvancedCameraMonitoring component to verify the video play() bug fixes.
        </p>
        
        <div className="max-w-md mx-auto">
          <AdvancedCameraMonitoring
            cameraOn={cameraOn}
            setCameraOn={setCameraOn}
            onActivityDetected={handleActivityDetected}
            isInterviewActive={true}
            monitoringLevel="moderate"
          />
        </div>

        {/* Activity Log */}
        {alerts.length > 0 && (
          <div className="mt-8 max-w-2xl mx-auto">
            <h2 className="text-xl font-semibold mb-4">Activity Alerts</h2>
            <div className="space-y-2">
              {alerts.map((alert, index) => (
                <div key={index} className="p-3 bg-white rounded shadow">
                  <div className="flex justify-between items-center">
                    <span className="font-medium">{alert.type}</span>
                    <span className={`text-xs px-2 py-1 rounded ${
                      alert.severity === 'high' ? 'bg-red-100 text-red-800' :;
                      alert.severity === 'medium' ? 'bg-yellow-100 text-yellow-800' :;
                      'bg-blue-100 text-blue-800'
                    }`}>
                      {alert.severity}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mt-1">{alert.message}</p>
                  <p className="text-xs text-gray-400 mt-1">
                    {alert.timestamp.toLocaleTimeString()}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default TestCameraPage;