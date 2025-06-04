'use client';

import { useState } from 'react';
import ImageUpload from '@/components/ImageUpload';
import ImageGallery from '@/components/ImageGallery';
import FolderManager from '@/components/FolderManager';

export default function ImagesPage() {
  const [currentFolder, setCurrentFolder] = useState<string | null>(null);

  const handleFolderSelect = (folder: { _id: string }) => {
    setCurrentFolder(folder._id);
  };

  const handleUploadComplete = (imageUrl: string) => {
    // Optionally refresh the gallery or show a success message
    console.log('Upload complete:', imageUrl);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        <div className="md:col-span-1">
          <FolderManager
            onSelect={handleFolderSelect}
            currentFolder={currentFolder || undefined}
          />
        </div>
        <div className="md:col-span-3 space-y-8">
          <div>
            <h2 className="text-lg font-semibold mb-4">Upload Image</h2>
            <ImageUpload
              onUploadComplete={handleUploadComplete}
              folder={currentFolder || undefined}
            />
          </div>
          <div>
            <h2 className="text-lg font-semibold mb-4">Images</h2>
            <ImageGallery
              folder={currentFolder || undefined}
            />
          </div>
        </div>
      </div>
    </div>
  );
} 