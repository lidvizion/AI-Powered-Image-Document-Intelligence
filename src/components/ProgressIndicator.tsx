'use client';

import { useState, useEffect } from 'react';

interface ProgressIndicatorProps {
  isProcessing: boolean;
  steps?: string[];
  className?: string;
}

export default function ProgressIndicator({ 
  isProcessing, 
  steps = [
    'Initializing analysis...',
    'Processing image data...',
    'Running object detection...',
    'Analyzing instances...',
    'Extracting text (OCR)...',
    'Generating results...'
  ],
  className = ''
}: ProgressIndicatorProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (!isProcessing) {
      setCurrentStep(0);
      setProgress(0);
      return;
    }

    const interval = setInterval(() => {
      setCurrentStep(prev => {
        const next = prev + 1;
        if (next >= steps.length) {
          setProgress(100);
          return prev;
        }
        setProgress((next / steps.length) * 100);
        return next;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isProcessing, steps.length]);

  if (!isProcessing) return null;

  return (
    <div className={`bg-white dark:bg-gray-900 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 ${className}`}>
      <div className="flex items-center space-x-4 mb-4">
        <div className="flex-shrink-0">
          <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
            <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          </div>
        </div>
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            Processing Analysis
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {steps[currentStep] || 'Finalizing...'}
          </p>
        </div>
        <div className="text-sm font-medium text-blue-600 dark:text-blue-400">
          {Math.round(progress)}%
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mb-4">
        <div 
          className="bg-blue-600 h-2 rounded-full transition-all duration-500 ease-out"
          style={{ width: `${progress}%` }}
        ></div>
      </div>

      {/* Steps */}
      <div className="space-y-2">
        {steps.map((step, index) => (
          <div 
            key={index}
            className={`flex items-center space-x-3 text-sm transition-all duration-300 ${
              index <= currentStep 
                ? 'text-blue-600 dark:text-blue-400' 
                : 'text-gray-400 dark:text-gray-500'
            }`}
          >
            <div className={`w-2 h-2 rounded-full transition-all duration-300 ${
              index < currentStep 
                ? 'bg-blue-600' 
                : index === currentStep 
                  ? 'bg-blue-400 animate-pulse' 
                  : 'bg-gray-300 dark:bg-gray-600'
            }`}></div>
            <span className={index <= currentStep ? 'font-medium' : ''}>
              {step}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
