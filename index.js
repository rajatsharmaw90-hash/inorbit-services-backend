require("dotenv").config();

const express = require("express");
const cors = require("cors");
const { Pool } = require("pg");

const app = express();

const PORT = process.env.PORT || 5000;

/* =========================
   CORS CONFIG (FIXED)
========================= */
const corsOptions = {
  origin: [
    "https://inorbitservices.ca",
    "https://www.inorbitservices.ca"
  ],
  methods: ["GET", "POST", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: false
};

app.use(cors(corsOptions));
app.options("*", cors(corsOptions));

/* =========================
   MIDDLEWARE
========================= */
app.use(express.json());

/* =========================
   HEALTH CHECK (IMPORTANT)
========================= */
app.get("/", (req, res) => {
  res.json({ status: "API running" });
});

app.get("/test", (req, res) => {
  res.json({ ok: true });
});

/* =========================
   DATABASE CONNECTION
========================= */
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === "production"
    ? { rejectUnauthorized: false }
    : false,
});

/* =========================
   CONTACT ROUTE
========================= */
app.post("/api/contact", async (req, res) => {
  const { name, email, service, message } = req.body;

  // basic validation (prevents DB crashes)
  if (!name || !email || !message) {
    return res.status(400).json({
      success: false,
      message: "Missing required fields",
    });
  }

  try {
    await pool.query(
      `
      INSERT INTO contacts (name, email, message)
      VALUES ($1, $2, $3)
      `,
      [name, email, message]
    );

    return res.status(200).json({
      success: true,
      message: "Contact saved",
    });

  } catch (error) {
    console.error("DB Error:", error);

    return res.status(500).json({
      success: false,
      error: "Server error",
    });
  }
});

/* =========================
   GLOBAL ERROR HANDLER
========================= */
app.use((err, req, res, next) => {
  console.error("Unhandled Error:", err);
  res.status(500).json({ error: "Internal server error" });
});

/* =========================
   START SERVER (FIXED FOR HOSTING)
========================= */
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});