const express = require("express");
const router = express.Router();
const pool = require("../db");
const { authenticateToken, authorizeRoles } = require("../middleware/authMiddleware");

const isAdmin = (req) => req.user?.role === "admin";

async function assertInstructorOwnsCourse(courseId, req) {
  if (isAdmin(req)) return;
  const { rows } = await pool.query(
    `SELECT 1 FROM courses WHERE course_id = $1 AND instructor_id = $2`,
    [courseId, req.user.user_id]
  );
  if (!rows.length) {
    const e = new Error("Not your course");
    e.status = 403;
    throw e;
  }
}

async function assertStudentEnrolled(courseId, req) {
  const { rows } = await pool.query(
    `SELECT 1 FROM enrollments WHERE student_id = $1 AND course_id = $2`,
    [req.user.user_id, courseId]
  );
  if (!rows.length) {
    const e = new Error("Not enrolled in course");
    e.status = 403;
    throw e;
  }
}

/**
 * STUDENT — create or update submission (idempotent per assignment)
 * POST /submissions
 * Body: { assignment_id, file_url?, text_answer? }
 */
router.post("/", authenticateToken, authorizeRoles("student"), async (req, res) => {
  try {
    const { assignment_id, file_url, text_answer } = req.body || {};
    if (!assignment_id) {
      return res.status(400).json({ success: false, error: "assignment_id required" });
    }

    // must be enrolled in assignment's course
    const { rows: a } = await pool.query(
      `SELECT course_id FROM assignments WHERE assignment_id = $1`,
      [assignment_id]
    );
    if (!a.length) return res.status(404).json({ success: false, error: "Assignment not found" });

    await assertStudentEnrolled(a[0].course_id, req);

    const { rows } = await pool.query(
      `INSERT INTO submissions (assignment_id, student_id, file_url, text_answer)
       VALUES ($1,$2,$3,$4)
       ON CONFLICT (assignment_id, student_id) DO UPDATE
         SET file_url = EXCLUDED.file_url,
             text_answer = EXCLUDED.text_answer,
             submitted_at = CURRENT_TIMESTAMP
       RETURNING submission_id, assignment_id, student_id, file_url, text_answer, grade, feedback, submitted_at`,
      [assignment_id, req.user.user_id, file_url || null, text_answer || null]
    );
    res.status(201).json({ success: true, data: rows[0] });
  } catch (e) {
    res.status(e.status || 500).json({ success: false, error: e.message });
  }
});

/**
 * STUDENT — my submissions (optionally filter by course or assignment)
 * GET /submissions/my?course_id=&assignment_id=
 */
router.get("/my", authenticateToken, authorizeRoles("student"), async (req, res) => {
  try {
    const { course_id, assignment_id } = req.query;
    const where = [`s.student_id = $1`];
    const vals = [req.user.user_id];
    let i = 2;

    if (assignment_id) { where.push(`s.assignment_id = $${i++}`); vals.push(Number(assignment_id)); }
    if (course_id)     { where.push(`a.course_id    = $${i++}`); vals.push(Number(course_id)); }

    const { rows } = await pool.query(
      `SELECT s.submission_id, s.assignment_id, a.title AS assignment_title,
              a.course_id, c.title AS course_title,
              s.file_url, s.text_answer, s.grade, s.feedback, s.submitted_at
         FROM submissions s
         JOIN assignments a ON a.assignment_id = s.assignment_id
         JOIN courses     c ON c.course_id     = a.course_id
        WHERE ${where.join(" AND ")}
        ORDER BY s.submission_id DESC`,
      vals
    );
    res.json({ success: true, data: rows });
  } catch (e) {
    res.status(500).json({ success: false, error: e.message });
  }
});

/**
 * INSTRUCTOR/ADMIN — list submissions for an assignment
 * GET /submissions/assignment/:assignmentId
 */
