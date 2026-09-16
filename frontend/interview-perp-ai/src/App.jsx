import { lazy, Suspense } from 'react';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate, // Make sure to import Navigate
} from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import ScrollToTop from './components/ScrollToTop';
import Seo from './components/Seo';
import { ThemeProvider } from './context/ThemeContext';
import NotFound from './pages/NotFound';

// Import your page components
import UserProvider from './context/userContext';
const LandingPage = lazy(() => import('./pages/LandingPage'));
const Dashboard = lazy(() => import('./pages/Home/Dashboard'));
const InterviewPrep = lazy(() => import('./pages/InterviewPrep/InterviewPrep'));
const ReviewPage = lazy(() => import('./pages/Review/ReviewPage'));
const SignUp = lazy(() => import('./pages/Auth/SignUp.jsx'));
const Login = lazy(() => import('./pages/Auth/Login'));
const AnalyticsDashboard = lazy(() => import('./pages/Analytics/AnalyticsDashboard'));
const PracticePage = lazy(() => import('./pages/PracticePage'));
const RoadmapPage = lazy(() => import('./pages/Roadmap/RoadmapPage'));
const PhaseOverviewPage = lazy(() => import('./pages/Roadmap/PhaseOverviewPage'));
const PhaseQuizPage = lazy(() => import('./pages/Roadmap/PhaseQuizPage'));
const PhaseSessionLibrary = lazy(() => import('./pages/Roadmap/PhaseSessionLibrary'));
const CreateSessionPage = lazy(() => import('./pages/Roadmap/CreateSessionPage'));
const RoadmapSessionPractice = lazy(() => import('./pages/Roadmap/RoadmapSessionPractice'));
const CodeReviewSimulator = lazy(() => import('./pages/CodeReview/CodeReviewSimulator'));
const ScenarioSelector = lazy(() => import('./pages/CodeReview/ScenarioSelector'));
const MultiFilePRReview = lazy(() => import('./pages/CodeReview/MultiFilePRReview'));
const SmartResumeBuilder = lazy(() => import('./pages/Resume/SmartResumeBuilder'));
const LiveCodingPage = lazy(() => import('./pages/LiveCoding/LiveCodingPage'));
const LiveCodingChallenge = lazy(() => import('./pages/LiveCoding/LiveCodingChallenge'));
const StudyRoomDashboard = lazy(() => import('./pages/StudyRoom/StudyRoomDashboard'));
const StudyRoomInterface = lazy(() => import('./pages/StudyRoom/StudyRoomInterface'));
const StudyRoomJoin = lazy(() => import('./pages/StudyRoom/StudyRoomJoin'));
const AIInterviewCoach = lazy(() => import('./pages/AIInterviewCoach/AIInterviewCoach'));
const InterviewInterface = lazy(() => import('./pages/AIInterviewCoach/InterviewInterface'));
const InterviewReport = lazy(() => import('./pages/AIInterviewCoach/InterviewReport'));
const SalaryNegotiationPage = lazy(() => import('./pages/SalaryNegotiation/SalaryNegotiationPage'));
const NegotiationSimulator = lazy(() => import('./pages/SalaryNegotiation/NegotiationSimulator'));
const NegotiationResults = lazy(() => import('./pages/SalaryNegotiation/NegotiationResults'));
const NegotiationHistory = lazy(() => import('./pages/SalaryNegotiation/NegotiationHistory'));


// ✅ ADD THIS COMPONENT DEFINITION
// This component checks for a token and protects routes.
const ProtectedRoute = ({ children }) => {
  const token = sessionStorage.getItem('token') || localStorage.getItem('token');
  // If a token exists, render the child component (the page).
  // Otherwise, redirect to the home/login page.
  return token ? children : <Navigate to="/" replace />;
};

const RedirectIfAuth = ({ children }) => {
    const token = sessionStorage.getItem('token') || localStorage.getItem('token');
    return token ? <Navigate to="/dashboard" replace /> : children;
};

const App = () => {
  return (
    <ThemeProvider>
      <UserProvider>
        <div className="min-h-screen transition-colors duration-300" style={{ backgroundColor: 'var(--color-bg)' }}>
          <Router>
          <ScrollToTop />
          <Seo />
          <Suspense fallback={<div className="grid min-h-screen place-items-center">Loading…</div>}>
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
            <Route path="/roadmap-session/:sessionId" element={<ProtectedRoute><RoadmapSessionPractice key="roadmap-session" /></ProtectedRoute>} />
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
            <Route
              path="/code-review"
              element={<ProtectedRoute><ScenarioSelector /></ProtectedRoute>}
            />
            <Route
              path="/code-review/:scenarioId"
              element={<ProtectedRoute><CodeReviewSimulator /></ProtectedRoute>}
            />
            <Route
              path="/multi-file-pr/:prId"
              element={<ProtectedRoute><MultiFilePRReview /></ProtectedRoute>}
            />
            <Route
              path="/resume-builder"
              element={<ProtectedRoute><SmartResumeBuilder /></ProtectedRoute>}
            />
            <Route
              path="/salary-negotiation"
              element={<ProtectedRoute><SalaryNegotiationPage /></ProtectedRoute>}
            />
            <Route
              path="/salary-negotiation/simulator"
              element={<ProtectedRoute><NegotiationSimulator /></ProtectedRoute>}
            />
            <Route
              path="/salary-negotiation/results"
              element={<ProtectedRoute><NegotiationResults /></ProtectedRoute>}
            />
            <Route
              path="/salary-negotiation/history"
              element={<ProtectedRoute><NegotiationHistory /></ProtectedRoute>}
            />
            <Route
              path="/live-coding"
              element={<ProtectedRoute><LiveCodingPage /></ProtectedRoute>}
            />
            <Route
              path="/live-coding/:challengeId"
              element={<ProtectedRoute><LiveCodingChallenge /></ProtectedRoute>}
            />
            <Route
              path="/study-rooms"
              element={<ProtectedRoute><StudyRoomDashboard /></ProtectedRoute>}
            />
            <Route
              path="/study-room/:roomId"
              element={<ProtectedRoute><StudyRoomInterface /></ProtectedRoute>}
            />
            <Route
              path="/join/:roomId"
              element={<ProtectedRoute><StudyRoomJoin /></ProtectedRoute>}
            />
            <Route
              path="/ai-interview-coach"
              element={<ProtectedRoute><AIInterviewCoach /></ProtectedRoute>}
            />
            <Route
              path="/ai-interview/:sessionId"
              element={<ProtectedRoute><InterviewInterface /></ProtectedRoute>}
            />
            <Route
              path="/ai-interview/:sessionId/report"
              element={<ProtectedRoute><InterviewReport /></ProtectedRoute>}
            />
            <Route path="*" element={<NotFound />} />
          </Routes>
          </Suspense>
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
    </ThemeProvider>
  );
};

export default App;
