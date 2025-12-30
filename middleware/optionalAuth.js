const jwt = require("jsonwebtoken");

/**
 * Optional authentication middleware
 * Attaches user info to req.user if token is valid, but doesn't fail if token is missing
 * Useful for routes that work for both authenticated and unauthenticated users
 */
const optionalAuth = (req, res, next) => {
  const authHeader = req.headers.authorization || req.headers.Authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    // No token provided - continue without authentication
    req.user = null;
    return next();
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "secretkey");
    req.user = decoded; // Attach decoded payload (userId, username) to req
    next();
  } catch (error) {
    // Invalid token - continue without authentication
    req.user = null;
    next();
  }
};

module.exports = optionalAuth;

