const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const nodemailer = require("nodemailer");
require('dotenv').config(); // Load environment variables

const app = express();

// MongoDB Atlas connection string from environment variables
const uri = process.env.MONGODB_URI;

// Define the user schema and model
const { Schema, model } = mongoose;
const userSchema = new Schema({
  username: { type: String },
  useremail: { type: String, unique: true },
  comments: { type: String },
  userrole: { type: String }
}, { versionKey: false });

const User = model("User", userSchema, "users");

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Connect to MongoDB Atlas
mongoose.connect(uri)
  .then(() => console.log("Connected to MongoDB Atlas"))
  .catch((err) => console.error("Failed to connect to MongoDB Atlas", err));

// Create a transporter for nodemailer
const transporter = nodemailer.createTransport({
  service: 'gmail', // or any other email service
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// Function to send email
const sendEmailNotification = (username, useremail) => {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: process.env.NOTIFICATION_EMAIL,
    subject: 'New User Form Submission',
    text: `New user form submitted by ${username} (${useremail}).`
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.error('Error sending email:', error);
    } else {
      console.log('Email sent:', info.response);
    }
  });
};

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
    sendEmailNotification(username, useremail); // Send email notification
    res.status(201).json(savedUser);
    console.log("User saved:", savedUser); // Log saved user for debugging
  } catch (err) {
    console.error("Error saving user:", err);
    res.status(500).json({ message: err.message });
  }
});

// Export the Express app as a Vercel serverless function
module.exports = (req, res) => {
  if (mongoose.connection.readyState === 0) {
    mongoose.connect(uri);
  }
  return app(req, res);
};
