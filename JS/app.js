const express = require('express');
const cors = require('cors');
const app = express();
const port = 10000;

// Import all entity routers
const restaurantRoutes = require('./routes/restaurant');
const searchRoutes = require('./routes/search');
const productRoutes = require('./routes/product');
const userRoutes = require('./routes/user');
const orderRoutes = require('./routes/order');
const tokenRoutes = require('./routes/token');

// Middleware parsing
app.use(cors({
    origin: 'http://localhost:3000',
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'userId']
}));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Basic health-check route to verify the server is up and running
app.get('/api/health', (req, res) => {
    res.json({ 
        status: 'OK', 
        message: 'Server is running properly' 
    });
});
app.set('json spaces', 2);
// Mount primary API routes
app.use('/api/search', searchRoutes);
app.use('/api/restaurants', restaurantRoutes);
app.use('/api/users', userRoutes);
app.use('/api/token', tokenRoutes);

// Mount nested routes (dependent on specific restaurant or user IDs)
app.use('/api/restaurants/:restaurantId/products', productRoutes);
app.use('/api/users/:userid/orders', orderRoutes);

// Start the Express server and listen on the specified port
app.listen(port, '0.0.0.0', () => {
    console.log(`Server is running on port ${port}`);
});