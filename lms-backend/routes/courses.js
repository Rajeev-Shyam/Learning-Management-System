// routes/courses.js
const express = require("express");
const router = express.Router();
const pool = require("../db");
const { authenticateToken, authorizeRoles } = require("../middleware/authMiddleware");

/* Helpers */
const isAdmin = (req) => req.user?.role === "admin";
const ownsCourse = (course, req) => course?.instructor_id === req.user?.user_id;

function validateCoursePayload(body, { partial = false } = {}) {
  const errors = [];
  const out = {};

  if (!partial) {
    if (!body.title || typeof body.title !== "string" || !body.title.trim()) {
      errors.push("title is required");
    } else {
      out.title = body.title.trim();
    }
    if (body.price == null || isNaN(Number(body.price))) {
      errors.push("price is required and must be a number");
    } else {
      out.price = Number(body.price);
    }
  } else {
    if (body.title != null) {
      if (!String(body.title).trim()) errors.push("title cannot be empty");
      else out.title = String(body.title).trim();
    }
    if (body.price != null) {
      const p = Number(body.price);
      if (isNaN(p)) errors.push("price must be a number");
      else out.price = p;
    }
  }

  if (out.price != null && out.price < 0) errors.push("price must be >= 0");
  if (body.description != null) out.description = body.description;

  if (errors.length) {
    const err = new Error(errors.join(", "));
    err.status = 400;
    throw err;
  }
  return out;
}

/**
 * GET /courses  (auth required)
 * - admin: all courses
 * - instructor: own courses
 * - student: enrolled courses
 */
