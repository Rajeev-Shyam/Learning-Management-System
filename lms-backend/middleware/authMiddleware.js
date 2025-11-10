// middleware/authMiddleware.js
const jwt = require("jsonwebtoken");
const SECRET = process.env.JWT_SECRET;



// Parse "Authorization: Bearer <token>" safely
function extractBearerToken(req) {
  const hdr = req.headers["authorization"];
  if (!hdr) return null;
  const parts = hdr.split(" ");
  if (parts.length !== 2) return null;
  const [scheme, token] = parts;
  if (!/^Bearer$/i.test(scheme)) return null;
  return token;
}

function authenticateToken(req, res, next) {
  const token = extractBearerToken(req);
  if (!token) {
    return res.status(401).json({ success: false, error: "Access denied. No token provided." });
  }

  jwt.verify(token, SECRET, (err, payload) => {
    if (err && err.name === "TokenExpiredError") {
      return res.status(401).json({ success: false, error: "Token expired. Please log in again." });
    }
    if (err) {
      return res.status(403).json({ success: false, error: "Invalid token." });
    }
    // Expected payload should at least have user_id and role
    // (your auth.js should sign these)
    req.user = payload;
    next();
  });
}

// Usage: authorizeRoles("admin", "instructor")
function authorizeRoles(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user || !req.user.role) {
      return res.status(401).json({ success: false, error: "Not authenticated." });
    }
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ success: false, error: "Access forbidden: insufficient rights." });
    }
    next();
  };
}

module.exports = { authenticateToken, authorizeRoles };

