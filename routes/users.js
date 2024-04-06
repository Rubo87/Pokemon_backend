const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const pool = require('../src/client');


// Validation middleware for the POST /users route
const validateUser = [
    body('first_name').notEmpty().isString(),
    body('last_name').notEmpty().isString(),
    body('age').notEmpty().isInt({ min: 18 }),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        next();
    }
];

// Route to get all users
router.get('/', async (req, res) => {
    try {
      const { rows } = await pool.query('SELECT * FROM users');
      res.json(rows);
    } catch (error) {
      console.error('Error executing query', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

// Route to get one user by ID
router.get('/:id', async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        const query = 'SELECT * FROM users WHERE id = $1';
        const result = await pool.query(query, [id]);

        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'User not found' });
        }

        const user = result.rows[0];
        res.json(user);
    } catch (error) {
        console.error('Error retrieving user:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Get all orders for a specific user
router.get('/:id/orders', async (req, res) => {
    try {
        const userId = parseInt(req.params.id);
        const query = 'SELECT * FROM orders WHERE user_id = $1';
        const result = await pool.query(query, [userId]);
        res.json(result.rows);
    } catch (error) {
        console.error('Error retrieving user orders:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Route to create a new user
router.post('/', validateUser, async (req, res) => {
    try {
        const { first_name, last_name, age } = req.body;
        const query = 'INSERT INTO users (first_name, last_name, age) VALUES ($1, $2, $3) RETURNING *';
        const values = [first_name, last_name, age];
        const result = await pool.query(query, values);
        const newUser = result.rows[0];
        res.status(201).json(newUser);
    } catch (error) {
        console.error('Error inserting user:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Route to edit one user by ID
router.put('/:id', async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        const { first_name, last_name, age } = req.body;
        const query = 'UPDATE users SET first_name = $1, last_name = $2, age = $3 WHERE id = $4 RETURNING *';
        const values = [first_name, last_name, age, id];
        const result = await pool.query(query, values);
        
        // Check if a user with the given ID was found and updated
        if (result.rowCount === 0) {
            return res.status(404).json({ message: 'User not found' });
        }

        const updatedUser = result.rows[0];
        res.json(updatedUser);
    } catch (error) {
        console.error('Error updating user:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Route to set a user as inactive if they have no orders
router.put('/:id/check-inactive', async (req, res) => {
    try {
        const userId = parseInt(req.params.id);
        const query = 'UPDATE users SET active = false WHERE id = $1 AND NOT EXISTS (SELECT 1 FROM orders WHERE user_id = $1)';
        const result = await pool.query(query, [userId]);

        if (result.rowCount === 0) {
            return res.status(404).json({ message: 'User not found or already has orders' });
        }

        res.json({ message: 'User set as inactive' });
    } catch (error) {
        console.error('Error setting user as inactive:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Route to delete one user by ID
router.delete('/:id', async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        const query = 'DELETE FROM users WHERE id = $1';
        const result = await pool.query(query, [id]);
        
        // Check if a user with the given ID was found and deleted
        if (result.rowCount === 0) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.json({ message: 'User deleted' });
    } catch (error) {
        console.error('Error deleting user:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

module.exports = router;