router.get("/", authenticateToken, async (req, res) => {
  try {
    const { role, user_id } = req.user;

    if (role === "admin") {
      const { rows } = await pool.query(
        `SELECT c.course_id, c.title, c.description, c.price, c.instructor_id, c.status, c.is_public, c.created_at,
                u.name AS instructor_name
           FROM courses c
           JOIN users u ON u.user_id = c.instructor_id
          ORDER BY c.course_id DESC`
      );
      return res.json({ success: true, data: rows });
    }

    if (role === "instructor") {
      const { rows } = await pool.query(
        `SELECT c.course_id, c.title, c.description, c.price, c.instructor_id, c.status, c.is_public, c.created_at
           FROM courses c
          WHERE c.instructor_id = $1
          ORDER BY c.course_id DESC`,
        [user_id]
      );
      return res.json({ success: true, data: rows });
    }

    // student → enrolled
    const { rows } = await pool.query(
      `SELECT c.course_id, c.title, c.description, c.price, c.instructor_id, c.status, c.is_public, c.created_at
         FROM enrollments e
         JOIN courses c ON c.course_id = e.course_id
        WHERE e.student_id = $1
        ORDER BY c.course_id DESC`,
      [user_id]
    );
    return res.json({ success: true, data: rows });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * Convenience for students:
 * GET /courses/enrolled
 */
router.get("/enrolled", authenticateToken, authorizeRoles("student"), async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT c.course_id, c.title, c.description, c.price, c.instructor_id, c.status, c.is_public, c.created_at
         FROM enrollments e
         JOIN courses c ON c.course_id = e.course_id
        WHERE e.student_id = $1
        ORDER BY c.course_id DESC`,
      [req.user.user_id]
    );
    res.json({ success: true, data: rows });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * POST /courses
 * Instructor (own) or Admin (must pass instructor_id)
 */
router.post("/", authenticateToken, authorizeRoles("instructor", "admin"), async (req, res) => {
  try {
    const { title, description, price } = validateCoursePayload(req.body);
    let instructorId;

    if (isAdmin(req)) {
      if (!req.body.instructor_id) {
        return res.status(400).json({ success: false, error: "Admin must specify instructor_id" });
      }
      instructorId = Number(req.body.instructor_id);
    } else {
      instructorId = req.user.user_id;
    }

    const { rows } = await pool.query(
      `INSERT INTO courses (title, description, price, instructor_id)
       VALUES ($1, $2, $3, $4)
       RETURNING course_id, title, description, price, instructor_id, status, is_public, created_at`,
      [title, description ?? null, price, instructorId]
    );

    res.status(201).json({ success: true, message: "Course added", data: rows[0] });
  } catch (err) {
    res.status(err.status || 500).json({ success: false, error: err.message });
  }
});

/**
 * PUT /courses/:id  (owner or admin) – full replace
 */
router.put("/:id", authenticateToken, authorizeRoles("instructor", "admin"), async (req, res) => {
  try {
    const courseId = Number(req.params.id);
    const { title, description, price } = validateCoursePayload(req.body, { partial: false });

    const { rows: existing } = await pool.query("SELECT * FROM courses WHERE course_id = $1", [courseId]);
    if (!existing.length) return res.status(404).json({ success: false, error: "Course not found" });

    if (!isAdmin(req) && !ownsCourse(existing[0], req)) {
      return res.status(403).json({ success: false, error: "Not allowed" });
    }

    const { rows } = await pool.query(
      `UPDATE courses
          SET title = $1, description = $2, price = $3
        WHERE course_id = $4
        RETURNING course_id, title, description, price, instructor_id, status, is_public, created_at`,
      [title, description ?? null, price, courseId]
    );

    res.json({ success: true, data: rows[0] });
  } catch (err) {
    res.status(err.status || 500).json({ success: false, error: err.message });
  }
});

/**
 * PATCH /courses/:id  (owner or admin) – partial update
 */
router.patch("/:id", authenticateToken, authorizeRoles("instructor", "admin"), async (req, res) => {
  try {
    const courseId = Number(req.params.id);
    validateCoursePayload(req.body, { partial: true });

    const { rows: existing } = await pool.query("SELECT * FROM courses WHERE course_id = $1", [courseId]);
    if (!existing.length) return res.status(404).json({ success: false, error: "Course not found" });

    if (!isAdmin(req) && !ownsCourse(existing[0], req)) {
      return res.status(403).json({ success: false, error: "Not allowed" });
    }

    const fields = [];
    const values = [];
    let i = 1;

    if (req.body.title != null)       { fields.push(`title = $${i++}`); values.push(String(req.body.title).trim()); }
    if (req.body.description != null) { fields.push(`description = $${i++}`); values.push(req.body.description); }
    if (req.body.price != null) {
      const p = Number(req.body.price);
      if (isNaN(p) || p < 0) return res.status(400).json({ success: false, error: "Invalid price" });
      fields.push(`price = $${i++}`); values.push(p);
    }

    if (!fields.length) return res.status(400).json({ success: false, error: "No valid fields to update" });

    values.push(courseId);

    const { rows } = await pool.query(
      `UPDATE courses SET ${fields.join(", ")}
        WHERE course_id = $${i}
        RETURNING course_id, title, description, price, instructor_id, status, is_public, created_at`,
      values
    );

    res.json({ success: true, data: rows[0] });
  } catch (err) {
    res.status(err.status || 500).json({ success: false, error: err.message });
  }
});

/**
 * DELETE /courses/:id  (owner or admin)
 */
router.delete("/:id", authenticateToken, authorizeRoles("instructor", "admin"), async (req, res) => {
  try {
    const courseId = Number(req.params.id);

    const { rows: existing } = await pool.query("SELECT * FROM courses WHERE course_id = $1", [courseId]);
    if (!existing.length) return res.status(404).json({ success: false, error: "Course not found" });

    if (!isAdmin(req) && !ownsCourse(existing[0], req)) {
      return res.status(403).json({ success: false, error: "Not allowed" });
    }

    await pool.query("DELETE FROM courses WHERE course_id = $1", [courseId]);
    res.json({ success: true, message: "Course deleted" });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * Admin-only: approve/reject
 * PATCH /courses/:id/status  Body: { "status": "pending" | "approved" | "rejected" }
 */
router.patch("/:id/status", authenticateToken, authorizeRoles("admin"), async (req, res) => {
  const { status } = req.body || {};
  if (!["pending","approved","rejected"].includes(status)) {
    return res.status(400).json({ success:false, error:"Invalid status" });
  }
  const { rows } = await pool.query(
    `UPDATE courses SET status=$1 WHERE course_id=$2 RETURNING *`,
    [status, req.params.id]
  );
  if (!rows.length) return res.status(404).json({ success:false, error:"Course not found" });
  res.json({ success:true, data: rows[0] });
});

/**
 * PUBLIC catalog for landing page
 * GET /courses/public   (only approved & public)
 */
router.get("/public", async (_req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT c.course_id, c.title, c.description, c.price, c.created_at,
              u.name AS instructor_name
         FROM courses c
         JOIN users u ON u.user_id=c.instructor_id
        WHERE c.status='approved' AND c.is_public=true
        ORDER BY c.course_id DESC`
    );
    res.json({ success:true, data: rows });
  } catch (err) {
    res.status(500).json({ success:false, error: err.message });
  }
});

module.exports = router;


