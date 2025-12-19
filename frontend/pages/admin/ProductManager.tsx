// frontend/pages/admin/ProductManager.tsx

import React, { useEffect, useState } from 'react';
import { Product } from '../../types';
import { Plus, Edit2, Trash2, X } from 'lucide-react';
import { api } from '../../services/api';

const ProductManager: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');

  const [formData, setFormData] = useState<Partial<Product>>({
    name: '',
    description: '',
    price: 0,
    stock: 0,
    active: true
  });

  const loadProducts = async () => {
    try {
      const response = await api.getAllProducts();
      setProducts(response.products);
    } catch (error) {
      console.error('Failed to load products:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, []);

  const handleOpenModal = (product?: Product) => {
    if (product) {
      setEditingProduct(product);
      setFormData({
        name: product.name,
        description: product.description,
        price: product.price,
        stock: product.stock,
        active: product.active
      });
      setImagePreview(getImageUrl(product.image_url));
    } else {
      setEditingProduct(null);
      setFormData({
        name: '',
        description: '',
        price: 0,
        stock: 0,
        active: true
      });
      setImagePreview('');
    }
    setImageFile(null);
    setIsModalOpen(true);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const formDataToSend = new FormData();
    formDataToSend.append('name', formData.name!);
    formDataToSend.append('description', formData.description || '');
    formDataToSend.append('price', formData.price!.toString());
    formDataToSend.append('stock', formData.stock!.toString());
    formDataToSend.append('active', formData.active!.toString());
    
    if (imageFile) {
      formDataToSend.append('image', imageFile);
    }

    try {
      if (editingProduct) {
        await api.updateProduct(editingProduct.id, formDataToSend);
      } else {
        await api.createProduct(formDataToSend);
      }
      setIsModalOpen(false);
      loadProducts();
    } catch (error: any) {
      alert(error.message || 'Failed to save product');
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        await api.deleteProduct(id);
        loadProducts();
      } catch (error: any) {
        alert(error.message || 'Failed to delete product');
      }
    }
  };

  const getImageUrl = (imageUrl: string) => {
    if (imageUrl.startsWith('http')) return imageUrl;
    return `${import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000'}${imageUrl}`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading products...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Product Management</h1>
        <button
          onClick={() => handleOpenModal()}
          className="flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
        >
          <Plus className="h-4 w-4 mr-2" /> Add Product
        </button>
      </div>

      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <ul className="divide-y divide-gray-200">
          {products.map((product) => (
            <li key={product.id}>
              <div className="px-4 py-4 sm:px-6 flex items-center justify-between">
                <div className="flex items-center">
                  <img 
                    className="h-12 w-12 rounded-full object-cover" 
                    src={getImageUrl(product.image_url)} 
                    alt={product.name}
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = 'https://via.placeholder.com/100x100?text=No+Image';
                    }}
                  />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-indigo-600 truncate">{product.name}</p>
                    <p className="text-sm text-gray-500">Stock: {product.stock} | Price: ${Number(product.price).toFixed(2)}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${product.active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    {product.active ? 'Active' : 'Inactive'}
                  </span>
                  <button onClick={() => handleOpenModal(product)} className="p-2 text-gray-400 hover:text-gray-600">
                    <Edit2 className="h-5 w-5" />
                  </button>
                  <button onClick={() => handleDelete(product.id)} className="p-2 text-gray-400 hover:text-red-600">
                    <Trash2 className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <form onSubmit={handleSubmit}>
                <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="text-lg leading-6 font-medium text-gray-900">{editingProduct ? 'Edit Product' : 'New Product'}</h3>
                    <button type="button" onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-500">
                      <X className="h-6 w-6" />
                    </button>
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Product Image</label>
                      <div className="mt-1 flex items-center space-x-4">
                        {imagePreview && (
                          <img src={imagePreview} alt="Preview" className="h-20 w-20 object-cover rounded" />
                        )}
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleImageChange}
                          className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700">Product Name</label>
                      <input 
                        type="text" 
                        required 
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                        value={formData.name} 
                        onChange={(e) => setFormData({...formData, name: e.target.value})} 
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700">Description</label>
                      <textarea 
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                        rows={3}
                        value={formData.description} 
                        onChange={(e) => setFormData({...formData, description: e.target.value})} 
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Price</label>
                        <input 
                          type="number" 
                          step="0.01" 
                          required 
                          min="0"
                          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                          value={formData.price} 
                          onChange={(e) => setFormData({...formData, price: parseFloat(e.target.value)})} 
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Stock</label>
                        <input 
                          type="number" 
                          required 
                          min="0"
                          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                          value={formData.stock} 
                          onChange={(e) => setFormData({...formData, stock: parseInt(e.target.value)})} 
                        />
                      </div>
                    </div>

                    <div className="flex items-center">
                      <input 
                        id="active" 
                        type="checkbox" 
                        className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                        checked={formData.active} 
                        onChange={(e) => setFormData({...formData, active: e.target.checked})} 
                      />
                      <label htmlFor="active" className="ml-2 block text-sm text-gray-900">Active (Visible to customers)</label>
                    </div>
                  </div>
                </div>
                <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                  <button 
                    type="submit" 
                    className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none sm:ml-3 sm:w-auto sm:text-sm"
                  >
                    Save
                  </button>
                  <button 
                    type="button" 
                    onClick={() => setIsModalOpen(false)} 
                    className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductManager;
