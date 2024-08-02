const express = require("express");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const router = express.Router();

const JWT_SECRET = "hahah_this_is_aditya";

// Register
router.post("/register", async (req, res) => {
  console.log("Register endpoint hit");
  try {
    const { username, password } = req.body;
    console.log("Request body:", req.body);
    const user = new User({ username, password });
    await user.save();
    res.status(201).send({ message: "User created" });
  } catch (err) {
    console.error("Error in register:", err);
    res.status(400).send({ error: err.message });
  }
});

// Login
router.post("/login", async (req, res) => {
  console.log("Login endpoint hit");
  try {
    const { username, password } = req.body;
    console.log("Request body:", req.body);
    const user = await User.findOne({ username });

    if (!user) {
      return res.status(400).send({ error: "User not found" });
    }

    if (user.password !== password) {
      console.log("Invalid username or password");
      return res.status(400).send({ error: "Invalid username or password" });
    }
    const token = jwt.sign({ userId: user._id }, JWT_SECRET, {
      expiresIn: "1h",
    });
    res.send({ token });
  } catch (err) {
    console.error("Error in login:", err);
    res.status(400).send({ error: err.message });
  }
});

// Define a protected route
router.post("/me", async (req, res, next) => {
  const token = req.header("Authorization").replace("Bearer ", "");

  if (!token) {
    console.log("No token");
    return res.status(401).send({ error: "Access denied. No token provided." });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await User.findById(decoded.userId);
    if (!user) {
      console.log("No user");
      return res.status(401).send({ error: "Access denied. Invalid token." });
    }
    res.status(200).send({user});
  } catch (error) {
    console.error("JWT verification error:", error);
    res.status(400).send({ error: "Invalid token." });
  }
});

module.exports = router;
