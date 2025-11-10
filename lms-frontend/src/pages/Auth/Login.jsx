import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

export default function Login() {
  const [selectedRole, setSelectedRole] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleInstantLogin = async (role) => {
    setLoading(true);
    setError("");
    
    const credentials = {
      student: { email: 'student@lms.com', password: 'password123' },
      instructor: { email: 'instructor@lms.com', password: 'password123' }
    };

    try {
      const result = await login(credentials[role].email, credentials[role].password);
      
      if (result.success) {
        // Navigate based on role
        if (role === 'student') {
          navigate("/student-dashboard");
        } else {
          navigate("/instructor-dashboard");
        }
      } else {
        setError(result.message || "Login failed");
      }
    } catch (err) {
      setError("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      {/* Back to Home */}
      <Link 
        to="/" 
        className="absolute top-6 left-6 text-gray-600 hover:text-blue-600 flex items-center gap-2 font-medium"
      >
        ← Back to Home
      </Link>

      <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome Back!</h1>
          <p className="text-gray-600">Choose your role to continue</p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        {/* Role Selection */}
        <div className="space-y-4 mb-8">
          <button
            onClick={() => {
              setSelectedRole("student");
              handleInstantLogin("student");
            }}
            disabled={loading}
            className={`w-full p-6 rounded-xl border-2 transition-all ${
              selectedRole === "student"
                ? "border-green-500 bg-green-50"
                : "border-gray-200 hover:border-green-500 hover:bg-green-50"
            } ${loading ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center text-3xl">
                  👨‍🎓
                </div>
                <div className="text-left">
                  <h3 className="text-xl font-bold text-gray-900">I'm a Student</h3>
                  <p className="text-gray-600 text-sm">Access your courses and learning materials</p>
                </div>
              </div>
              {selectedRole === "student" && loading && (
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-green-600"></div>
              )}
            </div>
          </button>

          <button
            onClick={() => {
              setSelectedRole("instructor");
              handleInstantLogin("instructor");
            }}
            disabled={loading}
            className={`w-full p-6 rounded-xl border-2 transition-all ${
              selectedRole === "instructor"
                ? "border-purple-500 bg-purple-50"
                : "border-gray-200 hover:border-purple-500 hover:bg-purple-50"
            } ${loading ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center text-3xl">
                  👨‍🏫
                </div>
                <div className="text-left">
                  <h3 className="text-xl font-bold text-gray-900">I'm an Instructor</h3>
                  <p className="text-gray-600 text-sm">Manage your courses and students</p>
                </div>
              </div>
              {selectedRole === "instructor" && loading && (
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-purple-600"></div>
              )}
            </div>
          </button>

          <Link
            to="/admin-dashboard"
            className="block w-full p-6 rounded-xl border-2 border-gray-200 hover:border-blue-500 hover:bg-blue-50 transition-all"
          >
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center text-3xl">
                👨‍💼
              </div>
              <div className="text-left">
                <h3 className="text-xl font-bold text-gray-900">I'm an Admin</h3>
                <p className="text-gray-600 text-sm">Manage platform and view analytics</p>
              </div>
            </div>
          </Link>
        </div>

        {/* Divider */}
        <div className="relative mb-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-white text-gray-500">One-click demo access</span>
          </div>
        </div>

        {/* Register Link */}
        <p className="text-center text-gray-600">
          Don't have an account?{" "}
          <Link to="/register" className="text-blue-600 hover:text-blue-700 font-semibold">
            Sign up free
          </Link>
        </p>

        {/* Direct Dashboard Links */}
        <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-200">
          <p className="text-sm font-semibold text-gray-700 text-center mb-3">
            🎯 Quick Access - No Login Required
          </p>
          <div className="flex gap-2 justify-center flex-wrap">
            <Link to="/student-dashboard" className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg text-sm font-medium transition">
              Student
            </Link>
            <Link to="/instructor-dashboard" className="px-4 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-lg text-sm font-medium transition">
              Instructor
            </Link>
            <Link to="/admin-dashboard" className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-sm font-medium transition">
              Admin
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
