import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import PrivateRoute from './components/PrivateRoute';

// Pages
import Landing from './pages/Landing';
import About from './pages/About';
import Features from './pages/Features';
import Pricing from './pages/Pricing';
import Contact from './pages/Contact';
import Teach from './pages/Teach';
import Login from './pages/Auth/Login';
import Register from './pages/Auth/Register';
import StudentDashboard from './pages/Dashboard/StudentDashboard';
import InstructorDashboard from './pages/Dashboard/InstructorDashboard';
import AdminDashboard from './pages/Dashboard/AdminDashboard';
import CourseDetails from './pages/CourseDetails';
import Courses from './pages/Courses';
import Home from './pages/Home';
import NotFound from './pages/NotFound';

function App() {
  return (
    <Router>
      <AuthProvider>
        <div className="min-h-screen bg-slate-50">
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Landing />} />
            <Route path="/about" element={<About />} />
            <Route path="/features" element={<Features />} />
            <Route path="/pricing" element={<Pricing />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/teach" element={<Teach />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/courses" element={<Courses />} />
            <Route path="/home" element={<Home />} />

            {/* Demo Dashboards - Public Access for Demo */}
            <Route path="/student-dashboard" element={<StudentDashboard />} />
            <Route path="/instructor-dashboard" element={<InstructorDashboard />} />
            <Route path="/admin-dashboard" element={<AdminDashboard />} />

            {/* Shared Protected Routes */}
            <Route
              path="/course/:id"
              element={
                <PrivateRoute>
                  <CourseDetails />
                </PrivateRoute>
              }
            />

            {/* 404 Route */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </div>
      </AuthProvider>
    </Router>
  );
}

export default App;
