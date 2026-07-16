const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const predictRoute = require("./routes/predict"); // new route

const app = express();

app.use(cors());
app.use(express.json());

mongoose.connect("mongodb://127.0.0.1:27017/ai_prenatal_db")
  .then(() => console.log("MongoDB connected successfully"))
  .catch((err) => console.log("MongoDB connection error:", err));

app.use("/api/predict", predictRoute); // route for image prediction

app.get("/", (req, res) => {
  res.send("Backend is running successfully");
});

app.listen(5000, () => {
  console.log("Server running on port 5000");
});