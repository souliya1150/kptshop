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
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [newFolder, setNewFolder] = useState('');

  useEffect(() => {
    fetchImages();
  }, []);

  const fetchImages = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch('/api/gallery');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json() as GalleryItem[];
      setImages(data);
      const uniqueFolders = Array.from(new Set(data.map((img) => img.folder)));
      setFolders(uniqueFolders);
    } catch (error) {
      console.error('Error fetching images:', error);
      setError('Failed to load images. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleUpload = async (result: CloudinaryUploadWidgetResults) => {
    try {
      if (!result.info || typeof result.info === 'string') {
        throw new Error('Invalid upload result');
      }

      // Get the current folder or use default
      const currentFolder = selectedFolder === 'all' ? 'default' : selectedFolder;

      // Prepare image data for MongoDB
      const imageData = {
        name: result.info.original_filename || 'New Image',
        detail: 'Add details here',
        imageUrl: result.info.secure_url,
        folder: currentFolder,
        publicId: result.info.public_id,
        width: result.info.width,
        height: result.info.height,
        format: result.info.format,
        bytes: result.info.bytes,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      // Save to MongoDB
      const response = await fetch('/api/gallery', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(imageData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to save image to database');
      }

      // Refresh the gallery
      await fetchImages();
      setError(null);
    } catch (error) {
      console.error('Error uploading image:', error);
      setError('Failed to upload image. Please try again.');
    }
  };

  const handleCreateFolder = () => {
    if (!newFolder.trim()) {
      setError('Folder name cannot be empty');
      return;
    }
    if (folders.includes(newFolder.trim())) {
      setError('Folder already exists');
      return;
    }
    setFolders([...folders, newFolder.trim()]);
    setSelectedFolder(newFolder.trim());
    setNewFolder('');
  };

  const handleEdit = (image: GalleryItem) => {
    setCurrentImage(image);
    setIsEditing(true);
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentImage) return;

    try {
      setError(null);
      const response = await fetch(`/api/gallery/${currentImage._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(currentImage),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      setIsEditing(false);
      setCurrentImage(null);
      await fetchImages();
    } catch (error) {
      console.error('Error updating image:', error);
      setError('Failed to update image. Please try again.');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this image?')) return;

    try {
      setError(null);
      const response = await fetch(`/api/gallery/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      await fetchImages();
    } catch (error) {
      console.error('Error deleting image:', error);
      setError('Failed to delete image. Please try again.');
    }
  };

  const filteredImages = selectedFolder === 'all'
    ? images
    : images.filter(img => img.folder === selectedFolder);

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Image Gallery</h1>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {/* Folder Management */}
      <div className="mb-6 flex gap-4 items-center">
        <select
          value={selectedFolder}
          onChange={(e) => setSelectedFolder(e.target.value)}
          className="p-2 border rounded bg-white text-black"
        >
          <option value="all" className="text-black">All Folders</option>
          {folders.map((folder) => (
            <option key={folder} value={folder} className="text-black">
              {folder}
            </option>
          ))}
        </select>

        <div className="flex gap-2">
          <input
            type="text"
            value={newFolder}
            onChange={(e) => setNewFolder(e.target.value)}
            placeholder="New folder name"
            className="p-2 border rounded"
          />
          <button
            onClick={handleCreateFolder}
            className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
          >
            Create Folder
          </button>
        </div>
      </div>

      {/* Upload Widget */}
      <div className="mb-8">
        <CldUploadWidget
          options={{
            cloudName: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
            uploadPreset: "kptshop_gallery",
            sources: ["local", "url", "camera"],
            maxFiles: 1,
            resourceType: "image",
            folder: selectedFolder === 'all' ? 'default' : selectedFolder,
            styles: {
              palette: {
                window: "#FFFFFF",
                windowBorder: "#90A0B3",
                tabIcon: "#0078FF",
                menuIcons: "#5A616A",
                textDark: "#000000",
                textLight: "#FFFFFF",
                link: "#0078FF",
                action: "#FF620C",
                inactiveTabIcon: "#0E2F5A",
                error: "#F44235",
                inProgress: "#0078FF",
                complete: "#20B832",
                sourceBg: "#E4EBF1"
              }
            }
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

      {/* Loading State */}
      {loading && (
        <div className="text-center py-4">
          Loading images...
        </div>
      )}

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
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block mb-2">Details</label>
                <textarea
                  value={currentImage.detail}
                  onChange={(e) => setCurrentImage({ ...currentImage, detail: e.target.value })}
                  className="w-full p-2 border rounded"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block mb-2">Folder</label>
                <select
                  value={currentImage.folder}
                  onChange={(e) => setCurrentImage({ ...currentImage, folder: e.target.value })}
                  className="w-full p-2 border rounded bg-white text-black"
                  required
                >
                  {folders.map((folder) => (
                    <option key={folder} value={folder} className="text-black">
                      {folder}
                    </option>
                  ))}
                </select>
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
      {!loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredImages.map((image) => (
            <div key={image._id} className="border rounded-lg overflow-hidden">
              <div className="relative h-48">
                <Image
                  src={image.imageUrl}
                  alt={image.name}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  priority
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
      )}
    </div>
  );
} 