router.get("/assignment/:assignmentId", authenticateToken, authorizeRoles("instructor", "admin"), async (req, res) => {
  try {
    const assignmentId = Number(req.params.assignmentId);

    const { rows: a } = await pool.query(
      `SELECT assignment_id, course_id FROM assignments WHERE assignment_id = $1`,
      [assignmentId]
    );
    if (!a.length) return res.status(404).json({ success: false, error: "Assignment not found" });

    // instructor must own the course
    await assertInstructorOwnsCourse(a[0].course_id, req);

    const { rows } = await pool.query(
      `SELECT s.submission_id, s.student_id, u.name AS student_name,
              s.file_url, s.text_answer, s.grade, s.feedback, s.submitted_at
         FROM submissions s
         JOIN users u ON u.user_id = s.student_id
        WHERE s.assignment_id = $1
        ORDER BY s.submission_id DESC`,
      [assignmentId]
    );
    res.json({ success: true, data: rows });
  } catch (e) {
    res.status(e.status || 500).json({ success: false, error: e.message });
  }
});

/**
 * ANY AUTH — get one submission if allowed
 * GET /submissions/:id
 * - Student can view their own submission
 * - Instructor must own the course
 * - Admin can view any
 */
router.get("/:id", authenticateToken, async (req, res) => {
  try {
    const id = Number(req.params.id);
    const { rows: sub } = await pool.query(
      `SELECT s.*, a.course_id
         FROM submissions s
         JOIN assignments a ON a.assignment_id = s.assignment_id
        WHERE s.submission_id = $1`,
      [id]
    );
    if (!sub.length) return res.status(404).json({ success: false, error: "Submission not found" });

    const row = sub[0];
    if (req.user.role === "student" && row.student_id !== req.user.user_id) {
      return res.status(403).json({ success: false, error: "Forbidden" });
    }
    if (req.user.role === "instructor") {
      await assertInstructorOwnsCourse(row.course_id, req);
    }
    res.json({ success: true, data: row });
  } catch (e) {
    res.status(e.status || 500).json({ success: false, error: e.message });
  }
});

/**
 * INSTRUCTOR/ADMIN — grade a submission
 * PATCH /submissions/:id/grade
 * Body: { grade?, feedback? }
 */
router.patch("/:id/grade", authenticateToken, authorizeRoles("instructor", "admin"), async (req, res) => {
  try {
    const id = Number(req.params.id);
    const { grade, feedback } = req.body || {};

    const { rows: sub } = await pool.query(
      `SELECT s.submission_id, a.course_id
         FROM submissions s
         JOIN assignments a ON a.assignment_id = s.assignment_id
        WHERE s.submission_id = $1`,
      [id]
    );
    if (!sub.length) return res.status(404).json({ success: false, error: "Submission not found" });

    await assertInstructorOwnsCourse(sub[0].course_id, req);

    const fields = [];
    const vals = [];
    let i = 1;

    if (grade != null) {
      const g = Number(grade);
      if (!Number.isFinite(g) || g < 0 || g > 100) {
        return res.status(400).json({ success: false, error: "grade must be 0..100" });
      }
      fields.push(`grade = $${i++}`);
      vals.push(g);
    }
    if (feedback != null) {
      fields.push(`feedback = $${i++}`);
      vals.push(feedback);
    }
    if (!fields.length) {
      return res.status(400).json({ success: false, error: "No fields to update" });
    }

    vals.push(id);
    const { rows } = await pool.query(
      `UPDATE submissions SET ${fields.join(", ")}
        WHERE submission_id = $${i}
        RETURNING submission_id, assignment_id, student_id, file_url, text_answer, grade, feedback, submitted_at`,
      vals
    );
    res.json({ success: true, data: rows[0] });
  } catch (e) {
    res.status(e.status || 500).json({ success: false, error: e.message });
  }
});

/**
 * (Optional) INSTRUCTOR/ADMIN — delete a submission
 * DELETE /submissions/:id
 */
router.delete("/:id", authenticateToken, authorizeRoles("instructor", "admin"), async (req, res) => {
  try {
    const id = Number(req.params.id);

    // fetch to check course ownership for instructor
    const { rows: sub } = await pool.query(
      `SELECT s.submission_id, a.course_id
         FROM submissions s
         JOIN assignments a ON a.assignment_id = s.assignment_id
        WHERE s.submission_id = $1`,
      [id]
    );
    if (!sub.length) return res.status(404).json({ success: false, error: "Submission not found" });

    await assertInstructorOwnsCourse(sub[0].course_id, req);

    await pool.query(`DELETE FROM submissions WHERE submission_id = $1`, [id]);
    res.json({ success: true, message: "Deleted" });
  } catch (e) {
    res.status(e.status || 500).json({ success: false, error: e.message });
  }
});

module.exports = router;
