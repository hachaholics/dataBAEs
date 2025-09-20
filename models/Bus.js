// models/Bus.js
const mongoose = require('mongoose');
const { Schema } = mongoose;

const DeviceSchema = new Schema({
  gpsId: String,
  cameraId: String
}, { _id: false });

const BusSchema = new Schema({
  busNo: { type: String, required: true, index: true },
  registrationNumber: String,
  routes: [{ type: Schema.Types.ObjectId, ref: 'Route' }],
  driverName: String,
  conductorName: String,
  devices: DeviceSchema
}, { timestamps: true });

module.exports = mongoose.model('Bus', BusSchema);
