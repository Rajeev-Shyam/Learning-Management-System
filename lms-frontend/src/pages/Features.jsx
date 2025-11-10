import { Link } from 'react-router-dom';

export default function Features() {
  const features = [
    {
      icon: '🎥',
      title: 'HD Video Lessons',
      description: 'Learn with high-quality video content from expert instructors worldwide',
      color: 'blue'
    },
    {
      icon: '📝',
      title: 'Interactive Quizzes',
      description: 'Test your knowledge with engaging quizzes and immediate feedback',
      color: 'green'
    },
    {
      icon: '📊',
      title: 'Progress Tracking',
      description: 'Monitor your learning journey with detailed analytics and insights',
      color: 'purple'
    },
    {
      icon: '🏆',
      title: 'Certificates',
      description: 'Earn recognized certificates upon course completion',
      color: 'yellow'
    },
    {
      icon: '💬',
      title: 'Discussion Forums',
      description: 'Connect with instructors and peers in course-specific forums',
      color: 'pink'
    },
    {
      icon: '📱',
      title: 'Mobile Learning',
      description: 'Learn on-the-go with our mobile-friendly platform',
      color: 'indigo'
    },
    {
      icon: '⚡',
      title: 'Fast Streaming',
      description: 'Enjoy buffer-free video streaming with adaptive quality',
      color: 'red'
    },
    {
      icon: '🔔',
      title: 'Smart Notifications',
      description: 'Stay updated with personalized learning reminders',
      color: 'orange'
    },
    {
      icon: '📚',
      title: 'Resource Library',
      description: 'Access downloadable materials, PDFs, and code samples',
      color: 'teal'
    },
    {
      icon: '👥',
      title: 'Group Projects',
      description: 'Collaborate with classmates on real-world projects',
      color: 'cyan'
    },
    {
      icon: '🎯',
      title: 'Personalized Path',
      description: 'Get course recommendations based on your interests',
      color: 'lime'
    },
    {
      icon: '💳',
      title: 'Flexible Payment',
      description: 'Multiple payment options including subscriptions and one-time purchases',
      color: 'blue'
    }
  ];

  const stats = [
    { number: '10,000+', label: 'Active Students', icon: '👨‍🎓' },
    { number: '500+', label: 'Expert Instructors', icon: '👨‍🏫' },
    { number: '1,200+', label: 'Online Courses', icon: '📚' },
    { number: '95%', label: 'Satisfaction Rate', icon: '⭐' }
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link to="/" className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              🎓 LearnHub
            </Link>
            <div className="hidden md:flex items-center space-x-8">
              <Link to="/courses" className="text-gray-700 hover:text-blue-600">Courses</Link>
              <Link to="/about" className="text-gray-700 hover:text-blue-600">About</Link>
              <Link to="/features" className="text-blue-600 font-medium">Features</Link>
              <Link to="/pricing" className="text-gray-700 hover:text-blue-600">Pricing</Link>
              <Link to="/contact" className="text-gray-700 hover:text-blue-600">Contact</Link>
            </div>
            <div className="flex items-center space-x-4">
              <Link to="/login" className="text-gray-700 hover:text-blue-600 font-medium">Sign In</Link>
              <Link to="/register" className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium">Get Started</Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-5xl font-bold mb-6">Platform Features</h1>
          <p className="text-xl text-blue-100 max-w-3xl mx-auto">
            Everything you need for an exceptional learning experience
          </p>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-5xl mb-3">{stat.icon}</div>
                <div className="text-4xl font-bold text-blue-600 mb-2">{stat.number}</div>
                <div className="text-gray-600">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Powerful Features for Effective Learning
            </h2>
            <p className="text-xl text-gray-600">
              Designed with students and instructors in mind
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div 
                key={index} 
                className="bg-white p-8 rounded-xl border-2 border-gray-100 hover:border-blue-500 hover:shadow-xl transition-all"
              >
                <div className="text-5xl mb-4">{feature.icon}</div>
                <h3 className="text-2xl font-bold text-gray-900 mb-3">
                  {feature.title}
                </h3>
                <p className="text-gray-600">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* For Instructors Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-4xl font-bold text-gray-900 mb-6">
                Built for Instructors
              </h2>
              <ul className="space-y-4">
                {[
                  'Easy course creation with intuitive builder',
                  'Upload videos, PDFs, and assignments',
                  'Track student progress and engagement',
                  'Automated certificate generation',
                  'Real-time analytics dashboard',
                  'Multiple pricing options',
                  'Direct student communication',
                  'Secure payment processing'
                ].map((item, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <svg className="w-6 h-6 text-green-500 flex-shrink-0 mt-1" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span className="text-lg text-gray-700">{item}</span>
                  </li>
                ))}
              </ul>
              <Link 
                to="/teach" 
                className="inline-block mt-8 bg-purple-600 hover:bg-purple-700 text-white px-8 py-3 rounded-lg font-semibold"
              >
                Become an Instructor
              </Link>
            </div>
            <div className="bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl p-12 text-white">
              <div className="space-y-8">
                <div>
                  <div className="text-5xl font-bold mb-2">$500K+</div>
                  <div className="text-purple-100">Total Instructor Earnings</div>
                </div>
                <div>
                  <div className="text-5xl font-bold mb-2">50K+</div>
                  <div className="text-purple-100">Students Taught</div>
                </div>
                <div>
                  <div className="text-5xl font-bold mb-2">4.9/5</div>
                  <div className="text-purple-100">Average Rating</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Technology Stack */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Built with Modern Technology
            </h2>
            <p className="text-xl text-gray-600">
              Fast, secure, and scalable platform
            </p>
          </div>

          <div className="grid md:grid-cols-4 gap-8">
            {[
              { name: 'React', icon: '⚛️', desc: 'Fast UI' },
              { name: 'Node.js', icon: '🟢', desc: 'Powerful Backend' },
              { name: 'PostgreSQL', icon: '🐘', desc: 'Reliable Database' },
              { name: 'AWS', icon: '☁️', desc: 'Cloud Hosting' }
            ].map((tech, index) => (
              <div key={index} className="text-center p-6 bg-gray-50 rounded-xl">
                <div className="text-5xl mb-3">{tech.icon}</div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">{tech.name}</h3>
                <p className="text-gray-600">{tech.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-r from-blue-600 to-purple-600 py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Ready to Start Learning?
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Join thousands of students already learning on LearnHub
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              to="/register" 
              className="bg-white hover:bg-gray-100 text-blue-600 px-8 py-4 rounded-lg font-semibold text-lg"
            >
              Start Free Trial
            </Link>
            <Link 
              to="/courses" 
              className="bg-blue-700 hover:bg-blue-800 text-white px-8 py-4 rounded-lg font-semibold text-lg"
            >
              Browse Courses
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-2xl font-bold mb-4">🎓 LearnHub</h3>
              <p className="text-gray-400">Your gateway to knowledge</p>
            </div>
            <div>
              <h4 className="font-bold mb-4">Platform</h4>
              <ul className="space-y-2 text-gray-400">
                <li><Link to="/courses" className="hover:text-white">Courses</Link></li>
                <li><Link to="/features" className="hover:text-white">Features</Link></li>
                <li><Link to="/pricing" className="hover:text-white">Pricing</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4">Company</h4>
              <ul className="space-y-2 text-gray-400">
                <li><Link to="/about" className="hover:text-white">About</Link></li>
                <li><Link to="/contact" className="hover:text-white">Contact</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4">Teach</h4>
              <ul className="space-y-2 text-gray-400">
                <li><Link to="/teach" className="hover:text-white">Become Instructor</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2025 LearnHub. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
