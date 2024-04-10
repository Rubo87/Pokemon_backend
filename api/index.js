const express = require('express');
const app = express();
const port = 3000; // Port number can be changed

// Middleware for handling JSON data
app.use(express.json());

// Enable CORS
app.use(require('cors')());

// Routes
const pokemonRouter = require('../routes/pokemon');
app.use('/pokemon', pokemonRouter);

// Start server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});