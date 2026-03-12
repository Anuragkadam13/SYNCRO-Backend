const express = require("express");
const router = express.Router();
const User = require("../models/User.model");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

// 1. REGISTER ROUTE (To add your new Admin/Employees from scratch)
router.post("/register", async (req, res) => {
  const { firstName, email, password, role } = req.body;
  try {
    // Check if user exists
    let user = await User.findOne({ email });
    if (user) return res.status(400).json({ message: "User already exists" });

    // 2. NEW: Check if someone is trying to register as a second Admin
    if (role === "admin") {
      const existingAdmin = await User.findOne({ role: "admin" });
      if (existingAdmin) {
        return res.status(400).json({
          message:
            "System already has an Administrator. You cannot create another Admin ID.",
        });
      }
    }

    // Hash the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    user = new User({ firstName, email, password: hashedPassword, role });
    await user.save();

    res.status(201).json({ message: "User created successfully!", user: user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error during registration" });
  }
});

// 2. LOGIN ROUTE
router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "Invalid Credentials" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(400).json({ message: "Invalid Credentials" });

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1d" },
    );

    res.json({
      token,
      user: {
        id: user._id,
        firstName: user.firstName,
        role: user.role,
        taskCounts: user.taskCounts,
      },
    });
  } catch (err) {
    res.status(500).json({ message: "Server error during login" });
  }
});

//FETCHING ALL EMPLOYEES
router.get("/employees", async (req, res) => {
  try {
    const employees = await User.find({ role: "employee" });
    res.json(employees);
  } catch (err) {
    res.status(500).json({ message: "Server Error" });
  }
});

// Route to get the latest user data (to sync task counts)
router.get("/me/:id", async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-password");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json(user);
    console.log(user);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server Error" });
  }
});

module.exports = router;
