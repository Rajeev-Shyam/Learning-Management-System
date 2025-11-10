// routes/users.js
const express = require("express");
const router = express.Router();
const pool = require("../db");
const { authenticateToken, authorizeRoles } = require("../middleware/authMiddleware");

const VALID_ROLES = new Set(["student", "instructor", "admin"]);

/* Helpers */
const isBlank = (v) => v == null || String(v).trim() === "";

async function countAdmins(client = pool) {
  const { rows } = await client.query(
    "SELECT COUNT(*)::int AS count FROM users WHERE role = 'admin'"
  );
  return rows[0].count;
}

/**
 * GET /users (admin only)
 * Optional query params: ?page=1&limit=20&q=alice&role=student
 */
router.get("/", authenticateToken, authorizeRoles("admin"), async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page ?? "1", 10));
    const limit = Math.max(1, Math.min(100, parseInt(req.query.limit ?? "20", 10)));
    const offset = (page - 1) * limit;

    const q = req.query.q?.trim();
    const role = req.query.role?.trim();

    const filters = [];
    const params = [];
    let i = 1;

    if (q) {
      filters.push(`(LOWER(name) LIKE $${i} OR LOWER(email) LIKE $${i})`);
      params.push(`%${q.toLowerCase()}%`);
      i++;
    }
    if (role && VALID_ROLES.has(role)) {
      filters.push(`role = $${i++}`);
      params.push(role);
    }

    const where = filters.length ? `WHERE ${filters.join(" AND ")}` : "";
    const listSql = `
      SELECT user_id, name, email, role, created_at
      FROM users
      ${where}
      ORDER BY user_id DESC
      LIMIT ${limit} OFFSET ${offset}
    `;
    const countSql = `SELECT COUNT(*)::int AS total FROM users ${where}`;

    const [list, total] = await Promise.all([
      pool.query(listSql, params),
      pool.query(countSql, params),
    ]);

    res.json({
      success: true,
      page,
      limit,
      total: total.rows[0].total,
      data: list.rows,
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * PUT /users/:id (admin) – full update (role & optionally name/email)
 * Body: { role, name?, email? }
 */
router.put("/:id", authenticateToken, authorizeRoles("admin"), async (req, res) => {
  const id = Number(req.params.id);
  const { role, name, email } = req.body || {};

  try {
    if (!VALID_ROLES.has(role)) {
      return res.status(400).json({ success: false, error: "Invalid role provided" });
    }

    // If changing role away from admin, ensure not last admin
    if (role !== "admin") {
      const { rows } = await pool.query("SELECT role FROM users WHERE user_id = $1", [id]);
      if (!rows.length) return res.status(404).json({ success: false, error: "User not found" });
      if (rows[0].role === "admin") {
        const admins = await countAdmins();
        if (admins <= 1) {
          return res.status(400).json({ success: false, error: "Cannot demote the last admin" });
        }
      }
    }

    const { rows: updated } = await pool.query(
      `UPDATE users
       SET role = $1,
           name = COALESCE($2, name),
           email = COALESCE($3, email)
       WHERE user_id = $4
       RETURNING user_id, name, email, role, created_at`,
      [role, isBlank(name) ? null : name.trim(), isBlank(email) ? null : email.trim(), id]
    );

    if (!updated.length) {
      return res.status(404).json({ success: false, error: "User not found" });
    }

    res.json({ success: true, message: "User updated successfully", user: updated[0] });
  } catch (err) {
    // Unique violation (email)
    if (err.code === "23505") {
      return res.status(409).json({ success: false, error: "Email already in use" });
    }
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * PATCH /users/:id (admin) – partial update
 * Body: { name?, email?, role? }
 */
router.patch("/:id", authenticateToken, authorizeRoles("admin"), async (req, res) => {
  const id = Number(req.params.id);
  const { name, email, role } = req.body || {};

  try {
    const updates = [];
    const values = [];
    let i = 1;

    if (!isBlank(name)) {
      updates.push(`name = $${i++}`);
      values.push(name.trim());
    }
    if (!isBlank(email)) {
      updates.push(`email = $${i++}`);
      values.push(email.trim());
    }
    if (!isBlank(role)) {
      if (!VALID_ROLES.has(role)) {
        return res.status(400).json({ success: false, error: "Invalid role provided" });
      }
      // Prevent demoting last admin
      const { rows } = await pool.query("SELECT role FROM users WHERE user_id = $1", [id]);
      if (!rows.length) return res.status(404).json({ success: false, error: "User not found" });
      if (rows[0].role === "admin" && role !== "admin") {
        const admins = await countAdmins();
        if (admins <= 1) {
          return res.status(400).json({ success: false, error: "Cannot demote the last admin" });
        }
      }
      updates.push(`role = $${i++}`);
      values.push(role);
    }

    if (!updates.length) {
      return res.status(400).json({ success: false, error: "No valid fields provided for update" });
    }

    values.push(id);

    const { rows: updated } = await pool.query(
      `UPDATE users SET ${updates.join(", ")}
       WHERE user_id = $${i}
       RETURNING user_id, name, email, role, created_at`,
      values
    );

    if (!updated.length) {
      return res.status(404).json({ success: false, error: "User not found" });
    }

    res.json({ success: true, message: "User updated successfully", user: updated[0] });
  } catch (err) {
    if (err.code === "23505") {
      return res.status(409).json({ success: false, error: "Email already in use" });
    }
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * DELETE /users/:id (admin)
 * - Prevent deleting the last admin.
 */
router.delete("/:id", authenticateToken, authorizeRoles("admin"), async (req, res) => {
  const id = Number(req.params.id);

  try {
    const { rows: target } = await pool.query("SELECT user_id, name, email, role FROM users WHERE user_id = $1", [id]);
    if (!target.length) {
      return res.status(404).json({ success: false, error: "User not found" });
    }

    if (target[0].role === "admin") {
      const admins = await countAdmins();
      if (admins <= 1) {
        return res.status(400).json({ success: false, error: "Cannot delete the last admin" });
      }
    }

    await pool.query("DELETE FROM users WHERE user_id = $1", [id]);
    res.json({ success: true, message: "User deleted successfully", user: target[0] });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;

