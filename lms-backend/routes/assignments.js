const express = require("express");
const router = express.Router();
const pool = require("../db");
const { authenticateToken, authorizeRoles } = require("../middleware/authMiddleware");

/* helpers */
const isAdmin = (req) => req.user?.role === "admin";

async function assertInstructorOwnsCourse(courseId, req) {
  if (isAdmin(req)) return; // admin bypass
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
    const e = new Error("Not enrolled");
    e.status = 403;
    throw e;
  }
}

function validateCreate(body) {
  const errors = [];
  const out = {};
  if (!body.course_id) errors.push("course_id is required");
  if (!body.title || !String(body.title).trim()) errors.push("title is required");
  if (errors.length) {
    const e = new Error(errors.join(", "));
    e.status = 400;
    throw e;
  }
  out.course_id = Number(body.course_id);
  out.title = String(body.title).trim();
  out.description = body.description ?? null;
  out.due_at = body.due_at ?? null; // ISO string or null
  return out;
}

function validatePatch(body) {
  const fields = [];
  const vals = [];
  let i = 1;

  if (body.title != null) {
    const t = String(body.title).trim();
    if (!t) {
      const e = new Error("title cannot be empty");
      e.status = 400;
      throw e;
    }
    fields.push(`title = $${i++}`);
    vals.push(t);
  }
  if (body.description != null) {
    fields.push(`description = $${i++}`);
    vals.push(body.description);
  }
  if (body.due_at != null) {
    fields.push(`due_at = $${i++}`);
    vals.push(body.due_at); // allow null to clear
  }

  if (!fields.length) {
    const e = new Error("no fields to update");
    e.status = 400;
    throw e;
  }

  return { fields, vals };
}

/**
 * POST /assignments
 * Instructor (owns course) or Admin can create
 */
router.post("/", authenticateToken, authorizeRoles("instructor", "admin"), async (req, res) => {
  try {
    const { course_id, title, description, due_at } = validateCreate(req.body);

    // if instructor, must own course
    if (req.user.role === "instructor") {
      await assertInstructorOwnsCourse(course_id, req);
    }

    const { rows } = await pool.query(
      `INSERT INTO assignments (course_id, title, description, due_at)
       VALUES ($1,$2,$3,$4)
       RETURNING assignment_id, course_id, title, description, due_at, created_at`,
      [course_id, title, description, due_at]
    );
    res.status(201).json({ success: true, data: rows[0] });
  } catch (e) {
    res.status(e.status || 500).json({ success: false, error: e.message });
  }
});

/**
 * GET /assignments/course/:courseId
 * - Student: must be enrolled
 * - Instructor: must own the course
 * - Admin: all
 */
router.get("/course/:courseId", authenticateToken, async (req, res) => {
  try {
    const courseId = Number(req.params.courseId);

    if (req.user.role === "student") {
      await assertStudentEnrolled(courseId, req);
    } else if (req.user.role === "instructor") {
      await assertInstructorOwnsCourse(courseId, req);
    }

    const { rows } = await pool.query(
      `SELECT assignment_id, course_id, title, description, due_at, created_at
         FROM assignments
        WHERE course_id = $1
        ORDER BY assignment_id DESC`,
      [courseId]
    );
    res.json({ success: true, data: rows });
  } catch (e) {
    res.status(e.status || 500).json({ success: false, error: e.message });
  }
});

/**
 * GET /assignments/:id
 * View a single assignment with the same access rules
 */
router.get("/:id", authenticateToken, async (req, res) => {
  try {
    const id = Number(req.params.id);
    const { rows } = await pool.query(`SELECT * FROM assignments WHERE assignment_id = $1`, [id]);
    if (!rows.length) return res.status(404).json({ success: false, error: "Not found" });

    const a = rows[0];
    if (req.user.role === "student") {
      await assertStudentEnrolled(a.course_id, req);
    } else if (req.user.role === "instructor") {
      await assertInstructorOwnsCourse(a.course_id, req);
    }
    res.json({ success: true, data: a });
  } catch (e) {
    res.status(e.status || 500).json({ success: false, error: e.message });
  }
});

/**
 * PATCH /assignments/:id
 * Owner instructor (by course) or Admin can update title/description/due_at
 */
router.patch("/:id", authenticateToken, authorizeRoles("instructor", "admin"), async (req, res) => {
  try {
    const id = Number(req.params.id);
    const { rows: existing } = await pool.query(
      `SELECT assignment_id, course_id FROM assignments WHERE assignment_id = $1`,
      [id]
    );
    if (!existing.length) return res.status(404).json({ success: false, error: "Not found" });

    // ownership check (instructor)
    await assertInstructorOwnsCourse(existing[0].course_id, req);

    const { fields, vals } = validatePatch(req.body);
    vals.push(id);

    const { rows } = await pool.query(
      `UPDATE assignments
          SET ${fields.join(", ")}
        WHERE assignment_id = $${vals.length}
        RETURNING assignment_id, course_id, title, description, due_at, created_at`,
      vals
    );
    res.json({ success: true, data: rows[0] });
  } catch (e) {
    res.status(e.status || 500).json({ success: false, error: e.message });
  }
});

/**
 * DELETE /assignments/:id
 * Owner instructor (by course) or Admin can delete
 */
router.delete("/:id", authenticateToken, authorizeRoles("instructor", "admin"), async (req, res) => {
  try {
    const id = Number(req.params.id);
    const { rows: existing } = await pool.query(
      `SELECT assignment_id, course_id FROM assignments WHERE assignment_id = $1`,
      [id]
    );
    if (!existing.length) return res.status(404).json({ success: false, error: "Not found" });

    await assertInstructorOwnsCourse(existing[0].course_id, req);

    await pool.query(`DELETE FROM assignments WHERE assignment_id = $1`, [id]);
    res.json({ success: true, message: "Deleted" });
  } catch (e) {
    res.status(e.status || 500).json({ success: false, error: e.message });
  }
});

module.exports = router;
