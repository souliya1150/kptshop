'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { CldUploadWidget, CloudinaryUploadWidgetResults } from 'next-cloudinary';

interface GalleryItem {
  _id: string;
  name: string;
  detail: string;
  imageUrl: string;
  folder: string;
}

export default function GalleryPage() {
  const [images, setImages] = useState<GalleryItem[]>([]);
  const [folders, setFolders] = useState<string[]>([]);
  const [selectedFolder, setSelectedFolder] = useState<string>('all');
  const [isEditing, setIsEditing] = useState(false);
  const [currentImage, setCurrentImage] = useState<GalleryItem | null>(null);

  useEffect(() => {
    fetchImages();
  }, []);

  const fetchImages = async () => {
    try {
      const response = await fetch('/api/gallery');
      const data = await response.json() as GalleryItem[];
      setImages(data);
      const uniqueFolders = Array.from(new Set(data.map((img) => img.folder)));
      setFolders(uniqueFolders);
    } catch (error) {
      console.error('Error fetching images:', error);
    }
  };

  const handleUpload = async (result: CloudinaryUploadWidgetResults) => {
    try {
      if (!result.info || typeof result.info === 'string') {
        throw new Error('Invalid upload result');
      }
      
      const response = await fetch('/api/gallery', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: 'New Image',
          detail: 'Add details here',
          imageUrl: result.info.secure_url,
          folder: 'default',
        }),
      });
      if (response.ok) {
        fetchImages();
      }
    } catch (error) {
      console.error('Error uploading image:', error);
    }
  };

  const handleEdit = (image: GalleryItem) => {
    setCurrentImage(image);
    setIsEditing(true);
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentImage) return;

    try {
      const response = await fetch(`/api/gallery/${currentImage._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(currentImage),
      });
      if (response.ok) {
        setIsEditing(false);
        setCurrentImage(null);
        fetchImages();
      }
    } catch (error) {
      console.error('Error updating image:', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this image?')) return;

    try {
      const response = await fetch(`/api/gallery/${id}`, {
        method: 'DELETE',
      });
      if (response.ok) {
        fetchImages();
      }
    } catch (error) {
      console.error('Error deleting image:', error);
    }
  };

  const filteredImages = selectedFolder === 'all'
    ? images
    : images.filter(img => img.folder === selectedFolder);

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Image Gallery</h1>

      {/* Folder Selection */}
      <div className="mb-6">
        <select
          value={selectedFolder}
          onChange={(e) => setSelectedFolder(e.target.value)}
          className="p-2 border rounded"
        >
          <option value="all">All Folders</option>
          {folders.map((folder) => (
            <option key={folder} value={folder}>
              {folder}
            </option>
          ))}
        </select>
      </div>

      {/* Upload Widget */}
      <div className="mb-8">
        <CldUploadWidget
          options={{
            cloudName: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
            uploadPreset: "gallery_upload"
          }}
          onUpload={handleUpload}
        >
          {({ open }) => (
            <button
              onClick={() => open()}
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            >
              Upload Image
            </button>
          )}
        </CldUploadWidget>
      </div>

      {/* Edit Modal */}
      {isEditing && currentImage && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg w-96">
            <h2 className="text-xl font-bold mb-4">Edit Image Details</h2>
            <form onSubmit={handleUpdate}>
              <div className="mb-4">
                <label className="block mb-2">Name</label>
                <input
                  type="text"
                  value={currentImage.name}
                  onChange={(e) => setCurrentImage({ ...currentImage, name: e.target.value })}
                  className="w-full p-2 border rounded"
                />
              </div>
              <div className="mb-4">
                <label className="block mb-2">Details</label>
                <textarea
                  value={currentImage.detail}
                  onChange={(e) => setCurrentImage({ ...currentImage, detail: e.target.value })}
                  className="w-full p-2 border rounded"
                />
              </div>
              <div className="mb-4">
                <label className="block mb-2">Folder</label>
                <input
                  type="text"
                  value={currentImage.folder}
                  onChange={(e) => setCurrentImage({ ...currentImage, folder: e.target.value })}
                  className="w-full p-2 border rounded"
                />
              </div>
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="px-4 py-2 border rounded"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-500 text-white rounded"
                >
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Image Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredImages.map((image) => (
          <div key={image._id} className="border rounded-lg overflow-hidden">
            <div className="relative h-48">
              <Image
                src={image.imageUrl}
                alt={image.name}
                fill
                className="object-cover"
              />
            </div>
            <div className="p-4">
              <h3 className="font-bold">{image.name}</h3>
              <p className="text-sm text-gray-600 mb-2">{image.detail}</p>
              <p className="text-xs text-gray-500">Folder: {image.folder}</p>
              <div className="mt-4 flex gap-2">
                <button
                  onClick={() => handleEdit(image)}
                  className="px-3 py-1 bg-blue-500 text-white rounded text-sm"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(image._id)}
                  className="px-3 py-1 bg-red-500 text-white rounded text-sm"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
} 