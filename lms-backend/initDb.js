// initDb.js - Initialize database tables if they don't exist
const pool = require("./db");

async function initializeTables() {
  const client = await pool.connect();
  try {
    console.log("🔄 Initializing database tables...");

    // Create users table
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        user_id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        email VARCHAR(100) UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        role VARCHAR(20) CHECK (role IN ('student','instructor','admin')) DEFAULT 'student',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log("✅ Users table ready");

    // Create courses table
    await client.query(`
      CREATE TABLE IF NOT EXISTS courses (
        course_id SERIAL PRIMARY KEY,
        title VARCHAR(200) NOT NULL,
        description TEXT,
        instructor_id INT REFERENCES users(user_id) ON DELETE CASCADE,
        thumbnail_url TEXT,
        price NUMERIC(10,2) DEFAULT 0,
        status VARCHAR(20) DEFAULT 'approved' CHECK (status IN ('pending','approved','rejected')),
        is_public BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log("✅ Courses table ready");

    // Create enrollments table
    await client.query(`
      CREATE TABLE IF NOT EXISTS enrollments (
        enrollment_id SERIAL PRIMARY KEY,
        student_id INT REFERENCES users(user_id) ON DELETE CASCADE,
        course_id INT REFERENCES courses(course_id) ON DELETE CASCADE,
        progress NUMERIC(5,2) DEFAULT 0,
        enrolled_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(student_id, course_id)
      );
    `);
    console.log("✅ Enrollments table ready");

    // Create lessons table
    await client.query(`
      CREATE TABLE IF NOT EXISTS lessons (
        lesson_id SERIAL PRIMARY KEY,
        course_id INT REFERENCES courses(course_id) ON DELETE CASCADE,
        title VARCHAR(200),
        content TEXT,
        video_url TEXT,
        order_index INT DEFAULT 0
      );
    `);
    console.log("✅ Lessons table ready");

    // Create wishlist table (for student features)
    await client.query(`
      CREATE TABLE IF NOT EXISTS wishlist (
        wishlist_id SERIAL PRIMARY KEY,
        student_id INT REFERENCES users(user_id) ON DELETE CASCADE,
        course_id INT REFERENCES courses(course_id) ON DELETE CASCADE,
        added_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(student_id, course_id)
      );
    `);
    console.log("✅ Wishlist table ready");

    // Create cart table
    await client.query(`
      CREATE TABLE IF NOT EXISTS cart (
        cart_id SERIAL PRIMARY KEY,
        student_id INT REFERENCES users(user_id) ON DELETE CASCADE,
        course_id INT REFERENCES courses(course_id) ON DELETE CASCADE,
        added_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(student_id, course_id)
      );
    `);
    console.log("✅ Cart table ready");

    // Create assignments table
    await client.query(`
      CREATE TABLE IF NOT EXISTS assignments (
        assignment_id SERIAL PRIMARY KEY,
        course_id INT REFERENCES courses(course_id) ON DELETE CASCADE,
        title VARCHAR(200) NOT NULL,
        description TEXT,
        due_date TIMESTAMP,
        max_points INT DEFAULT 100,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log("✅ Assignments table ready");

    // Create submissions table
    await client.query(`
      CREATE TABLE IF NOT EXISTS submissions (
        submission_id SERIAL PRIMARY KEY,
        assignment_id INT REFERENCES assignments(assignment_id) ON DELETE CASCADE,
        student_id INT REFERENCES users(user_id) ON DELETE CASCADE,
        content TEXT,
        file_url TEXT,
        grade NUMERIC(5,2),
        feedback TEXT,
        submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(assignment_id, student_id)
      );
    `);
    console.log("✅ Submissions table ready");

    // Create quizzes table
    await client.query(`
      CREATE TABLE IF NOT EXISTS quizzes (
        quiz_id SERIAL PRIMARY KEY,
        course_id INT REFERENCES courses(course_id) ON DELETE CASCADE,
        title VARCHAR(200) NOT NULL,
        description TEXT,
        time_limit INT,
        max_attempts INT DEFAULT 1,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log("✅ Quizzes table ready");

    // Create achievements table
    await client.query(`
      CREATE TABLE IF NOT EXISTS achievements (
        achievement_id SERIAL PRIMARY KEY,
        student_id INT REFERENCES users(user_id) ON DELETE CASCADE,
        title VARCHAR(100) NOT NULL,
        description TEXT,
        icon_url TEXT,
        earned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log("✅ Achievements table ready");

    // Create messages table
    await client.query(`
      CREATE TABLE IF NOT EXISTS messages (
        message_id SERIAL PRIMARY KEY,
        sender_id INT REFERENCES users(user_id) ON DELETE CASCADE,
        receiver_id INT REFERENCES users(user_id) ON DELETE CASCADE,
        subject VARCHAR(200),
        body TEXT,
        is_read BOOLEAN DEFAULT false,
        sent_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log("✅ Messages table ready");

    // Create ratings table
    await client.query(`
      CREATE TABLE IF NOT EXISTS ratings (
        rating_id SERIAL PRIMARY KEY,
        course_id INT REFERENCES courses(course_id) ON DELETE CASCADE,
        student_id INT REFERENCES users(user_id) ON DELETE CASCADE,
        rating INT CHECK (rating >= 1 AND rating <= 5),
        review TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(course_id, student_id)
      );
    `);
    console.log("✅ Ratings table ready");

    // Create coupons table
    await client.query(`
      CREATE TABLE IF NOT EXISTS coupons (
        coupon_id SERIAL PRIMARY KEY,
        code VARCHAR(50) UNIQUE NOT NULL,
        discount_percent INT CHECK (discount_percent >= 0 AND discount_percent <= 100),
        valid_from TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        valid_until TIMESTAMP,
        max_uses INT,
        uses INT DEFAULT 0,
        is_active BOOLEAN DEFAULT true
      );
    `);
    console.log("✅ Coupons table ready");

    // Create payouts table
    await client.query(`
      CREATE TABLE IF NOT EXISTS payouts (
        payout_id SERIAL PRIMARY KEY,
        instructor_id INT REFERENCES users(user_id) ON DELETE CASCADE,
        amount NUMERIC(10,2) NOT NULL,
        status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending','processing','completed','failed')),
        requested_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        processed_at TIMESTAMP
      );
    `);
    console.log("✅ Payouts table ready");

    console.log("✨ All tables initialized successfully!");
    
  } catch (error) {
    console.error("❌ Error initializing tables:", error.message);
    throw error;
  } finally {
    client.release();
  }
}

// Run if executed directly
if (require.main === module) {
  initializeTables()
    .then(() => {
      console.log("✅ Database initialization complete!");
      process.exit(0);
    })
    .catch((err) => {
      console.error("❌ Database initialization failed:", err);
      process.exit(1);
    });
}

module.exports = initializeTables;
