const express = require('express');
const bodyParser = require('body-parser');
const pool = require('./client');
const { validationResult } = require('express-validator');
const usersRouter = require('../routes/users');
const ordersRouter = require('../routes/orders');
// Create an Express application
const app = express();

// Middleware to parse JSON bodies
app.use(bodyParser.json());
app.use('/users', usersRouter);
app.use('/orders', ordersRouter);


// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

