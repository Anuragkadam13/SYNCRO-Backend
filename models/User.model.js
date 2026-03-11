// backend/models/User.js
const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    firstName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true }, // This will be hashed for security
    role: {
      type: String,
      enum: ["admin", "employee"],
      default: "employee",
    },
    taskCounts: {
      newTask: { type: Number, default: 0 },
      active: { type: Number, default: 0 },
      completed: { type: Number, default: 0 },
      failed: { type: Number, default: 0 },
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("User", userSchema);
