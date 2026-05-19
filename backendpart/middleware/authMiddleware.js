const jwt = require("jsonwebtoken");
const User = require("../models/User");
const { isBlacklisted } = require("../utils/tokenBlacklist");
const { getJson, setJson, cacheKeys } = require("../utils/cache");

module.exports = async (req, res, next) => {
  try {
    // 🔐 Check Authorization header
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        message: "Authorization token missing"
      });
    }

    // 🧾 Extract token
    const token = authHeader.split(" ")[1];

    if (await isBlacklisted(token)) {
      return res.status(401).json({ message: "Token revoked. Please log in again." });
    }

    // 🔓 Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const userCacheKey = cacheKeys.user(decoded.id);
    let user = await getJson(userCacheKey);

    if (!user) {
      const doc = await User.findById(decoded.id).select("-password");
      if (!doc) {
        return res.status(401).json({ message: "User not found" });
      }
      user = doc.toObject();
      user.id = user._id.toString();
      await setJson(userCacheKey, user, 300);
    }

    if (!user.id && user._id) {
      user.id = user._id.toString();
    }

    if (user.isBlocked) {
      return res.status(403).json({
        message: "Your account is blocked by admin"
      });
    }

    // ✅ Attach user to request
    req.user = user;

    next();
  } catch (error) {
    return res.status(401).json({
      message: "Token is not valid or expired"
    });
  }
};
