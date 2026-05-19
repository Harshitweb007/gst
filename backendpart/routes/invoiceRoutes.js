const express = require("express");
const router = express.Router();
const Invoice = require("../models/Invoice");
const authMiddleware = require("../middleware/authMiddleware");
const { getJson, setJson, cacheKeys, invalidateUserCache } = require("../utils/cache");

const INVOICE_CACHE_TTL = 120;

// ======================
// CREATE INVOICE
// ======================
router.post("/", authMiddleware, async (req, res) => {
  try {
    const { invoiceNo, customerName, date, items, totalAmount } = req.body;

    const invoice = await Invoice.create({
      user: req.user.id,     // ✅ important
      invoiceNo,
      customerName,
      date,
      items,
      totalAmount,
      status: "Pending"     // ✅ default
    });

    await invalidateUserCache(req.user.id);

    res.status(201).json({
      message: "Invoice created successfully",
      invoice
    });
  } catch (error) {
    console.error("Create invoice error:", error.message);
    res.status(500).json({ message: "Failed to create invoice" });
  }
});

// ======================
// GET USER INVOICES
// ======================
router.get("/", authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id || req.user._id;
    const cacheKey = cacheKeys.invoices(userId);
    const cached = await getJson(cacheKey);
    if (cached) {
      return res.json(cached);
    }

    const invoices = await Invoice.find({ user: userId })
      .sort({ createdAt: -1 });

    await setJson(cacheKey, invoices, INVOICE_CACHE_TTL);
    res.json(invoices);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch invoices" });
  }
});

// ======================
// UPDATE INVOICE STATUS
// ======================
router.put("/:id", authMiddleware, async (req, res) => {
  try {
    const { status } = req.body;

    await Invoice.findOneAndUpdate(
      { _id: req.params.id, user: req.user.id }, // 🔒 ownership check
      { status }
    );

    await invalidateUserCache(req.user.id || req.user._id);
    res.json({ success: true });
  } catch (error) {
    console.error("Update status error:", error.message);
    res.status(500).json({ message: "Failed to update invoice" });
  }
});

// ======================
// DELETE INVOICE
// ======================
router.delete("/:id", authMiddleware, async (req, res) => {
  try {
    await Invoice.findOneAndDelete({
      _id: req.params.id,
      user: req.user.id     // 🔒 only owner can delete
    });

    await invalidateUserCache(req.user.id || req.user._id);
    res.json({ success: true });
  } catch (error) {
    console.error("Delete invoice error:", error.message);
    res.status(500).json({ message: "Failed to delete invoice" });
  }
});

module.exports = router;
