// routes/busRoutes.js
const express = require('express');
const router = express.Router();
const busController = require('../controllers/busController');

router.get('/byRoute/:routeId', busController.getBusesByRoute);
router.get('/track/:routeId', busController.trackBuses);
router.get('/track/stream/:routeId', busController.streamBusesByRoute);

module.exports = router;
