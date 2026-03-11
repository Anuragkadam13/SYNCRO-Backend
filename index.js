// backend/server.js
const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const authRoutes = require("./routes/auth.route");
const taskRoutes = require("./routes/tasks.route");
const connectToMongo = require("./config/db");
const app = express();
dotenv.config();
const PORT = process.env.PORT || 5000;

connectToMongo()
  .then(() => {
    app.use(express.json());
    app.use(
      cors({
        origin: ["https://syncro-frontend-tau.vercel.app"],
        methods: ["GET", "POST", "PUT", "DELETE"],
        credentials: true,
      }),
    ); // Allows your React app to talk to this server

    app.use("/uploads", express.static("uploads")); // Makes uploaded proof files accessible

    // Routes
    app.use("/api/auth", authRoutes);
    app.use("/api/tasks", taskRoutes);

    app.listen(PORT, () => {
      console.log(`🚀 Server started on port ${PORT}`);
    });
  })
  .catch((err) => console.error("Failed to connect to MongoDB:", err));
