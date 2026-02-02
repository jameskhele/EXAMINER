import React from 'react';
import { Home, Calendar, Users, UserCheck, X, Clock, LogOut,User } from 'lucide-react';
import type { ActiveModule } from './MainApplication';
import { useAuth } from '../context/AuthContext';

interface SidebarProps {
  activeModule: ActiveModule;
  onModuleChange: (module: ActiveModule) => void;
  isOpen: boolean;
  onToggle: () => void;
}

const menuItems = [
  { id: 'dashboard', label: 'Dashboard', icon: Home },
  { id: 'timetable', label: 'Timetable', icon: Calendar },
  { id: 'seating', label: 'Seating', icon: Users },
  { id: 'invigilator', label: 'Invigilators', icon: UserCheck },
  { id: 'history', label: 'History', icon: Clock },
  // { id: 'profile', label: 'Profile', icon: User },
];

export default function Sidebar({ activeModule, onModuleChange, isOpen, onToggle }: SidebarProps) {
  const { logout } = useAuth();

  return (
    <>
      {/* Overlay for mobile */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-40 bg-gray-600 bg-opacity-75 lg:hidden"
          onClick={onToggle}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-xl transform transition-transform duration-300 ease-in-out
        lg:translate-x-0 lg:static lg:inset-0
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="flex items-center justify-between h-16 px-6 pb-6 border-b border-gray-200 mt-5">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <Calendar className="h-5 w-5 text-white" />
            </div>
            <span className="font-semibold text-gray-900">ExamScheduler</span>
          </div>
          
          <button
            onClick={onToggle}
            className="lg:hidden p-2 rounded-md text-gray-500 hover:text-gray-700"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="mt-8 px-4">
          <div className="space-y-2">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeModule === item.id;
              
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    onModuleChange(item.id as ActiveModule);
                    if (isOpen) onToggle();
                  }}
                  className={`
                    w-full flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors
                    ${isActive 
                      ? 'bg-blue-50 text-blue-700' 
                      : 'text-gray-700 hover:bg-gray-100'
                    }
                  `}
                >
                  <Icon className={`h-5 w-5 mr-3 ${isActive ? 'text-blue-600' : 'text-gray-500'}`} />
                  {item.label}
                </button>
              );
            })}
          </div>

          {/* Logout Button */}
          <div className="mt-8 pt-4 border-t border-gray-200">
            <button
              onClick={logout}
              className="w-full flex items-center px-4 py-3 text-sm font-medium rounded-lg text-gray-700 hover:bg-red-50 hover:text-red-700 transition-colors"
            >
              <LogOut className="h-5 w-5 mr-3 text-gray-500" />
              Logout
            </button>
          </div>
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200">
          <div className="text-xs text-gray-500 text-center">
            <p>ExamScheduler v1.0.0</p>
            <p className="mt-1">© 2025 Project Edition</p>
          </div>
        </div>
      </div>
    </>
  );
}

