import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Sidebar = () => {
  const { user } = useAuth();
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(true);

  const studentLinks = [
    { path: '/student-dashboard', label: 'Dashboard', icon: '📊' },
    { path: '/courses', label: 'Courses', icon: '📚' },
    { path: '/wishlist', label: 'Wishlist', icon: '❤️' },
    { path: '/cart', label: 'Cart', icon: '🛒' },
    { path: '/assignments', label: 'Assignments', icon: '📝' },
    { path: '/quizzes', label: 'Quizzes', icon: '❓' },
    { path: '/achievements', label: 'Achievements', icon: '🏆' },
    { path: '/messages', label: 'Messages', icon: '💬' },
  ];

  const instructorLinks = [
    { path: '/instructor-dashboard', label: 'Dashboard', icon: '📊' },
    { path: '/courses', label: 'My Courses', icon: '📚' },
    { path: '/assignments', label: 'Assignments', icon: '📝' },
    { path: '/submissions', label: 'Submissions', icon: '📤' },
    { path: '/quizzes', label: 'Quizzes', icon: '❓' },
    { path: '/payouts', label: 'Payouts', icon: '💰' },
    { path: '/ratings', label: 'Ratings', icon: '⭐' },
    { path: '/messages', label: 'Messages', icon: '💬' },
  ];

  const adminLinks = [
    { path: '/admin-dashboard', label: 'Dashboard', icon: '📊' },
    { path: '/users', label: 'Users', icon: '👥' },
    { path: '/courses', label: 'All Courses', icon: '📚' },
    { path: '/enrollments', label: 'Enrollments', icon: '📋' },
    { path: '/coupons', label: 'Coupons', icon: '🎟️' },
    { path: '/messages', label: 'Messages', icon: '💬' },
    { path: '/ratings', label: 'Ratings', icon: '⭐' },
  ];

  const getLinks = () => {
    if (user?.role === 'student') return studentLinks;
    if (user?.role === 'instructor') return instructorLinks;
    if (user?.role === 'admin') return adminLinks;
    return [];
  };

  const links = getLinks();

  return (
    <>
      {/* Toggle button for mobile */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="lg:hidden fixed top-20 left-4 z-50 p-2 bg-primary text-white rounded-md shadow-lg"
      >
        {isOpen ? '✕' : '☰'}
      </button>

      {/* Sidebar */}
      <aside
        className={`fixed left-0 top-16 h-screen bg-white shadow-lg transition-transform duration-300 ease-in-out z-40 ${
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        } ${isOpen ? 'w-64' : 'lg:w-20'}`}
      >
        <div className="flex flex-col h-full py-6">
          {/* Toggle button for desktop */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="hidden lg:block absolute top-4 right-4 text-slate-600 hover:text-primary"
          >
            {isOpen ? '◀' : '▶'}
          </button>

          <nav className="flex-1 mt-8">
            <ul className="space-y-2 px-3">
              {links.map((link) => (
                <li key={link.path}>
                  <Link
                    to={link.path}
                    className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition duration-200 ${
                      location.pathname === link.path
                        ? 'bg-primary text-white'
                        : 'text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    <span className="text-xl">{link.icon}</span>
                    {isOpen && <span className="font-medium">{link.label}</span>}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {isOpen && (
            <div className="px-6 pb-4">
              <div className="p-4 bg-primary/10 rounded-lg">
                <p className="text-sm text-slate-600">
                  Logged in as
                </p>
                <p className="font-semibold text-primary capitalize">
                  {user?.role}
                </p>
              </div>
            </div>
          )}
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
