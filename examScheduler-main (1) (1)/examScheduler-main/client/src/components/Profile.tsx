// import React from 'react';
import { useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { User, Mail, Building } from 'lucide-react';

export default function Profile() {
  const { user } = useAuth();
  useEffect(() => {
    console.log("User data:", user);
  }, [user]);

  if (!user) {
    return <div>Loading user profile...</div>;
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 flex items-center">
          <User className="h-8 w-8 text-blue-600 mr-3" />
          User Profile
        </h1>
        <p className="text-gray-600 mt-1">View and manage your account details.</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 max-w-2xl mx-auto">
        <div className="flex items-center space-x-6">
          <img
            src=""
            alt={user.name}
            className="w-24 h-24 rounded-full object-cover border-4 border-blue-200"
          />
          <div>
            <h2 className="text-3xl font-bold text-gray-900">{user.name}</h2>
            <p className="text-gray-500">{user.role}</p>
          </div>
        </div>

        <div className="mt-8 border-t border-gray-200 pt-8 space-y-6">
          <div className="flex items-center">
            <Mail className="h-6 w-6 text-gray-400 mr-4" />
            <div>
              <p className="text-sm text-gray-500">Email Address</p>
              <p className="text-lg font-medium text-gray-800">{user.email}</p>
            </div>
          </div>
          <div className="flex items-center">
            <Building className="h-6 w-6 text-gray-400 mr-4" />
            <div>
              <p className="text-sm text-gray-500">Institution</p>
              <p className="text-lg font-medium text-gray-800">{user.institution}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
