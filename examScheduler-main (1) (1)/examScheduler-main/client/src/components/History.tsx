import React, { useEffect, useState } from 'react';
import { apiService } from '../services/api';
import { Clock, Download, FileText, Calendar, Users, UserCheck } from 'lucide-react';
import { exportToPdf } from '../utils/exportUtils';

interface HistoryItem {
  _id: string;
  type: 'timetable' | 'seating' | 'invigilators';
  createdAt: string;
  data: any[];
}

export default function History() {
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        setLoading(true);
        const response = await apiService.getHistory();
        setHistory(response.data);
        setError(null);
      } catch (err) {
        setError('Failed to fetch history. Please try again later.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, []);

  const handleDownload = (item: HistoryItem) => {
    const fileName = `${item.type}_${new Date(item.createdAt).toISOString().split('T')[0]}`;
    exportToPdf(item.data, fileName);
  };

  const getIcon = (type: string) => {
    switch(type) {
      case 'timetable': return <Calendar className="h-6 w-6 text-blue-500" />;
      case 'seating': return <Users className="h-6 w-6 text-emerald-500" />;
      case 'invigilators': return <UserCheck className="h-6 w-6 text-purple-500" />;
      default: return <FileText className="h-6 w-6 text-gray-500" />;
    }
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 flex items-center">
          <Clock className="h-8 w-8 text-gray-600 mr-3" />
          Generation History
        </h1>
        <p className="text-gray-600 mt-1">View and download previously generated documents.</p>
      </div>

      {loading && (
        <div className="text-center p-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading history...</p>
        </div>
      )}
      {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">{error}</div>}
      
      {!loading && !error && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <ul className="divide-y divide-gray-200">
            {history.length > 0 ? (
              history.map((item) => (
                <li key={item._id} className="p-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                      {getIcon(item.type)}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-800 capitalize">{item.type} Document</p>
                      <p className="text-sm text-gray-500">
                        Generated on: {new Date(item.createdAt).toLocaleString()}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleDownload(item)}
                    className="inline-flex items-center px-3 py-2 bg-emerald-600 text-white rounded-lg text-sm font-medium hover:bg-emerald-700 transition-colors"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Download
                  </button>
                </li>
              ))
            ) : (
              <li className="p-6 text-center text-gray-500">No history found. Start by generating a document.</li>
            )}
          </ul>
        </div>
      )}
    </div>
  );
}
