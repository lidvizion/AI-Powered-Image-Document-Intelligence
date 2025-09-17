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
          relative border-2 border-dashed rounded-lg p-8 text-center cursor-pointer
          transition-all duration-200 ease-in-out
          ${isDragActive 
            ? 'border-blue-500 bg-blue-50 dark:bg-blue-950' 
            : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
          }
          ${disabled 
            ? 'opacity-50 cursor-not-allowed bg-gray-50 dark:bg-gray-800' 
            : 'hover:bg-gray-50 dark:hover:bg-gray-800'
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
        
        <div className="space-y-4">
          <div className="flex justify-center">
            <svg
              className={`w-12 h-12 ${isDragActive ? 'text-blue-500' : 'text-gray-400'}`}
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
          
          <div>
            <p className="text-lg font-medium text-gray-900 dark:text-gray-100">
              {isDragActive ? 'Drop your file here' : 'Upload an image or video'}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400" id="upload-description">
              Drag and drop your file here, or click to browse
            </p>
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">
              Supports: PNG, JPG, GIF, WebP, MP4, WebM, MOV
            </p>
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
      <div className="mt-6">
        <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
          Or try a sample:
        </h4>
        <div className="flex flex-wrap gap-2">
          {SAMPLE_MEDIA.map((sample) => (
            <button
              key={sample.path}
              onClick={() => handleSampleSelect(sample.path, sample.name, sample.type)}
              disabled={disabled}
              className={`
                px-3 py-2 text-sm rounded-lg border transition-all duration-200
                ${disabled 
                  ? 'bg-gray-100 dark:bg-gray-700 text-gray-400 cursor-not-allowed border-gray-200 dark:border-gray-600'
                  : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:border-blue-400 dark:hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-950'
                }
              `}
            >
              {sample.name}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
