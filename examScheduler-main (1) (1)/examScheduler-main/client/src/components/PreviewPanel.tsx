import React from 'react';
import { useExam } from '../context/ExamContext';
import { X } from 'lucide-react';

interface PreviewPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function PreviewPanel({ isOpen, onClose }: PreviewPanelProps) {
  const { state } = useExam();

  const renderPreviewContent = () => {
    if (!state.preview.generated) {
      return <p className="text-gray-500">No preview available.</p>;
    }

    if (Array.isArray(state.preview.data) && state.preview.data.length > 0) {
      return (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                {Object.keys(state.preview.data[0]).map((key) => (
                  <th key={key} scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {key}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {state.preview.data.map((row, index) => (
                <tr key={index}>
                  {Object.values(row).map((value, i) => (
                    <td key={i} className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {String(value)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    }

    return (
      <div>
        <h3 className="text-lg font-medium text-gray-900">Generated Data</h3>
        <pre className="mt-2 text-sm text-gray-500 bg-gray-100 p-4 rounded">
          {JSON.stringify(state.preview.data, null, 2)}
        </pre>
      </div>
    );
  };

  return (
    <div
      className={`fixed top-0 right-0 h-full w-full max-w-2xl bg-white shadow-lg transform transition-transform duration-300 ease-in-out ${
        isOpen ? 'translate-x-0' : 'translate-x-full'
      }`}
    >
      <div className="p-6 h-full flex flex-col">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900">Preview</h2>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-100">
            <X className="h-6 w-6 text-gray-600" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto">
          {renderPreviewContent()}
        </div>
      </div>
    </div>
  );
}