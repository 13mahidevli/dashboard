const mongoose = require("mongoose");

const EmergencySchema = new mongoose.Schema({
  id: String,
  name: String,
  location: {
    lat: Number,
    lng: Number,
  },
  time: Date,
  type: String,
  status: String,
});

module.exports = mongoose.model("Emergency", EmergencySchema);
