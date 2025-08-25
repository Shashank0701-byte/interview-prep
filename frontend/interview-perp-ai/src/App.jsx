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
import SignUp from './pages/Auth/Signup';
import Login from './pages/Auth/Login';
import AnalyticsDashboard from './pages/Analytics/AnalyticsDashboard';
import PracticePage from './pages/PracticePage';

// Import collaborative feature components
import StudyGroups from './pages/Collaborative/StudyGroups.jsx';
import StudyGroupDetail from './pages/Collaborative/StudyGroupDetail.jsx';
import PeerReview from './pages/Collaborative/PeerReview.jsx';
import Mentorship from './pages/Collaborative/Mentorship.jsx';
import Forum from './pages/Collaborative/Forum.jsx';
import ForumDetail from './pages/Collaborative/ForumDetail.jsx';


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
            <Route path="/progress" element={<ProtectedRoute><AnalyticsDashboard /></ProtectedRoute>} />
            {/* These routes should also be protected */}
            <Route
              path='/dashboard'
              element={<ProtectedRoute><Dashboard /></ProtectedRoute>}
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
            
            {/* Collaborative Features Routes */}
            <Route
              path="/study-groups"
              element={<ProtectedRoute><StudyGroups /></ProtectedRoute>}
            />
            <Route
              path="/peer-reviews"
              element={<ProtectedRoute><PeerReview /></ProtectedRoute>}
            />
            <Route
              path="/mentorships"
              element={<ProtectedRoute><Mentorship /></ProtectedRoute>}
            />
            <Route
              path="/forums"
              element={<ProtectedRoute><Forum /></ProtectedRoute>}
            />
            <Route
              path="/forums/:forumId"
              element={<ProtectedRoute><ForumDetail /></ProtectedRoute>}
            />
            <Route
              path="/study-groups/:groupId"
              element={<ProtectedRoute><StudyGroupDetail /></ProtectedRoute>}
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
