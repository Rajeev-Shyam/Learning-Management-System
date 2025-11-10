import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../components/DashboardLayout';
import StatCard from '../../components/StatCard';
import axios from '../../api/axios';

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    total_users: 0,
    total_students: 0,
    total_instructors: 0,
    total_courses: 0,
    pending_courses: 0,
    approved_courses: 0,
    total_enrollments: 0
  });
  const [users, setUsers] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [statsRes, usersRes, coursesRes] = await Promise.all([
        axios.get('/admin/stats'),
        axios.get('/users?limit=10'),
        axios.get('/courses')
      ]);

      if (statsRes.data.success) {
        setStats(statsRes.data.data);
      }
      if (usersRes.data.success) {
        setUsers(usersRes.data.data || []);
      }
      if (coursesRes.data.success) {
        setCourses((coursesRes.data.data || []).slice(0, 10));
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-slate-600">Loading dashboard...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-800">Admin Dashboard</h1>
        <p className="text-slate-600 mt-2">Monitor and manage the entire platform</p>
      </div>

      {/* Platform Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="Total Users"
          value={stats.total_users || 0}
          icon={
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
          }
          color="blue"
        />
        <StatCard
          title="Students"
          value={stats.total_students || 0}
          icon={
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          }
          color="green"
        />
        <StatCard
          title="Instructors"
          value={stats.total_instructors || 0}
          icon={
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          }
          color="purple"
        />
        <StatCard
          title="Total Courses"
          value={stats.total_courses || 0}
          icon={
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
          }
          color="orange"
        />
      </div>

      {/* Secondary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-2xl shadow-md p-6 border border-slate-100">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-slate-600 font-medium">Pending Courses</h3>
            <span className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </span>
          </div>
          <p className="text-3xl font-bold text-yellow-600">{stats.pending_courses || 0}</p>
        </div>

        <div className="bg-white rounded-2xl shadow-md p-6 border border-slate-100">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-slate-600 font-medium">Approved Courses</h3>
            <span className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </span>
          </div>
          <p className="text-3xl font-bold text-green-600">{stats.approved_courses || 0}</p>
        </div>

        <div className="bg-white rounded-2xl shadow-md p-6 border border-slate-100">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-slate-600 font-medium">Total Enrollments</h3>
            <span className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </span>
          </div>
          <p className="text-3xl font-bold text-blue-600">{stats.total_enrollments || 0}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Users */}
        <div className="bg-white rounded-2xl shadow-md p-6 border border-slate-100">
          <h2 className="text-xl font-bold text-slate-800 mb-4">Recent Users</h2>
          
          {users.length > 0 ? (
            <div className="space-y-3">
              {users.map((user) => (
                <div key={user.user_id} className="flex items-center justify-between p-3 border border-slate-200 rounded-lg hover:bg-slate-50">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center text-white font-semibold">
                      {user.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="font-semibold text-slate-800">{user.name}</p>
                      <p className="text-sm text-slate-500">{user.email}</p>
                    </div>
                  </div>
                  <span className={`px-3 py-1 text-xs font-medium rounded-full ${
                    user.role === 'admin' ? 'bg-red-100 text-red-700' :
                    user.role === 'instructor' ? 'bg-purple-100 text-purple-700' :
                    'bg-blue-100 text-blue-700'
                  }`}>
                    {user.role}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-slate-500 text-center py-4">No users found</p>
          )}
        </div>

        {/* Recent Courses */}
        <div className="bg-white rounded-2xl shadow-md p-6 border border-slate-100">
          <h2 className="text-xl font-bold text-slate-800 mb-4">Recent Courses</h2>
          
          {courses.length > 0 ? (
            <div className="space-y-3">
              {courses.map((course) => (
                <div key={course.course_id} className="flex items-center justify-between p-3 border border-slate-200 rounded-lg hover:bg-slate-50">
                  <div className="flex-1">
                    <p className="font-semibold text-slate-800">{course.title}</p>
                    <p className="text-sm text-slate-500">
                      {course.instructor_name && `By ${course.instructor_name}`}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {course.price !== undefined && (
                      <span className="text-sm font-semibold text-blue-600">${parseFloat(course.price).toFixed(2)}</span>
                    )}
                    <span className={`px-3 py-1 text-xs font-medium rounded-full ${
                      course.status === 'approved' ? 'bg-green-100 text-green-700' :
                      course.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-red-100 text-red-700'
                    }`}>
                      {course.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-slate-500 text-center py-4">No courses found</p>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AdminDashboard;
