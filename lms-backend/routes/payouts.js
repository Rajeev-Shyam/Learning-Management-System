// routes/payouts.js
const express = require("express");
const router = express.Router();
const pool = require("../db");
const { authenticateToken, authorizeRoles } = require("../middleware/authMiddleware");

// % share the instructor gets (tweak or load from .env)
const INSTRUCTOR_SHARE = Number(process.env.INSTRUCTOR_SHARE || 0.7);

// Admin: create a payout for a transaction (pay instructor)
router.post("/", authenticateToken, authorizeRoles("admin"), async (req, res) => {
  try {
    const { transaction_id, amount } = req.body || {};
    if (!transaction_id) {
      return res.status(400).json({ success: false, error: "transaction_id is required" });
    }

    // 1) Make sure we haven't already created a payout for this transaction
    const { rows: existingPayout } = await pool.query(
      `SELECT payout_id FROM instructor_income WHERE transaction_id = $1 LIMIT 1`,
      [transaction_id]
    );
    if (existingPayout.length) {
      return res.status(409).json({ success: false, error: "Payout already exists for this transaction" });
    }

    // 2) Load transaction → course → instructor
    const { rows: txRows } = await pool.query(
      `SELECT t.transaction_id, t.status, t.amount_paid, t.course_id, c.instructor_id
         FROM transactions t
         JOIN courses c ON c.course_id = t.course_id
        WHERE t.transaction_id = $1`,
      [transaction_id]
    );
    if (!txRows.length) return res.status(404).json({ success: false, error: "Transaction not found" });
    const tx = txRows[0];

    if (tx.status !== "paid") {
      return res.status(400).json({ success: false, error: `Cannot pay out a transaction with status "${tx.status}"` });
    }
    if (!tx.instructor_id) {
      return res.status(422).json({ success: false, error: "Course has no instructor_id; cannot create payout" });
    }

    // 3) Decide amount (use provided or default share)
    const payoutAmount =
      amount != null ? Number(amount) : Number((Number(tx.amount_paid) * INSTRUCTOR_SHARE).toFixed(2));
    if (isNaN(payoutAmount) || payoutAmount <= 0) {
      return res.status(400).json({ success: false, error: "Invalid payout amount" });
    }

    // 4) Create payout (pending)
    const { rows: created } = await pool.query(
      `INSERT INTO instructor_income (instructor_id, course_id, transaction_id, amount, status)
       VALUES ($1,$2,$3,$4,'pending')
       RETURNING *`,
      [tx.instructor_id, tx.course_id, tx.transaction_id, payoutAmount]
    );

    res.status(201).json({ success: true, message: "Payout created", data: created[0] });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Admin: list all payouts
router.get("/", authenticateToken, authorizeRoles("admin"), async (_req, res) => {
  const { rows } = await pool.query(
    `SELECT p.*, u.name AS instructor_name, c.title
       FROM instructor_income p
       JOIN users u ON u.user_id = p.instructor_id
       JOIN courses c ON c.course_id = p.course_id
      ORDER BY p.payout_id DESC`
  );
  res.json({ success: true, data: rows });
});

// Admin: mark payout paid
router.patch("/:id/paid", authenticateToken, authorizeRoles("admin"), async (req, res) => {
  const id = Number(req.params.id);
  const { rows } = await pool.query(
    `UPDATE instructor_income
        SET status='paid', paid_at = CURRENT_TIMESTAMP
      WHERE payout_id = $1
      RETURNING *`,
    [id]
  );
  if (!rows.length) return res.status(404).json({ success: false, error: "Payout not found" });
  res.json({ success: true, message: "Payout marked paid", data: rows[0] });
});

// Instructor: view ONLY my payouts
router.get("/my", authenticateToken, authorizeRoles("instructor"), async (req, res) => {
  const { rows } = await pool.query(
    `SELECT p.*, c.title
       FROM instructor_income p
       JOIN courses c ON c.course_id = p.course_id
      WHERE p.instructor_id = $1
      ORDER BY p.payout_id DESC`,
    [req.user.user_id]
  );
  res.json({ success: true, data: rows });
});

module.exports = router;


