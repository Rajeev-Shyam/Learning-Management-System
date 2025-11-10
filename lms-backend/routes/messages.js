// routes/messages.js
const express = require("express");
const router = express.Router();
const pool = require("../db");
const { authenticateToken, authorizeRoles } = require("../middleware/authMiddleware");

// Inbox: current user's messages
router.get("/", authenticateToken, async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT * FROM messages WHERE receiver_id = $1 ORDER BY message_id DESC`,
      [req.user.user_id]
    );
    res.json({ success: true, data: rows });
  } catch (e) {
    res.status(500).json({ success: false, error: e.message });
  }
});

// Send message (instructor/admin)
// Send message (student → instructor, instructor/admin → anyone, admin → anyone)
router.post("/", authenticateToken, authorizeRoles("student","instructor","admin"), async (req, res) => {
  try {
    const { receiver_id, course_id, content } = req.body || {};
    if (!content) return res.status(400).json({ success:false, error:"content required" });

    // If student: can only message their instructor for a course they are enrolled in
    if (req.user.role === "student") {
      if (!course_id || !receiver_id) {
        return res.status(400).json({ success:false, error:"student must include course_id and receiver_id (instructor)" });
      }
      const { rows: ok } = await pool.query(
        `SELECT 1
           FROM enrollments e
           JOIN courses c ON c.course_id = e.course_id
          WHERE e.student_id = $1 AND e.course_id = $2 AND c.instructor_id = $3`,
        [req.user.user_id, course_id, receiver_id]
      );
      if (!ok.length) return res.status(403).json({ success:false, error:"You can only message your course instructor" });
    }

    // If instructor: validate ownership when sending to a course
    if (req.user.role === "instructor" && course_id) {
      const { rows } = await pool.query(
        `SELECT 1 FROM courses WHERE course_id=$1 AND instructor_id=$2`,
        [course_id, req.user.user_id]
      );
      if (!rows.length) return res.status(403).json({ success:false, error:"Not your course" });
    }

    const { rows } = await pool.query(
      `INSERT INTO messages (sender_id, receiver_id, course_id, content)
       VALUES ($1,$2,$3,$4) RETURNING *`,
      [req.user.user_id, receiver_id || null, course_id || null, content]
    );
    res.status(201).json({ success:true, data: rows[0] });
  } catch (e) {
    res.status(500).json({ success:false, error: e.message });
  }
});

// View sent messages
router.get("/sent", authenticateToken, async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT * FROM messages WHERE sender_id = $1 ORDER BY message_id DESC`,
      [req.user.user_id]
    );
    res.json({ success:true, data: rows });
  } catch (e) {
    res.status(500).json({ success:false, error: e.message });
  }
});


// Thread between me and another user (optionally scoped by course)
router.get("/thread/:userId", authenticateToken, async (req, res) => {
  const otherId = Number(req.params.userId);
  const courseId = req.query.course_id ? Number(req.query.course_id) : null;

  // Restrict student visibility
  if (req.user.role === "student") {
    if (!courseId) return res.status(400).json({ success:false, error:"course_id required for student threads" });
    const { rows: ok } = await pool.query(
      `SELECT 1
         FROM enrollments e
         JOIN courses c ON c.course_id = e.course_id
        WHERE e.student_id = $1 AND e.course_id = $2 AND c.instructor_id = $3`,
      [req.user.user_id, courseId, otherId]
    );
    if (!ok.length) return res.status(403).json({ success:false, error:"No conversation access" });
  }

  const params = [req.user.user_id, otherId, req.user.user_id, otherId];
  let sql = `
    SELECT *
      FROM messages
     WHERE (sender_id = $1 AND receiver_id = $2)
        OR (sender_id = $3 AND receiver_id = $4)
  `;
  if (courseId) {
    sql += ` AND course_id = $5`;
    params.push(courseId);
  }
  sql += ` ORDER BY message_id ASC`;

  try {
    const { rows } = await pool.query(sql, params);
    res.json({ success:true, data: rows });
  } catch (e) {
    res.status(500).json({ success:false, error: e.message });
  }
});


// Broadcast to all students in a course
router.post("/broadcast", authenticateToken, authorizeRoles("instructor","admin"), async (req, res) => {
  const { course_id, content } = req.body || {};
  if (!course_id || !content) return res.status(400).json({ success:false, error:"course_id and content required" });

  // Instructor must own the course
  if (req.user.role === "instructor") {
    const { rows } = await pool.query(
      `SELECT 1 FROM courses WHERE course_id=$1 AND instructor_id=$2`,
      [course_id, req.user.user_id]
    );
    if (!rows.length) return res.status(403).json({ success:false, error:"Not your course" });
  }

  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const { rows: students } = await client.query(
      `SELECT student_id FROM enrollments WHERE course_id=$1`,
      [course_id]
    );
    const created = [];
    for (const s of students) {
      const { rows } = await client.query(
        `INSERT INTO messages (sender_id, receiver_id, course_id, content)
         VALUES ($1,$2,$3,$4) RETURNING *`,
        [req.user.user_id, s.student_id, course_id, content]
      );
      created.push(rows[0]);
    }
    await client.query("COMMIT");
    res.status(201).json({ success:true, message:`Broadcasted to ${created.length} students`, data: created });
  } catch (e) {
    await client.query("ROLLBACK");
    res.status(500).json({ success:false, error: e.message });
  } finally {
    client.release();
  }
});


// Mark read
router.patch("/:id/read", authenticateToken, async (req, res) => {
  try {
    const { rows } = await pool.query(
      `UPDATE messages SET is_read=true WHERE message_id=$1 AND receiver_id=$2 RETURNING *`,
      [req.params.id, req.user.user_id]
    );
    if (!rows.length) return res.status(404).json({ success:false, error:"Not found" });
    res.json({ success:true, data: rows[0] });
  } catch (e) {
    res.status(500).json({ success:false, error: e.message });
  }
});

// Admin: view thread between any two users (optional filter by course)
router.get("/admin/thread", authenticateToken, authorizeRoles("admin"), async (req, res) => {
  const userA = Number(req.query.user_a);
  const userB = Number(req.query.user_b);
  const courseId = req.query.course_id ? Number(req.query.course_id) : null;

  if (!userA || !userB) {
    return res.status(400).json({ success:false, error:"user_a and user_b are required" });
    }

  const params = [userA, userB, userB, userA];
  let sql = `
    SELECT * FROM messages
     WHERE (sender_id = $1 AND receiver_id = $2)
        OR (sender_id = $3 AND receiver_id = $4)
  `;
  if (courseId) {
    sql += ` AND course_id = $5`;
    params.push(courseId);
  }
  sql += ` ORDER BY message_id ASC`;

  const { rows } = await pool.query(sql, params);
  res.json({ success:true, data: rows });
});


module.exports = router;
