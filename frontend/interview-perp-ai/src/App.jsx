import React from 'react';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate, // Make sure to import Navigate
} from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

// Import your page components
import LandingPage from './pages/LandingPage';
import Dashboard from './pages/Home/Dashboard';
import InterviewPrep from './pages/InterviewPrep/InterviewPrep';
import UserProvider from './context/userContext';
import ReviewPage from './pages/Review/ReviewPage';

// ✅ ADD THIS COMPONENT DEFINITION
// This component checks for a token and protects routes.
const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  // If a token exists, render the child component (the page).
  // Otherwise, redirect to the home/login page.
  return token ? children : <Navigate to="/" replace />;
};

const App = () => {
  return (
    <UserProvider>
      <div>
        <Router>
          <Routes>
            <Route path='/' element={<LandingPage />} />
            
            {/* These routes should also be protected */}
            <Route
              path='/dashboard'
              element={<ProtectedRoute><Dashboard /></ProtectedRoute>}
            />
            <Route
              path='/interview-prep/:sessionId'
              element={<ProtectedRoute><InterviewPrep /></ProtectedRoute>}
            />
            
            {/* Now this route will work correctly */}
            <Route
              path="/review"
              element={<ProtectedRoute><ReviewPage /></ProtectedRoute>}
            />
          </Routes>
        </Router>
        <Toaster
          toastOptions={{
            className: "",
            style: {
              fontSize: "13px",
            },
          }}
        />
      </div>
    </UserProvider>
  );
};

export default App;
