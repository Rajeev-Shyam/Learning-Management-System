import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from '../api/axios';
import DashboardLayout from '../components/DashboardLayout';
import Button from '../components/Button';
import { useAuth } from '../context/AuthContext';

const CourseDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [course, setCourse] = useState(null);
  const [lessons, setLessons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [enrolling, setEnrolling] = useState(false);

  useEffect(() => {
    fetchCourseDetails();
  }, [id]);

  const fetchCourseDetails = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`/courses/${id}`);
      if (response.data.success) {
        setCourse(response.data.data);
      }
    } catch (err) {
      setError('Failed to load course details');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleEnroll = async () => {
    try {
      setEnrolling(true);
      const response = await axios.post('/enrollments', {
        course_id: parseInt(id)
      });
      
      if (response.data.success) {
        alert('Successfully enrolled in course!');
        navigate('/student-dashboard');
      }
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to enroll');
    } finally {
      setEnrolling(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-slate-600">Loading course details...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (error || !course) {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold text-slate-800 mb-2">Course Not Found</h2>
          <p className="text-slate-600 mb-4">{error || 'This course does not exist'}</p>
          <Button onClick={() => navigate(-1)}>Go Back</Button>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto">
        {/* Course Header */}
        <div className="bg-white rounded-2xl shadow-md p-8 mb-6">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-slate-800 mb-2">{course.title}</h1>
              <p className="text-slate-600 mb-4">{course.description}</p>
              
              <div className="flex items-center gap-4 text-sm text-slate-500">
                {course.instructor_name && (
                  <span className="flex items-center gap-1">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    {course.instructor_name}
                  </span>
                )}
                {course.enrolled_students !== undefined && (
                  <span className="flex items-center gap-1">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                    </svg>
                    {course.enrolled_students} students
                  </span>
                )}
                {course.price !== undefined && (
                  <span className="font-semibold text-blue-600">
                    ${parseFloat(course.price).toFixed(2)}
                  </span>
                )}
              </div>
            </div>

            {user?.role === 'student' && (
              <Button 
                onClick={handleEnroll} 
                disabled={enrolling}
                className="ml-4"
              >
                {enrolling ? 'Enrolling...' : 'Enroll Now'}
              </Button>
            )}
          </div>
        </div>

        {/* Course Content */}
        <div className="bg-white rounded-2xl shadow-md p-8">
          <h2 className="text-2xl font-bold text-slate-800 mb-4">Course Content</h2>
          
          {lessons.length > 0 ? (
            <div className="space-y-3">
              {lessons.map((lesson, index) => (
                <div 
                  key={lesson.lesson_id} 
                  className="border border-slate-200 rounded-lg p-4 hover:border-blue-300 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 text-blue-600 font-semibold text-sm">
                        {index + 1}
                      </span>
                      <div>
                        <h3 className="font-semibold text-slate-800">{lesson.title}</h3>
                        {lesson.content && (
                          <p className="text-sm text-slate-500 mt-1">{lesson.content.substring(0, 100)}...</p>
                        )}
                      </div>
                    </div>
                    {lesson.video_url && (
                      <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-slate-500 text-center py-8">
              No lessons available yet. Check back soon!
            </p>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default CourseDetails;
