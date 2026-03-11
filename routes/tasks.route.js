// backend/routes/tasks.js
const express = require("express");
const router = express.Router();
const Task = require("../models/Task.model");
const User = require("../models/User.model");
const upload = require("../middlewares/multer");
const { verifyAdmin } = require("../middlewares/authMiddleware");

// 1. CREATE TASK (Admin Only)
router.post("/create", verifyAdmin, async (req, res) => {
  const {
    taskTitle,
    taskDescription,
    taskDate,
    category,
    assignedTo,
    createdBy,
  } = req.body;

  try {
    const newTask = new Task({
      taskTitle,
      taskDescription,
      taskDate,
      category,
      assignedTo, // This is the Employee's MongoDB ID
      createdBy, // This is the Admin's ID
    });

    await newTask.save();

    // UPDATE THE EMPLOYEE'S TASK COUNT
    // We increment the 'newTask' count for that specific employee automatically
    await User.findByIdAndUpdate(assignedTo, {
      $inc: { "taskCounts.newTask": 1 },
    });

    res
      .status(201)
      .json({ message: "Task assigned successfully!", task: newTask });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Error creating task", error: err.message });
  }
});

// 2. GET TASKS FOR LOGGED-IN EMPLOYEE
router.get("/my-tasks/:userId", async (req, res) => {
  try {
    const tasks = await Task.find({ assignedTo: req.params.userId }).sort({
      createdAt: -1,
    });
    res.json(tasks);
  } catch (err) {
    res.status(500).json({ message: "Error fetching tasks" });
  }
});

// GET ALL COMPLETED ROUTES
router.get("/all-completed", async (req, res) => {
  try {
    const tasks = await Task.find({ status: "completed" })
      .populate("assignedTo", "firstName") // Only get the name
      .sort({ updatedAt: -1 });
    res.json(tasks);
  } catch (err) {
    res.status(500).json({ message: "Error fetching submissions" });
  }
});

// 1. ACCEPT TASK (Employee accepts the new task)
router.patch("/accept/:taskId", async (req, res) => {
  try {
    const task = await Task.findByIdAndUpdate(
      req.params.taskId,
      { status: "accepted" },
      { returnDocument: "after" },
    );

    // Logic: Decrement 'newTask' and increment 'active' in User model
    await User.findByIdAndUpdate(task.assignedTo, {
      $inc: { "taskCounts.newTask": -1, "taskCounts.active": 1 },
    });

    res.json({ message: "Task Accepted!", task });
  } catch (err) {
    res.status(500).json({ message: "Update failed" });
  }
});

// 2. COMPLETE TASK (With Proof Upload)
router.patch("/complete/:taskId", upload.single("proof"), async (req, res) => {
  try {
    const task = await Task.findById(req.params.taskId);
    if (!task) return res.status(404).json({ message: "Task not found" });

    task.status = "completed";

    // Update: Handle the file using Memory Storage (buffer)
    if (req.file) {
      task.proofFile = {
        data: req.file.buffer, // The actual PDF/Image data
        contentType: req.file.mimetype, // e.g., 'application/pdf'
        fileName: req.file.originalname,
      };
    }

    await task.save();

    // Logic: Decrement 'active' and increment 'completed'
    await User.findByIdAndUpdate(task.assignedTo, {
      $inc: { "taskCounts.active": -1, "taskCounts.completed": 1 },
    });

    res.json({
      message: "Task Completed with Proof!",
      task: { ...task._doc, proofFile: "File stored in DB" }, // Hide buffer in response for speed
    });
  } catch (err) {
    console.error("Vercel Upload Error:", err); // Very important for debugging logs!
    res.status(500).json({ message: "Completion failed", error: err.message });
  }
});

//Viewing proof File
router.get("/view-proof/:taskId", async (req, res) => {
  try {
    const task = await Task.findById(req.params.taskId);

    if (!task || !task.proofFile || !task.proofFile.data) {
      return res.status(404).json({ message: "Proof file not found" });
    }

    // 1. Tell the browser the correct file type (e.g., application/pdf or image/png)
    res.set("Content-Type", task.proofFile.contentType);

    // 2. Set the filename so when the user saves it, it has the original name
    res.set(
      "Content-Disposition",
      `inline; filename="${task.proofFile.fileName}"`,
    );

    // 3. Send the raw binary buffer data
    res.send(task.proofFile.data);
  } catch (err) {
    res.status(500).json({ message: "Error fetching file" });
  }
});

module.exports = router;
