import React, { useState, useRef } from 'react';
import { Settings, Play, Download, Calendar } from 'lucide-react';
import FileUpload from './FileUpload';
import { useExam } from '../context/ExamContext';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export default function TimetableModule() {
  const { state, addFile, generateOutput, updateTimetableSettings } = useExam();
  const [showSettings, setShowSettings] = useState(false);
  
  const settingsFormRef = useRef<HTMLFormElement>(null);

  const handleStudentRegistrationUpload = (file: File) => {
    addFile(file, 'timetable', 'studentRegistration');
  };

  const handleCourseDataUpload = (file: File) => {
    addFile(file, 'timetable', 'courseData');
  };

  const handleGenerate = () => {
    generateOutput('timetable');
  };

  const handleApplySettings = () => {
    if (settingsFormRef.current) {
      const formData = new FormData(settingsFormRef.current);
      const newSettings = {
        endTermMode: formData.get('endTermMode') === 'on',
        fixedBreak: formData.get('fixedBreak') === 'on',
        slotsPerDay: parseInt(formData.get('slotsPerDay') as string, 10),
        examsPerSlot: parseInt(formData.get('examsPerSlot') as string, 10),
        studentsPerSlot: parseInt(formData.get('studentsPerSlot') as string, 10),
        blacklistCourses: (formData.get('blacklistCourses') as string).split(',').map(c => c.trim()).filter(Boolean),
      };
      updateTimetableSettings(newSettings);
      alert('Settings applied successfully!');
    }
  };

  const handleExport = () => {
  if (state.preview.data && state.preview.data.length > 0) {
    const doc = new jsPDF();

    // Extract headers and body
    const tableHeaders = Object.keys(state.preview.data[0]);
    const tableData = state.preview.data.map((row: Record<string, any>) => Object.values(row));

    // Generate the table
    autoTable(doc, {
      head: [tableHeaders],
      body: tableData,
      startY: 20, // optional, sets where table starts
      styles: { fontSize: 10 }, // optional styling
    });

    // Save file
    doc.save("Timetable.pdf");
  } else {
    alert("No data available to export.");
  }
};

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center">
            <Calendar className="h-8 w-8 text-blue-600 mr-3" />
            Exam Timetable Generator
          </h1>
          <p className="text-gray-600 mt-1">Create conflict-free exam schedules automatically</p>
        </div>
        <button
          onClick={() => setShowSettings(!showSettings)}
          className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors"
        >
          <Settings className="h-4 w-4 mr-2" />
          Settings
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Upload Subject & Student Data</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FileUpload
                onFileUpload={handleStudentRegistrationUpload}
                title="Upload Student Registration Data"
                description="Upload the .csv file with student registration details"
              />
              <FileUpload
                onFileUpload={handleCourseDataUpload}
                title="Upload Course Data"
                description="Upload the .csv file with course information"
              />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Generate Timetable</h2>
              {state.preview.generated && state.preview.type === 'timetable' && (
                <button 
                  onClick={handleExport}
                  className="inline-flex items-center px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-medium hover:bg-emerald-700 transition-colors">
                  <Download className="h-4 w-4 mr-2" />
                  Export to PDF
                </button>
              )}
            </div>
            
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div className="bg-blue-50 p-3 rounded-lg">
                  <p className="font-medium text-blue-900">Slots Per Day</p>
                  <p className="text-blue-700">{state.settings.timetable.slotsPerDay}</p>
                </div>
                <div className="bg-blue-50 p-3 rounded-lg">
                  <p className="font-medium text-blue-900">Exams Per Slot</p>
                  <p className="text-blue-700">{state.settings.timetable.examsPerSlot}</p>
                </div>
                <div className="bg-blue-50 p-3 rounded-lg">
                  <p className="font-medium text-blue-900">Students Per Slot</p>
                  <p className="text-blue-700">{state.settings.timetable.studentsPerSlot}</p>
                </div>
              </div>

              <button
                onClick={handleGenerate}
                disabled={state.files.timetable.length < 2 || state.isGenerating}
                className="w-full inline-flex items-center justify-center px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {state.isGenerating ? "Generating..." : "Generate Timetable"}
              </button>
            </div>
          </div>
        </div>

        {showSettings && (
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 sticky top-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Timetable Settings</h3>
              <form ref={settingsFormRef} onSubmit={(e) => e.preventDefault()}>
                <div className="space-y-4">
                  <label className="flex items-center"><input type="checkbox" name="endTermMode" defaultChecked={state.settings.timetable.endTermMode} className="mr-2"/>End-Term Mode</label>
                  <label className="flex items-center"><input type="checkbox" name="fixedBreak" defaultChecked={state.settings.timetable.fixedBreak} className="mr-2"/>Fixed Break</label>
                  <div><label>Slots Per Day</label><input type="number" name="slotsPerDay" defaultValue={state.settings.timetable.slotsPerDay} className="w-full p-2 border rounded"/></div>
                  <div><label>Exams Per Slot</label><input type="number" name="examsPerSlot" defaultValue={state.settings.timetable.examsPerSlot} className="w-full p-2 border rounded"/></div>
                  <div><label>Students Per Slot</label><input type="number" name="studentsPerSlot" defaultValue={state.settings.timetable.studentsPerSlot} className="w-full p-2 border rounded"/></div>
                  <div><label>Blacklist Courses (comma-separated)</label><textarea name="blacklistCourses" defaultValue={state.settings.timetable.blacklistCourses.join(',')} className="w-full p-2 border rounded"/></div>
                  <button onClick={handleApplySettings} className="w-full px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300">Apply Settings</button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
