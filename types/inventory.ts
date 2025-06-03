export interface InventoryItem {
  _id: string;
  name: string;
  description: string;
  price: number;
  quantity: number;
  image_url: string;
  category: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateInventoryItem {
  name: string;
  description: string;
  price: number;
  quantity: number;
  image_url: string;
  category: string;
} 