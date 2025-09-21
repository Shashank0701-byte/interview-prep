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
import SignUp from './pages/Auth/SignUp.jsx';
import Login from './pages/Auth/Login';
import AnalyticsDashboard from './pages/Analytics/AnalyticsDashboard';
import PracticePage from './pages/PracticePage';
import RoadmapPage from './pages/Roadmap/RoadmapPage';
import PhaseOverviewPage from './pages/Roadmap/PhaseOverviewPage';
import PhaseQuizPage from './pages/Roadmap/PhaseQuizPage';
import PhaseSessionLibrary from './pages/Roadmap/PhaseSessionLibrary';
import CreateSessionPage from './pages/Roadmap/CreateSessionPage';


// ✅ ADD THIS COMPONENT DEFINITION
// This component checks for a token and protects routes.
const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  // If a token exists, render the child component (the page).
  // Otherwise, redirect to the home/login page.
  return token ? children : <Navigate to="/" replace />;
};

const RedirectIfAuth = ({ children }) => {
    const token = localStorage.getItem('token');
    return token ? <Navigate to="/dashboard" replace /> : children;
};

const App = () => {
  return (
    <UserProvider>
      <div>
        <Router>
          <Routes>
            <Route path='/' element={<LandingPage />} />
             <Route 
            path="/signUp" 
            element={<RedirectIfAuth><SignUp /></RedirectIfAuth>} 
          /> 
          <Route 
            path="/login" 
            element={<RedirectIfAuth><Login /></RedirectIfAuth>} 
          /> 
            <Route path="/progress" element={<ProtectedRoute><AnalyticsDashboard key="analytics" /></ProtectedRoute>} />
            <Route path="/roadmap" element={<ProtectedRoute><RoadmapPage key="roadmap" /></ProtectedRoute>} />
            <Route path="/phase/:role/:phaseId" element={<ProtectedRoute><PhaseOverviewPage key="phase-overview" /></ProtectedRoute>} />
            <Route path="/phase-quiz/:role/:phaseId" element={<ProtectedRoute><PhaseQuizPage key="phase-quiz" /></ProtectedRoute>} />
            <Route path="/phase-sessions/:role/:phaseId" element={<ProtectedRoute><PhaseSessionLibrary key="phase-sessions" /></ProtectedRoute>} />
            <Route path="/create-session/:role/:phaseId" element={<ProtectedRoute><CreateSessionPage key="create-session" /></ProtectedRoute>} />
            {/* These routes should also be protected */}
            <Route
              path='/dashboard'
              element={<ProtectedRoute><Dashboard key="dashboard" /></ProtectedRoute>}
            />
            <Route
              path='/interview-prep/:sessionId'
              element={<ProtectedRoute><InterviewPrep /></ProtectedRoute>}
            />
            <Route
                    path="/practice"
                    element={<ProtectedRoute><PracticePage /></ProtectedRoute>}
                />
            {/* <Route path="/companies" element={<ProtectedRoute><CompaniesPage /></ProtectedRoute>} /> */}
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
