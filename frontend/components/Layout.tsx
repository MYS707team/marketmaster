// frontend/components/Layout.tsx

import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ShoppingCart, LogOut, User as UserIcon, LayoutDashboard, Package, ShoppingBag, Menu, X, Users, BarChart3, CreditCard } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { UserRole } from '../types';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { user, logout, cartCount } = useAuth();
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const isActive = (path: string) => location.pathname === path ? 'text-indigo-600 bg-indigo-50' : 'text-gray-600 hover:text-indigo-600 hover:bg-gray-50';

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
  const closeMenu = () => setIsMenuOpen(false);

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <Link to="/" className="flex-shrink-0 flex items-center gap-2">
                <div className="bg-indigo-600 p-1.5 rounded-lg">
                  <ShoppingBag className="h-6 w-6 text-white" />
                </div>
                <span className="font-bold text-xl text-gray-900 tracking-tight">MarketMaster</span>
              </Link>
              
              {user?.role === UserRole.ADMIN && (
                 <div className="hidden sm:ml-8 sm:flex sm:space-x-4 items-center">
                    <Link to="/admin" className={`px-3 py-2 rounded-md text-sm font-medium ${isActive('/admin')}`}>Dashboard</Link>
                    <Link to="/admin/products" className={`px-3 py-2 rounded-md text-sm font-medium ${isActive('/admin/products')}`}>Products</Link>
                    <Link to="/admin/orders" className={`px-3 py-2 rounded-md text-sm font-medium ${isActive('/admin/orders')}`}>Orders</Link>
                    <Link to="/admin/users" className={`px-3 py-2 rounded-md text-sm font-medium ${isActive('/admin/users')}`}>Users</Link>
                 </div>
              )}
            </div>
            
            <div className="flex items-center space-x-4">
              {user ? (
                <>
                  <span className="text-sm text-gray-500 hidden md:block">
                    Welcome, <span className="font-semibold text-gray-800">{user.username}</span>
                  </span>
                  
                  {user.role === UserRole.USER && (
                    <Link to="/cart" className="relative p-2 text-gray-600 hover:text-indigo-600 transition-colors">
                      <ShoppingCart className="h-6 w-6" />
                      {cartCount > 0 && (
                        <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/4 -translate-y-1/4 bg-red-600 rounded-full">
                          {cartCount}
                        </span>
                      )}
                    </Link>
                  )}
                  
                  {/* Hamburger Menu Button */}
                  <button 
                    onClick={toggleMenu}
                    className="p-2 text-gray-600 hover:text-indigo-600 transition-colors"
                    aria-label="Menu"
                  >
                    {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                  </button>
                </>
              ) : (
                <div className="flex items-center space-x-2">
                  <Link to="/login" className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-indigo-600">Log in</Link>
                  <Link to="/register" className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 shadow-sm">Sign up</Link>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Hamburger Menu Dropdown */}
        {isMenuOpen && user && (
          <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 mr-4 z-50">
            <div className="py-2">
              {user.role === UserRole.USER && (
                <>
                  <Link 
                    to="/profile" 
                    onClick={closeMenu}
                    className="flex items-center px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    <UserIcon className="h-5 w-5 mr-3 text-gray-400" />
                    My Profile
                  </Link>
                  <Link 
                    to="/profile#orders" 
                    onClick={closeMenu}
                    className="flex items-center px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    <Package className="h-5 w-5 mr-3 text-gray-400" />
                    My Orders
                  </Link>
                  <Link 
                    to="/profile#cards" 
                    onClick={closeMenu}
                    className="flex items-center px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    <CreditCard className="h-5 w-5 mr-3 text-gray-400" />
                    My Cards
                  </Link>
                </>
              )}

              {user.role === UserRole.ADMIN && (
                <>
                  <Link 
                    to="/admin" 
                    onClick={closeMenu}
                    className="flex items-center px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    <LayoutDashboard className="h-5 w-5 mr-3 text-gray-400" />
                    Admin Dashboard
                  </Link>
                  <Link 
                    to="/admin/products" 
                    onClick={closeMenu}
                    className="flex items-center px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    <Package className="h-5 w-5 mr-3 text-gray-400" />
                    Products
                  </Link>
                  <Link 
                    to="/admin/orders" 
                    onClick={closeMenu}
                    className="flex items-center px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    <ShoppingCart className="h-5 w-5 mr-3 text-gray-400" />
                    Orders
                  </Link>
                  <Link 
                    to="/admin/users" 
                    onClick={closeMenu}
                    className="flex items-center px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    <Users className="h-5 w-5 mr-3 text-gray-400" />
                    Users
                  </Link>
                  <Link 
                    to="/admin/statistics" 
                    onClick={closeMenu}
                    className="flex items-center px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    <BarChart3 className="h-5 w-5 mr-3 text-gray-400" />
                    Statistics
                  </Link>
                </>
              )}

              <div className="border-t border-gray-200 my-2"></div>
              
              <button 
                onClick={() => {
                  closeMenu();
                  logout();
                }}
                className="flex items-center w-full px-4 py-3 text-sm text-red-600 hover:bg-red-50 transition-colors"
              >
                <LogOut className="h-5 w-5 mr-3" />
                Logout
              </button>
            </div>
          </div>
        )}
      </nav>

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
      
      <footer className="bg-white border-t border-gray-200 mt-auto">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <p className="text-center text-sm text-gray-500">&copy; {new Date().getFullYear()} MarketMaster. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default Layout;
