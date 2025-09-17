'use client';

import { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';

interface UploadProps {
  onFileSelect: (file: File) => void;
  disabled?: boolean;
}

const SAMPLE_MEDIA = [
  { name: 'Container Sample', path: '/sample/sample-image.jpg', type: 'image/jpeg' },
  // Add more samples as needed
];

export default function Upload({ onFileSelect, disabled = false }: UploadProps) {

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      if (acceptedFiles.length > 0 && !disabled) {
        onFileSelect(acceptedFiles[0]);
      }
    },
    [onFileSelect, disabled]
  );

  const handleSampleSelect = useCallback(async (samplePath: string, sampleName: string, mimeType: string) => {
    if (disabled) return;
    
    try {
      const response = await fetch(samplePath);
      const blob = await response.blob();
      const file = new File([blob], sampleName, { type: mimeType });
      onFileSelect(file);
    } catch (error) {
      console.error('Failed to load sample media:', error);
    }
  }, [onFileSelect, disabled]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.gif', '.webp'],
      'video/*': ['.mp4', '.webm', '.mov']
    },
    multiple: false,
    disabled
  });

  return (
    <div className="w-full">
      <div
        {...getRootProps()}
        className={`
          relative border-2 border-dashed rounded-2xl p-12 text-center cursor-pointer
          transition-all duration-300 ease-in-out group
          ${isDragActive 
            ? 'border-blue-500 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/50 dark:to-indigo-950/50 scale-105 shadow-lg' 
            : 'border-gray-300 dark:border-gray-600 hover:border-blue-400 dark:hover:border-blue-500'
          }
          ${disabled 
            ? 'opacity-50 cursor-not-allowed bg-gray-50 dark:bg-gray-800' 
            : 'hover:bg-gradient-to-br hover:from-gray-50 hover:to-blue-50 dark:hover:from-gray-800 dark:hover:to-blue-950/20 hover:shadow-lg hover:scale-102'
          }
        `}
        role="button"
        tabIndex={0}
        aria-label="Upload image or video file"
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            // Trigger file input click
            const input = e.currentTarget.querySelector('input');
            input?.click();
          }
        }}
      >
        <input {...getInputProps()} aria-describedby="upload-description" />
        
        <div className="space-y-6">
          <div className="flex justify-center">
            <div className={`w-16 h-16 rounded-2xl flex items-center justify-center transition-all duration-300 ${
              isDragActive 
                ? 'bg-gradient-to-br from-blue-500 to-blue-600 shadow-lg scale-110' 
                : 'bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-600 group-hover:from-blue-100 group-hover:to-blue-200 dark:group-hover:from-blue-800 dark:group-hover:to-blue-700'
            }`}>
              <svg
                className={`w-8 h-8 transition-colors duration-300 ${
                  isDragActive 
                    ? 'text-white' 
                    : 'text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-400'
                }`}
                stroke="currentColor"
                fill="none"
                viewBox="0 0 48 48"
                aria-hidden="true"
              >
                <path
                  d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
          </div>
          
          <div className="space-y-3">
            <p className="text-xl font-semibold text-gray-900 dark:text-gray-100">
              {isDragActive ? 'Drop your file here' : 'Upload an image or video'}
            </p>
            <p className="text-gray-600 dark:text-gray-400" id="upload-description">
              {isDragActive ? 'Release to upload' : 'Drag and drop your file here, or click to browse'}
            </p>
            <div className="flex flex-wrap justify-center gap-2 mt-4">
              {['PNG', 'JPG', 'GIF', 'WebP', 'MP4', 'WebM', 'MOV'].map((format) => (
                <span key={format} className="px-3 py-1 text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded-full">
                  {format}
                </span>
              ))}
            </div>
          </div>
        </div>

        {disabled && (
          <div className="absolute inset-0 flex items-center justify-center bg-white/50 dark:bg-black/50 rounded-lg">
            <div className="flex items-center space-x-2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
              <span className="text-sm font-medium">Processing...</span>
            </div>
          </div>
        )}
      </div>

      {/* Sample Media Picker */}
      <div className="mt-8">
        <div className="text-center mb-4">
          <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
            Or try a sample:
          </h4>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Click to load a pre-configured test image
          </p>
        </div>
        <div className="flex justify-center">
          {SAMPLE_MEDIA.map((sample) => (
            <button
              key={sample.path}
              onClick={() => handleSampleSelect(sample.path, sample.name, sample.type)}
              disabled={disabled}
              className={`
                group px-6 py-3 text-sm font-semibold rounded-xl border transition-all duration-300 transform
                ${disabled 
                  ? 'bg-gray-100 dark:bg-gray-700 text-gray-400 cursor-not-allowed border-gray-200 dark:border-gray-600'
                  : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:border-blue-400 dark:hover:border-blue-500 hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 dark:hover:from-blue-950/50 dark:hover:to-indigo-950/50 hover:shadow-lg hover:scale-105'
                }
              `}
            >
              <span className="flex items-center space-x-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span>{sample.name}</span>
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
