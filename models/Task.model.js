const mongoose = require("mongoose");

const taskSchema = new mongoose.Schema(
  {
    taskTitle: { type: String, required: true },
    taskDescription: { type: String, required: true },
    taskDate: { type: Date, required: true }, // The Deadline
    category: { type: String, required: true },

    // Status tracking
    status: {
      type: String,
      enum: ["new", "accepted", "completed", "failed"],
      default: "new",
    },

    // Link to the Employee
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // Link to the Admin who created it (Optional but good for tracking)
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    // For your "Proof" requirement later
    proofFile: { type: String, default: null },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Task", taskSchema);
