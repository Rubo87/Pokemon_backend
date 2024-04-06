const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const pool = require('../src/client');

// Validation middleware for the POST /orders route
const validateOrder = [
    body('price').notEmpty().isNumeric(),
    body('date').notEmpty().isISO8601(),
    body('user_id').notEmpty().isInt(),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        next();
    }
];

// Route to get all orders
router.get('/', async (req, res) => {
    try {
      const { rows } = await pool.query('SELECT * FROM orders');
      res.json(rows);
    } catch (error) {
      console.error('Error executing query', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

// Route to get one order by ID
router.get('/:id', async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        const query = 'SELECT * FROM orders WHERE id = $1';
        const result = await pool.query(query, [id]);

        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Order not found' });
        }

        const order = result.rows[0];
        res.json(order);
    } catch (error) {
        console.error('Error retrieving order:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Route to create a new order
router.post('/', validateOrder, async (req, res) => {
    try {
        const { price, date, user_id } = req.body;
        const query = 'INSERT INTO orders (price, date, user_id) VALUES ($1, $2, $3) RETURNING *';
        const values = [price, date, user_id];
        const result = await pool.query(query, values);

        const newOrder = result.rows[0];
        res.status(201).json(newOrder);
    } catch (error) {
        console.error('Error creating new order:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Route to edit one order by ID
router.put('/:id', validateOrder, async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        const { price, date, user_id } = req.body;
        let query = 'UPDATE orders SET ';
        const values = [];
        let index = 1;

        if (price !== undefined) {
            query += `price = $${index}, `;
            values.push(price);
            index++;
        }
        if (date !== undefined) {
            query += `date = $${index}, `;
            values.push(date);
            index++;
        }
        if (user_id !== undefined) {
            query += `user_id = $${index}, `;
            values.push(user_id);
            index++;
        }

        // Remove the trailing comma and space
        query = query.slice(0, -2);

        // Add the WHERE clause for the order ID
        query += ` WHERE id = $${index} RETURNING *`;
        values.push(id);

        const result = await pool.query(query, values);

        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Order not found' });
        }

        const updatedOrder = result.rows[0];
        res.json(updatedOrder);
    } catch (error) {
        console.error('Error updating order:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Route to delete one order by ID
router.delete('/:id', async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        const query = 'DELETE FROM orders WHERE id = $1 RETURNING *';
        const result = await pool.query(query, [id]);

        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Order not found' });
        }

        const deletedOrder = result.rows[0];
        res.json({ message: `Order with ID ${id} deleted`, order: deletedOrder });
    } catch (error) {
        console.error('Error deleting order:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

module.exports = router;