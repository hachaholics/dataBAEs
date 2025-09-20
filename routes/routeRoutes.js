// routes/routeRoutes.js
const express = require('express');
const router = express.Router();
const routeController = require('../controllers/routeController');

router.get('/search', routeController.searchRoutes);

module.exports = router;
