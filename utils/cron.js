// backend/utils/cron.js
const cron = require("node-cron");
const Task = require("../models/Task.model");
const User = require("../models/User.model");

// Runs every day at midnight (00:00)
cron.schedule("0 0 * * *", async () => {
  const today = new Date();

  // Find tasks where deadline is past AND status is still 'new' or 'accepted'
  const expiredTasks = await Task.find({
    taskDate: { $lt: today },
    status: { $in: ["new", "accepted"] },
  });

  for (let task of expiredTasks) {
    task.status = "failed";
    await task.save();

    // Logic: Decrement the 'active' or 'new' count and increment 'failed'
    const updateField =
      task.status === "new" ? "taskCounts.newTask" : "taskCounts.active";

    await User.findByIdAndUpdate(task.assignedTo, {
      $inc: { [updateField]: -1, "taskCounts.failed": 1 },
    });
  }
  console.log("Checked deadlines: Expired tasks marked as failed.");
});
