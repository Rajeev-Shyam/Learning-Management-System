import { Link } from 'react-router-dom';

export default function Teach() {
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
              <Link to="/features" className="text-gray-700 hover:text-blue-600">Features</Link>
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

      {/* Hero */}
      <section className="bg-gradient-to-r from-purple-600 to-pink-600 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h1 className="text-5xl font-bold mb-6">Become an Instructor</h1>
              <p className="text-xl text-purple-100 mb-8">
                Share your knowledge with millions of students worldwide and earn money doing what you love
              </p>
              <Link to="/register" className="inline-block bg-white hover:bg-gray-100 text-purple-600 px-8 py-4 rounded-lg font-semibold text-lg">
                Start Teaching Today
              </Link>
            </div>
            <div className="bg-white/10 backdrop-blur rounded-2xl p-8">
              <div className="space-y-6">
                <div>
                  <div className="text-4xl font-bold mb-2">$500K+</div>
                  <div className="text-purple-100">Total Instructor Earnings</div>
                </div>
                <div>
                  <div className="text-4xl font-bold mb-2">50,000+</div>
                  <div className="text-purple-100">Students Taught</div>
                </div>
                <div>
                  <div className="text-4xl font-bold mb-2">4.8/5</div>
                  <div className="text-purple-100">Average Rating</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-center text-gray-900 mb-16">Why Teach on LearnHub?</h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { icon: '💰', title: 'Earn Money', desc: 'Keep 70% of revenue from your courses' },
              { icon: '🌍', title: 'Global Reach', desc: 'Access to 10,000+ students worldwide' },
              { icon: '📊', title: 'Analytics', desc: 'Track your course performance in real-time' },
              { icon: '🎥', title: 'Easy Tools', desc: 'Simple course creation and video upload' },
              { icon: '💬', title: 'Community', desc: 'Connect with student and other instructors' },
              { icon: '🏆', title: 'Recognition', desc: 'Build your reputation as an expert' }
            ].map((benefit, index) => (
              <div key={index} className="text-center p-8 rounded-xl border-2 border-gray-100 hover:border-purple-500 hover:shadow-lg transition">
                <div className="text-6xl mb-4">{benefit.icon}</div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">{benefit.title}</h3>
                <p className="text-gray-600">{benefit.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Process */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-center text-gray-900 mb-16">How It Works</h2>
          
          <div className="grid md:grid-cols-4 gap-8">
            {[
              { step: '1', title: 'Sign Up', desc: 'Create your instructor account' },
              { step: '2', title: 'Plan Course', desc: 'Outline your curriculum' },
              { step: '3', title: 'Record & Upload', desc: 'Create engaging video content' },
              { step: '4', title: 'Earn Money', desc: 'Get paid as students enroll' }
            ].map((item, index) => (
              <div key={index} className="text-center">
                <div className="w-16 h-16 bg-purple-600 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                  {item.step}
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">{item.title}</h3>
                <p className="text-gray-600">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-gradient-to-r from-purple-600 to-pink-600 py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">Ready to Start Teaching?</h2>
          <p className="text-xl text-purple-100 mb-8">Join our community of expert instructors</p>
          <Link to="/register" className="inline-block bg-white hover:bg-gray-100 text-purple-600 px-8 py-4 rounded-lg font-semibold text-lg">
            Become an Instructor
          </Link>
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
