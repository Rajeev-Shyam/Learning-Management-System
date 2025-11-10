import { Link } from 'react-router-dom';

export default function About() {
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
              <Link to="/about" className="text-blue-600 font-medium">About</Link>
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

      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-5xl font-bold mb-6">About LearnHub</h1>
          <p className="text-xl text-blue-100 max-w-3xl mx-auto">
            Empowering learners worldwide with quality education and transforming lives through knowledge
          </p>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-4xl font-bold text-gray-900 mb-6">Our Mission</h2>
              <p className="text-lg text-gray-600 mb-4">
                At LearnHub, we believe that education is the key to unlocking human potential. Our mission is to make high-quality education accessible to everyone, everywhere.
              </p>
              <p className="text-lg text-gray-600 mb-4">
                We partner with the world's best instructors to bring you courses that are practical, engaging, and designed to help you achieve your goals.
              </p>
              <p className="text-lg text-gray-600">
                Whether you're looking to advance your career, start a new hobby, or simply expand your knowledge, LearnHub is here to support your learning journey.
              </p>
            </div>
            <div className="bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl p-12 text-white">
              <div className="space-y-8">
                <div>
                  <div className="text-5xl font-bold mb-2">10,000+</div>
                  <div className="text-blue-100">Active Students</div>
                </div>
                <div>
                  <div className="text-5xl font-bold mb-2">500+</div>
                  <div className="text-blue-100">Expert Instructors</div>
                </div>
                <div>
                  <div className="text-5xl font-bold mb-2">1,200+</div>
                  <div className="text-blue-100">Courses Available</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="bg-gray-50 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Our Values</h2>
            <p className="text-xl text-gray-600">The principles that guide everything we do</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-xl shadow-sm">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center text-3xl mb-4">🎯</div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">Excellence</h3>
              <p className="text-gray-600">We strive for excellence in every course, ensuring our students receive the highest quality education.</p>
            </div>
            
            <div className="bg-white p-8 rounded-xl shadow-sm">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center text-3xl mb-4">🤝</div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">Community</h3>
              <p className="text-gray-600">We foster a supportive learning community where students and instructors connect and grow together.</p>
            </div>
            
            <div className="bg-white p-8 rounded-xl shadow-sm">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center text-3xl mb-4">🚀</div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">Innovation</h3>
              <p className="text-gray-600">We continuously innovate our platform and teaching methods to enhance the learning experience.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Meet Our Team</h2>
            <p className="text-xl text-gray-600">Passionate educators and technologists working together</p>
          </div>
          
          <div className="grid md:grid-cols-4 gap-8">
            {[
              { name: 'Sarah Johnson', role: 'CEO & Founder', avatar: '👩‍💼' },
              { name: 'Michael Chen', role: 'CTO', avatar: '👨‍💻' },
              { name: 'Emily Davis', role: 'Head of Education', avatar: '👩‍🏫' },
              { name: 'James Wilson', role: 'Lead Designer', avatar: '👨‍🎨' }
            ].map((member, index) => (
              <div key={index} className="text-center">
                <div className="w-32 h-32 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-6xl mx-auto mb-4">
                  {member.avatar}
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-1">{member.name}</h3>
                <p className="text-gray-600">{member.role}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-r from-blue-600 to-purple-600 py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">Join Our Learning Community</h2>
          <p className="text-xl text-blue-100 mb-8">Start your learning journey today</p>
          <Link to="/register" className="inline-block bg-white hover:bg-gray-100 text-blue-600 px-8 py-4 rounded-lg font-semibold text-lg">
            Get Started Free
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
                <li><Link to="/careers" className="hover:text-white">Careers</Link></li>
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
