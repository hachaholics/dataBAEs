// models/Stop.js
const mongoose = require('mongoose');

const StopSchema = new mongoose.Schema({
  name: { type: String, required: true, index: true },
  lat: { type: Number, required: true },
  long: { type: Number, required: true }
}, { timestamps: true });

module.exports = mongoose.model('Stop', StopSchema);
