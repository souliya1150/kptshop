import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { CloudArrowUpIcon } from '@heroicons/react/24/outline';

interface ImageUploadProps {
  onUploadComplete: (url: string) => void;
  folder?: string;
}

export default function ImageUpload({ onUploadComplete, folder }: ImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;

    setUploading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('file', file);
      if (folder) {
        formData.append('folder', folder);
      }

      const response = await fetch('/.netlify/functions/api/images', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.details || data.error || 'Upload failed');
      }

      onUploadComplete(data.url);
      setRetryCount(0);
    } catch (err) {
      console.error('Upload error:', err);
      setError(err instanceof Error ? err.message : 'Upload failed');
      setRetryCount(prev => prev + 1);
    } finally {
      setUploading(false);
    }
  }, [folder, onUploadComplete]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.gif', '.webp']
    },
    maxSize: 5 * 1024 * 1024, // 5MB
    disabled: uploading,
    multiple: false
  });

  const handleRetry = () => {
    setError(null);
    setRetryCount(0);
  };

  return (
    <div className="space-y-4">
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors
          ${isDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'}
          ${uploading ? 'opacity-50 cursor-not-allowed' : ''}`}
      >
        <input {...getInputProps()} />
        <CloudArrowUpIcon className="mx-auto h-12 w-12 text-gray-400" />
        <p className="mt-2 text-sm text-gray-600">
          {isDragActive
            ? 'Drop the image here'
            : 'Drag and drop an image, or click to select'}
        </p>
        <p className="mt-1 text-xs text-gray-500">
          PNG, JPG, GIF up to 5MB
        </p>
      </div>

      {uploading && (
        <div className="text-center text-sm text-gray-600">
          Uploading...
        </div>
      )}

      {error && (
        <div className="text-center">
          <p className="text-sm text-red-600 mb-2">{error}</p>
          {retryCount < 3 && (
            <button
              onClick={handleRetry}
              className="text-sm text-blue-600 hover:text-blue-700"
            >
              Try again
            </button>
          )}
        </div>
      )}
    </div>
  );
} 