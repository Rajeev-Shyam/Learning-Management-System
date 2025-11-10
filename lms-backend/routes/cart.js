const express = require("express");
const router = express.Router();
const pool = require("../db");
const { authenticateToken, authorizeRoles } = require("../middleware/authMiddleware");

/**
 * GET /cart
 * View my cart (student)
 */
router.get("/", authenticateToken, authorizeRoles("student"), async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT ci.cart_item_id, c.course_id, c.title, c.price, ci.qty
         FROM cart_items ci
         JOIN courses c ON c.course_id = ci.course_id
        WHERE ci.student_id = $1
        ORDER BY ci.cart_item_id DESC`,
      [req.user.user_id]
    );
    res.json({ success: true, data: rows });
  } catch (e) {
    res.status(500).json({ success: false, error: e.message });
  }
});

/**
 * POST /cart
 * Add to cart (student)
 * Body: { course_id, qty? }
 */
router.post("/", authenticateToken, authorizeRoles("student"), async (req, res) => {
  try {
    const { course_id, qty = 1 } = req.body || {};
    if (!course_id) {
      return res.status(400).json({ success: false, error: "course_id required" });
    }

    const safeQty = Math.max(1, Number(qty) || 1);

    const { rows } = await pool.query(
      `INSERT INTO cart_items (student_id, course_id, qty)
       VALUES ($1, $2, $3)
       ON CONFLICT (student_id, course_id)
       DO UPDATE SET qty = cart_items.qty + EXCLUDED.qty
       RETURNING cart_item_id, student_id, course_id, qty`,
      [req.user.user_id, course_id, safeQty]
    );

    res.status(201).json({ success: true, data: rows[0] });
  } catch (e) {
    res.status(500).json({ success: false, error: e.message });
  }
});

/**
 * DELETE /cart/:id
 * Remove from cart (student)
 */
router.delete("/:id", authenticateToken, authorizeRoles("student"), async (req, res) => {
  try {
    const { rows } = await pool.query(
      `DELETE FROM cart_items
        WHERE cart_item_id = $1 AND student_id = $2
        RETURNING cart_item_id`,
      [req.params.id, req.user.user_id]
    );

    if (!rows.length) {
      return res.status(404).json({ success: false, error: "Not found" });
    }
    res.json({ success: true, message: "Removed" });
  } catch (e) {
    res.status(500).json({ success: false, error: e.message });
  }
});

/**
 * Helper: fetch a valid coupon by code (active + not expired + usage remaining)
 * Uses either percent_off OR discount_percent (whichever is present).
 */
async function fetchValidCoupon(client, code) {
  if (!code) return null;

  const { rows } = await client.query(
    `SELECT code,
            /* prefer percent_off (int), else discount_percent (numeric) */
            COALESCE(percent_off::numeric, discount_percent)::numeric AS pct,
            is_active, max_uses, used_count, expires_at
       FROM coupons
      WHERE code = $1
        AND is_active = true
        AND (expires_at IS NULL OR expires_at >= NOW())`,
    [code]
  );
  const c = rows[0];
  if (!c) return null;

  if (c.max_uses != null && c.used_count != null && c.used_count >= c.max_uses) {
    return null; // usage cap reached
  }
  return c;
}

/**
 * POST /cart/checkout
 * Checkout (student) — creates enrollments + transactions, clears cart
 * Body: { coupon_code?, payment_method? }
 */
router.post("/checkout", authenticateToken, authorizeRoles("student"), async (req, res) => {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    // Get all items in cart (include qty!)
    const { rows: items } = await client.query(
      `SELECT ci.course_id, ci.qty, c.price AS course_price
         FROM cart_items ci
         JOIN courses c ON c.course_id = ci.course_id
        WHERE ci.student_id = $1`,
      [req.user.user_id]
    );

    if (!items.length) {
      await client.query("ROLLBACK");
      return res.status(400).json({ success: false, error: "Cart is empty" });
    }

    // Optional coupon
    const couponCode = (req.body?.coupon_code || "").trim() || null;
    const paymentMethod = (req.body?.payment_method || "card").trim();

    let coupon = null;
    if (couponCode) {
      coupon = await fetchValidCoupon(client, couponCode);
      if (!coupon) {
        // choose to ignore invalid or return error — here we error:
        await client.query("ROLLBACK");
        return res.status(400).json({ success: false, error: "Invalid or expired coupon" });
      }
    }

    const pct = coupon ? Number(coupon.pct || 0) : 0;
    const createdTx = [];

    // For a clean summary:
    let subtotal = 0;
    let discountTotal = 0;
    let totalPaid = 0;

    for (const it of items) {
      const qty = Math.max(1, Number(it.qty) || 1);
      const price = Number(it.course_price);

      const lineOriginal  = Number((price * qty).toFixed(2));
      const lineDiscount  = Number((lineOriginal * (pct / 100)).toFixed(2));
      const linePaid      = Math.max(0, Number((lineOriginal - lineDiscount).toFixed(2)));

      subtotal      += lineOriginal;
      discountTotal += lineDiscount;
      totalPaid     += linePaid;

      // Ensure enrollment (idempotent; enrollment is per course, qty doesn't matter)
      await client.query(
        `INSERT INTO enrollments (student_id, course_id)
         VALUES ($1, $2)
         ON CONFLICT (student_id, course_id) DO NOTHING`,
        [req.user.user_id, it.course_id]
      );

      // Create transaction row
      const { rows: txRows } = await client.query(
        `INSERT INTO transactions
           (student_id, course_id, original_price, discount_amount, amount_paid, coupon_code, payment_method, status)
         VALUES
           ($1, $2, $3, $4, $5, $6, $7, 'paid')
         RETURNING *`,
        [
          req.user.user_id,
          it.course_id,
          lineOriginal,            // original price for this line (qty considered)
          lineDiscount,            // discount for this line
          linePaid,                // amount paid for this line
          coupon ? coupon.code : null,
          paymentMethod
        ]
      );
      createdTx.push(txRows[0]);
    }

    // Bump coupon usage (once per checkout)
    if (coupon) {
      await client.query(
        `UPDATE coupons SET used_count = used_count + 1 WHERE code = $1`,
        [coupon.code]
      );
    }

    // Clear cart
    await client.query(`DELETE FROM cart_items WHERE student_id = $1`, [req.user.user_id]);

    await client.query("COMMIT");
    res.status(201).json({
      success: true,
      message: "Checkout complete",
      summary: {
        subtotal: Number(subtotal.toFixed(2)),
        discount: Number(discountTotal.toFixed(2)),
        total_paid: Number(totalPaid.toFixed(2))
      },
      data: createdTx
    });
  } catch (e) {
    await client.query("ROLLBACK");
    res.status(500).json({ success: false, error: e.message });
  } finally {
    client.release();
  }
});

/**
 * GET /cart/transactions/my
 * Student: my transactions
 */
router.get("/transactions/my", authenticateToken, authorizeRoles("student"), async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT t.transaction_id, t.course_id, c.title,
              t.original_price, t.discount_amount, t.amount_paid,
              t.coupon_code, t.payment_method, t.status, t.created_at
         FROM transactions t
         JOIN courses c ON c.course_id = t.course_id
        WHERE t.student_id = $1
        ORDER BY t.transaction_id DESC`,
      [req.user.user_id]
    );
    res.json({ success: true, data: rows });
  } catch (e) {
    res.status(500).json({ success: false, error: e.message });
  }
});

