const express = require('express');
const app = express();
const port = 3000; // Port number can be changed
const pool = require('./client');

// Middleware for handling JSON data
app.use(express.json());

// Enable CORS
app.use(require('cors')());

// Routes
const pokemonRouter = require('./routes/pokemon');
app.use('/pokemon', pokemonRouter);

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});