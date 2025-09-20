// models/BusStatus.js
const mongoose = require('mongoose');
const { Schema } = mongoose;

const GeoSchema = new Schema({
  lat: { type: Number, required: true },
  long: { type: Number, required: true }
}, { _id: false });

const BusStatusSchema = new Schema({
  bus: { type: Schema.Types.ObjectId, ref: 'Bus', required: true, index: true },
  location: GeoSchema,
  overcrowdingFlag: { type: String, enum: ['GREEN', 'YELLOW', 'RED'], default: 'GREEN' },
  lastUpdated: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.model('BusStatus', BusStatusSchema);
