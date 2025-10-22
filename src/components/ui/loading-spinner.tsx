import React from 'react';
import { cn } from '@/lib/utils';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl',
  className?: string,
  text?: string,
  variant?: 'default' | 'primary' | 'secondary' | 'gradient'
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'md',
  className,
  text,
  variant = 'default';
}) => {
  const sizeClasses = {
    sm: 'w-4 h-4 border-2',
    md: 'w-6 h-6 border-2',
    lg: 'w-8 h-8 border-3',
    xl: 'w-12 h-12 border-4'
  };

  const variantClasses = {
    default: 'border-gray-300 border-t-gray-600',
    primary: 'border-blue-200 border-t-blue-600',
    secondary: 'border-purple-200 border-t-purple-600',
    gradient: 'border-transparent bg-gradient-to-r from-blue-500 to-purple-500'
  };

  const textSizes = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base',
    xl: 'text-lg'
  };

  return (
    <div className={cn('flex flex-col items-center justify-center gap-3', className)}>
      <div className="relative">
        {variant === 'gradient' ? (
          <div className={cn(
            'rounded-full animate-spin',
            sizeClasses[size],
            'bg-gradient-to-r from-blue-500 to-purple-500'
          )}>
            <div className={cn(
              'absolute inset-1 bg-white rounded-full'
            )}></div>
          </div>
        ) : (
          <div className={cn(
            'animate-spin rounded-full border-solid',
            sizeClasses[size],
            variantClasses[variant]
          )}></div>
        )}
      </div>
      {text && (
        <p className={cn(
          'text-gray-600 font-medium animate-pulse',
          textSizes[size]
        )}>
          {text}
        </p>
      )}
    </div>
  );
};

export default LoadingSpinner;

// Professional Interview Loading Component
export const InterviewLoadingSpinner: React.FC<{ message?: string }> = ({ 
  message = "Preparing your interview experience...";
}) => {
  return (
    <div className="flex items-center justify-center min-h-[400px] p-8">
      <div className="text-center max-w-md">
        {/* Main Spinner */}
        <div className="relative mb-6">
          <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto"></div>
          <div className="absolute inset-0 w-16 h-16 border-4 border-transparent border-r-purple-600 rounded-full animate-spin mx-auto" 
               style={{ animationDirection: 'reverse', animationDuration: '1.5s' }}></div>
        </div>
        
        {/* Text */}
        <h3 className="text-xl font-semibold text-gray-800 mb-2">
          Getting Ready
        </h3>
        <p className="text-gray-600 animate-pulse">
          {message}
        </p>
        
        {/* Progress dots */}
        <div className="flex justify-center gap-1 mt-4">
          <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
          <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
          <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
        </div>
      </div>
    </div>
  );
};

// Submitting Answers Loading Component
export const SubmittingLoadingSpinner: React.FC<{ message?: string }> = ({ 
  message = "Submitting your answers...";
}) => {
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-8 shadow-2xl max-w-sm w-full mx-4">
        <div className="text-center">
          {/* Checkmark Animation Spinner */}
          <div className="relative mb-6">
            <div className="w-12 h-12 border-4 border-green-200 border-t-green-600 rounded-full animate-spin mx-auto"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-6 h-6 border-2 border-transparent border-t-green-600 rounded-full animate-spin"></div>
            </div>
          </div>
          
          <h3 className="text-lg font-semibold text-gray-800 mb-2">
            Processing Submission
          </h3>
          <p className="text-gray-600 text-sm animate-pulse">
            {message}
          </p>
          
          {/* Progress bar */}
          <div className="w-full bg-gray-200 rounded-full h-1.5 mt-4 overflow-hidden">
            <div className="bg-gradient-to-r from-green-500 to-blue-500 h-1.5 rounded-full animate-pulse w-3/4"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Question Generation Loading
export const QuestionGenerationSpinner: React.FC<{ count?: number }> = ({ count = 5 }) => {
  return (
    <div className="flex items-center justify-center p-12">
      <div className="text-center">
        <div className="relative mb-6">
          {/* Multiple spinning rings */}
          <div className="w-20 h-20 border-4 border-blue-100 rounded-full animate-spin mx-auto"></div>
          <div className="absolute inset-2 border-4 border-purple-100 border-t-purple-500 rounded-full animate-spin" 
               style={{ animationDirection: 'reverse', animationDuration: '1.2s' }}></div>
          <div className="absolute inset-4 border-4 border-blue-100 border-t-blue-500 rounded-full animate-spin" 
               style={{ animationDuration: '0.8s' }}></div>
        </div>
        
        <h3 className="text-xl font-bold text-gray-800 mb-2">
          Generating Questions
        </h3>
        <p className="text-gray-600 mb-4">
          Creating {count}+ unique questions for your interview...
        </p>
        
        {/* Steps */}
        <div className="space-y-2 text-sm text-gray-500">
          <div className="flex items-center justify-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span>Analyzing job requirements</span>
          </div>
          <div className="flex items-center justify-center gap-2 animate-pulse">
            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
            <span>Generating DSA problems</span>
          </div>
          <div className="flex items-center justify-center gap-2 text-gray-400">
            <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
            <span>Preparing interview rounds</span>
          </div>
        </div>
      </div>
    </div>
  );
};