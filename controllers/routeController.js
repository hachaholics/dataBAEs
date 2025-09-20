// controllers/routeController.js
const mongoose = require('mongoose');
const Route = require('../models/Route');
const Stop = require('../models/Stop');
const Bus = require('../models/Bus');

/**
 * GET /routes/search?start=<stopName>&end=<stopName>
 * Returns routes where start and end stops exist and start.order < end.order
 */
exports.searchRoutes = async (req, res) => {
  try {
    const { start, end } = req.query;
    if (!start || !end) return res.status(400).json({ message: 'start and end query params required' });

    // Find stop docs by name (case-insensitive)
    const startStop = await Stop.findOne({ name: { $regex: `^${start}$`, $options: 'i' } });
    const endStop = await Stop.findOne({ name: { $regex: `^${end}$`, $options: 'i' } });

    if (!startStop || !endStop) {
      return res.status(404).json({ message: 'start or end stop not found' });
    }

    const startId = startStop._id;
    const endId = endStop._id;

    // Aggregate routes: ensure both stops present and start.order < end.order
    const routes = await Route.aggregate([
      {
        $match: {
          'stops.stop': { $all: [startId, endId] }
        }
      },
      {
        // unwind stops to compute orders
        $project: {
          routeName: 1,
          routeNumber: 1,
          stops: 1
        }
      },
      {
        $addFields: {
          startOrder: {
            $arrayElemAt: [
              {
                $map: {
                  input: {
                    $filter: {
                      input: '$stops',
                      as: 's',
                      cond: { $eq: ['$$s.stop', startId] }
                    }
                  },
                  as: 'x',
                  in: '$$x.order'
                }
              },
              0
            ]
          },
          endOrder: {
            $arrayElemAt: [
              {
                $map: {
                  input: {
                    $filter: {
                      input: '$stops',
                      as: 's',
                      cond: { $eq: ['$$s.stop', endId] }
                    }
                  },
                  as: 'x',
                  in: '$$x.order'
                }
              },
              0
            ]
          }
        }
      },
      {
        $match: { $expr: { $lt: ['$startOrder', '$endOrder'] } }
      },
      {
        // populate stops with actual stop docs
        $lookup: {
          from: 'stops',
          localField: 'stops.stop',
          foreignField: '_id',
          as: 'stopDetails'
        }
      },
      {
        $project: {
          routeName: 1,
          routeNumber: 1,
          stops: 1,
          stopDetails: 1
        }
      }
    ]);

    // For each route, also fetch buses running on it
    const routesWithBuses = await Promise.all(routes.map(async (r) => {
      const buses = await Bus.find({ routes: new mongoose.Types.ObjectId(r._id) })
        .select('busNo registrationNumber driverName conductorName devices')
        .lean();
      return { ...r, buses };
    }));

    res.json({ routes: routesWithBuses });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};
