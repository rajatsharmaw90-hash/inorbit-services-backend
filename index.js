require("dotenv").config();

const express = require("express");
const cors = require("cors");
const { Pool } = require("pg");

const app = express();

const corsOptions = {
  origin: [
     "http://localhost:5173",
    "https://inorbitservices.ca",
    "https://www.inorbitservices.ca"
  ],
  methods: ["GET", "POST", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"]
};

app.use(cors(corsOptions));



app.use(express.json());

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
  },
});
app.get("/", (req, res) => {
  res.send("Server is running...");
});
app.post("/api/contact", async (req, res) => {
  const { name, email, service, message } = req.body;

  try {
    await pool.query(
      `
      INSERT INTO contacts
      (name, email, message)
      VALUES ($1,$2,$3)
      `,
      [name, email, message]
    );

    res.status(200).json({
      success: true,
      message: "Contact saved",
    });
  } catch (error) {
    console.log(error);

    res.status(500).json({
      error: "Server error",
    });
  }
});

app.post("/gardening/contact", async (req, res) => {
  const { name, email, message } = req.body;

  try {
    await pool.query(
      `
      INSERT INTO gardening_contacts
      (name, email, message)
      VALUES ($1,$2,$3)
      `,
      [name, email, message]
    );

    res.status(200).json({
      success: true,
      message: "Contact saved",
    });
  } catch (error) {
    console.log(error);

    res.status(500).json({
      error: "Server error",
    });
  }
});

app.listen(5000, () => {
  console.log("Server running on port 5000");
});