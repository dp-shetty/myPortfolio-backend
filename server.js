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
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  comments: { type: String },
  role: { type: String, required: true }
});

const User = model("User", userSchema, "users");

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Connect to MongoDB Atlas
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
    res.status(500).json({ message: err.message });
  }
});

app.post("/users", async (req, res) => {
  const { name, email, role, comments } = req.body;
  try {
    const newUser = new User({ name, email, role, comments });
    const savedUser = await newUser.save();
    res.status(201).json(savedUser);
    console.log(savedUser)
  } catch (err) {
    console.error("Error saving user:", err);  // Log the error
    res.status(400).json({ message: err.message });
  }
});


// Export the Express app as a Vercel serverless function
module.exports = (req, res) => {
  if (mongoose.connection.readyState === 0) {
    mongoose.connect(uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
  }
  return app(req, res);
};
