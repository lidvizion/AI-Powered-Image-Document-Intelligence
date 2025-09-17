'use client';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  text?: string;
  className?: string;
}

export default function LoadingSpinner({ size = 'md', text, className = '' }: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-6 w-6',
    lg: 'h-8 w-8'
  };

  return (
    <div className={`flex items-center justify-center ${className}`}>
      <div className="flex flex-col items-center space-y-3">
        <div className="relative">
          {/* Outer ring */}
          <div className={`${sizeClasses[size]} border-4 border-gray-200 dark:border-gray-700 rounded-full animate-spin`}></div>
          {/* Inner ring */}
          <div className={`${sizeClasses[size]} border-4 border-blue-600 border-t-transparent rounded-full animate-spin absolute top-0 left-0`}></div>
        </div>
        {text && (
          <p className="text-sm text-gray-600 dark:text-gray-400 animate-pulse">
            {text}
          </p>
        )}
      </div>
    </div>
  );
}
