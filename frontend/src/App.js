import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { useAuth } from './context/AuthContext';

// Layout Components
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';
import Sidebar from './components/layout/Sidebar';

// Pages
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import GrievanceForm from './pages/GrievanceForm';
import GrievanceDetails from './pages/GrievanceDetails';
import GrievanceList from './pages/GrievanceList';
import Profile from './pages/Profile';
import NotFound from './pages/NotFound';

// Components
import Chatbot from './components/chatbot/Chatbot';

// Create theme
const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
    background: {
      default: '#f5f5f5',
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontSize: '2.5rem',
      fontWeight: 500,
    },
    h2: {
      fontSize: '2rem',
      fontWeight: 500,
    },
    h3: {
      fontSize: '1.75rem',
      fontWeight: 500,
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          textTransform: 'none',
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
        },
      },
    },
  },
});

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  
  if (loading) {
    return <div>Loading...</div>;
  }
  
  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }
  
  return children;
};

function App() {
  const [showChatbot, setShowChatbot] = useState(false);
  
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        <Header />
        <div style={{ display: 'flex', flexGrow: 1 }}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route 
              path="/dashboard" 
              element={
                <ProtectedRoute>
                  <div style={{ display: 'flex', width: '100%' }}>
                    <Sidebar />
                    <Dashboard />
                  </div>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/grievances" 
              element={
                <ProtectedRoute>
                  <div style={{ display: 'flex', width: '100%' }}>
                    <Sidebar />
                    <GrievanceList />
                  </div>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/grievances/new" 
              element={
                <ProtectedRoute>
                  <div style={{ display: 'flex', width: '100%' }}>
                    <Sidebar />
                    <GrievanceForm />
                  </div>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/grievances/:id" 
              element={
                <ProtectedRoute>
                  <div style={{ display: 'flex', width: '100%' }}>
                    <Sidebar />
                    <GrievanceDetails />
                  </div>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/profile" 
              element={
                <ProtectedRoute>
                  <div style={{ display: 'flex', width: '100%' }}>
                    <Sidebar />
                    <Profile />
                  </div>
                </ProtectedRoute>
              } 
            />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </div>
        <Footer />
        <Chatbot show={showChatbot} onClose={() => setShowChatbot(false)} />
        {!showChatbot && (
          <div className="chatbot-toggle" onClick={() => setShowChatbot(true)}>
            <span>💬</span>
          </div>
        )}
      </div>
    </ThemeProvider>
  );
}

export default App;
