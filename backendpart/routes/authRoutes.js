const express = require("express");
const router = express.Router();

const authController = require("../controllers/authController");
const authMiddleware = require("../middleware/authMiddleware");
const rateLimit = require("../middleware/rateLimit");

const authRateLimit = rateLimit({
  windowSeconds: 900,
  maxAttempts: 10,
  keyPrefix: "ratelimit:auth"
});

// ✅ SIGN UP
router.post("/signup", authRateLimit, authController.signup);

// ✅ LOGIN
router.post("/login", authRateLimit, authController.login);

// ✅ LOGOUT (revokes JWT in Redis)
router.post("/logout", authMiddleware, authController.logout);

// ✅ GET CURRENT USER
router.get("/me", authMiddleware, authController.getMe);

module.exports = router;