/**
 * GET /cart/transactions
 * Admin: all transactions
 */
router.get("/transactions", authenticateToken, authorizeRoles("admin"), async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT t.transaction_id, t.student_id, u.name AS student_name,
              t.course_id, c.title,
              t.original_price, t.discount_amount, t.amount_paid,
              t.coupon_code, t.payment_method, t.status, t.created_at
         FROM transactions t
         JOIN users u   ON u.user_id  = t.student_id
         JOIN courses c ON c.course_id = t.course_id
        ORDER BY t.transaction_id DESC`
    );
    res.json({ success: true, data: rows });
  } catch (e) {
    res.status(500).json({ success: false, error: e.message });
  }
});

/**
 * PATCH /cart/transactions/:id/refund
 * Admin: refund a transaction (status -> refunded)
 */
router.patch("/transactions/:id/refund", authenticateToken, authorizeRoles("admin"), async (req, res) => {
  try {
    const id = Number(req.params.id);
    const { rows } = await pool.query(
      `UPDATE transactions
          SET status = 'refunded'
        WHERE transaction_id = $1
        RETURNING *`,
      [id]
    );
    if (!rows.length) {
      return res.status(404).json({ success: false, error: "Transaction not found" });
    }
    res.json({ success: true, message: "Refunded", data: rows[0] });
  } catch (e) {
    res.status(500).json({ success: false, error: e.message });
  }
});

module.exports = router;
