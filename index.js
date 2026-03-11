// backend/server.js
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");
const authRoutes = require("./routes/auth.route");
const taskRoutes = require("./routes/tasks.route");

dotenv.config();
const app = express();

// Middleware
app.use(cors()); // Allows your React app to talk to this server
app.use(express.json()); // Allows server to read JSON data from requests
app.use("/uploads", express.static("uploads")); // Makes uploaded proof files accessible

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/tasks", taskRoutes);

// MongoDB Connection
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB Connected Successfully"))
  .catch((err) => console.error("❌ DB Connection Error:", err));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server started on port ${PORT}`));
