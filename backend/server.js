const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

// Validate required environment variables
if (!process.env.JWT_SECRET) {
    console.error('JWT_SECRET is not defined in environment variables');
    process.exit(1);
}

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Database Connection
if (!process.env.MONGO_URI) {
    console.error('MONGO_URI is not defined in environment variables');
    process.exit(1);
}

mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('MongoDB Connected'))
    .catch(err => {
        console.error('MongoDB connection error:', err);
        process.exit(1);
    });

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/routes', require('./routes/routeRoutes'));
app.use('/api/rides', require('./routes/rideRoutes'));
app.use('/api/reviews', require('./routes/reviewRoutes'));
app.use('/api/safety-incidents', require('./routes/safetyIncidentRoutes'));
app.use('/api/challenges', require('./routes/challengeRoutes'));
app.use('/api/rewards', require('./routes/rewardRoutes'));
app.use('/api/badges', require('./routes/badgeRoutes'));
app.use('/api/users', require('./routes/userRoutes'));

const PORT = 5001; // Force 5001 to avoid conflicts

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
