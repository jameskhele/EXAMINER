import React, { createContext, useContext, useReducer } from 'react';
import { apiService } from '../services/api';

// --- STATE AND ACTION DEFINITIONS ---

interface TimetableSettings {
  endTermMode: boolean;
  fixedBreak: boolean;
  slotsPerDay: number;
  examsPerSlot: number;
  studentsPerSlot: number;
  blacklistCourses: string[];
}

interface ExamState {
  files: {
    timetable: any[];
    seating: any[];
    invigilator: any[];
  };
  settings: {
    timetable: TimetableSettings;
  };
  isGenerating: boolean;
  error: string | null;
  timetableGenerated: boolean;
  seatingGenerated: boolean;
  preview: {
    type: 'timetable' | 'seating' | 'invigilator' | null;
    data: any;
    generated: boolean;
  };
}

type Action =
  | { type: 'ADD_FILE'; payload: { file: File; module: 'timetable' | 'seating' | 'invigilator'; dataType: string } }
  | { type: 'UPDATE_TIMETABLE_SETTINGS'; payload: TimetableSettings }
  | { type: 'GENERATE_START' }
  | { type: 'GENERATION_SUCCESS'; payload: { data: any; module: 'timetable' | 'seating' | 'invigilator' } }
  | { type: 'GENERATION_FAILURE'; payload: { error: string } };

// --- INITIAL STATE ---

const initialState: ExamState = {
  files: {
    timetable: [],
    seating: [],
    invigilator: [],
  },
  settings: {
    timetable: {
      endTermMode: false,
      fixedBreak: false,
      slotsPerDay: 2,
      examsPerSlot: 10,
      studentsPerSlot: 8000,
      blacklistCourses: [],
    },
  },
  isGenerating: false,
  error: null,
  timetableGenerated: false,
  seatingGenerated: false,
  preview: {
    type: null,
    data: null,
    generated: false,
  },
};

// --- REDUCER ---

const examReducer = (state: ExamState, action: Action): ExamState => {
  switch (action.type) {
    case 'ADD_FILE':
      return {
        ...state,
        files: {
          ...state.files,
          [action.payload.module]: [...state.files[action.payload.module], {
            id: Date.now(),
            name: action.payload.file.name,
            dataType: action.payload.dataType,
            file: action.payload.file
          }],
        },
      };
    case 'UPDATE_TIMETABLE_SETTINGS':
      return {
        ...state,
        settings: { ...state.settings, timetable: action.payload },
      };
    case 'GENERATE_START':
      return { ...state, isGenerating: true, error: null };
    case 'GENERATION_SUCCESS':
      return {
        ...state,
        isGenerating: false,
        timetableGenerated: action.payload.module === 'timetable' || state.timetableGenerated,
        seatingGenerated: action.payload.module === 'seating' || state.seatingGenerated,
        preview: {
          type: action.payload.module,
          data: action.payload.data,
          generated: true,
        },
      };
    case 'GENERATION_FAILURE':
      return {
        ...state,
        isGenerating: false,
        error: action.payload.error,
      };
    default:
      return state;
  }
};

// --- CONTEXT PROVIDER ---

const ExamContext = createContext<{
  state: ExamState;
  dispatch: React.Dispatch<Action>;
}>({
  state: initialState,
  dispatch: () => null,
});

export const ExamProvider = ({ children }: { children: React.ReactNode }) => {
  const [state, dispatch] = useReducer(examReducer, initialState);
  return <ExamContext.Provider value={{ state, dispatch }}>{children}</ExamContext.Provider>;
};

// --- HOOK AND LOGIC ---

export const useExam = () => {
  const context = useContext(ExamContext);
  if (!context) throw new Error('useExam must be used within an ExamProvider');
  const { state, dispatch } = context;

  const addFile = (file: File, module: 'timetable' | 'seating' | 'invigilator', dataType: string) => {
    dispatch({ type: 'ADD_FILE', payload: { file, module, dataType } });
  };

  const updateTimetableSettings = (settings: TimetableSettings) => {
    dispatch({ type: 'UPDATE_TIMETABLE_SETTINGS', payload: settings });
  };

  const generateOutput = async (module: 'timetable' | 'seating' | 'invigilator') => {
    dispatch({ type: 'GENERATE_START' });

    try {
      const formData = new FormData();
      let response;

      // Common files needed for multiple modules
      const studentRegFile = state.files.timetable.find(f => f.dataType === 'studentRegistration')?.file;
      const courseDataFile = state.files.timetable.find(f => f.dataType === 'courseData')?.file;
      
      formData.append('settings', JSON.stringify(state.settings.timetable));

      if (module === 'timetable') {
        if (!studentRegFile || !courseDataFile) throw new Error("Student and course data files are required.");
        formData.append('studentRegistration', studentRegFile);
        formData.append('courseData', courseDataFile);
        response = await apiService.generate('timetable', formData);
      } else if (module === 'seating') {
        const roomDataFile = state.files.seating.find(f => f.dataType === 'roomData')?.file;
        if (!roomDataFile || !studentRegFile || !courseDataFile) throw new Error("Room, student, and course data files are required.");
        formData.append('roomData', roomDataFile);
        formData.append('studentRegistration', studentRegFile);
        formData.append('courseData', courseDataFile);
        response = await apiService.generate('seating', formData);
      } else if (module === 'invigilator') {
        const invigilatorDataFile = state.files.invigilator.find(f => f.dataType === 'invigilatorData')?.file;
        const roomDataFile = state.files.seating.find(f => f.dataType === 'roomData')?.file;
        if (!invigilatorDataFile || !roomDataFile || !studentRegFile || !courseDataFile) throw new Error("All data files are required for invigilator assignment.");
        formData.append('invigilatorData', invigilatorDataFile);
        formData.append('roomData', roomDataFile);
        formData.append('studentRegistration', studentRegFile);
        formData.append('courseData', courseDataFile);
        response = await apiService.generate('invigilators', formData);
      }

      if (response) {
        dispatch({ type: 'GENERATION_SUCCESS', payload: { data: response.data, module } });
      } else {
        throw new Error("Could not get a response from the server.");
      }
    } catch (error: any) {
      console.error(`Error processing ${module}:`, error);
      const errorMessage = error.response?.data?.message || error.message || `Failed to generate ${module}.`;
      dispatch({ type: 'GENERATION_FAILURE', payload: { error: errorMessage } });
    }
  };

  return { state, addFile, generateOutput, updateTimetableSettings };
};

