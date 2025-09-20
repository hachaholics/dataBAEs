// server.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');

const routeRoutes = require('./routes/routeRoutes');
const chatBotRoutes = require('./routes/chatBotRoutes');
const busRoutes = require('./routes/busRoutes');
const app = express();
app.use(cors());
app.use(express.json());

// connect DB
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/busdb';
connectDB(MONGO_URI);

// routes
app.use('/api/routes', routeRoutes);
app.use('/api/buses', busRoutes);
app.use('/api/chatbot', chatBotRoutes);

// health
app.get('/health', (req, res) => res.json({ ok: true }));

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
