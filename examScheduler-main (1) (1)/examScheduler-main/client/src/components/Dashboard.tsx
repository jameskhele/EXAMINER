import React, { useState, useEffect } from 'react';
import { Calendar, Users, UserCheck, FileText, TrendingUp, Clock, Loader2 } from 'lucide-react';
import type { ActiveModule } from './MainApplication';
import { apiService } from '../services/api';
import { formatRelativeTime } from '../utils/time';

interface DashboardProps {
  onModuleSelect: (module: ActiveModule) => void;
}

const modules = [
  {
    id: 'timetable',
    title: 'Exam Timetable',
    description: 'Generate conflict-free exam schedules automatically',
    icon: Calendar,
    color: 'bg-blue-600',
    stats: { label: 'Exams Scheduled', value: '245' }
  },
  {
    id: 'seating',
    title: 'Seating Arrangement',
    description: 'Optimize seating plans for exam halls',
    icon: Users,
    color: 'bg-emerald-600',
    stats: { label: 'Students Seated', value: '1,834' }
  },
  {
    id: 'invigilator',
    title: 'Invigilator Assignment',
    description: 'Efficiently assign invigilators to exam halls',
    icon: UserCheck,
    color: 'bg-purple-600',
    stats: { label: 'Staff Assigned', value: '89' }
  },
];

const activityTextMap: { [key: string]: string } = {
  timetable: 'Generated a new Exam Timetable',
  seating: 'Created a Seating Arrangement',
  invigilators: 'Assigned Invigilators',
};

export default function Dashboard({ onModuleSelect }: DashboardProps) {
  const [recentActivity, setRecentActivity] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRecentActivity = async () => {
      try {
        const response = await apiService.getHistory();
        // Get the 3 most recent items from the history
        setRecentActivity(response.data.slice(0, 3));
      } catch (error) {
        console.error("Failed to fetch recent activity:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchRecentActivity();
  }, []);

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl p-8 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">Welcome to ExamDesk</h1>
            <p className="text-blue-100 text-lg">
               Professional exam management solution
            </p>
          </div>
          <div className="hidden md:block">
            <div className="w-24 h-24 bg-blue-500 rounded-full flex items-center justify-center">
              <FileText className="h-12 w-12 text-white" />
            </div>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      {/* <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Exams</p>
              <p className="text-2xl font-bold text-gray-900">245</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Calendar className="h-6 w-6 text-blue-600" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm">
            <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
            <span className="text-green-600">+12%</span>
            <span className="text-gray-500 ml-1">from last semester</span>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Students</p>
              <p className="text-2xl font-bold text-gray-900">1,834</p>
            </div>
            <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center">
              <Users className="h-6 w-6 text-emerald-600" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm">
            <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
            <span className="text-green-600">+8%</span>
            <span className="text-gray-500 ml-1">enrollment increase</span>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Staff</p>
              <p className="text-2xl font-bold text-gray-900">89</p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <UserCheck className="h-6 w-6 text-purple-600" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm">
            <Clock className="h-4 w-4 text-blue-500 mr-1" />
            <span className="text-gray-500">Available for duty</span>
          </div>
        </div>
      </div> */}

      {/* Main Modules */}
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-6">Exam Management Modules</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {modules.map((module) => {
            const Icon = module.icon;
            return (
              <button
                key={module.id}
                onClick={() => onModuleSelect(module.id as ActiveModule)}
                className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 text-left hover:shadow-md transition-shadow duration-200 group"
              >
                <div className={`w-12 h-12 ${module.color} rounded-lg flex items-center justify-center mb-4`}>
                  <Icon className="h-6 w-6 text-white" />
                </div>
                
                <h3 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                  {module.title}
                </h3>
                <p className="text-gray-600 text-sm mb-4">{module.description}</p>
                
                <div className="flex items-center justify-between">
                  <div>
                    {/* <p className="text-xs text-gray-500">{module.stats.label}</p>
                    <p className="text-lg font-bold text-gray-900">{module.stats.value}</p> */}
                  </div>
                  <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center group-hover:bg-blue-100 transition-colors">
                    <span className="text-gray-500 group-hover:text-blue-600">→</span>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
        {loading ? (
            <div className="flex justify-center items-center h-24">
                <Loader2 className="h-6 w-6 text-blue-600 animate-spin" />
            </div>
        ) : recentActivity.length > 0 ? (
            <div className="space-y-4">
            {recentActivity.map((activity) => (
                <div key={activity._id} className="flex items-center space-x-4">
                <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">{activityTextMap[activity.type] || 'Performed an action'}</p>
                    <p className="text-xs text-gray-500">{formatRelativeTime(activity.createdAt)}</p>
                </div>
                </div>
            ))}
            </div>
        ) : (
            <p className="text-sm text-gray-500 text-center">No recent activity to display.</p>
        )}
      </div>
    </div>
  );
}
