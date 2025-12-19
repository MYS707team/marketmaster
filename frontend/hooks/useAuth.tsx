// frontend/hooks/useAuth.tsx

import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, CartItem } from '../types';
import { api } from '../services/api';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  setUser: (user: User | null) => void;
  logout: () => void;
  cart: CartItem[];
  addToCart: (item: CartItem) => void;
  removeFromCart: (productId: string) => void;
  updateCartItemQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  cartCount: number;
  cartTotal: number;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUserState] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [cart, setCart] = useState<CartItem[]>([]);

  useEffect(() => {
    const initAuth = async () => {
      const token = sessionStorage.getItem('mm_token');
      
      if (token) {
        try {
          const response = await api.getCurrentUser();
          setUserState(response.user);
        } catch (error) {
          console.error('Failed to fetch user:', error);
          sessionStorage.removeItem('mm_token');
          sessionStorage.removeItem('mm_user');
        }
      }
      
      // Load cart from local storage
      const savedCart = localStorage.getItem('mm_cart');
      if (savedCart) {
        try {
          setCart(JSON.parse(savedCart));
        } catch (error) {
          console.error('Failed to parse cart:', error);
          localStorage.removeItem('mm_cart');
        }
      }
      
      setIsLoading(false);
    };

    initAuth();
  }, []);

  useEffect(() => {
    localStorage.setItem('mm_cart', JSON.stringify(cart));
  }, [cart]);

  const logout = () => {
    sessionStorage.removeItem('mm_user');
    sessionStorage.removeItem('mm_token');
    setUserState(null);
    setCart([]);
    window.location.hash = '#/login';
  };

  const addToCart = (newItem: CartItem) => {
    setCart(prev => {
      const existing = prev.find(item => item.productId === newItem.productId);
      if (existing) {
        return prev.map(item => 
          item.productId === newItem.productId 
            ? { ...item, quantity: item.quantity + newItem.quantity }
            : item
        );
      }
      return [...prev, newItem];
    });
  };

  const removeFromCart = (productId: string) => {
    setCart(prev => prev.filter(item => item.productId !== productId));
  };

  const updateCartItemQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    
    setCart(prev => prev.map(item => 
      item.productId === productId 
        ? { ...item, quantity }
        : item
    ));
  };

  const clearCart = () => setCart([]);

  const cartCount = cart.reduce((acc, item) => acc + item.quantity, 0);
  const cartTotal = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);

  return (
    <AuthContext.Provider value={{ 
      user, 
      isLoading, 
      setUser: setUserState, 
      logout,
      cart,
      addToCart,
      removeFromCart,
      updateCartItemQuantity,
      clearCart,
      cartCount,
      cartTotal
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
