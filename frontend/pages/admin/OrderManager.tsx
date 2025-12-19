// frontend/pages/admin/OrderManager.tsx

import React, { useEffect, useState } from 'react';
import { Order, OrderStatus } from '../../types';
import { api } from '../../services/api';

const OrderManager: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  const loadOrders = async () => {
    try {
      const response = await api.getAllOrders();
      setOrders(response.orders);
    } catch (error) {
      console.error('Failed to load orders:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, []);

  const handleStatusChange = async (orderId: string, newStatus: OrderStatus) => {
    try {
      await api.updateOrderStatus(orderId, newStatus);
      loadOrders();
    } catch (error: any) {
      alert(error.message || 'Failed to update order status');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading orders...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Order Management</h1>

      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order ID</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {orders.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-4 text-center text-sm text-gray-500">No orders found.</td>
              </tr>
            ) : (
              orders.map((order) => (
                <tr key={order.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {order.id.substring(0, 8)}...
                    <div className="text-xs text-gray-400 mt-1">{order.items.length} items</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{order.username}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">${Number(order.total_amount).toFixed(2)}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(order.created_at).toLocaleDateString()}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <select
                      value={order.status}
                      onChange={(e) => handleStatusChange(order.id, e.target.value as OrderStatus)}
                      className={`text-sm rounded-full px-3 py-1 font-semibold border-0 cursor-pointer focus:ring-2 focus:ring-offset-1 focus:ring-indigo-500
                        ${order.status === OrderStatus.COMPLETED ? 'bg-green-100 text-green-800' : 
                          order.status === OrderStatus.PENDING ? 'bg-yellow-100 text-yellow-800' : 
                          order.status === OrderStatus.CANCELLED ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800'}`}
                    >
                      {Object.values(OrderStatus).map((status) => (
                        <option key={status} value={status}>{status}</option>
                      ))}
                    </select>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default OrderManager;
