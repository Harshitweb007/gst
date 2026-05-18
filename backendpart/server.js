const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const connectDB = require("./config/db");

// Load env variables
dotenv.config();

// Connect MongoDB
connectDB();

const app = express();

/* =======================
   GLOBAL MIDDLEWARE
======================= */

// Parse JSON
app.use(express.json());

// CORS
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    credentials: true
  })
);

// Debug middleware (REMOVE later if you want)
app.use((req, res, next) => {
  console.log(`[${req.method}] ${req.url}`);
  next();
});

/* =======================
   ROUTES
======================= */

app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/admin", require("./routes/adminRoutes"));
app.use("/api/invoices", require("./routes/invoiceRoutes"));
app.use("/api/dashboard", require("./routes/dashboardRoutes"));
app.use("/api/contact", require("./routes/contactRoutes"));

/* =======================
   HEALTH CHECK
======================= */

app.get("/", (req, res) => {
  res.send("Backend is running 🚀");
});

/* =======================
   404 HANDLER
======================= */

app.use((req, res) => {
  res.status(404).json({
    message: "Route not found"
  });
});

/* =======================
   SERVER START
======================= */

const PORT = process.env.PORT || 5001;

app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});
