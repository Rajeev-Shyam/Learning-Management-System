const express = require("express");
const router = express.Router();
const pool = require("../db");
const { authenticateToken, authorizeRoles } = require("../middleware/authMiddleware");

/* helpers */
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
    const e = new Error("Not enrolled");
    e.status = 403;
    throw e;
  }
}

/* ---------- Create quiz (owner/admin) ---------- */
router.post("/", authenticateToken, authorizeRoles("instructor", "admin"), async (req, res) => {
  try {
    const { course_id, title, description } = req.body || {};
    if (!course_id || !title)
      return res.status(400).json({ success: false, error: "course_id and title required" });

    if (req.user.role === "instructor") {
      await assertInstructorOwnsCourse(Number(course_id), req);
    }

    const { rows } = await pool.query(
      `INSERT INTO quizzes (course_id, title, description)
       VALUES ($1,$2,$3)
       RETURNING quiz_id, course_id, title, description, created_at`,
      [course_id, String(title).trim(), description || null]
    );
    res.status(201).json({ success: true, data: rows[0] });
  } catch (e) {
    res.status(e.status || 500).json({ success: false, error: e.message });
  }
});

/* ---------- List quizzes for a course (role-aware) ---------- */
router.get(
  "/course/:courseId",
  authenticateToken,
  async (req, res) => {
    try {
      const courseId = Number(req.params.courseId);

      if (req.user.role === "student") {
        await assertStudentEnrolled(courseId, req);
      } else if (req.user.role === "instructor") {
        await assertInstructorOwnsCourse(courseId, req);
      } // admin sees all

      const { rows } = await pool.query(
        `SELECT quiz_id, course_id, title, description, created_at
           FROM quizzes
          WHERE course_id = $1
          ORDER BY quiz_id DESC`,
        [courseId]
      );
      res.json({ success: true, data: rows });
    } catch (e) {
      res.status(e.status || 500).json({ success: false, error: e.message });
    }
  }
);

/* ---------- Get one quiz with questions (role-aware) ---------- */
router.get("/:quizId", authenticateToken, async (req, res) => {
  try {
    const quizId = Number(req.params.quizId);
    const { rows: qz } = await pool.query(`SELECT * FROM quizzes WHERE quiz_id = $1`, [quizId]);
    if (!qz.length) return res.status(404).json({ success: false, error: "Quiz not found" });
    const quiz = qz[0];

    if (req.user.role === "student") {
      await assertStudentEnrolled(quiz.course_id, req);
    } else if (req.user.role === "instructor") {
      await assertInstructorOwnsCourse(quiz.course_id, req);
    }

    const { rows: questions } = await pool.query(
      `SELECT question_id, prompt, options, correct_index
         FROM questions
        WHERE quiz_id = $1
        ORDER BY question_id`,
      [quizId]
    );
    res.json({ success: true, data: { quiz, questions } });
  } catch (e) {
    res.status(e.status || 500).json({ success: false, error: e.message });
  }
});

/* ---------- Add question (owner/admin) ---------- */
router.post("/:quizId/questions", authenticateToken, authorizeRoles("instructor", "admin"), async (req, res) => {
  try {
    const quizId = Number(req.params.quizId);
    const { prompt, options, correct_index } = req.body || {};
    if (!prompt || !Array.isArray(options) || options.length < 2 || correct_index == null) {
      return res.status(400).json({ success: false, error: "prompt, options[>=2], correct_index required" });
    }

    if (req.user.role === "instructor") {
      const { rows } = await pool.query(
        `SELECT 1
           FROM quizzes q
           JOIN courses c ON c.course_id = q.course_id
          WHERE q.quiz_id = $1 AND c.instructor_id = $2`,
        [quizId, req.user.user_id]
      );
      if (!rows.length) return res.status(403).json({ success: false, error: "Not your quiz" });
    }

    const { rows } = await pool.query(
      `INSERT INTO questions (quiz_id, prompt, options, correct_index)
       VALUES ($1,$2,$3,$4)
       RETURNING question_id, quiz_id, prompt, options, correct_index`,
      [quizId, String(prompt).trim(), JSON.stringify(options), Number(correct_index)]
    );
    res.status(201).json({ success: true, data: rows[0] });
  } catch (e) {
    res.status(e.status || 500).json({ success: false, error: e.message });
  }
});

