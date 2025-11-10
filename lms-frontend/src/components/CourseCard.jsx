import React from 'react';
import { Link } from 'react-router-dom';

const CourseCard = ({ course }) => {
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition duration-300">
      <div className="h-48 bg-gradient-to-r from-primary to-blue-600 flex items-center justify-center">
        <span className="text-6xl">📚</span>
      </div>
      <div className="p-5">
        <h3 className="text-xl font-bold text-slate-800 mb-2">
          {course.title || course.name}
        </h3>
        <p className="text-slate-600 text-sm mb-4 line-clamp-2">
          {course.description || 'No description available'}
        </p>
        <div className="flex items-center justify-between mb-4">
          {course.price !== undefined && (
            <span className="text-2xl font-bold text-primary">
              ${course.price}
            </span>
          )}
          {course.instructor_name && (
            <span className="text-sm text-slate-500">
              By {course.instructor_name}
            </span>
          )}
        </div>
        <div className="flex items-center justify-between">
          {course.rating && (
            <div className="flex items-center">
              <span className="text-yellow-500 mr-1">⭐</span>
              <span className="text-sm font-semibold">{course.rating}</span>
            </div>
          )}
          {course.students_count !== undefined && (
            <span className="text-sm text-slate-500">
              {course.students_count} students
            </span>
          )}
        </div>
        <Link
          to={`/courses/${course.id}`}
          className="mt-4 block w-full text-center px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition duration-200"
        >
          View Details
        </Link>
      </div>
    </div>
  );
};

export default CourseCard;
