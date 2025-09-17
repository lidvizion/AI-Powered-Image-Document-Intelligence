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
          group relative px-8 py-4 rounded-xl font-bold text-white transition-all duration-300
          focus:outline-none focus:ring-4 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-gray-900
          ${isDisabled
            ? 'bg-gray-400 dark:bg-gray-600 cursor-not-allowed'
            : 'bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 active:from-blue-800 active:to-blue-900 focus:ring-blue-500 shadow-lg hover:shadow-xl transform hover:-translate-y-1 hover:scale-105'
          }
        `}
        aria-label={isProcessing ? 'Processing analysis' : 'Run Lid Vizion analysis'}
      >
        <div className="flex items-center space-x-3">
          {isProcessing ? (
            <>
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              <span className="text-lg">Processing...</span>
            </>
          ) : (
            <>
              <div className="w-6 h-6 bg-white/20 rounded-lg flex items-center justify-center group-hover:bg-white/30 transition-colors duration-300">
                <svg 
                  className="w-4 h-4" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2} 
                    d="M13 10V3L4 14h7v7l9-11h-7z" 
                  />
                </svg>
              </div>
              <span className="text-lg">Run Analysis</span>
            </>
          )}
        </div>
        
        {!isDisabled && !isProcessing && (
          <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-white/0 via-white/20 to-white/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        )}
      </button>

      {!hasFile && !isProcessing && (
        <div className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>Upload an image or video to start analysis</span>
        </div>
      )}

      {hasFile && !isProcessing && (
        <div className="flex items-center space-x-2 text-sm text-green-600 dark:text-green-400">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>Ready to analyze your media</span>
        </div>
      )}

      {isProcessing && (
        <div className="flex items-center space-x-2 text-sm text-blue-600 dark:text-blue-400">
          <svg className="w-4 h-4 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>This may take a few moments...</span>
        </div>
      )}
    </div>
  );
}
