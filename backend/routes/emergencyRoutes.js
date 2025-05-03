const express = require("express");
const router = express.Router();
const Emergency = require("../models/Emergency");

// GET /api/emergencies - fetch all emergencies
router.get("/", async (req, res) => {
  try {
    const emergencies = await Emergency.find();
    res.json(emergencies);
  } catch (error) {
    res.status(500).json({ error: "Server Error" });
  }
});
router.post("/", async (req, res) => {
  const { name, location, time, type, status } = req.body;

  try {
    const newEmergency = new Emergency({
      name,
      location,
      time,
      type,
      status,
    });

    const savedEmergency = await newEmergency.save();
    res.status(201).json(savedEmergency);
  } catch (error) {
    console.error("Error creating emergency:", error);
    res.status(500).json({ error: "Server Error" });
  }
});
module.exports = router;
