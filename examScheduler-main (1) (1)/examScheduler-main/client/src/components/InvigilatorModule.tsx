import React from 'react';
import { Play, Download, UserCheck } from 'lucide-react';
import FileUpload from './FileUpload';
import { useExam } from '../context/ExamContext';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export default function InvigilatorModule() {
  const { state, addFile, generateOutput } = useExam();

  const handleInvigilatorDataUpload = (file: File) => {
    addFile(file, 'invigilator', 'invigilatorData');
  };

  const handleGenerate = () => {
    generateOutput('invigilator');
  };

const handleExport = () => {
  if (state.preview.data && state.preview.data.length > 0) {
    const doc = new jsPDF();

    // Extract headers and body
    const tableHeaders = Object.keys(state.preview.data[0]);
    const tableData = state.preview.data.map(row => Object.values(row));

    // Generate the table
    autoTable(doc, {
      head: [tableHeaders],
      body: tableData,
      startY: 20, // optional, sets where table starts
      styles: { fontSize: 10 }, // optional styling
    });

    // Save file
    doc.save("Invigilator_assignment.pdf");
  } else {
    alert("No data available to export.");
  }
};

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center">
            <UserCheck className="h-8 w-8 text-purple-600 mr-3" />
            Invigilator Assignment
          </h1>
          <p className="text-gray-600 mt-1">Assign invigilators to exam rooms</p>
        </div>
      </div>

      <div className="lg:col-span-2 space-y-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Upload Invigilator Data</h2>
          <FileUpload
            onFileUpload={handleInvigilatorDataUpload}
            title="Upload Invigilator Data"
            description="Upload the .csv file with invigilator details"
          />
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Generate Assignments</h2>
            {state.preview.generated && state.preview.type === 'invigilator' && (
              <button onClick={handleExport} className="inline-flex items-center px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-medium hover:bg-emerald-700">
                <Download className="h-4 w-4 mr-2" />
                Export to PDF
              </button>
            )}
          </div>
          
          <div className="space-y-4">
            <button
              onClick={handleGenerate}
              disabled={state.files.invigilator.length < 1 || state.isGenerating || !state.seatingGenerated}
              className="w-full inline-flex items-center justify-center px-6 py-3 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 disabled:opacity-50"
            >
              {state.isGenerating ? "Generating..." : "Generate Assignments"}
            </button>
            {!state.seatingGenerated && (
              <p className="text-sm text-red-600 text-center">
                Please generate the seating arrangement before assigning invigilators.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
