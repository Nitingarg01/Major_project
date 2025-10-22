import React from 'react';

export const LoaderFive = ({ className = "", size = "h-8 w-8" }: { className?: string, size?: string }) => {
  return (
    <div className={`animate-spin rounded-full border-b-2 border-blue-600 ${size} ${className}`}></div>
  )
}