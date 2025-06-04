import { useState, useEffect } from 'react';
import Image from 'next/image';

interface ImageData {
  _id: string;
  name: string;
  url: string;
  folder: string | null;
  tags: string[];
  metadata: {
    width: number;
    height: number;
    format: string;
    size: number;
  };
}

interface ImageGalleryProps {
  onSelect?: (image: ImageData) => void;
  folder?: string;
}

export default function ImageGallery({ onSelect, folder }: ImageGalleryProps) {
  const [images, setImages] = useState<ImageData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchImages = async () => {
      try {
        setLoading(true);
        const url = new URL('/api/images', window.location.origin);
        if (folder) {
          url.searchParams.append('folder', folder);
        }

        const response = await fetch(url);
        if (!response.ok) {
          throw new Error('Failed to fetch images');
        }

        const data = await response.json();
        setImages(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load images');
      } finally {
        setLoading(false);
      }
    };

    fetchImages();
  }, [folder]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-48">
        <div className="text-gray-500">Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-48">
        <div className="text-red-500">{error}</div>
      </div>
    );
  }

  if (images.length === 0) {
    return (
      <div className="flex items-center justify-center h-48">
        <div className="text-gray-500">No images found</div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {images.map((image) => (
        <div
          key={image._id}
          className="relative aspect-square group cursor-pointer"
          onClick={() => onSelect?.(image)}
        >
          <Image
            src={image.url}
            alt={image.name}
            fill
            className="object-cover rounded-lg transition-transform group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-opacity rounded-lg" />
          <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-b-lg">
            <p className="text-white text-sm truncate">{image.name}</p>
          </div>
        </div>
      ))}
    </div>
  );
} 