// frontend/pages/customer/Cart.tsx

import React, { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { Trash2, CreditCard, Plus, Minus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../services/api';

const Cart: React.FC = () => {
  const { cart, removeFromCart, updateCartItemQuantity, clearCart, user, cartTotal } = useAuth();
  const [isProcessing, setIsProcessing] = useState(false);
  const navigate = useNavigate();

  const handleCheckout = async () => {
    if (!user || cart.length === 0) return;
    setIsProcessing(true);

    try {
      const items = cart.map(item => ({
        productId: item.productId,
        quantity: item.quantity
      }));

      await api.createOrder(items);
      clearCart();
      navigate('/profile#orders');
    } catch (error: any) {
      alert(error.message || "Checkout failed");
    } finally {
      setIsProcessing(false);
    }
  };

  const getImageUrl = (imageUrl: string) => {
    if (imageUrl.startsWith('http')) return imageUrl;
    return `${import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000'}${imageUrl}`;
  };

  if (cart.length === 0) {
    return (
      <div className="text-center py-24">
        <h2 className="text-2xl font-bold text-gray-900">Your cart is empty</h2>
        <p className="mt-2 text-gray-500">Go add some awesome products!</p>
        <button 
          onClick={() => navigate('/')} 
          className="mt-6 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-indigo-700 bg-indigo-100 hover:bg-indigo-200"
        >
          Continue Shopping
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Shopping Cart</h1>
      
      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        <ul className="divide-y divide-gray-200">
          {cart.map((item) => (
            <li key={item.productId} className="px-6 py-4 flex items-center">
              <img 
                className="h-16 w-16 rounded-md object-cover" 
                src={getImageUrl(item.imageUrl)} 
                alt={item.name}
                onError={(e) => {
                  (e.target as HTMLImageElement).src = 'https://via.placeholder.com/100x100?text=No+Image';
                }}
              />
              <div className="ml-4 flex-1">
                <h3 className="text-lg font-medium text-gray-900">{item.name}</h3>
                <p className="text-gray-500">${Number(item.price).toFixed(2)} each</p>
              </div>
              <div className="flex items-center space-x-4">
                <div className="flex items-center border border-gray-300 rounded-md">
                  <button
                    onClick={() => updateCartItemQuantity(item.productId, item.quantity - 1)}
                    className="p-2 hover:bg-gray-100 transition-colors"
                    disabled={item.quantity <= 1}
                  >
                    <Minus className="h-4 w-4" />
                  </button>
                  <span className="px-4 py-2 font-medium">{item.quantity}</span>
                  <button
                    onClick={() => updateCartItemQuantity(item.productId, item.quantity + 1)}
                    className="p-2 hover:bg-gray-100 transition-colors"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>
                <span className="font-bold text-gray-900 w-24 text-right">
                  ${(Number(item.price) * item.quantity).toFixed(2)}
                </span>
                <button 
                  onClick={() => removeFromCart(item.productId)}
                  className="text-red-500 hover:text-red-700 p-2"
                >
                  <Trash2 className="h-5 w-5" />
                </button>
              </div>
            </li>
          ))}
        </ul>
        <div className="bg-gray-50 px-6 py-4 flex justify-between items-center">
          <span className="text-lg font-medium text-gray-900">Total</span>
          <span className="text-2xl font-bold text-indigo-600">${cartTotal.toFixed(2)}</span>
        </div>
      </div>

      <div className="mt-8 flex justify-between items-center">
        <button
          onClick={() => navigate('/')}
          className="px-6 py-3 border border-gray-300 text-base font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
        >
          Continue Shopping
        </button>
        <button
          onClick={handleCheckout}
          disabled={isProcessing}
          className={`flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${isProcessing ? 'opacity-75 cursor-not-allowed' : ''}`}
        >
          <CreditCard className="h-5 w-5 mr-2" />
          {isProcessing ? 'Processing...' : 'Place Order'}
        </button>
      </div>
    </div>
  );
};

export default Cart;
