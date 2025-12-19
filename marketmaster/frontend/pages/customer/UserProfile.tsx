// frontend/pages/customer/UserProfile.tsx

import React, { useEffect, useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { Order, Card } from '../../types';
import { CreditCard, Plus, Trash2, Check } from 'lucide-react';
import { api } from '../../services/api';

const UserProfile: React.FC = () => {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [cards, setCards] = useState<Card[]>([]);
  const [activeTab, setActiveTab] = useState<'profile' | 'orders' | 'cards'>('profile');
  const [showAddCard, setShowAddCard] = useState(false);
  const [cardForm, setCardForm] = useState({
    cardNumber: '',
    cardHolderName: '',
    expiryMonth: '',
    expiryYear: '',
    cvv: ''
  });
  const [cardError, setCardError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      loadOrders();
      loadCards();
    }
    
    // Check URL hash for navigation
    const hash = window.location.hash.split('#')[2];
    if (hash === 'orders') setActiveTab('orders');
    if (hash === 'cards') setActiveTab('cards');
  }, [user]);

  const loadOrders = async () => {
    try {
      const response = await api.getUserOrders();
      setOrders(response.orders);
    } catch (error) {
      console.error('Failed to load orders:', error);
    }
  };

  const loadCards = async () => {
    try {
      const response = await api.getUserCards();
      setCards(response.cards);
    } catch (error) {
      console.error('Failed to load cards:', error);
    }
  };

  const handleAddCard = async (e: React.FormEvent) => {
    e.preventDefault();
    setCardError('');
    setLoading(true);

    try {
      await api.addCard(cardForm);
      setShowAddCard(false);
      setCardForm({
        cardNumber: '',
        cardHolderName: '',
        expiryMonth: '',
        expiryYear: '',
        cvv: ''
      });
      loadCards();
    } catch (error: any) {
      setCardError(error.message || 'Failed to add card');
    } finally {
      setLoading(false);
    }
  };

  const handleSetDefaultCard = async (cardId: string) => {
    try {
      await api.setDefaultCard(cardId);
      loadCards();
    } catch (error: any) {
      alert(error.message || 'Failed to set default card');
    }
  };

  const handleDeleteCard = async (cardId: string) => {
    if (!confirm('Are you sure you want to delete this card?')) return;
    
    try {
      await api.deleteCard(cardId);
      loadCards();
    } catch (error: any) {
      alert(error.message || 'Failed to delete card');
    }
  };

  if (!user) return null;

  return (
    <div className="space-y-8">
      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('profile')}
            className={`${
              activeTab === 'profile'
                ? 'border-indigo-500 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
          >
            Profile
          </button>
          <button
            onClick={() => setActiveTab('orders')}
            className={`${
              activeTab === 'orders'
                ? 'border-indigo-500 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
          >
            Orders
          </button>
          <button
            onClick={() => setActiveTab('cards')}
            className={`${
              activeTab === 'cards'
                ? 'border-indigo-500 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
          >
            Payment Cards
          </button>
        </nav>
      </div>

      {/* Profile Tab */}
      {activeTab === 'profile' && (
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">My Profile</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-500">Username</label>
              <p className="mt-1 text-lg text-gray-900">{user.username}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-500">Email</label>
              <p className="mt-1 text-lg text-gray-900">{user.email}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-500">Member Since</label>
              <p className="mt-1 text-lg text-gray-900">{new Date(user.createdAt).toLocaleDateString()}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-500">Account Status</label>
              <p className="mt-1 text-lg">
                <span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                  Active
                </span>
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Orders Tab */}
      {activeTab === 'orders' && (
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="px-6 py-5 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Order History</h3>
          </div>
          <ul className="divide-y divide-gray-200">
            {orders.length === 0 ? (
              <li className="p-6 text-center text-gray-500">No orders yet.</li>
            ) : (
              orders.map((order) => (
                <li key={order.id} className="p-6">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-bold text-indigo-600">{order.id}</span>
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                      order.status === 'Completed' ? 'bg-green-100 text-green-800' : 
                      order.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
                      order.status === 'Cancelled' ? 'bg-red-100 text-red-800' :
                      'bg-blue-100 text-blue-800'
                    }`}>
                      {order.status}
                    </span>
                  </div>
                  <div className="text-sm text-gray-500 mb-2">
                    Ordered on {new Date(order.created_at).toLocaleDateString()}
                  </div>
                  <div className="space-y-2">
                    {order.items.map((item, idx) => (
                      <div key={idx} className="flex justify-between text-sm">
                        <span>{item.name} x {item.quantity}</span>
                        <span>${(item.price * item.quantity).toFixed(2)}</span>
                      </div>
                    ))}
                  </div>
                  <div className="mt-4 pt-4 border-t border-gray-100 flex justify-between font-bold">
                    <span>Total</span>
                    <span>${order.total_amount.toFixed(2)}</span>
                  </div>
                </li>
              ))
            )}
          </ul>
        </div>
      )}

      {/* Cards Tab */}
      {activeTab === 'cards' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-medium text-gray-900">Payment Cards</h3>
            <button
              onClick={() => setShowAddCard(true)}
              className="flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Card
            </button>
          </div>

          {/* Add Card Form */}
          {showAddCard && (
            <div className="bg-white shadow rounded-lg p-6">
              <div className="flex justify-between items-center mb-4">
                <h4 className="text-lg font-medium text-gray-900">Add New Card</h4>
                <button
                  onClick={() => {
                    setShowAddCard(false);
                    setCardError('');
                  }}
                  className="text-gray-400 hover:text-gray-500"
                >
                  ×
                </button>
              </div>

              {cardError && (
                <div className="bg-red-50 text-red-600 p-3 rounded-md text-sm mb-4 border border-red-100">
                  {cardError}
                </div>
              )}

              <form onSubmit={handleAddCard} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Card Number</label>
                  <input
                    type="text"
                    required
                    maxLength={19}
                    placeholder="1234 5678 9012 3456"
                    value={cardForm.cardNumber}
                    onChange={(e) => {
                      const value = e.target.value.replace(/\s/g, '');
                      if (/^\d*$/.test(value) && value.length <= 16) {
                        setCardForm({ ...cardForm, cardNumber: value });
                      }
                    }}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Cardholder Name</label>
                  <input
                    type="text"
                    required
                    placeholder="JOHN DOE"
                    value={cardForm.cardHolderName}
                    onChange={(e) => setCardForm({ ...cardForm, cardHolderName: e.target.value.toUpperCase() })}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  />
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Month</label>
                    <input
                      type="text"
                      required
                      maxLength={2}
                      placeholder="MM"
                      value={cardForm.expiryMonth}
                      onChange={(e) => {
                        const value = e.target.value;
                        if (/^\d*$/.test(value) && value.length <= 2) {
                          setCardForm({ ...cardForm, expiryMonth: value });
                        }
                      }}
                      className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Year</label>
                    <input
                      type="text"
                      required
                      maxLength={4}
                      placeholder="YYYY"
                      value={cardForm.expiryYear}
                      onChange={(e) => {
                        const value = e.target.value;
                        if (/^\d*$/.test(value) && value.length <= 4) {
                          setCardForm({ ...cardForm, expiryYear: value });
                        }
                      }}
                      className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">CVV</label>
                    <input
                      type="text"
                      required
                      maxLength={4}
                      placeholder="123"
                      value={cardForm.cvv}
                      onChange={(e) => {
                        const value = e.target.value;
                        if (/^\d*$/.test(value) && value.length <= 4) {
                          setCardForm({ ...cardForm, cvv: value });
                        }
                      }}
                      className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    />
                  </div>
                </div>

                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowAddCard(false);
                      setCardError('');
                    }}
                    className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className={`px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 ${loading ? 'opacity-75 cursor-not-allowed' : ''}`}
                  >
                    {loading ? 'Adding...' : 'Add Card'}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Cards List */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {cards.length === 0 ? (
              <div className="col-span-2 text-center py-12 bg-white rounded-lg shadow">
                <CreditCard className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No payment cards added yet.</p>
              </div>
            ) : (
              cards.map((card) => (
                <div key={card.id} className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg p-6 text-white shadow-lg relative">
                  {card.is_default && (
                    <div className="absolute top-4 right-4">
                      <span className="bg-white text-indigo-600 text-xs font-semibold px-2 py-1 rounded-full flex items-center">
                        <Check className="h-3 w-3 mr-1" />
                        Default
                      </span>
                    </div>
                  )}
                  
                  <div className="mb-8">
                    <p className="text-sm opacity-75">Card Number</p>
                    <p className="text-xl font-mono tracking-wider">•••• •••• •••• {card.last_four}</p>
                  </div>
                  
                  <div className="flex justify-between items-end">
                    <div>
                      <p className="text-xs opacity-75">Cardholder</p>
                      <p className="font-medium">{card.card_holder_name}</p>
                    </div>
                    <div>
                      <p className="text-xs opacity-75">Expires</p>
                      <p className="font-medium">{card.expiry_month}/{card.expiry_year}</p>
                    </div>
                  </div>

                  <div className="mt-4 flex justify-end space-x-2">
                    {!card.is_default && (
                      <button
                        onClick={() => handleSetDefaultCard(card.id)}
                        className="text-xs bg-white/20 hover:bg-white/30 px-3 py-1 rounded transition-colors"
                      >
                        Set as Default
                      </button>
                    )}
                    <button
                      onClick={() => handleDeleteCard(card.id)}
                      className="text-xs bg-red-500/50 hover:bg-red-500/70 px-3 py-1 rounded transition-colors flex items-center"
                    >
                      <Trash2 className="h-3 w-3 mr-1" />
                      Delete
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default UserProfile;
