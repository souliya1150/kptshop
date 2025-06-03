'use client';

import { useState, useEffect } from 'react';
import { InventoryItem } from '@/types/inventory';
import { PencilIcon, TrashIcon } from '@heroicons/react/24/outline';
import { toast } from 'react-hot-toast';
import AddItemModal from '@/components/AddItemModal';
import EditItemModal from '@/components/EditItemModal';
import CategoryModal from '@/components/CategoryModal';
import DeleteConfirmModal from '@/components/DeleteConfirmModal';
import Image from 'next/image';

interface Category {
  _id: string;
  name: string;
  description: string;
}

export default function Home() {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);
  const [itemToDelete, setItemToDelete] = useState<InventoryItem | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [isLoading, setIsLoading] = useState(true);

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/categories');
      if (!response.ok) throw new Error('Failed to fetch categories');
      const data = await response.json();
      setCategories(data);
    } catch (error) {
      toast.error('Error fetching categories');
      console.error('Error:', error);
    }
  };

  const fetchItems = async () => {
    try {
      const response = await fetch('/api/inventory');
      if (!response.ok) throw new Error('Failed to fetch items');
      const data = await response.json();
      setItems(data);
    } catch (error) {
      toast.error('Error fetching items');
      console.error('Error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
    fetchCategories();
  }, []);

  const handleDelete = async (id: string) => {
    try {
      const response = await fetch(`/api/inventory/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete item');

      toast.success('Item deleted successfully');
      fetchItems();
    } catch (error) {
      toast.error('Error deleting item');
      console.error('Error:', error);
    }
  };

  const handleDeleteClick = (item: InventoryItem) => {
    setItemToDelete(item);
    setIsDeleteModalOpen(true);
  };

  const handleEdit = (item: InventoryItem) => {
    setSelectedItem(item);
    setIsEditModalOpen(true);
  };

  const handleUpdateCategory = async (itemId: string, category: string) => {
    try {
      const response = await fetch('/api/inventory/update-categories', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ itemId, category }),
      });

      if (!response.ok) throw new Error('Failed to update category');

      toast.success('Category updated successfully');
      fetchItems();
    } catch (error) {
      toast.error('Error updating category');
      console.error('Error:', error);
    }
  };

  const filteredItems = items.filter((item) => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase());

    // Debug logging
    console.log('Selected Category:', selectedCategory);
    console.log('Item Category:', item.category);

    // Use exact case matching since database stores original case
    const matchesCategory = selectedCategory === 'All' ||
      item.category === selectedCategory;

    console.log('Matches:', matchesCategory);

    return matchesSearch && matchesCategory;
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black p-8">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="bg-gray-800 rounded-lg shadow p-6">
                <div className="h-4 bg-gray-700 rounded w-3/4"></div>
                <div className="space-y-3 mt-4">
                  <div className="h-4 bg-gray-700 rounded"></div>
                  <div className="h-4 bg-gray-700 rounded w-5/6"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black p-4 sm:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-white">KPT Shop Inventory</h1>
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 w-full sm:w-auto">
            <button
              onClick={() => setIsCategoryModalOpen(true)}
              className="w-full sm:w-auto bg-gray-700 text-white px-4 py-2 rounded-md hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
            >
              Manage Categories
            </button>
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="w-full sm:w-auto bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              Add New Item
            </button>
          </div>
        </div>

        <div className="mb-6 space-y-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <input
                type="text"
                placeholder="Search items..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-4 py-2 rounded-md border border-gray-700 bg-gray-800 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div className="w-full sm:w-48">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full px-4 py-2 rounded-md border border-gray-700 bg-gray-800 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="All">All Categories</option>
                {categories.map((category) => (
                  <option key={category._id} value={category.name}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {filteredItems.map((item) => (
            <div
              key={item._id}
              className="bg-gray-800 rounded-lg shadow overflow-hidden"
            >
              <div className="relative h-48 sm:h-56">
                <Image
                  src={item.image_url}
                  alt={item.name}
                  width={1000}
                  height={1000}
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-2 right-2 flex space-x-2">
                  <button
                    onClick={() => handleEdit(item)}
                    className="p-2 bg-gray-800 rounded-full shadow hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <PencilIcon className="h-5 w-5 text-gray-300" />
                  </button>
                  <button
                    onClick={() => handleDeleteClick(item)}
                    className="p-2 bg-gray-800 rounded-full shadow hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-red-500"
                  >
                    <TrashIcon className="h-5 w-5 text-red-400" />
                  </button>
                </div>
              </div>
              <div className="p-4 sm:p-6">
                <div className="flex flex-col sm:flex-row justify-between items-start gap-2 mb-2">
                  <h3 className="text-lg font-semibold text-white">
                    {item.name}
                  </h3>
                  <div className="flex flex-col items-start sm:items-end gap-2 w-full sm:w-auto">
                    <span className="px-2 py-1 text-xs font-medium bg-blue-600 text-white rounded-full">
                      {item.category || 'No Category'}
                    </span>
                    {!item.category && categories.length > 0 && (
                      <select
                        onChange={(e) => handleUpdateCategory(item._id, e.target.value)}
                        className="w-full sm:w-auto text-xs px-2 py-1 rounded border border-gray-600 bg-gray-700 text-white"
                      >
                        <option value="">Select Category</option>
                        {categories.map((category) => (
                          <option key={category._id} value={category.name}>
                            {category.name}
                          </option>
                        ))}
                      </select>
                    )}
                  </div>
                </div>
                <p className="text-gray-300 mb-4 text-sm sm:text-base">{item.description}</p>
                <div className="flex justify-between items-center">
                  <span className="text-base sm:text-lg font-bold text-white">
                    ${item.price.toFixed(2)}
                  </span>
                  <span className="text-xs sm:text-sm text-gray-400">
                    Quantity: {item.quantity}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredItems.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-400 text-base sm:text-lg">
              {searchQuery || selectedCategory !== 'All'
                ? 'No items found matching your criteria.'
                : 'No items in inventory. Add your first item!'}
            </p>
          </div>
        )}
      </div>

      <AddItemModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onItemAdded={fetchItems}
        categories={categories}
      />

      {selectedItem && (
        <EditItemModal
          isOpen={isEditModalOpen}
          onClose={() => {
            setIsEditModalOpen(false);
            setSelectedItem(null);
          }}
          onItemUpdated={fetchItems}
          item={selectedItem}
          categories={categories}
        />
      )}

      <CategoryModal
        isOpen={isCategoryModalOpen}
        onClose={() => setIsCategoryModalOpen(false)}
        onCategoryAdded={fetchCategories}
      />

      {itemToDelete && (
        <DeleteConfirmModal
          isOpen={isDeleteModalOpen}
          onClose={() => {
            setIsDeleteModalOpen(false);
            setItemToDelete(null);
          }}
          onConfirm={() => handleDelete(itemToDelete._id)}
          itemName={itemToDelete.name}
        />
      )}
    </div>
  );
}