/* ---------- Update question (owner/admin) ---------- */
router.patch("/:quizId/questions/:questionId", authenticateToken, authorizeRoles("instructor", "admin"), async (req, res) => {
  try {
    const quizId = Number(req.params.quizId);
    const questionId = Number(req.params.questionId);

    if (req.user.role === "instructor") {
      const { rows } = await pool.query(
        `SELECT 1
           FROM quizzes q
           JOIN courses c ON c.course_id = q.course_id
          WHERE q.quiz_id = $1 AND c.instructor_id = $2`,
        [quizId, req.user.user_id]
      );
      if (!rows.length) return res.status(403).json({ success: false, error: "Not your quiz" });
    }

    const fields = [];
    const values = [];
    let i = 1;

    if (req.body.prompt != null) {
      const p = String(req.body.prompt).trim();
      if (!p) return res.status(400).json({ success: false, error: "prompt cannot be empty" });
      fields.push(`prompt = $${i++}`);
      values.push(p);
    }
    if (req.body.options != null) {
      if (!Array.isArray(req.body.options) || req.body.options.length < 2) {
        return res.status(400).json({ success: false, error: "options must be array with >= 2 items" });
      }
      fields.push(`options = $${i++}`);
      values.push(JSON.stringify(req.body.options));
    }
    if (req.body.correct_index != null) {
      fields.push(`correct_index = $${i++}`);
      values.push(Number(req.body.correct_index));
    }
    if (!fields.length) return res.status(400).json({ success: false, error: "No fields to update" });

    values.push(questionId, quizId);
    const { rows } = await pool.query(
      `UPDATE questions
          SET ${fields.join(", ")}
        WHERE question_id = $${i++} AND quiz_id = $${i}
        RETURNING question_id, quiz_id, prompt, options, correct_index`,
      values
    );
    if (!rows.length) return res.status(404).json({ success: false, error: "Question not found" });
    res.json({ success: true, data: rows[0] });
  } catch (e) {
    res.status(e.status || 500).json({ success: false, error: e.message });
  }
});

/* ---------- Delete question (owner/admin) ---------- */
router.delete("/:quizId/questions/:questionId", authenticateToken, authorizeRoles("instructor", "admin"), async (req, res) => {
  try {
    const quizId = Number(req.params.quizId);
    const questionId = Number(req.params.questionId);

    if (req.user.role === "instructor") {
      const { rows } = await pool.query(
        `SELECT 1
           FROM quizzes q
           JOIN courses c ON c.course_id = q.course_id
          WHERE q.quiz_id = $1 AND c.instructor_id = $2`,
        [quizId, req.user.user_id]
      );
      if (!rows.length) return res.status(403).json({ success: false, error: "Not your quiz" });
    }

    const { rowCount } = await pool.query(
      `DELETE FROM questions WHERE question_id = $1 AND quiz_id = $2`,
      [questionId, quizId]
    );
    if (!rowCount) return res.status(404).json({ success: false, error: "Question not found" });
    res.json({ success: true, message: "Question deleted" });
  } catch (e) {
    res.status(e.status || 500).json({ success: false, error: e.message });
  }
});

/* ---------- Update quiz (owner/admin) ---------- */
router.patch("/:quizId", authenticateToken, authorizeRoles("instructor", "admin"), async (req, res) => {
  try {
    const quizId = Number(req.params.quizId);
    const { rows: qz } = await pool.query(`SELECT * FROM quizzes WHERE quiz_id=$1`, [quizId]);
    if (!qz.length) return res.status(404).json({ success: false, error: "Quiz not found" });

    if (req.user.role === "instructor") {
      await assertInstructorOwnsCourse(qz[0].course_id, req);
    }

    const fields = [];
    const vals = [];
    let i = 1;

    if (req.body.title != null) {
      const t = String(req.body.title).trim();
      if (!t) return res.status(400).json({ success: false, error: "title cannot be empty" });
      fields.push(`title = $${i++}`);
      vals.push(t);
    }
    if (req.body.description != null) {
      fields.push(`description = $${i++}`);
      vals.push(req.body.description);
    }
    if (!fields.length) return res.status(400).json({ success: false, error: "No fields to update" });

    vals.push(quizId);
    const { rows } = await pool.query(
      `UPDATE quizzes SET ${fields.join(", ")} WHERE quiz_id = $${i} 
       RETURNING quiz_id, course_id, title, description, created_at`,
      vals
    );
    res.json({ success: true, data: rows[0] });
  } catch (e) {
    res.status(e.status || 500).json({ success: false, error: e.message });
  }
});

