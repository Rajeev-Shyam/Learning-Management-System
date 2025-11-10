// index.js
require("dotenv").config();
console.log("✅ Environment variables loaded");

const express = require("express");
const app = express();
const cors = require("cors");
const pool = require("./db");
const initializeTables = require("./initDb");

const { authenticateToken, authorizeRoles } = require("./middleware/authMiddleware");

// Middleware
app.use(cors({
  origin: 'http://localhost:5174', // Allow frontend origin
  credentials: true
}));
app.use(express.json());
console.log("✅ Express + middleware initialized");

// Import routes
const authRoutes = require("./auth");
const courseRoutes = require("./routes/courses");
const enrollmentRoutes = require("./routes/enrollments");
const userRoutes = require("./routes/users");
const wishlistRoutes = require("./routes/wishlist");
const cartRoutes = require("./routes/cart");
const couponRoutes = require("./routes/coupons");
const assignmentRoutes = require("./routes/assignments");
const submissionRoutes = require("./routes/submissions");
const quizRoutes = require("./routes/quizzes");
const achievementRoutes = require("./routes/achievements");
const messageRoutes = require("./routes/messages");
const payoutRoutes = require("./routes/payouts");
const ratingRoutes = require("./routes/ratings");

const PORT = process.env.PORT || 3000;

// Function to initialize the server after DB connection
async function startServer() {
  try {
    console.log("⏳ Connecting to PostgreSQL...");
    const client = await pool.connect();
    console.log("✅ Connected to PostgreSQL database");
    client.release();

    // Initialize database tables
    await initializeTables();

    // Register routes
    app.use("/auth", authRoutes);
    app.use("/courses", courseRoutes);
    app.use("/enrollments", enrollmentRoutes);
    app.use("/users", userRoutes);
    app.use("/wishlist", wishlistRoutes);
    app.use("/cart", cartRoutes);
    app.use("/coupons", couponRoutes);
    app.use("/assignments", assignmentRoutes);
    app.use("/submissions", submissionRoutes);
    app.use("/quizzes", quizRoutes);
    app.use("/achievements", achievementRoutes);
    app.use("/messages", messageRoutes);
    app.use("/payouts", payoutRoutes);
    app.use("/ratings", ratingRoutes);

    // Public routes
    app.get("/", (req, res) => {
      res.send("LMS Backend Running 🚀");
    });

    // Health check
    app.get("/ping", (req, res) => res.json({ ok: true }));

    // Admin statistics endpoint
    app.get("/admin/stats", authenticateToken, authorizeRoles("admin"), async (req, res) => {
      try {
        const stats = await pool.query(`
          SELECT 
            (SELECT COUNT(*) FROM users) AS total_users,
            (SELECT COUNT(*) FROM users WHERE role = 'student') AS total_students,
            (SELECT COUNT(*) FROM users WHERE role = 'instructor') AS total_instructors,
            (SELECT COUNT(*) FROM courses) AS total_courses,
            (SELECT COUNT(*) FROM courses WHERE status = 'pending') AS pending_courses,
            (SELECT COUNT(*) FROM courses WHERE status = 'approved') AS approved_courses,
            (SELECT COUNT(*) FROM enrollments) AS total_enrollments
        `);
        res.json({ success: true, data: stats.rows[0] });
      } catch (err) {
        res.status(500).json({ success: false, error: err.message });
      }
    });

    // Student dashboard data endpoint
    app.get("/student/dashboard-data", authenticateToken, authorizeRoles("student"), async (req, res) => {
      try {
        const userId = req.user.user_id;
        
        // Get enrolled courses with progress
        const enrollments = await pool.query(`
          SELECT 
            c.course_id,
            c.title,
            c.description,
            c.thumbnail_url,
            e.progress,
            u.name AS instructor_name
          FROM enrollments e
          JOIN courses c ON e.course_id = c.course_id
          JOIN users u ON c.instructor_id = u.user_id
          WHERE e.student_id = $1
          ORDER BY e.enrolled_at DESC
        `, [userId]);

        // Get recommended courses (not enrolled yet)
        const recommended = await pool.query(`
          SELECT 
            c.course_id,
            c.title,
            c.description,
            c.thumbnail_url,
            c.price,
            u.name AS instructor_name
          FROM courses c
          JOIN users u ON c.instructor_id = u.user_id
          WHERE c.status = 'approved' 
            AND c.is_public = true
            AND c.course_id NOT IN (SELECT course_id FROM enrollments WHERE student_id = $1)
          ORDER BY c.created_at DESC
          LIMIT 4
        `, [userId]);

        res.json({ 
          success: true, 
          data: { 
            enrolledCourses: enrollments.rows,
            recommendedCourses: recommended.rows
          } 
        });
      } catch (err) {
        res.status(500).json({ success: false, error: err.message });
      }
    });

    // Instructor dashboard data endpoint
    app.get("/instructor/dashboard-data", authenticateToken, authorizeRoles("instructor"), async (req, res) => {
      try {
        const userId = req.user.user_id;
        
        // Get instructor's courses
        const courses = await pool.query(`
          SELECT 
            c.course_id,
            c.title,
            c.description,
            c.price,
            c.status,
            c.thumbnail_url,
            c.created_at,
            (SELECT COUNT(*) FROM enrollments WHERE course_id = c.course_id) AS enrolled_students,
            (SELECT AVG(rating)::numeric(3,2) FROM ratings WHERE course_id = c.course_id) AS avg_rating
          FROM courses c
          WHERE c.instructor_id = $1
          ORDER BY c.created_at DESC
        `, [userId]);

        // Get total stats
        const stats = await pool.query(`
          SELECT 
            COUNT(DISTINCT c.course_id)::int AS total_courses,
            COUNT(DISTINCT e.student_id)::int AS total_students,
            COALESCE(SUM(c.price * (SELECT COUNT(*) FROM enrollments WHERE course_id = c.course_id)), 0)::numeric(10,2) AS total_revenue
          FROM courses c
          LEFT JOIN enrollments e ON c.course_id = e.course_id
          WHERE c.instructor_id = $1
        `, [userId]);

        res.json({ 
          success: true, 
          data: { 
            courses: courses.rows,
            stats: stats.rows[0]
          } 
        });
      } catch (err) {
        res.status(500).json({ success: false, error: err.message });
      }
    });

    // Dashboards
    app.get("/student-dashboard", authenticateToken, authorizeRoles("student"), (req, res) => {
      res.json({ message: "Welcome Student!", user: req.user });
    });

    app.get("/instructor-dashboard", authenticateToken, authorizeRoles("instructor"), (req, res) => {
      res.json({ message: "Welcome Instructor!", user: req.user });
    });

    app.get("/admin-dashboard", authenticateToken, authorizeRoles("admin"), (req, res) => {
      res.json({ message: "Welcome Admin!", user: req.user });
    });

    // 404 handler
    app.use((req, res) => {
      res.status(404).json({ success: false, error: "Not found" });
    });

    // Global error handler
    app.use((err, req, res, next) => {
      console.error("❌ Server error:", err);
      res.status(500).json({ success: false, error: "Server error" });
    });

    // Start server
    app.listen(PORT, () => {
      console.log(`🚀 Server running at http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error("❌ Failed to start server:", err.message);
    process.exit(1);
  }
}

// Start everything
startServer();
