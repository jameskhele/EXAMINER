import React from 'react';
import { Menu, Eye,Building } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface HeaderProps {
  onSidebarToggle: () => void;
  onPreviewToggle: () => void;
}

export default function Header({ onSidebarToggle, onPreviewToggle }: HeaderProps) {
  const {user} = useAuth();
  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={onSidebarToggle}
              className="lg:hidden p-2 rounded-md text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition-colors"
            >
              <Menu className="h-5 w-5" />
            </button>
            
            <div>
              <h1 className="text-2xl font-bold text-gray-900">EXAM-SHEDULER</h1>
              <p className="text-sm text-gray-600">PROFESSIONAL EXAM MANAGEMENT </p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-lg bg-blue-100 flex">
              <Building className="h-4 w-4 text-blue-600 mt-1 mx-1" />
              <span>{user?.institution}</span>
            </div>
            <button
              onClick={onPreviewToggle}
              className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Eye className="h-4 w-4 mr-2" />
              Preview
            </button>
            

            {/* <button className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors">
              <Download className="h-4 w-4 mr-2" />
              Export
            </button> */}

            {/* <button className="p-2 rounded-lg text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition-colors">
              <Settings className="h-5 w-5" />
            </button> */}
            
          </div>
        </div>
      </div>
    </header>
  );
}