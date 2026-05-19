const User = require("../models/User");
const Invoice = require("../models/Invoice");
const { del, cacheKeys, invalidateUserCache } = require("../utils/cache");

/**
 * 📊 Get all users with invoice count
 */
exports.getUsersWithInvoices = async (req, res) => {
  try {
    const users = await User.aggregate([
      {
        $lookup: {
          from: "invoices",
          localField: "_id",
          foreignField: "user",
          as: "invoices"
        }
      },
      {
        $project: {
          name: 1,
          email: 1,
          role: 1,
          isBlocked: 1,
          subscription: 1,
          invoiceCount: { $size: "$invoices" }
        }
      }
    ]);

    res.json(users);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch users" });
  }
};

/**
 * 🚫 Block / Unblock User (WAIT MODE)
 */
exports.toggleBlockUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    user.isBlocked = !user.isBlocked;
    await user.save();
    await del(cacheKeys.user(user._id.toString()));
    await invalidateUserCache(user._id.toString());

    res.json({
      message: `User ${user.isBlocked ? "blocked" : "unblocked"} successfully`
    });
  } catch (err) {
    res.status(500).json({ message: "Failed to update user status" });
  }
};

/**
 * ❌ Delete User (ADMIN ONLY)
 */
exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    const userId = user._id.toString();
    await user.deleteOne();
    await del(cacheKeys.user(userId));
    await invalidateUserCache(userId);
    res.json({ message: "User deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: "Failed to delete user" });
  }
};
