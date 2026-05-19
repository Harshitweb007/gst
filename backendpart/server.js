const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const connectDB = require("./config/db");
const { connectRedis, isRedisReady } = require("./config/redis");

dotenv.config();

const startServer = async () => {
  await connectDB();

  try {
    await connectRedis();
  } catch (err) {
    console.error("Redis connection failed:", err.message);
    if (process.env.REDIS_URL) {
      process.exit(1);
    }
  }

  const app = express();

  app.use(express.json());

  app.use(
    cors({
      origin: process.env.FRONTEND_URL || "http://localhost:5173",
      credentials: true
    })
  );

  app.use((req, res, next) => {
    console.log(`[${req.method}] ${req.url}`);
    next();
  });

  app.use("/api/auth", require("./routes/authRoutes"));
  app.use("/api/admin", require("./routes/adminRoutes"));
  app.use("/api/invoices", require("./routes/invoiceRoutes"));
  app.use("/api/dashboard", require("./routes/dashboardRoutes"));
  app.use("/api/contact", require("./routes/contactRoutes"));

  app.get("/", (req, res) => {
    res.send("Backend is running 🚀");
  });

  app.get("/health", (req, res) => {
    res.json({
      status: "ok",
      redis: isRedisReady() ? "connected" : "disabled"
    });
  });

  app.use((req, res) => {
    res.status(404).json({ message: "Route not found" });
  });

  const PORT = process.env.PORT || 5001;

  app.listen(PORT, () => {
    console.log(`✅ Server running on port ${PORT}`);
  });
};

startServer().catch((err) => {
  console.error("Failed to start server:", err);
  process.exit(1);
});
