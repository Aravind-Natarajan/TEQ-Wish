const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const studentRoutes = require('./routes/router');
const dotenv = require('dotenv');
dotenv.config();

const app = express();

// Connect to MongoDB
connectDB();

// Enable CORS
app.use(cors({
  origin: 'https://teq-wish.netlify.app',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true
}));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Optional fallback CORS headers
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', 'https://teq-wish.netlify.app');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  next();
});

// Body parser
// app.use(express.json());

// Use routes
app.use('/api', studentRoutes);

require('./routes/router');

// Start server
const PORT = process.env.PORT || 8000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

