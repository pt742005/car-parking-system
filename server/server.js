// ==============================================================================
// FILE: server.js
// PURPOSE: Main entry point for our Node.js & Express.js Backend Server.
// ==============================================================================

// 1. Load environment variables from .env file
require('dotenv').config();

const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const parkingRoutes = require('./routes/parkingRoutes');

// 2. Initialize the Express application
const app = express();

// 3. Connect to MongoDB
connectDB();

// 4. Middlewares
// Enable CORS so our React frontend (running on a different port like 5173) can talk to this backend
app.use(cors());

// Enable JSON parsing for incoming HTTP request bodies
app.use(express.json());

// 5. Basic Health Check Route (Helps verify frontend <-> backend connection)
app.get('/api/health', (req, res) => {
  const mongoose = require('mongoose');
  const dbState = ['disconnected', 'connected', 'connecting', 'disconnecting'][mongoose.connection.readyState] || 'unknown';

  res.json({
    status: 'online',
    message: 'Car Parking Service Backend is running smoothly!',
    database: dbState,
    timestamp: new Date().toISOString(),
  });
});

// 6. Mount our Parking API Routes
// Any request starting with '/api/parking' goes to parkingRoutes.js
app.use('/api/parking', parkingRoutes);

// 7. Root Route fallback
app.get('/', (req, res) => {
  res.send('<h1>Car Parking Service Number System API</h1><p>Backend is running. Access API endpoints at /api/health or /api/parking</p>');
});

// 8. Start the Express Server
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`====================================================`);
  console.log(`🚀 Server is running on: http://localhost:${PORT}`);
  console.log(`📡 Health Check endpoint: http://localhost:${PORT}/api/health`);
  console.log(`====================================================`);
});
