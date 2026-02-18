'use client';

import React from 'react';
import { Bell, Menu, User } from 'lucide-react';

interface NavbarProps {
  onMenuClick: () => void;
  businessName?: string;
}

export const Navbar: React.FC<NavbarProps> = ({
  onMenuClick,
  businessName = 'My Business',
}) => {
  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-30">
      <div className="flex items-center justify-between px-4 py-4 lg:px-6">
        <div className="flex items-center space-x-4">
          <button
            onClick={onMenuClick}
            className="lg:hidden text-gray-600 hover:text-gray-900"
          >
            <Menu className="w-6 h-6" />
          </button>
          <div>
            <h1 className="text-xl font-bold text-gray-900">{businessName}</h1>
            <p className="text-sm text-gray-500">WhatsApp Business Assistant</p>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <button className="relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors">
            <Bell className="w-6 h-6" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
          </button>

          <button className="flex items-center space-x-2 p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors">
            <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
              <User className="w-5 h-5 text-white" />
            </div>
            <span className="hidden md:inline text-sm font-medium">Admin</span>
          </button>
        </div>
      </div>
    </header>
  );
};
