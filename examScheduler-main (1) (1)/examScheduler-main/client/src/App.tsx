import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import LoginScreen from './components/auth/LoginScreen';
import SignupScreen from './components/auth/SignupScreen';
import MainApplication from './components/MainApplication';
import LoadingScreen from './components/LoadingScreen';

const App: React.FC = () => {
  return (
    <Router>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </Router>
  );
};

const AppRoutes: React.FC = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return <LoadingScreen />;
  }

  return (
    <Routes>
      <Route path="/login" element={!user ? <LoginScreen /> : <Navigate to="/" />} />
      <Route path="/signup" element={!user ? <SignupScreen /> : <Navigate to="/" />} />
      <Route 
        path="/*" 
        element={
          user ? (
            <MainApplication />
          ) : (
            <Navigate to="/login" />
          )
        } 
      />
    </Routes>
  );
};

export default App;
