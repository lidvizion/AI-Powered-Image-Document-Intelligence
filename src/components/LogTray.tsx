'use client';

import { useState } from 'react';
import { LidVizionResult } from '@/lib/lv';

interface LogTrayProps {
  results: LidVizionResult | null;
  requestData: {
    fileName: string;
    fileSize: number;
    fileType: string;
    mediaType: string;
    timestamp: string;
  } | null;
  isProcessing: boolean;
}

export default function LogTray({ results, requestData, isProcessing }: LogTrayProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [activeTab, setActiveTab] = useState<'logs' | 'request' | 'response'>('logs');

  if (!results && !isProcessing && !requestData) {
    return null;
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 shadow-lg z-50">
      {/* Header */}
      <div 
        className="px-4 py-3 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className={`w-2 h-2 rounded-full ${
              isProcessing ? 'bg-yellow-500 animate-pulse' : 
              results?.success ? 'bg-green-500' : 'bg-red-500'
            }`} />
            <h3 className="font-medium text-gray-900 dark:text-gray-100">
              Processing Logs
            </h3>
            {results && (
              <span className="text-sm text-gray-500 dark:text-gray-400">
                Job ID: {results.jobId}
              </span>
            )}
          </div>
          <div className="flex items-center space-x-2">
            {results?.logs && (
              <span className="text-sm text-gray-500 dark:text-gray-400">
                {results.logs.length} entries
              </span>
            )}
            <svg 
              className={`w-5 h-5 text-gray-400 transition-transform duration-200 ${
                isExpanded ? 'rotate-180' : ''
              }`} 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>
      </div>

      {/* Expandable Content */}
      {isExpanded && (
        <div className="border-t border-gray-200 dark:border-gray-700">
          {/* Tab Navigation */}
          <div className="flex space-x-6 px-4 py-2 bg-gray-50 dark:bg-gray-800">
            <button
              onClick={() => setActiveTab('logs')}
              className={`py-2 px-1 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'logs'
                  ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
              }`}
            >
              Processing Logs
            </button>
            <button
              onClick={() => setActiveTab('request')}
              className={`py-2 px-1 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'request'
                  ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
              }`}
            >
              Request
            </button>
            <button
              onClick={() => setActiveTab('response')}
              className={`py-2 px-1 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'response'
                  ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
              }`}
            >
              Response
            </button>
          </div>

          {/* Tab Content */}
          <div className="max-h-64 overflow-y-auto">
            {activeTab === 'logs' && (
              <div className="p-4">
                {isProcessing ? (
                  <div className="flex items-center space-x-2 text-gray-600 dark:text-gray-400">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                    <span>Processing in progress...</span>
                  </div>
                ) : results?.logs && results.logs.length > 0 ? (
                  <div className="space-y-1 font-mono text-sm">
                    {results.logs.map((log, index) => (
                      <div key={index} className="flex items-start space-x-3">
                        <span className="text-gray-400 dark:text-gray-500 text-xs mt-0.5 w-8 text-right">
                          {String(index + 1).padStart(2, '0')}
                        </span>
                        <span className="text-gray-700 dark:text-gray-300 flex-1">{log}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 dark:text-gray-400 text-center py-4">No logs available</p>
                )}
              </div>
            )}

            {activeTab === 'request' && (
              <div className="p-4">
                {requestData ? (
                  <pre className="text-sm bg-gray-100 dark:bg-gray-800 rounded-lg p-3 overflow-x-auto">
                    <code className="text-gray-800 dark:text-gray-200">
                      {JSON.stringify(requestData, null, 2)}
                    </code>
                  </pre>
                ) : (
                  <p className="text-gray-500 dark:text-gray-400 text-center py-4">No request data available</p>
                )}
              </div>
            )}

            {activeTab === 'response' && (
              <div className="p-4">
                {results ? (
                  <pre className="text-sm bg-gray-100 dark:bg-gray-800 rounded-lg p-3 overflow-x-auto">
                    <code className="text-gray-800 dark:text-gray-200">
                      {JSON.stringify(results, null, 2)}
                    </code>
                  </pre>
                ) : (
                  <p className="text-gray-500 dark:text-gray-400 text-center py-4">No response data available</p>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
