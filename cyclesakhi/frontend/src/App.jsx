import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { LanguageProvider } from './context/LanguageContext';
import { CycleProvider } from './context/CycleContext';
import ErrorBoundary from './components/ErrorBoundary';
import Auth from './pages/Auth';
import Dashboard from './pages/Dashboard';
import Onboarding from './pages/Onboarding';
import Doctors from './pages/Doctors';
import Orders from './pages/Orders';
import Report from './pages/Report';
import Sidebar from './components/Sidebar';
import ChatBot from './components/ChatBot';

const PrivateRoute = ({ children }) => {
  const token = localStorage.getItem('accessToken');
  const user  = localStorage.getItem('user');
  return token && user ? children : <Navigate to="/auth" replace />;
};

// Only blocks unauthenticated users. Onboarded users CAN revisit to edit.
const OnboardingRoute = ({ children }) => {
  const token = localStorage.getItem('accessToken');
  if (!token) return <Navigate to="/auth" replace />;
  return children;
};

const AppLayout = ({ children }) => (
  <CycleProvider>
    <div className="flex h-screen bg-[#fdf2f8] overflow-hidden">
      <Sidebar />
      <main className="flex-1 overflow-y-auto w-full relative">
        {children}
      </main>
      <ChatBot />
    </div>
  </CycleProvider>
);

function App() {
  return (
    <LanguageProvider>
      <ErrorBoundary>
        <Router>
          <Toaster
            position="top-right"
            toastOptions={{
              style: {
                borderRadius: '14px',
                background: '#fff',
                color: '#333',
                boxShadow: '0 4px 20px rgba(255,107,138,0.15)',
                border: '1px solid #fce7f3',
                fontWeight: '500',
              },
            }}
          />
          <Routes>
            <Route path="/auth"       element={<Auth />} />
            <Route path="/onboarding" element={<OnboardingRoute><Onboarding /></OnboardingRoute>} />
            <Route path="/dashboard" element={<PrivateRoute><AppLayout><Dashboard /></AppLayout></PrivateRoute>} />
            <Route path="/doctors"   element={<PrivateRoute><AppLayout><Doctors /></AppLayout></PrivateRoute>} />
            <Route path="/orders"    element={<PrivateRoute><AppLayout><Orders /></AppLayout></PrivateRoute>} />
            <Route path="/report"    element={<PrivateRoute><AppLayout><Report /></AppLayout></PrivateRoute>} />
            <Route path="/"  element={<Navigate to="/dashboard" replace />} />
            <Route path="*"  element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </Router>
      </ErrorBoundary>
    </LanguageProvider>
  );
}

export default App;