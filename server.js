const express = require("express");
const cors = require("cors");
const { v4: uuidv4 } = require('uuid');
const mongoose = require("mongoose");
require('dotenv').config(); // Load environment variables

const app = express();

// MongoDB Atlas connection string from environment variables
const uri = process.env.MONGODB_URI;

// Define the user schema and model
const { Schema, model } = mongoose;
const userSchema = new Schema({
  id: { type: String, default: uuidv4 },
  username: { type: String, required: true },
  useremail: { type: String, required: true, unique: true },
  comments: { type: String },
  userrole: { type: String, required: true }
});

const User = model("User", userSchema, "users");

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Connect to MongoDB Atlas with connection pooling for serverless environments
mongoose.connect(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverSelectionTimeoutMS: 5000 // Keep trying to send operations for 5 seconds
}).then(() => console.log("Connected to MongoDB Atlas"))
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
    // Create a new user and save to database
    const newUser = new User({ username, useremail, userrole, comments });
    const savedUser = await newUser.save();
    res.status(201).json(savedUser);
    console.log("User saved:", savedUser); // Log saved user for debugging
  } catch (err) {
    console.error("Error saving user:", err);
    
    // Check for duplicate key error
    if (err.code === 11000) {
      res.status(409).json({ message: "Duplicate key error: This email is already registered." });
    } else {
      res.status(500).json({ message: err.message });
    }
  }
});

// Export the Express app as a Vercel serverless function
module.exports = async (req, res) => {
  if (mongoose.connection.readyState === 0) {
    try {
      await mongoose.connect(uri, {
        useNewUrlParser: true,
        useUnifiedTopology: true
      });
    } catch (err) {
      console.error("Failed to connect to MongoDB Atlas", err);
      return res.status(500).json({ message: "Database connection error" });
    }
  }
  return app(req, res);
};