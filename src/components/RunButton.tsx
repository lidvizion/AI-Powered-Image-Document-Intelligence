'use client';

interface RunButtonProps {
  onRun: () => void;
  disabled?: boolean;
  isProcessing?: boolean;
  hasFile?: boolean;
}

export default function RunButton({ 
  onRun, 
  disabled = false, 
  isProcessing = false, 
  hasFile = false 
}: RunButtonProps) {
  const isDisabled = disabled || isProcessing || !hasFile;

  return (
    <div className="flex flex-col items-center space-y-3">
      <button
        onClick={onRun}
        disabled={isDisabled}
        className={`
          relative px-8 py-3 rounded-lg font-semibold text-white transition-all duration-200
          focus:outline-none focus:ring-4 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-gray-900
          ${isDisabled
            ? 'bg-gray-400 dark:bg-gray-600 cursor-not-allowed'
            : 'bg-blue-600 hover:bg-blue-700 active:bg-blue-800 focus:ring-blue-500 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5'
          }
        `}
        aria-label={isProcessing ? 'Processing analysis' : 'Run Lid Vizion analysis'}
      >
        <div className="flex items-center space-x-2">
          {isProcessing ? (
            <>
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              <span>Processing...</span>
            </>
          ) : (
            <>
              <svg 
                className="w-5 h-5" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1m4 0h1m-6 4h.01M19 10a9 9 0 11-18 0 9 9 0 0118 0z" 
                />
              </svg>
              <span>Run Analysis</span>
            </>
          )}
        </div>
      </button>

      {!hasFile && !isProcessing && (
        <p className="text-sm text-gray-500 dark:text-gray-400 text-center">
          Upload an image or video to start analysis
        </p>
      )}

      {hasFile && !isProcessing && (
        <p className="text-sm text-green-600 dark:text-green-400 text-center">
          Ready to analyze your media
        </p>
      )}

      {isProcessing && (
        <p className="text-sm text-blue-600 dark:text-blue-400 text-center">
          This may take a few moments...
        </p>
      )}
    </div>
  );
}
