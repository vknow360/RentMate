require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const connectDB = require('./src/config/db');

// Connect to database
if (process.env.MONGODB_URI) {
  connectDB();
}

const app = express();

// Middleware
app.use(helmet());
app.use(cors({ origin: '*' }));
app.use(express.json());

// Request Logging Middleware
app.use((req, res, next) => {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    const status = res.statusCode;
    const isError = status >= 400;
    const resultMsg = isError ? 'ERROR' : 'SUCCESS';
    
    console.log(`[DEBUG] ${req.method} ${req.originalUrl || req.url} - ${status} ${resultMsg} (${duration}ms)`);
  });
  
  next();
});

const authRoutes = require('./src/routes/auth');
const userRoutes = require('./src/routes/users');
const propertyRoutes = require('./src/routes/properties');
const wishlistRoutes = require('./src/routes/wishlist');
const inquiryRoutes = require('./src/routes/inquiries');
const roommateRoutes = require('./src/routes/roommates');
const expenseRoutes = require('./src/routes/expenses');
const notificationRoutes = require('./src/routes/notifications');
const reviewRoutes = require('./src/routes/reviews');
const adminRoutes = require('./src/routes/admin');

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/properties', propertyRoutes);
app.use('/api/wishlist', wishlistRoutes);
app.use('/api/inquiries', inquiryRoutes);
app.use('/api/roommates', roommateRoutes);
app.use('/api/expenses', expenseRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/admin', adminRoutes);

app.get('/api/health', (req, res) => {
  res.status(200).json({ success: true, message: 'API is running' });
});

// Error Handling Middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ success: false, error: err.message || 'Server Error' });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
