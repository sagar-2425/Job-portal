import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { Toaster } from 'react-hot-toast';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';

// Components
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import PrivateRoute from './components/PrivateRoute';
import ScrollToTop from './components/ScrollToTop';

// Pages
import LandingPage from './pages/LandingPage';
import Login from './pages/Login';
import Register from './pages/Register';
import AdminLogin from './pages/AdminLogin';
import AdminAccess from './pages/AdminAccess';
import JobList from './pages/JobList';
import JobDetails from './pages/JobDetails';
import ApplicationForm from './pages/ApplicationForm';
import DashboardSeeker from './pages/DashboardSeeker';
import DashboardRecruiter from './pages/DashboardRecruiter';
import AdminDashboard from './pages/AdminDashboard';
import Profile from './pages/Profile';
import JobForm from './pages/JobForm';
import EditJobForm from './pages/EditJobForm';
import JobApplications from './pages/JobApplications';
import SavedJobs from './pages/SavedJobs';
import ChatPage from './pages/ChatPage';

// CSS
import './index.css';

function App() {
  return (
    <AuthProvider>
      <Router>
        <ScrollToTop />
        <div className="App">
          <Navbar />
          <main>
            <Routes>
              <Route path="/" element={<LandingPage />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/admin/login" element={<AdminLogin />} />
              <Route path="/admin/access" element={<AdminAccess />} />
              <Route path="/jobs" element={<JobList />} />
              <Route path="/jobs/:id" element={<JobDetails />} />
              <Route
                path="/apply/:jobId"
                element={
                  <PrivateRoute>
                    <ApplicationForm />
                  </PrivateRoute>
                }
              />
              <Route
                path="/dashboard/seeker"
                element={
                  <PrivateRoute>
                    <DashboardSeeker />
                  </PrivateRoute>
                }
              />
              <Route
                path="/dashboard/recruiter"
                element={
                  <PrivateRoute>
                    <DashboardRecruiter />
                  </PrivateRoute>
                }
              />
              <Route
                path="/dashboard/admin"
                element={
                  <PrivateRoute role="admin">
                    <AdminDashboard />
                  </PrivateRoute>
                }
              />
              <Route
                path="/profile"
                element={
                  <PrivateRoute>
                    <Profile />
                  </PrivateRoute>
                }
              />
              <Route
                path="/job-form"
                element={
                  <PrivateRoute role="recruiter">
                    <JobForm />
                  </PrivateRoute>
                }
              />
              <Route
                path="/edit-job/:id"
                element={
                  <PrivateRoute role="recruiter">
                    <EditJobForm />
                  </PrivateRoute>
                }
              />
              <Route
                path="/job/:jobId/applications"
                element={
                  <PrivateRoute role="recruiter">
                    <JobApplications />
                  </PrivateRoute>
                }
              />
              <Route
                path="/saved-jobs"
                element={
                  <PrivateRoute role="seeker">
                    <SavedJobs />
                  </PrivateRoute>
                }
              />
              <Route
                path="/chat/:jobId/:applicantId"
                element={
                  <PrivateRoute>
                    <ChatPage />
                  </PrivateRoute>
                }
              />
              <Route
                path="/chat/:jobId/:otherUserId"
                element={
                  <PrivateRoute>
                    <ChatPage />
                  </PrivateRoute>
                }
              />
            </Routes>
          </main>
          <Footer />
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: 'var(--card-bg)',
                color: 'var(--body-color)',
                border: '1px solid var(--border-color)',
              },
            }}
          />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
