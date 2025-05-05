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

router.put("/:id", async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  try {
    const updated = await Emergency.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    );
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: "Failed to update status" });
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
