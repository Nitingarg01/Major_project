'use client'
import React from 'react';

interface LoadingWrapperProps {
  children: React.ReactNode
  isLoading: boolean
  loadingMessage?: string
  loadingSubMessage?: string
}

const LoadingWrapper: React.FC<LoadingWrapperProps> = ({ 
  children, 
  isLoading, 
  loadingMessage = "Loading your dashboard...",
  loadingSubMessage = "Please wait while we fetch your data"
}) => {
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
        {/* Minimal Loading Navbar */}
        <nav className='w-full border-b border-gray-100 bg-white px-6 py-4'>
          <div className='flex justify-center items-center'>
            <div className='text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent'>
              AI Interview App
              Interview AI
            </div>
          </div>
        </nav>
        
        {/* Loading Content */}
        <div className="flex items-center justify-center" style={{ height: 'calc(100vh - 80px)' }}>
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-600 border-t-transparent mx-auto mb-6"></div>
            <div className="space-y-2">
              <p className="text-lg font-medium text-gray-700">{loadingMessage}</p>
              <p className="text-sm text-gray-500">{loadingSubMessage}</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return <>{children}</>;
}

export default LoadingWrapper;