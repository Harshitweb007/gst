const express = require("express");
const Invoice = require("../models/Invoice");
const auth = require("../middleware/auth");
const { getJson, setJson, cacheKeys } = require("../utils/cache");

const router = express.Router();
const DASHBOARD_CACHE_TTL = 60;

router.get("/", auth, async (req, res) => {
  try {
    const cacheKey = cacheKeys.dashboard(req.user.id);
    const cached = await getJson(cacheKey);
    if (cached) {
      return res.json(cached);
    }

    const invoices = await Invoice.find({ user: req.user.id });

    let totalSales = 0;
    let totalRevenue = 0;
    let salesDue = 0;

    const customerMap = {};
    const monthMap = {};

    invoices.forEach(inv => {
      const amount = inv.totalAmount || 0;
      totalSales += amount;

      // Paid vs Pending
      if (inv.status === "Paid") {
        totalRevenue += amount;
      } else {
        salesDue += amount;
      }

      // Customer-wise
      const customer = inv.customerName || "Unknown";
      customerMap[customer] = (customerMap[customer] || 0) + amount;

      // Monthly (safe date)
      const dateSource = inv.createdAt || inv.date || new Date();
      const monthKey = new Date(dateSource).toISOString().slice(0, 7); // YYYY-MM
      monthMap[monthKey] = (monthMap[monthKey] || 0) + amount;
    });

    // Customer chart
    const salesBreakdown = Object.entries(customerMap).map(
      ([name, value]) => ({ name, value })
    );

    // Monthly chart (sorted)
    const monthlySales = Object.entries(monthMap)
      .sort((a, b) => new Date(a[0]) - new Date(b[0]))
      .map(([key, value]) => ({
        name: new Date(key).toLocaleString("default", {
          month: "short",
          year: "numeric"
        }),
        value
      }));

    const payload = {
      totals: {
        purchaseDue: 0,
        salesDue,
        totalSales,
        totalRevenue
      },
      stats: {
        customers: Object.keys(customerMap).length,
        suppliers: 0,
        purchaseInvoices: 0,
        salesInvoices: invoices.length
      },
      salesBreakdown: salesBreakdown || [],
      monthlySales: monthlySales || []
    };

    await setJson(cacheKey, payload, DASHBOARD_CACHE_TTL);
    res.json(payload);

  } catch (err) {
    console.error("Dashboard error:", err);
    res.status(500).json({ message: "Dashboard error" });
  }
});

module.exports = router;
