const express = require("express");
const multer = require("multer");
const router = express.Router();

// Multer config to accept image upload
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

router.post("/", upload.single("image"), async (req, res) => {
  try {
    const file = req.file; // uploaded image
    const email = req.body.email;

    if (!file) return res.status(400).json({ message: "No file uploaded" });

    // === AI model simulation ===
    const result = Math.random() > 0.5 ? "Healthy" : "Heart Defect";
    const confidence = (Math.random() * 100).toFixed(2) + "%";

    res.json({ result, confidence });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Prediction failed" });
  }
});

module.exports = router;