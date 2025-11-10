const express = require("express");
const router = express.Router();
const pool = require("../db");
const { authenticateToken, authorizeRoles } = require("../middleware/authMiddleware");

// Public: list ratings for a course
router.get("/course/:courseId", async (req, res) => {
  const { rows } = await pool.query(
    `SELECT r.rating_id, r.rating, r.review, r.created_at, u.name AS student_name
       FROM course_ratings r
       JOIN users u ON u.user_id = r.student_id
      WHERE r.course_id = $1
      ORDER BY r.rating_id DESC`,
    [req.params.courseId]
  );
  res.json({ success:true, data: rows });
});

// Student: add or update my rating for a course (must be enrolled)
router.post("/", authenticateToken, authorizeRoles("student"), async (req, res) => {
  const { course_id, rating, review } = req.body || {};
  if (!course_id || rating == null) {
    return res.status(400).json({ success:false, error:"course_id and rating required" });
  }
  // must be enrolled
  const { rows: enr } = await pool.query(
    `SELECT 1 FROM enrollments WHERE student_id=$1 AND course_id=$2`,
    [req.user.user_id, course_id]
  );
  if (!enr.length) return res.status(403).json({ success:false, error:"You can only rate courses you are enrolled in" });

  const { rows } = await pool.query(
    `INSERT INTO course_ratings (course_id, student_id, rating, review)
     VALUES ($1,$2,$3,$4)
     ON CONFLICT (course_id, student_id) DO UPDATE
       SET rating = EXCLUDED.rating, review = EXCLUDED.review, created_at = CURRENT_TIMESTAMP
     RETURNING *`,
    [course_id, req.user.user_id, Number(rating), review || null]
  );
  res.status(201).json({ success:true, data: rows[0] });
});

module.exports = router;
