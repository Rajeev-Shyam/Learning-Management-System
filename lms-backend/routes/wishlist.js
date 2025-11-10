const express = require("express");
const router = express.Router();
const pool = require("../db");
const { authenticateToken, authorizeRoles } = require("../middleware/authMiddleware");

// List my wishlist (student)
router.get("/", authenticateToken, authorizeRoles("student"), async (req, res) => {
  const { rows } = await pool.query(
    `SELECT w.wishlist_id, c.course_id, c.title, c.price, c.instructor_id
     FROM wishlist w JOIN courses c ON c.course_id = w.course_id
     WHERE w.student_id = $1 ORDER BY w.wishlist_id DESC`,
    [req.user.user_id]
  );
  res.json({ success: true, data: rows });
});

// Add to wishlist (student)
router.post("/", authenticateToken, authorizeRoles("student"), async (req, res) => {
  const { course_id } = req.body;
  if (!course_id) return res.status(400).json({ success:false, error:"course_id required" });
  try {
    const { rows } = await pool.query(
      `INSERT INTO wishlist (student_id, course_id)
       VALUES ($1,$2) ON CONFLICT (student_id,course_id) DO NOTHING
       RETURNING wishlist_id, student_id, course_id`,
      [req.user.user_id, course_id]
    );
    if (!rows.length) return res.status(200).json({ success:true, message:"Already in wishlist" });
    res.status(201).json({ success: true, data: rows[0] });
  } catch (e) {
    res.status(500).json({ success:false, error: e.message });
  }
});

// Remove from wishlist (student)
router.delete("/:id", authenticateToken, authorizeRoles("student"), async (req, res) => {
  const { rows } = await pool.query(
    `DELETE FROM wishlist WHERE wishlist_id=$1 AND student_id=$2 RETURNING wishlist_id`,
    [req.params.id, req.user.user_id]
  );
  if (!rows.length) return res.status(404).json({ success:false, error:"Not found" });
  res.json({ success:true, message:"Removed" });
});

module.exports = router;
