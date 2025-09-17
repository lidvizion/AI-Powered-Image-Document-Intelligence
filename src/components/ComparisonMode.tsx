'use client';

import { useState } from 'react';
import { LidVizionResult } from '@/lib/lv';

interface ComparisonModeProps {
  results: LidVizionResult[];
  onClose: () => void;
}

export default function ComparisonMode({ results, onClose }: ComparisonModeProps) {
  const [selectedResults, setSelectedResults] = useState<LidVizionResult[]>([]);
  const [comparisonType, setComparisonType] = useState<'side-by-side' | 'overlay'>('side-by-side');

  const handleResultSelect = (result: LidVizionResult) => {
    setSelectedResults(prev => {
      if (prev.includes(result)) {
        return prev.filter(r => r !== result);
      } else if (prev.length < 2) {
        return [...prev, result];
      }
      return prev;
    });
  };

  const getComparisonStats = () => {
    if (selectedResults.length !== 2) return null;

    const [result1, result2] = selectedResults;
    const summary1 = result1.results?.summary;
    const summary2 = result2.results?.summary;

    if (!summary1 || !summary2) return null;

    return {
      detections: {
        result1: summary1.totalDetections || 0,
        result2: summary2.totalDetections || 0,
        difference: (summary1.totalDetections || 0) - (summary2.totalDetections || 0)
      },
      instances: {
        result1: summary1.totalInstances || 0,
        result2: summary2.totalInstances || 0,
        difference: (summary1.totalInstances || 0) - (summary2.totalInstances || 0)
      },
      processingTime: {
        result1: summary1.processingTime || 0,
        result2: summary2.processingTime || 0,
        difference: (summary1.processingTime || 0) - (summary2.processingTime || 0)
      }
    };
  };

  const stats = getComparisonStats();

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-900 rounded-lg shadow-xl max-w-6xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
            Comparison Mode
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          {/* Results Selection */}
          <div className="mb-6">
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">
              Select Results to Compare (Max 2)
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {results.map((result, index) => (
                <div
                  key={index}
                  onClick={() => handleResultSelect(result)}
                  className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                    selectedResults.includes(result)
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-950'
                      : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-gray-900 dark:text-gray-100">
                      Analysis #{index + 1}
                    </span>
                    {selectedResults.includes(result) && (
                      <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                        <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                    )}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    <p>Detections: {result.results?.summary?.totalDetections || 0}</p>
                    <p>Instances: {result.results?.summary?.totalInstances || 0}</p>
                    <p>Processing: {result.results?.summary?.processingTime || 0}ms</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Comparison Controls */}
          {selectedResults.length === 2 && (
            <div className="mb-6">
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">
                Comparison Settings
              </h3>
              <div className="flex items-center space-x-4">
                <label className="flex items-center">
                  <input
                    type="radio"
                    value="side-by-side"
                    checked={comparisonType === 'side-by-side'}
                    onChange={(e) => setComparisonType(e.target.value as 'side-by-side' | 'overlay')}
                    className="mr-2"
                  />
                  Side by Side
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    value="overlay"
                    checked={comparisonType === 'overlay'}
                    onChange={(e) => setComparisonType(e.target.value as 'side-by-side' | 'overlay')}
                    className="mr-2"
                  />
                  Overlay
                </label>
              </div>
            </div>
          )}

          {/* Comparison Results */}
          {stats && (
            <div className="space-y-6">
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                Comparison Statistics
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Detections Comparison */}
                <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-3">Detections</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Result 1:</span>
                      <span className="font-medium">{stats.detections.result1}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Result 2:</span>
                      <span className="font-medium">{stats.detections.result2}</span>
                    </div>
                    <div className="flex justify-between border-t border-gray-200 dark:border-gray-600 pt-2">
                      <span className="text-sm font-medium">Difference:</span>
                      <span className={`font-medium ${
                        stats.detections.difference > 0 ? 'text-green-600' : 
                        stats.detections.difference < 0 ? 'text-red-600' : 'text-gray-600'
                      }`}>
                        {stats.detections.difference > 0 ? '+' : ''}{stats.detections.difference}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Instances Comparison */}
                <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-3">Instances</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Result 1:</span>
                      <span className="font-medium">{stats.instances.result1}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Result 2:</span>
                      <span className="font-medium">{stats.instances.result2}</span>
                    </div>
                    <div className="flex justify-between border-t border-gray-200 dark:border-gray-600 pt-2">
                      <span className="text-sm font-medium">Difference:</span>
                      <span className={`font-medium ${
                        stats.instances.difference > 0 ? 'text-green-600' : 
                        stats.instances.difference < 0 ? 'text-red-600' : 'text-gray-600'
                      }`}>
                        {stats.instances.difference > 0 ? '+' : ''}{stats.instances.difference}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Processing Time Comparison */}
                <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-3">Processing Time</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Result 1:</span>
                      <span className="font-medium">{stats.processingTime.result1}ms</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Result 2:</span>
                      <span className="font-medium">{stats.processingTime.result2}ms</span>
                    </div>
                    <div className="flex justify-between border-t border-gray-200 dark:border-gray-600 pt-2">
                      <span className="text-sm font-medium">Difference:</span>
                      <span className={`font-medium ${
                        stats.processingTime.difference > 0 ? 'text-red-600' : 
                        stats.processingTime.difference < 0 ? 'text-green-600' : 'text-gray-600'
                      }`}>
                        {stats.processingTime.difference > 0 ? '+' : ''}{stats.processingTime.difference}ms
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
