const dotenv = require('dotenv');
dotenv.config();

const express = require('express');
const cors = require('cors');
const { connectDB } = require('./config/db');

// Connect to PostgreSQL database
connectDB();

const app = express();

// Standard express parsing & CORS middlewares
app.use(cors());
app.use(express.json());

// Register API Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/user', require('./routes/userRoutes'));
app.use('/api/account', require('./routes/accountRoutes'));

// Server status endpoint
app.get('/', (req, res) => {
  res.send('DoxBankOfIndia MERN API is running...');
});

// Universal Error Handling Middleware
app.use((err, req, res, next) => {
  console.error('Unhandled Server Error Log:', err.stack);
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  res.status(statusCode).json({
    success: false,
    message: err.message || 'Internal Server Error. Please contact support.',
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`[DoxBank Server] Online. Listening in ${process.env.NODE_ENV || 'production'} mode on port ${PORT}`);
});
