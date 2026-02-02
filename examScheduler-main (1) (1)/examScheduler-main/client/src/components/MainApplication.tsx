// import React, { useState } from 'react';
// import Header from './layout/Header';
// import Sidebar from './layout/Sidebar';
// import Dashboard from './pages/Dashboard';
// import TimetableWizard from './pages/TimetableWizard';
// import SeatingWizard from './pages/SeatingWizard';
// import InvigilatorWizard from './pages/InvigilatorWizard';
// import ReportsModule from './pages/ReportsModule';
// import SettingsModule from './pages/SettingsModule';
// import UserManagement from './pages/UserManagement';
// import NotificationCenter from './components/NotificationCenter';
// import { useTheme } from '../contexts/ThemeContext';

// export type ActiveModule = 'dashboard' | 'timetable' | 'seating' | 'invigilator' | 'reports' | 'settings' | 'users';

// export default function MainApplication() {
//   const [activeModule, setActiveModule] = useState<ActiveModule>('dashboard');
//   const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
//   const { theme } = useTheme();

//   const renderActiveModule = () => {
//     switch (activeModule) {
//       case 'timetable':
//         return <TimetableWizard />;
//       case 'seating':
//         return <SeatingWizard />;
//       case 'invigilator':
//         return <InvigilatorWizard />;
//       case 'reports':
//         return <ReportsModule />;
//       case 'settings':
//         return <SettingsModule />;
//       case 'users':
//         return <UserManagement />;
//       default:
//         return <Dashboard onModuleSelect={setActiveModule} />;
//     }
//   };

//   return (
//     <div className={`min-h-screen transition-colors duration-300 ${
//       theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'
//     }`}>
//       <div className="flex h-screen overflow-hidden">
//         <Sidebar 
//           activeModule={activeModule}
//           onModuleChange={setActiveModule}
//           collapsed={sidebarCollapsed}
//           onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
//         />
        
//         <div className="flex-1 flex flex-col overflow-hidden">
//           <Header 
//             onSidebarToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
//           />
          
//           <main className="flex-1 overflow-y-auto">
//             <div className="h-full">
//               {renderActiveModule()}
//             </div>
//           </main>
//         </div>
//       </div>

//       <NotificationCenter />
//     </div>
//   );
// }
import React, { useState } from 'react';
import Header from './Header';
import Sidebar from './Sidebar';
import Dashboard from './Dashboard';
import TimetableModule from './TimetableModule';
import SeatingModule from './SeatingModule';
import InvigilatorModule from './InvigilatorModule';
import PreviewPanel from './PreviewPanel';
import { ExamProvider } from '../context/ExamContext';
import History from './History';
import Profile from './Profile';

export type ActiveModule = 'dashboard' | 'timetable' | 'seating' | 'invigilator'|'history'| 'profile';

export default function MainApplication() {
  const [activeModule, setActiveModule] = useState<ActiveModule>('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);

  const renderActiveModule = () => {
    switch (activeModule) {
      case 'timetable':
        return <TimetableModule />;
      case 'seating':
        return <SeatingModule />;
      case 'invigilator':
        return <InvigilatorModule />;
      case 'history':
        return <History/>;
      // case 'profile':
      //   return <Profile/>
      default:
        return <Dashboard onModuleSelect={setActiveModule} />;
    }
  };

  return (
    <ExamProvider>
      <div className="min-h-screen bg-gray-50 flex space-x-0 lg:space-x-1">
        <Sidebar 
          activeModule={activeModule} 
          onModuleChange={setActiveModule}
          isOpen={sidebarOpen}
          onToggle={() => setSidebarOpen(!sidebarOpen)}
        />
        
        <div className="flex-1 flex flex-col lg:ml-64">
          <Header 
            onSidebarToggle={() => setSidebarOpen(!sidebarOpen)}
            onPreviewToggle={() => setPreviewOpen(!previewOpen)}
          />
          
          <main className="flex-1 overflow-auto">
            <div className="p-6">
              {renderActiveModule()}
            </div>
          </main>
        </div>

        <PreviewPanel 
          isOpen={previewOpen}
          onClose={() => setPreviewOpen(false)}
        />
      </div>
    </ExamProvider>
  );
}

// import React, { useState } from 'react';
// import Header from './Header';
// import Sidebar from './Sidebar';
// import Dashboard from './Dashboard';
// import TimetableModule from './TimetableModule';
// import SeatingModule from './SeatingModule';
// import InvigilatorModule from './InvigilatorModule';
// import History from './History';
// import PreviewPanel from './PreviewPanel';
// import { ExamProvider } from '../context/ExamContext';

// export type ActiveModule = 'dashboard' | 'timetable' | 'seating' | 'invigilator' | 'history';

// function MainApplication() {
//   const [activeModule, setActiveModule] = useState<ActiveModule>('dashboard');
//   const [sidebarOpen, setSidebarOpen] = useState(false);
//   const [previewOpen, setPreviewOpen] = useState(false);

//   const renderActiveModule = () => {
//     switch (activeModule) {
//       case 'timetable':
//         return <TimetableModule />;
//       case 'seating':
//         return <SeatingModule />;
//       case 'invigilator':
//         return <InvigilatorModule />;
//       case 'history':
//         return <History />;
//       default:
//         return <Dashboard onModuleSelect={setActiveModule} />;
//     }
//   };

//   return (
//     <ExamProvider>
//       <div className="min-h-screen bg-gray-50">
//         <Sidebar
//           activeModule={activeModule}
//           onModuleChange={setActiveModule}
//           isOpen={sidebarOpen}
//           onToggle={() => setSidebarOpen(!sidebarOpen)}
//         />
//         <div className="lg:ml-64">
//           <Header
//             onSidebarToggle={() => setSidebarOpen(!sidebarOpen)}
//             onPreviewToggle={() => setPreviewOpen(!previewOpen)}
//           />
//           <main className="p-6">
//             <div className="max-w-7xl mx-auto">
//               {renderActiveModule()}
//             </div>
//           </main>
//         </div>
//         <PreviewPanel
//           isOpen={previewOpen}
//           onClose={() => setPreviewOpen(false)}
//         />
//       </div>
//     </ExamProvider>
//   );
// }

// export default MainApplication;

