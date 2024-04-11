const express = require('express');
const router = express.Router();
const pool = require('../client.js'); // Import the PostgreSQL pool

// Route to get the complete list of pokemon from the database
router.get('/', async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM pokemon');
    res.json(rows);
  } catch (error) {
    console.error('Error executing query', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Route to get details of a specific pokemon by ID from the database
router.get('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const query = 'SELECT * FROM pokemon WHERE id = $1';
    const { rows } = await pool.query(query, [id]);
    if (rows.length === 0) {
      return res.status(404).json({ message: 'Pokemon not found' });
    }
    res.json(rows[0]);
  } catch (error) {
    console.error('Error fetching pokemon by ID:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Route to get specific information of a pokemon by ID and info type from the database
router.get('/:id/:info', async (req, res) => {
  const { id, info } = req.params;

  // List of valid info types (column names)
  const validInfoTypes = [
    'name_english', 'name_japanese', 'name_chinese', 'name_french',
    'type1', 'type2', 'base_hp', 'base_attack', 'base_defense',
    'base_spattack', 'base_spdefense', 'base_speed'
  ];

  // Check if the requested info type is valid
  if (!validInfoTypes.includes(info)) {
    return res.status(400).json({ message: 'Invalid info type' });
  }

  try {
    const query = `SELECT ${info} FROM pokemon WHERE id = $1`;
    const { rows } = await pool.query(query, [id]);

    if (rows.length === 0) {
      return res.status(404).json({ message: 'Pokemon not found' });
    }

    const infoValue = rows[0][info];
    if (!infoValue) {
      return res.status(400).json({ message: 'Invalid info type' });
    }

    res.json({ [info]: infoValue });
  } catch (error) {
    console.error('Error fetching pokemon info:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;