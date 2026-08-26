const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");   // ✅ MongoDB import
require("dotenv").config();             // ✅ .env file load

const authRoutes = require("./routes/authRoutes");

const app = express();

const allowedOrigins = ["http://localhost:3000", "http://localhost:3001", "http://localhost:3003"];

app.use(express.json());
app.use(cors({
  origin: function(origin, callback) {
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) return callback(null, true);
    return callback(new Error("CORS not allowed for origin " + origin), false);
  },
  credentials: true
}));

// ✅ MongoDB connection
const MONGO_URI = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/badposture";
mongoose.connect(MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log("MongoDB Connected"))
.catch(err => console.error("MongoDB connection error:", err));

app.use("/api/auth", authRoutes);

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => console.log(`User backend running on port ${PORT}`));
