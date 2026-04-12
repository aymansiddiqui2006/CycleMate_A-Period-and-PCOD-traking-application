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
import BottomTabBar from './components/BottomTabBar';
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

/**
 * AppShell — wraps every authenticated page.
 * - Sidebar: fixed left w-64, visible on lg+
 * - BottomTabBar: fixed bottom, visible on mobile only (lg:hidden)
 * - Main content: offset lg:ml-64, padded bottom for tab bar on mobile
 */
const AppShell = ({ children }) => (
  <CycleProvider>
    <div className="min-h-screen bg-[#fdf2f8]">
      <Sidebar />
      <BottomTabBar />
      <main className="lg:ml-64 min-h-screen pb-20 lg:pb-0 overflow-x-hidden">
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
                fontSize: '14px',
              },
            }}
          />
          <Routes>
            <Route path="/auth"       element={<Auth />} />
            <Route path="/onboarding" element={<OnboardingRoute><Onboarding /></OnboardingRoute>} />
            <Route path="/dashboard"  element={<PrivateRoute><AppShell><Dashboard /></AppShell></PrivateRoute>} />
            <Route path="/doctors"    element={<PrivateRoute><AppShell><Doctors /></AppShell></PrivateRoute>} />
            <Route path="/orders"     element={<PrivateRoute><AppShell><Orders /></AppShell></PrivateRoute>} />
            <Route path="/report"     element={<PrivateRoute><AppShell><Report /></AppShell></PrivateRoute>} />
            <Route path="/"           element={<Navigate to="/dashboard" replace />} />
            <Route path="*"           element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </Router>
      </ErrorBoundary>
    </LanguageProvider>
  );
}

export default App;