/* ---------- Delete quiz (owner/admin) ---------- */
router.delete("/:quizId", authenticateToken, authorizeRoles("instructor", "admin"), async (req, res) => {
  try {
    const quizId = Number(req.params.quizId);
    const { rows: qz } = await pool.query(`SELECT * FROM quizzes WHERE quiz_id=$1`, [quizId]);
    if (!qz.length) return res.status(404).json({ success: false, error: "Quiz not found" });

    if (req.user.role === "instructor") {
      await assertInstructorOwnsCourse(qz[0].course_id, req);
    }

    await pool.query(`DELETE FROM quizzes WHERE quiz_id = $1`, [quizId]);
    res.json({ success: true, message: "Quiz deleted" });
  } catch (e) {
    res.status(e.status || 500).json({ success: false, error: e.message });
  }
});

/* ---------- Start + submit attempt (auto-grade) ---------- */
router.post("/:quizId/attempts", authenticateToken, authorizeRoles("student"), async (req, res) => {
  try {
    const quizId = Number(req.params.quizId);

    const { rows: qc } = await pool.query(`SELECT course_id FROM quizzes WHERE quiz_id=$1`, [quizId]);
    if (!qc.length) return res.status(404).json({ success: false, error: "Quiz not found" });

    await assertStudentEnrolled(qc[0].course_id, req);

    // answers = array of indices
    const { answers } = req.body || {};
    const { rows: qs } = await pool.query(
      `SELECT correct_index FROM questions WHERE quiz_id=$1 ORDER BY question_id`,
      [quizId]
    );
    if (!qs.length) return res.status(400).json({ success: false, error: "Quiz has no questions" });

    let score = 0;
    if (Array.isArray(answers)) {
      qs.forEach((q, i) => {
        if (answers[i] != null && Number(answers[i]) === q.correct_index) score++;
      });
    }
    score = Number(((score / qs.length) * 100).toFixed(2));

    const { rows } = await pool.query(
      `INSERT INTO quiz_attempts (quiz_id, student_id, score, completed_at)
       VALUES ($1,$2,$3, CURRENT_TIMESTAMP)
       RETURNING attempt_id, quiz_id, student_id, score, completed_at`,
      [quizId, req.user.user_id, score]
    );
    res.status(201).json({ success: true, data: rows[0] });
  } catch (e) {
    res.status(e.status || 500).json({ success: false, error: e.message });
  }
});

/* ---------- My attempts (student) ---------- */
router.get("/:quizId/attempts/my", authenticateToken, authorizeRoles("student"), async (req, res) => {
  try {
    const quizId = Number(req.params.quizId);
    const { rows } = await pool.query(
      `SELECT attempt_id, quiz_id, student_id, score, completed_at
         FROM quiz_attempts
        WHERE quiz_id = $1 AND student_id = $2
        ORDER BY attempt_id DESC`,
      [quizId, req.user.user_id]
    );
    res.json({ success: true, data: rows });
  } catch (e) {
    res.status(500).json({ success: false, error: e.message });
  }
});

/* ---------- All attempts for a quiz (instructor/admin) ---------- */
router.get("/:quizId/attempts", authenticateToken, authorizeRoles("instructor", "admin"), async (req, res) => {
  try {
    const quizId = Number(req.params.quizId);

    if (req.user.role === "instructor") {
      const { rows: own } = await pool.query(
        `SELECT 1
           FROM quizzes q
           JOIN courses c ON c.course_id = q.course_id
          WHERE q.quiz_id = $1 AND c.instructor_id = $2`,
        [quizId, req.user.user_id]
      );
      if (!own.length) return res.status(403).json({ success: false, error: "Not your quiz" });
    }

    const { rows } = await pool.query(
      `SELECT qa.attempt_id, qa.student_id, u.name AS student_name, qa.score, qa.completed_at
         FROM quiz_attempts qa
         JOIN users u ON u.user_id = qa.student_id
        WHERE qa.quiz_id = $1
        ORDER BY qa.attempt_id DESC`,
      [quizId]
    );
    res.json({ success: true, data: rows });
  } catch (e) {
    res.status(500).json({ success: false, error: e.message });
  }
});

module.exports = router;

