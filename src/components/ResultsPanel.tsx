'use client';

import { useState } from 'react';
import { LidVizionResult } from '@/lib/lv';

interface ResultsPanelProps {
  results: LidVizionResult | null;
  isProcessing: boolean;
  error: string | null;
}

export default function ResultsPanel({ results, isProcessing, error }: ResultsPanelProps) {
  const [activeTab, setActiveTab] = useState<'results' | 'logs'>('results');

  if (error) {
    return (
      <div className="bg-white dark:bg-gray-900 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center space-x-3">
          <svg className="w-6 h-6 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
          <div>
            <h3 className="text-lg font-semibold text-red-600 dark:text-red-400">Processing Error</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  if (isProcessing) {
    return (
      <div className="bg-white dark:bg-gray-900 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center space-x-3">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Processing</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">Analyzing your media with Lid Vizion...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!results) {
    return (
      <div className="bg-white dark:bg-gray-900 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <div className="text-center">
          <svg className="w-12 h-12 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">No Results Yet</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">Upload media and click &quot;Run Analysis&quot; to see results</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-900 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
      {/* Tab Headers */}
      <div className="border-b border-gray-200 dark:border-gray-700">
        <nav className="flex space-x-8 px-6" aria-label="Tabs">
          <button
            onClick={() => setActiveTab('results')}
            className={`py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
              activeTab === 'results'
                ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
            }`}
          >
            Results ({results.results?.summary.totalDetections || 0})
          </button>
          <button
            onClick={() => setActiveTab('logs')}
            className={`py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
              activeTab === 'logs'
                ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
            }`}
          >
            Logs ({results.logs?.length || 0})
          </button>
        </nav>
      </div>

      {/* Tab Content */}
      <div className="p-6">
        {activeTab === 'results' && (
          <div className="space-y-6">
            {/* Summary */}
            {results.results?.summary && (
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {results.results.summary.totalDetections && (
                  <div className="bg-blue-50 dark:bg-blue-950 rounded-lg p-4">
                    <div className="flex items-center">
                      <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                        <span className="text-white font-semibold text-sm">{results.results.summary.totalDetections}</span>
                      </div>
                      <div className="ml-3">
                        <p className="text-sm font-medium text-blue-900 dark:text-blue-100">Detections</p>
                        <p className="text-xs text-blue-600 dark:text-blue-400">Bounding boxes</p>
                      </div>
                    </div>
                  </div>
                )}

                {results.results.summary.totalInstances && (
                  <div className="bg-green-50 dark:bg-green-950 rounded-lg p-4">
                    <div className="flex items-center">
                      <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                        <span className="text-white font-semibold text-sm">{results.results.summary.totalInstances}</span>
                      </div>
                      <div className="ml-3">
                        <p className="text-sm font-medium text-green-900 dark:text-green-100">Instances</p>
                        <p className="text-xs text-green-600 dark:text-green-400">Segmentation masks</p>
                      </div>
                    </div>
                  </div>
                )}

                {results.results.summary.totalLabels && (
                  <div className="bg-purple-50 dark:bg-purple-950 rounded-lg p-4">
                    <div className="flex items-center">
                      <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center">
                        <span className="text-white font-semibold text-sm">{results.results.summary.totalLabels}</span>
                      </div>
                      <div className="ml-3">
                        <p className="text-sm font-medium text-purple-900 dark:text-purple-100">Labels</p>
                        <p className="text-xs text-purple-600 dark:text-purple-400">Classifications</p>
                      </div>
                    </div>
                  </div>
                )}

                {results.results.summary.totalBlocks && (
                  <div className="bg-amber-50 dark:bg-amber-950 rounded-lg p-4">
                    <div className="flex items-center">
                      <div className="w-8 h-8 bg-amber-500 rounded-full flex items-center justify-center">
                        <span className="text-white font-semibold text-sm">{results.results.summary.totalBlocks}</span>
                      </div>
                      <div className="ml-3">
                        <p className="text-sm font-medium text-amber-900 dark:text-amber-100">OCR Blocks</p>
                        <p className="text-xs text-amber-600 dark:text-amber-400">Text extraction</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Results Sections */}
            <div className="space-y-6">
              {/* Detections */}
              {results.results?.detections && results.results.detections.length > 0 && (
                <div>
                  <h4 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Object Detections</h4>
                  <div className="space-y-3">
                    {results.results.detections.map((detection) => (
                      <div key={detection.id} className="border border-gray-200 dark:border-gray-600 rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                        <div className="flex items-start justify-between">
                          <div className="flex items-center space-x-3">
                            <div className="w-4 h-4 bg-blue-500 rounded-full" />
                            <div>
                              <h5 className="font-medium text-gray-900 dark:text-gray-100 capitalize">{detection.class}</h5>
                              <p className="text-sm text-gray-600 dark:text-gray-400">Confidence: {Math.round(detection.score * 100)}%</p>
                            </div>
                          </div>
                          <div className="text-right text-sm text-gray-500 dark:text-gray-400">
                            <p>Box: [{detection.box.join(', ')}]</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Instance Segmentation */}
              {results.results?.instances && results.results.instances.length > 0 && (
                <div>
                  <h4 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Instance Segmentation</h4>
                  <div className="space-y-3">
                    {results.results.instances.map((instance) => (
                      <div key={instance.id} className="border border-gray-200 dark:border-gray-600 rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                        <div className="flex items-start justify-between">
                          <div className="flex items-center space-x-3">
                            <div className="w-4 h-4 bg-green-500 rounded-full opacity-30" />
                            <div>
                              <h5 className="font-medium text-gray-900 dark:text-gray-100 capitalize">{instance.class}</h5>
                              <p className="text-sm text-gray-600 dark:text-gray-400">Confidence: {Math.round(instance.score * 100)}%</p>
                            </div>
                          </div>
                          <div className="text-right text-sm text-gray-500 dark:text-gray-400">
                            <p>Points: {instance.polygon.length}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Classification Labels */}
              {results.results?.labels && results.results.labels.length > 0 && (
                <div>
                  <h4 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Classification Labels</h4>
                  <div className="space-y-3">
                    {results.results.labels.map((label) => (
                      <div key={label.id} className="border border-gray-200 dark:border-gray-600 rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                        <div className="flex items-start justify-between">
                          <div className="flex items-center space-x-3">
                            <div className="w-4 h-4 bg-purple-500 rounded-full" />
                            <div>
                              <h5 className="font-medium text-gray-900 dark:text-gray-100 capitalize">{label.class.replace('_', ' ')}</h5>
                              <p className="text-sm text-gray-600 dark:text-gray-400">Confidence: {Math.round(label.score * 100)}%</p>
                            </div>
                          </div>
                        </div>
                        {label.attributes && (
                          <div className="mt-3 grid grid-cols-3 gap-4 text-sm">
                            {Object.entries(label.attributes).map(([key, value]) => (
                              <div key={key}>
                                <span className="font-medium text-gray-700 dark:text-gray-300 capitalize">{key}:</span>
                                <span className="ml-1 text-gray-600 dark:text-gray-400 capitalize">{value}</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* OCR Text Blocks */}
              {results.results?.blocks && results.results.blocks.length > 0 && (
                <div>
                  <h4 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">OCR Text Extraction</h4>
                  <div className="space-y-3">
                    {results.results.blocks.map((block) => (
                      <div key={block.id} className="border border-gray-200 dark:border-gray-600 rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                        <div className="flex items-start justify-between">
                          <div className="flex items-center space-x-3">
                            <div className="w-4 h-4 border-2 border-amber-500 border-dashed rounded" />
                            <div>
                              <h5 className="font-medium text-gray-900 dark:text-gray-100">&quot;{block.text}&quot;</h5>
                              <p className="text-sm text-gray-600 dark:text-gray-400">Confidence: {Math.round(block.score * 100)}%</p>
                            </div>
                          </div>
                          <div className="text-right text-sm text-gray-500 dark:text-gray-400">
                            <p>Box: [{block.box.join(', ')}]</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* No Results */}
              {!results.results?.detections && !results.results?.instances && !results.results?.labels && !results.results?.blocks && (
                <div className="text-center py-8">
                  <p className="text-gray-500 dark:text-gray-400">No results found in the media</p>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'logs' && (
          <div>
            <h4 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Processing Logs</h4>
            {results.logs && results.logs.length > 0 ? (
              <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                <div className="space-y-1 font-mono text-sm">
                  {results.logs.map((log, index) => (
                    <div key={index} className="flex items-start space-x-2">
                      <span className="text-gray-400 dark:text-gray-500 text-xs mt-0.5">
                        {String(index + 1).padStart(2, '0')}
                      </span>
                      <span className="text-gray-700 dark:text-gray-300">{log}</span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-500 dark:text-gray-400">No logs available</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
