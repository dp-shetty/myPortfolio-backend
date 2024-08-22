const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");

const app = express();

const uri =
  "mongodb+srv://dpshetty:%40Dpshetty852@portfoliouserscluster.20jvvn0.mongodb.net/userData?retryWrites=true&w=majority";

let isConnected;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Connect to MongoDB Atlas
async function connectToDatabase() {
  if (isConnected) {
    console.log("Using existing database connection");
    return;
  }
  try {
    await mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });
    isConnected = mongoose.connection.readyState;
    console.log("Connected to MongoDB Atlas");
  } catch (err) {
    console.error("Failed to connect to MongoDB Atlas", err);
  }
}

// Define the user schema and model
const { Schema, model } = mongoose;
const userSchema = new Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  comments: { type: String },
  role: { type: String, required: true }
});

const User = model("User", userSchema, "users");

// Routes
app.get("/", (req, res) => {
  res.send("Server is responding");
});

app.get("/users", async (req, res) => {
  await connectToDatabase(); // Ensure the database is connected before handling the request
  try {
    const users = await User.find();
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.post("/users", async (req, res) => {
  await connectToDatabase(); // Ensure the database is connected before handling the request
  const { name, email, role, comments } = req.body;
  try {
    const newUser = new User({ name, email, role, comments });
    const savedUser = await newUser.save();
    res.status(201).json(savedUser);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Start server
const port = process.env.PORT || 8055;
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
