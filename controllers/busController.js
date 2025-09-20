// controllers/busController.js
const mongoose = require('mongoose');
const Bus = require('../models/Bus');
const BusStatus = require('../models/BusStatus');
const Route = require('../models/Route');

/**
 * GET /buses/byRoute/:routeId
 * Returns buses assigned to a route (populated)
 */
exports.getBusesByRoute = async (req, res) => {
  try {
    const { routeId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(routeId)) return res.status(400).json({ message: 'Invalid routeId' });

    const buses = await Bus.find({ routes: routeId })
      .select('busNo registrationNumber driverName conductorName devices')
      .lean();

    res.json({ buses });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

/**
 * GET /buses/track/:routeId
 * Returns each bus on route with its latest status & location
 */
exports.trackBuses = async (req, res) => {
  try {
    const { routeId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(routeId)) return res.status(400).json({ message: 'Invalid routeId' });

    // find buses assigned to route
    const buses = await Bus.find({ routes: routeId })
      .select('busNo registrationNumber driverName conductorName devices')
      .lean();

    // gather statuses
    const results = await Promise.all(buses.map(async (b) => {
      const status = await BusStatus.findOne({ bus: b._id })
        .sort({ lastUpdated: -1 })
        .lean();
      return {
        bus: b,
        status: status || null
      };
    }));

    res.json({ routeId, buses: results });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

/**
 * SSE endpoint: GET /buses/track/stream/:routeId
 * Sends periodic updates (polls DB every X seconds).
 * NOTE: This is a simple SSE implementation. For production, consider using Socket.IO
 */
exports.streamBusesByRoute = async (req, res) => {
  try {
    const { routeId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(routeId)) {
      return res.status(400).json({ message: 'Invalid routeId' });
    }

    // SSE headers
    res.set({
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive'
    });
    res.flushHeaders();

    let keepAlive = true;

    const sendUpdate = async () => {
      if (!keepAlive) return;
      try {
        const buses = await Bus.find({ routes: routeId })
          .select('busNo registrationNumber driverName conductorName devices')
          .lean();

        const results = await Promise.all(buses.map(async (b) => {
          const status = await BusStatus.findOne({ bus: b._id }).sort({ lastUpdated: -1 }).lean();
          return { bus: b, status: status || null };
        }));

        const payload = JSON.stringify({ routeId, buses: results, timestamp: new Date() });
        res.write(`data: ${payload}\n\n`);
      } catch (err) {
        console.error('SSE send error', err);
      }
    };

    // send immediately and then every 4 seconds (adjust as necessary)
    sendUpdate();
    const interval = setInterval(sendUpdate, 4000);

    // keep connection alive by sending a comment ping every 20s
    const ping = setInterval(() => res.write(': ping\n\n'), 20000);

    req.on('close', () => {
      keepAlive = false;
      clearInterval(interval);
      clearInterval(ping);
      res.end();
    });
  } catch (err) {
    console.error(err);
    res.status(500).end();
  }
};
