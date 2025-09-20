// models/Route.js
const mongoose = require('mongoose');
const { Schema } = mongoose;

const RouteStopSub = new Schema({
  stop: { type: Schema.Types.ObjectId, ref: 'Stop', required: true },
  order: { type: Number, required: true }
}, { _id: false });

const RouteSchema = new Schema({
  routeName: { type: String, required: true },
  routeNumber: { type: String, required: true },
  stops: { type: [RouteStopSub], default: [] }
}, { timestamps: true });

module.exports = mongoose.model('Route', RouteSchema);
