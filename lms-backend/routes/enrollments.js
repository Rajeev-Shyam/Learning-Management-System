const express = require("express");
const router = express.Router();
const pool = require("../db");
const { authenticateToken, authorizeRoles } = require("../middleware/authMiddleware");

/**
 * GET /enrollments
 * - admin: all enrollments
 * - instructor: only enrollments for their courses
 * - student: forbidden (per your spec)
 */
router.get("/", authenticateToken, async (req, res) => {
  try {
    let query, params = [];

    if (req.user.role === "admin") {
      query = `
        SELECT
          e.enrollment_id,
          e.student_id,
          e.course_id,
          e.created_at,
          u.name AS student_name,
          c.title AS course_title
        FROM enrollments e
        JOIN users u    ON e.student_id = u.user_id
        JOIN courses c  ON e.course_id  = c.course_id
        ORDER BY e.enrollment_id DESC
      `;
    } else if (req.user.role === "instructor") {
      query = `
        SELECT
          e.enrollment_id,
          e.student_id,
          e.course_id,
          e.created_at,
          u.name AS student_name,
          c.title AS course_title
        FROM enrollments e
        JOIN users u    ON e.student_id = u.user_id
        JOIN courses c  ON e.course_id  = c.course_id
        WHERE c.instructor_id = $1
        ORDER BY e.enrollment_id DESC
      `;
      params = [req.user.user_id];
    } else {
      return res
        .status(403)
        .json({ success: false, error: "Students cannot view enrollments" });
    }

    const result = await pool.query(query, params);
    res.json({ success: true, data: result.rows });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * POST /enrollments
 * - student: enroll self
 * - admin: enroll any student (must pass student_id)
 * - instructor: not allowed
 *
 * Body (student):
 *   { "course_id": 123 }
 *
 * Body (admin):
 *   { "student_id": 7, "course_id": 123 }
 */
router.post(
  "/",
  authenticateToken,
  authorizeRoles("student", "admin"),
  async (req, res) => {
    try {
      const { course_id } = req.body;
      if (!course_id) {
        return res.status(400).json({
          success: false,
          error: "course_id is required",
        });
      }

      // resolve student_id depending on role
      let studentId;
      if (req.user.role === "student") {
        studentId = req.user.user_id;
      } else {
        // admin must provide student_id
        if (!req.body.student_id) {
          return res.status(400).json({
            success: false,
            error: "admin must specify student_id",
          });
        }
        studentId = Number(req.body.student_id);
      }

      // course exists?
      const { rows: courseRows } = await pool.query(
        "SELECT course_id FROM courses WHERE course_id = $1",
        [course_id]
      );
      if (!courseRows.length) {
        return res.status(404).json({
          success: false,
          error: "Course not found",
        });
      }

      // already enrolled?
      const { rows: exists } = await pool.query(
        `SELECT enrollment_id
         FROM enrollments
         WHERE student_id = $1 AND course_id = $2`,
        [studentId, course_id]
      );
      if (exists.length) {
        return res.status(409).json({
          success: false,
          error: "Student is already enrolled in this course",
        });
      }

      // create enrollment
      const { rows } = await pool.query(
        `INSERT INTO enrollments (student_id, course_id)
         VALUES ($1, $2)
         RETURNING enrollment_id, student_id, course_id, created_at`,
        [studentId, course_id]
      );

      res
        .status(201)
        .json({ success: true, message: "Enrolled successfully", data: rows[0] });
    } catch (err) {
      // if you add a DB unique index (see note), handle PG error 23505 nicely
      if (err.code === "23505") {
        return res
          .status(409)
          .json({ success: false, error: "Duplicate enrollment" });
      }
      res.status(500).json({ success: false, error: err.message });
    }
  }
);

/**
 * DELETE /enrollments/:id
 * - admin only (instructor cannot remove; student cannot remove)
 */
router.delete(
  "/:id",
  authenticateToken,
  authorizeRoles("admin"),
  async (req, res) => {
    const { id } = req.params;
    try {
      const result = await pool.query(
        `DELETE FROM enrollments
         WHERE enrollment_id = $1
         RETURNING enrollment_id, student_id, course_id`,
        [id]
      );

      if (!result.rows.length) {
        return res
          .status(404)
          .json({ success: false, error: "Enrollment not found" });
      }

      res.json({
        success: true,
        message: "Enrollment deleted",
        data: result.rows[0],
      });
    } catch (err) {
      res.status(500).json({ success: false, error: err.message });
    }
  }
);

module.exports = router;


