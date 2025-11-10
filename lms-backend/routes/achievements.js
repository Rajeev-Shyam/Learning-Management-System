const express = require("express");
const router = express.Router();
const pool = require("../db");
const { authenticateToken, authorizeRoles } = require("../middleware/authMiddleware");

// helpers
const isAdmin = (req) => req.user?.role === "admin";

/**
 * STUDENT — my achievements
 * GET /achievements/me
 */
router.get(
  "/me",
  authenticateToken,
  authorizeRoles("student"),
  async (req, res) => {
    try {
      const { rows } = await pool.query(
        `SELECT a.achievement_id, a.course_id, c.title AS course_title,
                a.title, a.description, a.earned_at
           FROM achievements a
           LEFT JOIN courses c ON c.course_id = a.course_id
          WHERE a.student_id = $1
          ORDER BY a.earned_at DESC`,
        [req.user.user_id]
      );
      res.json({ success: true, data: rows });
    } catch (e) {
      res.status(500).json({ success: false, error: e.message });
    }
  }
);

/**
 * ADMIN/INSTRUCTOR — create (award) an achievement
 * POST /achievements
 * Body: { student_id, course_id, title, description? }
 * Rules:
 *  - Admin: can award for any course/student
 *  - Instructor: course_id is required and must be owned by the instructor
 *  - Student must be enrolled in the course (if course_id provided)
 */
router.post(
  "/",
  authenticateToken,
  authorizeRoles("instructor", "admin"),
  async (req, res) => {
    try {
      let { student_id, course_id, title, description } = req.body || {};
      if (!student_id || !title) {
        return res
          .status(400)
          .json({ success: false, error: "student_id and title are required" });
      }
      title = String(title).trim();
      if (!title) {
        return res
          .status(400)
          .json({ success: false, error: "title cannot be empty" });
      }

      // If instructor → course_id is mandatory and must belong to them
      if (req.user.role === "instructor") {
        if (!course_id) {
          return res
            .status(400)
            .json({ success: false, error: "course_id is required for instructors" });
        }
        const { rows: courseRows } = await pool.query(
          `SELECT course_id, instructor_id FROM courses WHERE course_id = $1`,
          [course_id]
        );
        if (!courseRows.length) {
          return res
            .status(404)
            .json({ success: false, error: "Course not found" });
        }
        if (courseRows[0].instructor_id !== req.user.user_id) {
          return res
            .status(403)
            .json({ success: false, error: "Not your course" });
        }
      }

      // If a course_id is supplied, ensure student is enrolled
      if (course_id) {
        const { rows: en } = await pool.query(
          `SELECT 1 FROM enrollments WHERE student_id = $1 AND course_id = $2`,
          [student_id, course_id]
        );
        if (!en.length) {
          return res.status(400).json({
            success: false,
            error: "Student is not enrolled in this course",
          });
        }
      }

      const { rows } = await pool.query(
        `INSERT INTO achievements (student_id, course_id, title, description)
         VALUES ($1,$2,$3,$4)
         RETURNING achievement_id, student_id, course_id, title, description, earned_at`,
        [student_id, course_id || null, title, description || null]
      );
      res.status(201).json({ success: true, data: rows[0] });
    } catch (e) {
      res.status(500).json({ success: false, error: e.message });
    }
  }
);

/**
 * ADMIN/INSTRUCTOR — list achievements (with filters)
 * GET /achievements
 * Query (optional):
 *   - student_id
 *   - course_id
 * Rules:
 *  - Admin: all results (with optional filters)
 *  - Instructor: only for their courses
 */
router.get(
  "/",
  authenticateToken,
  authorizeRoles("instructor", "admin"),
  async (req, res) => {
    try {
      const { student_id, course_id } = req.query;
      const where = [];
      const vals = [];
      let i = 1;

      if (student_id) {
        where.push(`a.student_id = $${i++}`);
        vals.push(Number(student_id));
      }
      if (course_id) {
        where.push(`a.course_id = $${i++}`);
        vals.push(Number(course_id));
      }

      // instructor scoping
      let scope = "";
      if (!isAdmin(req)) {
        scope = `a.course_id IN (
          SELECT course_id FROM courses WHERE instructor_id = $${i++}
        )`;
        vals.push(req.user.user_id);
      }

      const allWhere = [scope, ...where].filter(Boolean).join(" AND ");
      const sql = `
        SELECT a.achievement_id, a.student_id, s.name AS student_name,
               a.course_id, c.title AS course_title,
               a.title, a.description, a.earned_at
          FROM achievements a
          LEFT JOIN users s   ON s.user_id   = a.student_id
          LEFT JOIN courses c ON c.course_id = a.course_id
         ${allWhere ? "WHERE " + allWhere : ""}
         ORDER BY a.earned_at DESC
      `;

      const { rows } = await pool.query(sql, vals);
      res.json({ success: true, data: rows });
    } catch (e) {
      res.status(500).json({ success: false, error: e.message });
    }
  }
);

/**
 * ADMIN/INSTRUCTOR — delete an achievement
 * DELETE /achievements/:id
 * - Admin: can delete any
 * - Instructor: only if it belongs to their course
 */
router.delete(
  "/:id",
  authenticateToken,
  authorizeRoles("instructor", "admin"),
  async (req, res) => {
    try {
      const id = Number(req.params.id);

      if (isAdmin(req)) {
        const { rowCount } = await pool.query(
          `DELETE FROM achievements WHERE achievement_id = $1`,
          [id]
        );
        if (!rowCount) {
          return res
            .status(404)
            .json({ success: false, error: "Achievement not found" });
        }
        return res.json({ success: true, message: "Deleted" });
      }

      // instructor: enforce ownership via course
      const { rowCount } = await pool.query(
        `DELETE FROM achievements a
          USING courses c
         WHERE a.achievement_id = $1
           AND a.course_id = c.course_id
           AND c.instructor_id = $2`,
        [id, req.user.user_id]
      );
      if (!rowCount) {
        return res
          .status(404)
          .json({ success: false, error: "Not found or not your course" });
      }
      res.json({ success: true, message: "Deleted" });
    } catch (e) {
      res.status(500).json({ success: false, error: e.message });
    }
  }
);

module.exports = router;
