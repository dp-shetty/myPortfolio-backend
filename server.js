const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
require('dotenv').config(); // Load environment variables

const app = express();

// MongoDB Atlas connection string from environment variables
const uri = process.env.MONGODB_URI;

// Define the user schema and model
const { Schema, model } = mongoose;
const userSchema = new Schema({
  username: { type: String,},
  useremail: { type: String,},
  comments: { type: String },
  userrole: { type: String,}
});

const User = model("User", userSchema, "users");

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Connect to MongoDB Atlas
mongoose.connect(uri)
  .then(() => console.log("Connected to MongoDB Atlas"))
  .catch((err) => console.error("Failed to connect to MongoDB Atlas", err));

// Routes
app.get("/", (req, res) => {
  res.send("Server is responding");
});

app.get("/users", async (req, res) => {
  try {
    const users = await User.find();
    res.json(users);
  } catch (err) {
    console.error("Error fetching users:", err);
    res.status(500).json({ message: err.message });
  }
});

app.post("/users", async (req, res) => {
  const { username, useremail, userrole, comments } = req.body;
  console.log("Received data:", req.body); // Log received data for debugging
  
  // Validate input
  if (!username || !useremail || !userrole) {
    return res.status(400).json({ message: "Username, email, and role are required." });
  }

  try {
    // Check if the email already exists
    const existingUser = await User.findOne({ useremail });
    if (existingUser) {
      return res.status(400).json({ message: "User with this email already exists." });
    }

    // Create a new user and save to database
    const newUser = new User({ username, useremail, userrole, comments });
    const savedUser = await newUser.save();
    res.status(201).json(savedUser);
    console.log("User saved:", savedUser); // Log saved user for debugging
  } catch (err) {
    console.error("Error saving user:", err);
    res.status(400).json({ message: err.message });
  }
});

// Export the Express app as a Vercel serverless function
module.exports = (req, res) => {
  if (mongoose.connection.readyState === 0) {
    mongoose.connect(uri);
  }
  return app(req, res);
};
