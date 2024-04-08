const express = require('express');
const router = express.Router();
const jsonData = require('../pokedex.json');

// Route to get the complete list of pokemon
router.get('/', (req, res) => {
  res.json(jsonData);
});

// Route to get details of a specific pokemon by ID
router.get('/:id', (req, res) => {
  const { id } = req.params;
  const pokemon = jsonData.find(p => p.id == id);
  if (!pokemon) {
    return res.status(404).json({ message: 'Pokemon not found' });
  }
  res.json(pokemon);
});

// Route to get specific information of a pokemon by ID and info type
router.get('/:id/:info', (req, res) => {
  const { id, info } = req.params;
  const pokemon = jsonData.find(p => p.id == id);
  if (!pokemon) {
    return res.status(404).json({ message: 'Pokemon not found' });
  }
  const infoValue = pokemon[info];
  if (!infoValue) {
    return res.status(400).json({ message: 'Invalid info type' });
  }
  res.json({ [info]: infoValue });
});
// Segunda opción
/* router.get('/:id/:info', (req, res) => {
    const { id, info } = req.params;
    const pokemon = jsonData.find(p => p.id == id);
  
    if (!pokemon) {
      return res.status(404).json({ message: 'Pokemon not found' });
    }
  
    let infoValue;
  
    // Check the requested info type and retrieve the corresponding value
    switch (info) {
      case 'name':
        infoValue = pokemon.name;
        break;
      case 'type':
        infoValue = pokemon.type;
        break;
      case 'base':
        infoValue = pokemon.base;
        break;
      default:
        return res.status(400).json({ message: 'Invalid info type' });
    }
  
    res.json({ [info]: infoValue });
  }); */

module.exports = router;