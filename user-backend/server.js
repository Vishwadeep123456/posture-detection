const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
require("dotenv").config();

const authRoutes = require("./routes/authRoutes");

const app = express();

// ===============================
// Allowed Frontend Origins
// ===============================
const allowedOrigins = [
  "http://localhost:3000",
  "http://localhost:3001",
  "https://posture-detection-a9vf-kappa.vercel.app",
];

// ===============================
// CORS Configuration
// ===============================
const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests without origin
    // (Postman, server-to-server etc.)
    if (!origin) {
      return callback(null, true);
    }

    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    return callback(
      new Error("CORS not allowed for origin: " + origin)
    );
  },

  credentials: true,

  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],

  allowedHeaders: ["Content-Type", "Authorization"],
};

// ===============================
// Middleware
// ===============================
app.use(cors(corsOptions));

app.use(express.json());

// Handle preflight requests
app.options(/.*/, cors(corsOptions));

// ===============================
// MongoDB Connection
// ===============================
const MONGO_URI = process.env.MONGO_URI;

if (!MONGO_URI) {
  console.error("❌ MONGO_URI is not defined");
} else {
  mongoose
    .connect(MONGO_URI)
    .then(() => {
      console.log("MongoDB Connected");
    })
    .catch((err) => {
      console.error("MongoDB connection error:", err);
    });
}

// ===============================
// Routes
// ===============================
app.use("/api/auth", authRoutes);

// ===============================
// Server
// ===============================
const PORT = process.env.PORT || 5001;

app.listen(PORT, () => {
  console.log(`User backend running on port ${PORT}`);
});