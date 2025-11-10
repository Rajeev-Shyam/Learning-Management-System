const express = require("express");
const router = express.Router();
const pool = require("../db");
const { authenticateToken, authorizeRoles } = require("../middleware/authMiddleware");

/**
 * ADMIN — List all coupons
 */
router.get("/", authenticateToken, authorizeRoles("admin"), async (_req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT code, percent_off, is_active, expires_at, max_uses, used_count
         FROM coupons
         ORDER BY expires_at NULLS LAST, code ASC`
    );
    res.json({ success: true, data: rows });
  } catch (e) {
    res.status(500).json({ success: false, error: e.message });
  }
});

/**
 * ADMIN — Create coupon
 * Body: { code, percent_off, is_active?, expires_at?, max_uses? }
 */
router.post("/", authenticateToken, authorizeRoles("admin"), async (req, res) => {
  try {
    let { code, percent_off, is_active = true, expires_at = null, max_uses = null } = req.body || {};

    if (!code || percent_off == null) {
      return res.status(400).json({ success: false, error: "code and percent_off are required" });
    }

    code = String(code).trim().toUpperCase();
    percent_off = Number(percent_off);

    if (!(percent_off >= 1 && percent_off <= 100)) {
      return res.status(400).json({ success: false, error: "percent_off must be 1..100" });
    }

    const { rows } = await pool.query(
      `INSERT INTO coupons (code, percent_off, is_active, expires_at, max_uses, used_count)
       VALUES ($1, $2, $3, $4, $5, 0)
       RETURNING code, percent_off, is_active, expires_at, max_uses, used_count`,
      [code, percent_off, Boolean(is_active), expires_at || null, max_uses ?? null]
    );

    res.status(201).json({ success: true, data: rows[0] });
  } catch (e) {
    // Unique code violation
    if (e.code === "23505") {
      return res.status(409).json({ success: false, error: "Coupon code already exists" });
    }
    res.status(500).json({ success: false, error: e.message });
  }
});

/**
 * ADMIN — Update coupon
 * Params: :code  (string PK)
 * Body: any of { percent_off, is_active, expires_at, max_uses }
 */
router.patch("/:code", authenticateToken, authorizeRoles("admin"), async (req, res) => {
  try {
    const code = String(req.params.code).trim().toUpperCase();
    const { percent_off, is_active, expires_at, max_uses } = req.body || {};

    const updates = [];
    const vals = [];
    let i = 1;

    if (percent_off != null) {
      const p = Number(percent_off);
      if (!(p >= 1 && p <= 100)) {
        return res.status(400).json({ success: false, error: "percent_off must be 1..100" });
      }
      updates.push(`percent_off = $${i++}`);
      vals.push(p);
    }
    if (is_active != null) {
      updates.push(`is_active = $${i++}`);
      vals.push(Boolean(is_active));
    }
    if (expires_at !== undefined) {
      updates.push(`expires_at = $${i++}`);
      vals.push(expires_at === "" ? null : expires_at);
    }
    if (max_uses !== undefined) {
      updates.push(`max_uses = $${i++}`);
      vals.push(max_uses === "" ? null : Number(max_uses));
    }

    if (!updates.length) {
      return res.status(400).json({ success: false, error: "No valid fields to update" });
    }

    vals.push(code);
    const { rows } = await pool.query(
      `UPDATE coupons SET ${updates.join(", ")} WHERE code = $${i}
       RETURNING code, percent_off, is_active, expires_at, max_uses, used_count`,
      vals
    );

    if (!rows.length) return res.status(404).json({ success: false, error: "Not found" });
    res.json({ success: true, data: rows[0] });
  } catch (e) {
    res.status(500).json({ success: false, error: e.message });
  }
});

/**
 * ADMIN — Delete coupon
 */
router.delete("/:code", authenticateToken, authorizeRoles("admin"), async (req, res) => {
  try {
    const code = String(req.params.code).trim().toUpperCase();
    const { rows } = await pool.query(
      `DELETE FROM coupons WHERE code = $1 RETURNING code`,
      [code]
    );
    if (!rows.length) return res.status(404).json({ success: false, error: "Not found" });
    res.json({ success: true, message: "Deleted", data: rows[0] });
  } catch (e) {
    res.status(500).json({ success: false, error: e.message });
  }
});

/**
 * OPTIONAL — Validate coupon (student/admin) before checkout
 */
router.get("/validate/:code", authenticateToken, async (req, res) => {
  try {
    const code = String(req.params.code).trim().toUpperCase();
    const { rows } = await pool.query(
      `SELECT code, percent_off, is_active, expires_at, max_uses, used_count
         FROM coupons
        WHERE code = $1`,
      [code]
    );
    const c = rows[0];
    if (
      !c ||
      !c.is_active ||
      (c.expires_at && new Date(c.expires_at) < new Date()) ||
      (c.max_uses != null && c.used_count != null && c.used_count >= c.max_uses)
    ) {
      return res.status(400).json({ success: false, error: "Invalid or expired coupon" });
    }
    res.json({ success: true, data: { code: c.code, percent_off: c.percent_off } });
  } catch (e) {
    res.status(500).json({ success: false, error: e.message });
  }
});

module.exports = router;
