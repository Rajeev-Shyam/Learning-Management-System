import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import CourseCard from '../components/CourseCard';
import axios from '../api/axios';

const Home = () => {
  const [featuredCourses, setFeaturedCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFeaturedCourses();
  }, []);

  const fetchFeaturedCourses = async () => {
    try {
      const response = await axios.get('/courses');
      setFeaturedCourses(response.data.slice(0, 3) || []);
    } catch (error) {
      console.error('Error fetching courses:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-20">
        <div className="text-center mb-16">
          <h1 className="text-5xl md:text-6xl font-bold text-slate-800 mb-6">
            Learn Smarter with <span className="text-primary">LMS Pro</span>
          </h1>
          <p className="text-xl text-slate-600 mb-8 max-w-2xl mx-auto">
            Transform your learning journey with our comprehensive platform. Access quality courses, 
            interact with expert instructors, and achieve your goals.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/register"
              className="px-8 py-4 bg-primary text-white rounded-lg font-semibold hover:bg-primary/90 transition duration-200 text-lg"
            >
              Get Started Free
            </Link>
            <Link
              to="/login"
              className="px-8 py-4 bg-white text-primary border-2 border-primary rounded-lg font-semibold hover:bg-primary/5 transition duration-200 text-lg"
            >
              Sign In
            </Link>
          </div>
        </div>

        {/* Features */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20">
          <div className="bg-white rounded-xl shadow-lg p-8 text-center hover:shadow-xl transition">
            <div className="text-6xl mb-4">📚</div>
            <h3 className="text-2xl font-bold text-slate-800 mb-3">Quality Courses</h3>
            <p className="text-slate-600">
              Access a wide range of courses from expert instructors in various fields.
            </p>
          </div>
          <div className="bg-white rounded-xl shadow-lg p-8 text-center hover:shadow-xl transition">
            <div className="text-6xl mb-4">🏆</div>
            <h3 className="text-2xl font-bold text-slate-800 mb-3">Earn Achievements</h3>
            <p className="text-slate-600">
              Track your progress and earn achievements as you complete courses and quizzes.
            </p>
          </div>
          <div className="bg-white rounded-xl shadow-lg p-8 text-center hover:shadow-xl transition">
            <div className="text-6xl mb-4">💬</div>
            <h3 className="text-2xl font-bold text-slate-800 mb-3">Interactive Learning</h3>
            <p className="text-slate-600">
              Engage with instructors and peers through assignments, quizzes, and messages.
            </p>
          </div>
        </div>

        {/* Featured Courses */}
        <div className="mb-16">
          <h2 className="text-4xl font-bold text-slate-800 text-center mb-12">
            Featured Courses
          </h2>
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
          ) : featuredCourses.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {featuredCourses.map((course) => (
                <CourseCard key={course.id} course={course} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-slate-600 text-lg">No courses available at the moment.</p>
            </div>
          )}
        </div>

        {/* CTA Section */}
        <div className="bg-primary rounded-2xl shadow-2xl p-12 text-center text-white">
          <h2 className="text-4xl font-bold mb-4">Ready to Start Learning?</h2>
          <p className="text-xl mb-8 opacity-90">
            Join thousands of learners and instructors on LMS Pro today!
          </p>
          <Link
            to="/register"
            className="inline-block px-8 py-4 bg-white text-primary rounded-lg font-semibold hover:bg-slate-100 transition duration-200 text-lg"
          >
            Sign Up Now
          </Link>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-slate-800 text-white py-8">
        <div className="container mx-auto px-4 text-center">
          <p className="text-slate-400">&copy; 2025 LMS Pro. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default Home;
