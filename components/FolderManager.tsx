import { useState, useEffect } from 'react';
import { FolderIcon, ChevronRightIcon } from '@heroicons/react/24/outline';

interface Folder {
  _id: string;
  name: string;
  path: string;
  parent: string | null;
}

interface FolderManagerProps {
  onSelect: (folder: Folder) => void;
  currentFolder?: string;
}

export default function FolderManager({ onSelect, currentFolder }: FolderManagerProps) {
  const [folders, setFolders] = useState<Folder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newFolderName, setNewFolderName] = useState('');
  const [showNewFolderInput, setShowNewFolderInput] = useState(false);

  const fetchFolders = async (parent: string | null = null) => {
    try {
      setLoading(true);
      const url = new URL('/api/folders', window.location.origin);
      if (parent) {
        url.searchParams.append('parent', parent);
      }

      const response = await fetch(url);
      if (!response.ok) {
        throw new Error('Failed to fetch folders');
      }

      const data = await response.json();
      setFolders(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load folders');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFolders(currentFolder || null);
  }, [currentFolder]);

  const handleCreateFolder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFolderName.trim()) return;

    try {
      const response = await fetch('/api/folders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: newFolderName.trim(),
          parent: currentFolder || null,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create folder');
      }

      const newFolder = await response.json();
      setFolders([...folders, newFolder]);
      setNewFolderName('');
      setShowNewFolderInput(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create folder');
    }
  };

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

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Folders</h2>
        <button
          onClick={() => setShowNewFolderInput(true)}
          className="text-sm text-blue-500 hover:text-blue-600"
        >
          New Folder
        </button>
      </div>

      {showNewFolderInput && (
        <form onSubmit={handleCreateFolder} className="flex gap-2">
          <input
            type="text"
            value={newFolderName}
            onChange={(e) => setNewFolderName(e.target.value)}
            placeholder="Folder name"
            className="flex-1 px-3 py-1 border rounded"
          />
          <button
            type="submit"
            className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Create
          </button>
          <button
            type="button"
            onClick={() => setShowNewFolderInput(false)}
            className="px-3 py-1 text-gray-500 hover:text-gray-600"
          >
            Cancel
          </button>
        </form>
      )}

      <div className="space-y-1">
        {folders.map((folder) => (
          <button
            key={folder._id}
            onClick={() => onSelect(folder)}
            className={`w-full flex items-center gap-2 px-3 py-2 rounded hover:bg-gray-100 ${
              currentFolder === folder._id ? 'bg-gray-100' : ''
            }`}
          >
            <FolderIcon className="w-5 h-5 text-gray-500" />
            <span className="flex-1 text-left">{folder.name}</span>
            <ChevronRightIcon className="w-4 h-4 text-gray-400" />
          </button>
        ))}
      </div>
    </div>
  );
} 