const bcrypt = require('bcrypt');
const pool = require('./db');

async function createTestUsers() {
  try {
    console.log('🔄 Creating test users...');
    
    const password = await bcrypt.hash('password123', 10);
    
    // Admin
    await pool.query(
      'INSERT INTO users (name, email, password_hash, role) VALUES ($1, $2, $3, $4) ON CONFLICT (email) DO NOTHING',
      ['Admin User', 'admin@lms.com', password, 'admin']
    );
    console.log('✅ Admin user created');
    
    // Instructor
    await pool.query(
      'INSERT INTO users (name, email, password_hash, role) VALUES ($1, $2, $3, $4) ON CONFLICT (email) DO NOTHING',
      ['John Instructor', 'instructor@lms.com', password, 'instructor']
    );
    console.log('✅ Instructor user created');
    
    // Student
    await pool.query(
      'INSERT INTO users (name, email, password_hash, role) VALUES ($1, $2, $3, $4) ON CONFLICT (email) DO NOTHING',
      ['Jane Student', 'student@lms.com', password, 'student']
    );
    console.log('✅ Student user created');
    
    console.log('\n📝 Test User Credentials:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('👤 Admin:');
    console.log('   Email: admin@lms.com');
    console.log('   Password: password123');
    console.log('');
    console.log('👨‍🏫 Instructor:');
    console.log('   Email: instructor@lms.com');
    console.log('   Password: password123');
    console.log('');
    console.log('👨‍🎓 Student:');
    console.log('   Email: student@lms.com');
    console.log('   Password: password123');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error creating test users:', error);
    process.exit(1);
  }
}

createTestUsers();
